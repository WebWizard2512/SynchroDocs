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
        console.log("🔐 === LIVEBLOCKS AUTH REQUEST STARTED ===");
        
        const { sessionClaims, userId } = await auth();
        if (!sessionClaims || !userId) {
            console.log("❌ No session claims or userId found");
            return new Response("Unauthorized", { status: 401 });
        }

        const user = await currentUser();
        if (!user) {
            console.log("❌ No current user found");
            return new Response("Unauthorized", { status: 401 });
        }

        const { room } = await req.json();
        console.log("🏠 Room ID:", room);
        console.log("👤 User ID:", user.id);
        console.log("🏢 SessionClaims org_id:", sessionClaims.org_id);

        // Get user's organization memberships from Clerk API
        const clerk = await clerkClient();
        let userOrgId = sessionClaims.org_id || null;

        if (!userOrgId) {
            try {
                console.log("🔍 SessionClaims org_id is undefined, checking user's organization memberships...");
                
                // Get the user's organization memberships
                const orgMemberships = await clerk.users.getOrganizationMembershipList({
                    userId: userId,
                    limit: 10
                });

                console.log("🏢 Organization memberships found:", orgMemberships.data.length);
                
                if (orgMemberships.data.length > 0) {
                    // Use the first active organization membership
                    const activeMembership = orgMemberships.data.find(m => m.organization);
                    if (activeMembership) {
                        userOrgId = activeMembership.organization.id;
                        console.log("✅ Found org ID from memberships:", userOrgId);
                    }
                }
            } catch (clerkError) {
                console.log("⚠️ Error fetching user org memberships:", clerkError);
                // Continue with userOrgId as null
            }
        }

        console.log("🏢 Final User org ID:", userOrgId);

        const document = await convex.query(api.documents.getById, { id: room });

        if (!document) {
            console.log("❌ Document not found for room:", room);
            return new Response("Document not found", { status: 404 });
        }

        console.log("📄 Document found:", {
            id: document._id,
            title: document.title,
            ownerId: document.ownerId,
            organizationId: document.organizationId
        });

        // Check if user is the document owner
        const isOwner = document.ownerId === user.id;
        console.log("👑 Is owner:", isOwner);

        let hasAccess = false;
        let accessReason = "";

        if (document.organizationId) {
            // This is an organization document
            console.log("🏢 Organization document check:");
            console.log("  - Document org ID:", document.organizationId);
            console.log("  - User org ID:", userOrgId);
            
            const isOrgMember = document.organizationId === userOrgId;
            hasAccess = isOrgMember || isOwner; // Allow access if org member OR owner
            accessReason = isOrgMember ? "organization member" : (isOwner ? "document owner" : "not authorized");
            
            console.log("  - Is org member:", isOrgMember);
            console.log("  - Is owner:", isOwner);
            console.log("  - Has access:", hasAccess);
        } else {
            // This is a personal document
            console.log("👤 Personal document check:");
            console.log("  - Document owner:", document.ownerId);
            console.log("  - Current user:", user.id);
            console.log("  - Is owner:", isOwner);
            
            hasAccess = isOwner;
            accessReason = isOwner ? "document owner" : "not document owner";
            console.log("  - Has access:", hasAccess);
        }

        if (!hasAccess) {
            console.log("❌ ACCESS DENIED");
            console.log("❌ Reason:", accessReason);
            return new Response("Unauthorized", { status: 403 });
        }

        console.log("✅ ACCESS GRANTED");
        console.log("✅ Reason:", accessReason);
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

        console.log("✅ Liveblocks session created successfully");
        console.log("🔐 === LIVEBLOCKS AUTH REQUEST COMPLETED ===");
        
        return new Response(body, { status });

    } catch (error) {
        console.error("💥 Liveblocks auth error:", error);
        console.error("💥 Error stack:", (error as Error).stack);
        return new Response("Internal Server Error", { status: 500 });
    }
}