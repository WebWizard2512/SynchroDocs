"use client";

import { ReactNode, useEffect, useState, useCallback, useRef } from "react";
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
  const fetchAttempted = useRef(false);
  const lastFetch = useRef<number>(0);

  const fetchUsers = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    const now = Date.now();
    if (now - lastFetch.current < 3000) {
      return; // Wait at least 3 seconds between fetches
    }
    
    lastFetch.current = now;
    
    try {
      console.log("Fetching users for mentions/tags...");
      const list = await getUsers();
      console.log(`Fetched ${list.length} users:`, list.map(u => u.name));
      setUsers(list);
      fetchAttempted.current = true;
    } catch (error) {
      console.error("Failed to fetch users:", error);
      // Retry after 5 seconds if first attempt
      if (!fetchAttempted.current) {
        setTimeout(fetchUsers, 5000);
      }
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Refresh users periodically to keep mentions up to date
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Refreshing users list...");
      fetchUsers();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [fetchUsers]);

  // Ensure users are loaded when they're empty
  useEffect(() => {
    if (users.length === 0 && fetchAttempted.current) {
      console.warn("Users list is empty, retrying fetch...");
      const timeout = setTimeout(fetchUsers, 2000);
      return () => clearTimeout(timeout);
    }
  }, [users.length, fetchUsers]);

  const resolveUsers = useCallback(({ userIds }: { userIds: string[] }): (UserInfo | undefined)[] => {
    console.log("Resolving users for IDs:", userIds);
    console.log("Available users:", users.length, users.map(u => ({ id: u.id, name: u.name })));
    
    return userIds.map((userId) => {
      const user = users.find((u) => u.id === userId);
      
      if (!user) {
        console.warn(`User ${userId} not found in users list. Available:`, users.map(u => u.id));
        // Return a placeholder instead of undefined to prevent "Anonymous"
        return {
          name: "Loading...",
          avatar: "",
          color: "#999999"
        };
      }
      
      console.log(`Resolved user ${userId} to ${user.name}`);
      return {
        name: user.name,
        avatar: user.avatar,
        color: user.color
      };
    });
  }, [users]);

  const resolveMentionSuggestions = useCallback(({ text }: { text: string }): string[] => {
    console.log("Getting mention suggestions for:", text, "from", users.length, "users");
    
    let filteredUsers = users;

    if (text) {
      filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(text.toLowerCase())
      );
    }
    
    const userIds = filteredUsers.map((user) => user.id);
    console.log("Returning mention suggestions:", userIds.length, "users");
    return userIds;
  }, [users]);

  const resolveRoomsInfo = useCallback(async ({ roomIds }: { roomIds: string[] }): Promise<RoomInfo[]> => {
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
      console.error("Liveblocks auth error:", error);
      
      if (!authError) {
        setAuthError("Failed to connect. Please refresh the page.");
        toast.error("Connection failed");
      }
      
      throw error;
    }
  }, [params.documentId, router, authError]);

  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center space-y-6 p-8 bg-white rounded-2xl shadow-xl max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl">⚠️</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Access Error</h2>
            <p className="text-red-600 font-medium">{authError}</p>
          </div>
          <button 
            onClick={() => router.replace("/")}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-medium">
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