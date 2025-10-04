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
  const lastSavedTitleRef = useRef(title);

  useEffect(() => {
    setValue(title);
    lastSavedTitleRef.current = title;
  }, [title]);

  const debouncedUpdate = useDebounce(
    useCallback(async (newValue: string) => {
      const trimmedValue = newValue.trim();
      
      if (!trimmedValue || trimmedValue === lastSavedTitleRef.current) {
        return;
      }

      setIsPending(true);
      try {
        await mutate({ id, title: trimmedValue });
        lastSavedTitleRef.current = trimmedValue;
      } catch {
        toast.error("Failed to update document");
        setValue(lastSavedTitleRef.current);
      } finally {
        setIsPending(false);
      }
    }, [id, mutate]),
    1000
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
    } catch {
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
        <form onSubmit={handleSubmit} className="relative w-fit max-w-[50ch]">
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
            maxLength={100}
          />
        </form>
      ) : (
        <span
          onClick={handleEdit} 
          className="text-lg px-1.5 cursor-pointer truncate hover:bg-gray-100 rounded transition-colors max-w-[50ch]"
        >
          {title}
        </span>
      )}
      {showError && (
        <BsCloudSlash className="size-4 text-red-500" />
      )}
      {!showError && !showLoader && <BsCloudCheck className="size-4 text-green-500" />}
      {showLoader && <LoaderIcon className="size-4 animate-spin text-muted-foreground" />}
    </div>
  );
};