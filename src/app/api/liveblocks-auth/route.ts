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
        const { sessionClaims, userId } = await auth();
        if (!sessionClaims || !userId) {
            return new Response("Unauthorized", { status: 401 });
        }

        const user = await currentUser();
        if (!user) {
            return new Response("Unauthorized", { status: 401 });
        }

        const { room } = await req.json();
        
        // Get user's organization memberships from Clerk API
        const clerk = await clerkClient();
        let userOrgId = sessionClaims.org_id || null;

        if (!userOrgId) {
            try {
                const orgMemberships = await clerk.users.getOrganizationMembershipList({
                    userId: userId,
                    limit: 10
                });

                if (orgMemberships.data.length > 0) {
                    const activeMembership = orgMemberships.data.find(m => m.organization);
                    if (activeMembership) {
                        userOrgId = activeMembership.organization.id;
                    }
                }
            } catch (clerkError) {
                // Continue with userOrgId as null
            }
        }

        const document = await convex.query(api.documents.getById, { id: room });

        if (!document) {
            return new Response("Document not found", { status: 404 });
        }

        // Authorization logic
        const isOwner = document.ownerId === user.id;
        let hasAccess = false;

        if (document.organizationId) {
            const isOrgMember = document.organizationId === userOrgId;
            hasAccess = isOrgMember || isOwner;
        } else {
            hasAccess = isOwner;
        }

        if (!hasAccess) {
            return new Response("Unauthorized", { status: 403 });
        }

        const name = user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Anonymous";
        const nameToNumber = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const hue = Math.abs(nameToNumber) % 360; 
        const color = `hsl(${hue}, 80%, 60%)`;
        
        const session = liveblocks.prepareSession(user.id, {
            userInfo: {
                name,
                avatar: user.imageUrl,
                color,
            },
        });

        session.allow(room, session.FULL_ACCESS);
        const { body, status } = await session.authorize();
        
        return new Response(body, { status });

    } catch (error) {
        console.error("Liveblocks auth error:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}