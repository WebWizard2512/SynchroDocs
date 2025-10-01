import { Liveblocks } from "@liveblocks/node";
import { ConvexHttpClient } from "convex/browser";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const liveblocks = new Liveblocks({
    secret: process.env.LIVEBLOCKS_SECRET_KEY!
});

export async function POST(req: Request) {
    try {
        // Get auth session
        const { sessionClaims, userId } = await auth();
        
        if (!sessionClaims || !userId) {
            console.error("No session claims or userId");
            return new Response("Unauthorized", { status: 401 });
        }

        // Get current user
        const user = await currentUser();
        if (!user) {
            console.error("No current user");
            return new Response("Unauthorized", { status: 401 });
        }

        // Get room ID from request
        const { room } = await req.json();
        
        if (!room) {
            console.error("No room ID provided");
            return new Response("Bad Request", { status: 400 });
        }

        // Get document from Convex
        let document;
        try {
            document = await convex.query(api.documents.getById, { id: room });
        } catch (convexError) {
            console.error("Convex query error:", convexError);
            return new Response("Document not found", { status: 404 });
        }

        if (!document) {
            console.error("Document not found:", room);
            return new Response("Document not found", { status: 404 });
        }

        // Get user's organization ID from session claims
        let userOrgId = sessionClaims.org_id || null;

        // If not in session claims, try to get from Clerk API
        if (!userOrgId) {
            try {
                const clerk = await clerkClient();
                const orgMemberships = await clerk.users.getOrganizationMembershipList({
                    userId: userId,
                    limit: 10
                });

                if (orgMemberships.data.length > 0) {
                    // Use the first active membership
                    const activeMembership = orgMemberships.data.find(m => m.organization);
                    if (activeMembership) {
                        userOrgId = activeMembership.organization.id;
                    }
                }
            } catch (clerkError) {
                console.error("Failed to fetch org memberships:", clerkError);
                // Continue with userOrgId as null
            }
        }

        // Authorization logic
        const isOwner = document.ownerId === user.id;
        let hasAccess = false;

        if (document.organizationId) {
            // Document belongs to an organization
            const isOrgMember = document.organizationId === userOrgId;
            hasAccess = isOrgMember || isOwner;
            
            if (!hasAccess) {
                console.error("Access denied: User not in document's organization", {
                    userId: user.id,
                    userOrgId,
                    documentOrgId: document.organizationId,
                    isOwner
                });
            }
        } else {
            // Personal document
            hasAccess = isOwner;
            
            if (!hasAccess) {
                console.error("Access denied: User not document owner", {
                    userId: user.id,
                    documentOwnerId: document.ownerId
                });
            }
        }

        if (!hasAccess) {
            return new Response("Forbidden", { status: 403 });
        }

        // Create user info for Liveblocks
        const name = user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Anonymous";
        const nameToNumber = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const hue = Math.abs(nameToNumber) % 360; 
        const color = `hsl(${hue}, 80%, 60%)`;
        
        // Prepare Liveblocks session
        const session = liveblocks.prepareSession(user.id, {
            userInfo: {
                name,
                avatar: user.imageUrl,
                color,
            },
        });

        // Grant full access to the room
        session.allow(room, session.FULL_ACCESS);
        
        const { body, status } = await session.authorize();
        
        return new Response(body, { status });

    } catch (error) {
        console.error("Liveblocks auth error:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}