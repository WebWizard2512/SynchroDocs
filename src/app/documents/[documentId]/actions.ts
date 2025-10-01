"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import { User } from "@clerk/nextjs/server";

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
        // Always include the current user first
        const currentUser = await clerk.users.getUser(userId);
        const allUsersMap = new Map<string, User>();
        
        // Add current user
        allUsersMap.set(currentUser.id, currentUser);

        // If user is in an organization, fetch organization members
        if (sessionClaims?.org_id) {
            try {
                const orgMembers = await clerk.organizations.getOrganizationMembershipList({
                    organizationId: sessionClaims.org_id as string,
                    limit: 100 // Increased limit
                });

                // Fetch all member details
                const memberPromises = orgMembers.data.map(async (member) => {
                    try {
                        if (!member.publicUserData?.userId) {
                            return null;
                        }
                        const user = await clerk.users.getUser(member.publicUserData.userId);
                        return user;
                    } catch (error) {
                        console.error(`Failed to fetch user ${member.publicUserData?.userId}:`, error);
                        return null;
                    }
                });

                const memberUsers = await Promise.all(memberPromises);

                // Add all valid org members to the map
                memberUsers.forEach(user => {
                    if (user) {
                        allUsersMap.set(user.id, user);
                    }
                });
            } catch (orgError) {
                console.error("Failed to fetch org members:", orgError);
            }
        }

        // Also try to get users from recent organization memberships if not currently in an org
        if (!sessionClaims?.org_id) {
            try {
                const userOrgMemberships = await clerk.users.getOrganizationMembershipList({
                    userId: userId,
                    limit: 10
                });

                // Get members from all organizations the user belongs to
                for (const membership of userOrgMemberships.data) {
                    try {
                        const orgMembers = await clerk.organizations.getOrganizationMembershipList({
                            organizationId: membership.organization.id,
                            limit: 50
                        });

                        const memberPromises = orgMembers.data.map(async (member) => {
                            try {
                                if (!member.publicUserData?.userId) {
                                    return null;
                                }
                                return await clerk.users.getUser(member.publicUserData.userId);
                            } catch {
                                return null;
                            }
                        });

                        const members = await Promise.all(memberPromises);
                        members.forEach(user => {
                            if (user) {
                                allUsersMap.set(user.id, user);
                            }
                        });
                    } catch {
                        // Skip organizations we can't access
                        continue;
                    }
                }
            } catch (error) {
                console.error("Failed to fetch user org memberships:", error);
            }
        }

        // Convert map to array and transform to expected format
        const users = Array.from(allUsersMap.values()).map((user) => {
            const name = user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Anonymous";
            
            // Generate consistent color for each user based on their ID
            const nameToNumber = (user.id + name).split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
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