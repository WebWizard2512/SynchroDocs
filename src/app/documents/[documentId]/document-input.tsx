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
  
  // Track the last successfully saved title
  const lastSavedTitleRef = useRef(title);

  // Update local state when title prop changes
  useEffect(() => {
    setValue(title);
    lastSavedTitleRef.current = title;
  }, [title]);

  const debouncedUpdate = useDebounce(
    useCallback(async (newValue: string) => {
      const trimmedValue = newValue.trim();
      
      // Don't update if empty or same as last saved
      if (!trimmedValue || trimmedValue === lastSavedTitleRef.current) {
        return;
      }

      setIsPending(true);
      try {
        await mutate({ id, title: trimmedValue });
        lastSavedTitleRef.current = trimmedValue;
        // Removed toast notification to reduce noise during typing
      } catch (error) {
        console.error("Failed to update document:", error);
        toast.error("Failed to update document");
        setValue(lastSavedTitleRef.current); // Revert to last saved
      } finally {
        setIsPending(false);
      }
    }, [id, mutate]),
    1000 // Increased debounce time to reduce API calls
  );

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    debouncedUpdate(newValue);
  }, [debouncedUpdate]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedValue = value.trim();
    
    if (!trimmedValue) {
      setValue(lastSavedTitleRef.current);
      setIsEditing(false);
      return;
    }

    // Don't make API call if value hasn't changed
    if (trimmedValue === lastSavedTitleRef.current) {
      setIsEditing(false);
      return;
    }

    setIsPending(true);
    try {
      await mutate({ id, title: trimmedValue });
      lastSavedTitleRef.current = trimmedValue;
      toast.success("Document renamed");
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update document:", error);
      toast.error("Failed to update document");
      setValue(lastSavedTitleRef.current);
    } finally {
      setIsPending(false);
    }
  }, [id, value, mutate]);

  const handleBlur = useCallback(() => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      setValue(lastSavedTitleRef.current);
    }
    setIsEditing(false);
  }, [value]);

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
            maxLength={100} // Add max length
          />
        </form>
      ) : (
        <span
          onClick={handleEdit} 
          className="text-lg px-1.5 cursor-pointer truncate hover:bg-gray-100 rounded transition-colors max-w-[50ch]"
          title="Click to edit title"
        >
          {title}
        </span>
      )}
      {showError && (
        <div className="flex items-center gap-1">
          <BsCloudSlash className="size-4 text-red-500" />
          <span className="text-xs text-red-500">Disconnected</span>
        </div>
      )}
      {!showError && !showLoader && <BsCloudCheck className="size-4 text-green-500" />}
      {showLoader && <LoaderIcon className="size-4 animate-spin text-muted-foreground" />}
    </div>
  );
};