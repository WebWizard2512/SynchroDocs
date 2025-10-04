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
        const currentUser = await clerk.users.getUser(userId);
        const allUsersMap = new Map<string, User>();
        
        allUsersMap.set(currentUser.id, currentUser);

        if (sessionClaims?.org_id) {
            try {
                const orgMembers = await clerk.organizations.getOrganizationMembershipList({
                    organizationId: sessionClaims.org_id as string,
                    limit: 100
                });

                const memberPromises = orgMembers.data.map(async (member) => {
                    try {
                        if (!member.publicUserData?.userId) {
                            return null;
                        }
                        const user = await clerk.users.getUser(member.publicUserData.userId);
                        return user;
                    } catch (error) {
                        return null;
                    }
                });

                const memberUsers = await Promise.all(memberPromises);

                memberUsers.forEach(user => {
                    if (user) {
                        allUsersMap.set(user.id, user);
                    }
                });
            } catch (orgError) {
                // Silently continue
            }
        }

        if (!sessionClaims?.org_id) {
            try {
                const userOrgMemberships = await clerk.users.getOrganizationMembershipList({
                    userId: userId,
                    limit: 10
                });

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
                        continue;
                    }
                }
            } catch (error) {
                // Silently continue
            }
        }

        const users = Array.from(allUsersMap.values()).map((user) => {
            const name = user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Anonymous";
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
        return [];
    }
}