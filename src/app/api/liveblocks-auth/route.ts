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
        console.log("=== Liveblocks Auth Request Start ===");
        
        // Get auth session
        const { sessionClaims, userId } = await auth();
        
        if (!sessionClaims || !userId) {
            console.error("No session claims or userId");
            return new Response("Unauthorized", { status: 401 });
        }

        console.log("User ID:", userId);
        console.log("Session Claims org_id:", sessionClaims.org_id);

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

        console.log("Room ID:", room);

        // Get document from Convex
        let document;
        try {
            document = await convex.query(api.documents.getById, { id: room });
            console.log("Document found:", {
                id: document._id,
                ownerId: document.ownerId,
                organizationId: document.organizationId
            });
        } catch (convexError) {
            console.error("Convex query error:", convexError);
            return new Response("Document not found", { status: 404 });
        }

        if (!document) {
            console.error("Document not found:", room);
            return new Response("Document not found", { status: 404 });
        }

        // Get user's organization ID from session claims
        let userOrgId = sessionClaims.org_id as string | undefined;

        // If not in session claims, try to get from Clerk API
        if (!userOrgId) {
            try {
                const clerk = await clerkClient();
                const orgMemberships = await clerk.users.getOrganizationMembershipList({
                    userId: userId,
                    limit: 10
                });

                console.log("User org memberships count:", orgMemberships.data.length);

                if (orgMemberships.data.length > 0) {
                    // Use the first active membership
                    const activeMembership = orgMemberships.data.find(m => m.organization);
                    if (activeMembership) {
                        userOrgId = activeMembership.organization.id;
                        console.log("Found org ID from memberships:", userOrgId);
                    }
                }
            } catch (clerkError) {
                console.error("Failed to fetch org memberships:", clerkError);
                // Continue with userOrgId as undefined
            }
        }

        // Authorization logic
        const isOwner = document.ownerId === user.id;
        let hasAccess = false;

        console.log("Authorization check:", {
            isOwner,
            userOrgId,
            documentOrgId: document.organizationId
        });

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
            // Personal document - only owner has access
            hasAccess = isOwner;
            
            if (!hasAccess) {
                console.error("Access denied: User not document owner", {
                    userId: user.id,
                    documentOwnerId: document.ownerId
                });
            }
        }

        if (!hasAccess) {
            console.error("=== Access Denied ===");
            return new Response(JSON.stringify({ 
                error: "Forbidden",
                details: "You don't have permission to access this document"
            }), { 
                status: 403,
                headers: { "Content-Type": "application/json" }
            });
        }

        console.log("Access granted!");

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
        
        console.log("=== Liveblocks Auth Success ===");
        return new Response(body, { status });

    } catch (error) {
        console.error("=== Liveblocks auth error ===", error);
        return new Response(JSON.stringify({ 
            error: "Internal Server Error",
            message: error instanceof Error ? error.message : "Unknown error"
        }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}