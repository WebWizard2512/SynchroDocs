"use client";

import {AlertDialog, AlertDialogAction, AlertDialogContent,AlertDialogCancel, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,AlertDialogTitle, AlertDialogTrigger} from"@/components/ui/alert-dialog";
import { Id } from "../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import {toast} from "sonner";
import { useRouter } from "next/router";

interface RemoveDialogProps{
    documentId: Id<"documents">;
    children: React.ReactNode;
}

export const RemoveDialog = ({documentId, children}: RemoveDialogProps) =>{
    const router = useRouter();
    const remove = useMutation(api.documents.removeById);
    const[isRemoving, setIsRemoving] = useState(false);
    return (
        <AlertDialog>
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
                    <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                    disabled={isRemoving}
                    onClick={(e) =>{
                        e.stopPropagation();
                        setIsRemoving(true);
                        remove({id: documentId})
                        .then(() => {
                            toast.success("Document removed successfully");
                            router.push("/");
                        })
                        .catch(() => toast.error("Failed to remove document"))
                        .finally(()=>setIsRemoving(false))
                    }}>
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}