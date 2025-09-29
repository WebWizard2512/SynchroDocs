"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function getDocuments(ids: Id<"documents">[]) {
    return await convex.query(api.documents.getByIds, { ids });
}

export async function getUsers() {
    const { sessionClaims, userId } = await auth();
    
    if (!userId) {
        return [];
    }

    const clerk = await clerkClient();
    
    try {
        // Always include the current user
        const currentUser = await clerk.users.getUser(userId);
        let allUsers = [currentUser];

        // If user is in an organization, fetch organization members
        if (sessionClaims?.org_id) {
            try {
                const orgMembers = await clerk.organizations.getOrganizationMembershipList({
                    organizationId: sessionClaims.org_id as string,
                    limit: 50
                });

                const memberUsers = await Promise.all(
                    orgMembers.data.map(async (member) => {
                        try {
                            return await clerk.users.getUser(member.publicUserData.userId);
                        } catch {
                            return null;
                        }
                    })
                );

                // Add org members (filter out nulls and duplicates)
                const validOrgUsers = memberUsers.filter(Boolean);
                const currentUserIds = new Set(allUsers.map(u => u.id));
                
                validOrgUsers.forEach(user => {
                    if (user && !currentUserIds.has(user.id)) {
                        allUsers.push(user);
                        currentUserIds.add(user.id);
                    }
                });
            } catch (orgError) {
                console.error("Failed to fetch org members:", orgError);
            }
        }

        // Transform users to the expected format
        const users = allUsers.map((user) => {
            const name = user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Anonymous";
            
            // Generate consistent color for each user
            const nameToNumber = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const hue = Math.abs(nameToNumber) % 360;
            const color = `hsl(${hue}, 80%, 60%)`;
            
            return {
                id: user.id,
                name: name,
                avatar: user.imageUrl || "",
                color: color
            };
        });
        
        return users;
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return [];
    }
}