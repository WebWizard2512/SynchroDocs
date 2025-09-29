import { BsCloudCheck, BsCloudSlash } from "react-icons/bs";
import { Id } from "../../../../convex/_generated/dataModel";
import { useRef, useState, useCallback, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useDebounce } from "@/hooks/use-debouce";
import { toast } from "sonner";
import { useStatus } from "@liveblocks/react";
import { LoaderIcon } from "lucide-react";

interface DocumentInputProps {
    title: string;
    id: Id<"documents">;
};

export const DocumentInput = ({ title, id }: DocumentInputProps) => {
  const status = useStatus();
  const [value, setValue] = useState(title);
  const [isPending, setIsPending] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const mutate = useMutation(api.documents.updateById);

  // Update local state when title prop changes
  useEffect(() => {
    setValue(title);
  }, [title]);

  const debouncedUpdate = useDebounce(
    useCallback(async (newValue: string) => {
      if (newValue === title || !newValue.trim()) return;

      setIsPending(true);
      try {
        await mutate({ id, title: newValue.trim() });
        toast.success("Document updated");
      } catch (error) {
        console.error("Failed to update document:", error);
        toast.error("Failed to update document");
        setValue(title); // Revert on error
      } finally {
        setIsPending(false);
      }
    }, [id, title, mutate]),
    500
  );

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    debouncedUpdate(newValue);
  }, [debouncedUpdate]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!value.trim()) {
      setValue(title);
      setIsEditing(false);
      return;
    }

    setIsPending(true);
    try {
      await mutate({ id, title: value.trim() });
      toast.success("Document updated");
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update document:", error);
      toast.error("Failed to update document");
      setValue(title);
    } finally {
      setIsPending(false);
    }
  }, [id, value, title, mutate]);

  const handleBlur = useCallback(() => {
    if (!value.trim()) {
      setValue(title);
    }
    setIsEditing(false);
  }, [value, title]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  }, []);

  const showLoader = isPending || status === "connecting" || status === "reconnecting";
  const showError = status === "disconnected";

  return (
    <div className="flex items-center gap-2">
      {isEditing ? (
        <form onSubmit={handleSubmit} className="relative w-full max-w-[50ch]">
          <span className="invisible text-lg px-1.5 whitespace-pre">
            {value || " "}
          </span>
          <input 
            ref={inputRef}
            value={value}
            onChange={onChange}
            onBlur={handleBlur}
            className="absolute inset-0 text-lg text-black px-1.5 bg-transparent truncate" 
            disabled={isPending}
          />
        </form>
      ) : (
        <span
          onClick={handleEdit} 
          className="text-lg px-1.5 cursor-pointer truncate hover:bg-gray-100 rounded transition-colors"
          title="Click to edit title"
        >
          {title}
        </span>
      )}
      {showError && <BsCloudSlash className="size-4 text-red-500" />}
      {!showError && !showLoader && <BsCloudCheck className="size-4 text-green-500" />}
      {showLoader && <LoaderIcon className="size-4 animate-spin text-muted-foreground" />}
    </div>
  );
};
