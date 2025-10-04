"use client";

import { ReactNode, useEffect, useState, useCallback } from "react";
import { 
  LiveblocksProvider, 
  RoomProvider, 
  ClientSideSuspense 
} from "@liveblocks/react/suspense";
import { useParams, useRouter } from "next/navigation";
import { FullScreenLoader } from "@/components/fullscreen-loader";
import { getUsers, getDocuments } from "./actions";
import { toast } from "sonner";
import { Id } from "../../../../convex/_generated/dataModel";
import { LEFT_MARGIN_DEFAULT, RIGHT_MARGIN_DEFAULT } from "@/constants/margins";

type User = { 
  id: string; 
  name: string; 
  avatar: string; 
  color: string 
};

interface UserInfo {
  name: string;
  avatar: string;
  color: string;
}

interface RoomInfo {
  id: string;
  name: string;
}

export function Room({ children }: { children: ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const list = await getUsers();
      setUsers(list);
    } catch (error) {
      setUsers([]);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, [fetchUsers]);

  const resolveUsers = useCallback(({ userIds }: { userIds: string[] }): (UserInfo | undefined)[] => {
    return userIds.map((userId) => {
      const user = users.find((u) => u.id === userId);
      
      if (!user) {
        return undefined;
      }
      
      return {
        name: user.name,
        avatar: user.avatar,
        color: user.color
      };
    });
  }, [users]);

  const resolveMentionSuggestions = useCallback(({ text }: { text: string }): string[] => {
    let filteredUsers = users;

    if (text) {
      filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(text.toLowerCase())
      );
    }
    
    return filteredUsers.map((user) => user.id);
  }, [users]);

  const resolveRoomsInfo = useCallback(async ({ roomIds }: { roomIds: string[] }): Promise<RoomInfo[]> => {
    try {
      const documents = await getDocuments(roomIds as Id<"documents">[]);
      return documents.map((document) => ({
        id: document.id,
        name: document.title || document.name,
      }));
    } catch (error) {
      return [];
    }
  }, []);

  const authEndpoint = useCallback(async (room?: string) => {
    const endpoint = "/api/liveblocks-auth";
    const roomId = room || (params.documentId as string);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ room: roomId }),
      });

      if (response.status === 403) {
        setAuthError("You don't have permission to access this document");
        toast.error("Access denied");
        setTimeout(() => router.replace("/"), 2000);
        throw new Error("Access denied");
      }

      if (response.status === 404) {
        setAuthError("Document not found");
        toast.error("Document not found");
        setTimeout(() => router.replace("/"), 2000);
        throw new Error("Document not found");
      }

      if (response.status === 401) {
        setAuthError("Please sign in to access this document");
        toast.error("Authentication required");
        throw new Error("Unauthorized");
      }

      if (!response.ok) {
        throw new Error(`Auth failed: ${response.status}`);
      }

      const data = await response.json();
      setAuthError(null);
      return data;
    } catch (error) {
      if (!authError) {
        setAuthError("Failed to connect. Please refresh the page.");
        toast.error("Connection failed");
      }
      
      throw error;
    }
  }, [params.documentId, router, authError]);

  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 p-8">
          <h2 className="text-xl font-bold text-gray-900">{authError}</h2>
          <button 
            onClick={() => router.replace("/")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

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
        <ClientSideSuspense fallback={<FullScreenLoader label="Connecting..." />}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}