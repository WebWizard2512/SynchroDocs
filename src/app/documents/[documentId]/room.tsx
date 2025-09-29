"use client";

import { ReactNode, useEffect, useState, useCallback } from "react";
import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from "@liveblocks/react/suspense";
import { useParams } from "next/navigation";
import { FullScreenLoader } from "@/components/fullscreen-loader";
import { getUsers, getDocuments } from "./actions";
import { toast } from "sonner";
import { Id } from "../../../../convex/_generated/dataModel";
import { LEFT_MARGIN_DEFAULT, RIGHT_MARGIN_DEFAULT } from "@/constants/margins";

type User = { id: string; name: string; avatar: string; color: string };

export function Room({ children }: { children: ReactNode }) {
  const params = useParams();
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = useCallback(async () => {
    try {
      const list = await getUsers();
      setUsers(list);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to fetch users");
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const resolveUsers = useCallback(({ userIds }: { userIds: string[] }) => {
    return userIds.map((userId) => {
      const user = users.find((user) => user.id === userId);
      if (!user) return undefined;
      
      return {
        name: user.name,
        avatar: user.avatar,
        color: user.color
      };
    });
  }, [users]);

  const resolveMentionSuggestions = useCallback(({ text }: { text: string }) => {
    let filteredUsers = users;

    if (text) {
      filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(text.toLowerCase())
      );
    }
    return filteredUsers.map((user) => user.id);
  }, [users]);

  const resolveRoomsInfo = useCallback(async ({ roomIds }: { roomIds: string[] }) => {
    try {
      const documents = await getDocuments(roomIds as Id<"documents">[]);
      return documents.map((document) => ({
        id: document.id,
        name: document.title || document.name,
      }));
    } catch (error) {
      console.error("Failed to resolve rooms info:", error);
      return [];
    }
  }, []);

  const authEndpoint = useCallback(async () => {
    const endpoint = "/api/liveblocks-auth";
    const room = params.documentId as string;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ room }),
    });

    if (!response.ok) {
      throw new Error(`Auth failed: ${response.status}`);
    }

    return await response.json();
  }, [params.documentId]);

  return (
    <LiveblocksProvider
      throttle={16}
      authEndpoint={authEndpoint}
      resolveUsers={resolveUsers}
      resolveMentionSuggestions={resolveMentionSuggestions}
      resolveRoomsInfo={resolveRoomsInfo}
    >
      <RoomProvider
        id={params.documentId as string}
        initialStorage={{
          leftMargin: LEFT_MARGIN_DEFAULT,
          rightMargin: RIGHT_MARGIN_DEFAULT
        }}
      >
        <ClientSideSuspense fallback={<FullScreenLoader label="Loading..." />}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}