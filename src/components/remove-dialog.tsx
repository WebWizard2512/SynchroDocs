"use client";

import {AlertDialog, AlertDialogAction, AlertDialogContent,AlertDialogCancel, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,AlertDialogTitle, AlertDialogTrigger} from"@/components/ui/alert-dialog";
import { Id } from "../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import {toast} from "sonner";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface RemoveDialogProps{
    documentId: Id<"documents">;
    children: React.ReactNode;
}

export const RemoveDialog = ({ documentId, children }: RemoveDialogProps) => {
  const router = useRouter();
  const remove = useMutation(api.documents.removeById);
  const [isRemoving, setIsRemoving] = useState(false);
  const [open, setOpen] = useState(false);

  const handleRemove = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRemoving(true);
    
    try {
      await remove({ id: documentId });
      toast.success("Document removed successfully");
      setOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Failed to remove document:", error);
      toast.error("Failed to remove document");
    } finally {
      setIsRemoving(false);
    }
  }, [documentId, remove, router]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your document.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={(e) => e.stopPropagation()}
            disabled={isRemoving}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isRemoving}
            onClick={handleRemove}
          >
            {isRemoving ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};