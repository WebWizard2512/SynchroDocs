"use client";
import { useEditorStore } from '@/app/store/use-editor-store';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  BoldIcon, 
  ItalicIcon, 
  LucideIcon, 
  UploadIcon, 
  SearchIcon, 
  ChevronDownIcon, 
  HighlighterIcon, 
  MessageSquarePlusIcon, 
  RemoveFormattingIcon, 
  ListTodoIcon, 
  PrinterIcon, 
  Redo2Icon, 
  SpellCheck, 
  UnderlineIcon, 
  Undo2Icon, 
  Link2Icon, 
  ImageIcon, 
  AlignCenterIcon, 
  AlignRightIcon, 
  AlignLeftIcon, 
  AlignJustifyIcon, 
  ListIcon, 
  ListOrderedIcon, 
  MinusIcon, 
  PlusIcon, 
  ListCollapseIcon,
  StrikethroughIcon 
} from 'lucide-react';
import { type Level } from '@tiptap/extension-heading';
import { type ColorResult, SketchPicker } from 'react-color';
import React, { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const LineHeightButton = () => {
  const { editor } = useEditorStore();

  const lineHeights = [
    { label: "Default", value: "normal" },
    { label: "Single", value: "1" },
    { label: "1.15", value: "1.15" },
    { label: "1.5", value: "1.5" },
    { label: "Double", value: "2" },
  ];

  const currentLineHeight = editor?.getAttributes("paragraph").lineHeight || "normal";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm transition-colors">
          <ListCollapseIcon className='size-4' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='p-1 flex flex-col gap-y-1'>
        {lineHeights.map(({ label, value }) => (
          <button 
            key={value} 
            onClick={() => editor?.chain().focus().setLineHeight(value).run()}
            className={cn(
              "flex items-center gap-x-2 px-2 py-1 rounded-sm hover:bg-neutral-200/80 transition-colors text-left",
              currentLineHeight === value && "bg-neutral-200/80"
            )}>
            <span className='text-sm'>{label}</span>
          </button>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const FontSizeButton = () => {
  const { editor } = useEditorStore();

  const currentFontSize = editor?.getAttributes("textStyle")?.fontSize ? 
    editor?.getAttributes("textStyle")?.fontSize?.replace("px", "") : "16";

  const [fontSize, setFontSize] = useState(currentFontSize);
  const [inputValue, setInputValue] = useState(fontSize);
  const [isEditing, setIsEditing] = useState(false);

  const updateFontSize = useCallback((newSize: string) => {
    const size = parseInt(newSize);
    if (!isNaN(size) && size > 0) {
      editor?.chain().focus().setFontSize(`${size}px`).run();
      setFontSize(newSize);
      setInputValue(newSize);
      setIsEditing(false);
    }
  }, [editor]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleInputBlur = useCallback(() => {
    updateFontSize(inputValue);
  }, [inputValue, updateFontSize]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      updateFontSize(inputValue);
      editor?.commands.focus();
    }
  }, [inputValue, updateFontSize, editor]);

  const increment = useCallback(() => {
    const newSize = parseInt(fontSize) + 1;
    updateFontSize(newSize.toString());
  }, [fontSize, updateFontSize]);

  const decrement = useCallback(() => {
    const newSize = parseInt(fontSize) - 1;
    if (newSize > 0) {
      updateFontSize(newSize.toString());
    }
  }, [fontSize, updateFontSize]);

  return (
    <div className='flex items-center gap-x-0.5'>
      <button onClick={decrement} className="h-7 w-7 shrink-0 flex items-center justify-center rounded-sm hover:bg-neutral-200/80 transition-colors">
        <MinusIcon className='size-4' />
      </button>
      {isEditing ? (
        <input
          type='text'
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className="h-7 w-10 text-sm border border-neutral-400 text-center rounded-sm bg-transparent focus:outline-none focus:ring-0" />
      ) : (
        <button
          onClick={() => {
            setIsEditing(true);
            setFontSize(currentFontSize);
          }}
          className="h-7 w-10 text-sm border border-neutral-400 text-center rounded-sm bg-transparent cursor-text hover:bg-neutral-50 transition-colors">
          {currentFontSize}
        </button>
      )}
      <button onClick={increment} className="h-7 w-7 shrink-0 flex items-center justify-center rounded-sm hover:bg-neutral-200/80 transition-colors">
        <PlusIcon className='size-4' />
      </button>
    </div>
  );
};

const ListButton = () => {
  const { editor } = useEditorStore();

  const lists = [
    {
      label: "Bullet List",
      icon: ListIcon,
      isActive: () => editor?.isActive("bulletList"),
      onClick: () => editor?.chain().focus().toggleBulletList().run()
    },
    {
      label: "Ordered List",
      icon: ListOrderedIcon,
      isActive: () => editor?.isActive("orderedList"),
      onClick: () => editor?.chain().focus().toggleOrderedList().run()
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm transition-colors">
          <ListIcon className='size-4' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='p-1 flex flex-col gap-y-1'>
        {lists.map(({ label, icon: Icon, onClick, isActive }) => (
          <button 
            key={label} 
            onClick={onClick}
            className={cn(
              "flex items-center gap-x-2 px-2 py-1 rounded-sm hover:bg-neutral-200/80 transition-colors text-left",
              isActive() && "bg-neutral-200/80"
            )}>
            <Icon className='size-4' />
            <span className='text-sm'>{label}</span>
          </button>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const AlignButton = () => {
  const { editor } = useEditorStore();

  const alignments = [
    {
      label: "Align Left",
      value: "left",
      icon: AlignLeftIcon,
    },
    {
      label: "Align Center",
      value: "center",
      icon: AlignCenterIcon,
    },
    {
      label: "Align Right",
      value: "right",
      icon: AlignRightIcon,
    },
    {
      label: "Align Justify",
      value: "justify",
      icon: AlignJustifyIcon,
    },
  ];

  const currentAlignment = alignments.find(align => 
    editor?.isActive({ textAlign: align.value })
  ) || alignments[0]; // Default to left

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn(
          "h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm transition-colors",
          editor?.isActive({ textAlign: currentAlignment.value }) && "bg-neutral-200/80"
        )}>
          <currentAlignment.icon className='size-4' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='p-1 flex flex-col gap-y-1'>
        {alignments.map(({ label, value, icon: Icon }) => (
          <button 
            key={value} 
            onClick={() => editor?.chain().focus().setTextAlign(value).run()}
            className={cn(
              "flex items-center gap-x-2 px-2 py-1 rounded-sm hover:bg-neutral-200/80 transition-colors text-left",
              editor?.isActive({ textAlign: value }) && "bg-neutral-200/80"
            )}>
            <Icon className='size-4' />
            <span className='text-sm'>{label}</span>
          </button>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ImageButton = () => {
  const { editor } = useEditorStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imageURL, setImageURL] = useState("");

  const onChange = useCallback((src: string) => {
    editor?.chain().focus().setImage({ src }).run();
  }, [editor]);

  const onUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const imageURL = URL.createObjectURL(file);
        onChange(imageURL);
      }
    };
    input.click();
  }, [onChange]);

  const handleImageUrlSubmit = useCallback(() => {
    if (imageURL) {
      onChange(imageURL);
      setImageURL("");
      setIsDialogOpen(false);
    }
  }, [imageURL, onChange]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm transition-colors">
            <ImageIcon className='size-4' />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onUpload}>
            <UploadIcon className='size-4 mr-2' />
            Upload
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
            <SearchIcon className='size-4 mr-2' />
            Paste Image URL
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Insert Image URL</DialogTitle>
          </DialogHeader>
          <Input 
            placeholder='https://example.com/image.jpg'
            value={imageURL}
            onChange={(e) => setImageURL(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleImageUrlSubmit();
              }
            }} 
          />
          <DialogFooter>
            <Button onClick={handleImageUrlSubmit} disabled={!imageURL.trim()}>
              Insert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const LinkButton = () => {
  const { editor } = useEditorStore();
  const [value, setValue] = useState("");

  const onChange = useCallback((href: string) => {
    if (href) {
      editor?.chain().focus().extendMarkRange("link").setLink({ href }).run();
    } else {
      editor?.chain().focus().unsetLink().run();
    }
    setValue("");
  }, [editor]);

  return (
    <DropdownMenu onOpenChange={(open) => {
      if (open) {
        setValue(editor?.getAttributes("link").href || "");
      }
    }}>
      <DropdownMenuTrigger asChild>
        <button className={cn(
          "h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm transition-colors",
          editor?.isActive("link") && "bg-neutral-200/80"
        )}>
          <Link2Icon className='size-4' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='p-2.5 flex items-center gap-x-2' onClick={(e) => e.stopPropagation()}>
        <Input 
          placeholder='https://example.com' 
          value={value} 
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onChange(value);
            }
          }}
        />
        <Button onClick={() => onChange(value)} size="sm">
          Apply
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const TextColorButton = () => {
  const { editor } = useEditorStore();
  const value = editor?.getAttributes("textStyle").color || "#000000";

  const onChange = useCallback((color: ColorResult) => {
    editor?.chain().focus().setColor(color.hex).run();
  }, [editor]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm transition-colors">
          <span className='text-xs font-bold'>A</span>
          <div className='h-0.5 w-full' style={{ backgroundColor: value }} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='p-0'>
        <SketchPicker color={value} onChange={onChange} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const HighlightColorButton = () => {
  const { editor } = useEditorStore();
  const value = editor?.getAttributes("highlight").color || "#FFFF00";
  const isActive = editor?.isActive("highlight");

  const onChange = useCallback((color: ColorResult) => {
    editor?.chain().focus().setHighlight({ color: color.hex }).run();
  }, [editor]);

  const toggleHighlight = useCallback(() => {
    if (isActive) {
      editor?.chain().focus().unsetHighlight().run();
    } else {
      editor?.chain().focus().setHighlight({ color: value }).run();
    }
  }, [editor, isActive, value]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          onClick={toggleHighlight}
          className={cn(
            "h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm transition-colors",
            isActive && "bg-neutral-200/80"
          )}>
          <HighlighterIcon className='size-4' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='p-0'>
        <SketchPicker color={value} onChange={onChange} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const HeadingLevelButton = () => {
  const { editor } = useEditorStore();

  const headings = [
    { label: "Normal text", value: 0, fontSize: "16px" },
    { label: "Heading 1", value: 1, fontSize: "32px" },
    { label: "Heading 2", value: 2, fontSize: "24px" },
    { label: "Heading 3", value: 3, fontSize: "20px" },
    { label: "Heading 4", value: 4, fontSize: "18px" },
    { label: "Heading 5", value: 5, fontSize: "16px" },
  ];

  const getCurrentHeading = useCallback(() => {
    for (let level = 1; level <= 5; level++) {
      if (editor?.isActive("heading", { level })) {
        return `Heading ${level}`;
      }
    }
    return "Normal text";
  }, [editor]);

  const currentHeading = getCurrentHeading();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-7 min-w-7 shrink-0 flex items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm transition-colors">
          <span className='truncate text-xs'>{currentHeading}</span>
          <ChevronDownIcon className="ml-1 size-3 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='p-1 flex flex-col gap-y-1'>
        {headings.map(({ label, value, fontSize }) => (
          <button 
            onClick={() => {
              if (value === 0) {
                editor?.chain().focus().setParagraph().run();
              } else {
                editor?.chain().focus().setHeading({ level: value as Level }).run();
              }
            }} 
            key={value} 
            style={{ fontSize }} 
            className={cn(
              "flex items-center gap-x-2 py-1 px-2 rounded-sm hover:bg-neutral-200/80 transition-colors text-left",
              ((value === 0 && !editor?.isActive("heading")) || editor?.isActive("heading", { level: value })) && "bg-neutral-200/80"
            )}>
            {label}
          </button>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const FontFamilyButton = () => {
  const { editor } = useEditorStore();

  const fonts = [
    { label: "Arial", value: "Arial" },
    { label: "Times New Roman", value: "Times New Roman" },
    { label: "Courier New", value: "Courier New" },
    { label: "Georgia", value: "Georgia" },
    { label: "Verdana", value: "Verdana" },
  ];

  const currentFont = editor?.getAttributes("textStyle").fontFamily || "Arial";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-7 w-[100px] md:w-[120px] shrink-0 flex items-center justify-between rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm transition-colors">
          <span className='truncate text-xs'>{currentFont}</span>
          <ChevronDownIcon className="ml-1 size-3 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='p-1 flex flex-col gap-y-1'>
        {fonts.map(({ label, value }) => (
          <button 
            onClick={() => editor?.chain().focus().setFontFamily(value).run()} 
            key={value} 
            className={cn(
              "flex items-center gap-x-2 py-1 px-2 rounded-sm hover:bg-neutral-200/80 transition-colors text-left",
              currentFont === value && "bg-neutral-200/80"
            )} 
            style={{ fontFamily: value }}>
            <span className='text-sm'>{label}</span>
          </button>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface ToolbarButtonProps {
  onClick?: () => void;
  isActive?: boolean;
  icon: LucideIcon;
  disabled?: boolean;
}

const ToolbarButton = ({ onClick, isActive, icon: Icon, disabled }: ToolbarButtonProps) => {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={cn(
        "text-sm min-w-7 h-7 flex items-center justify-center rounded-sm hover:bg-neutral-200/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        isActive && "bg-neutral-200/80"
      )}>
      <Icon className="size-4" />
    </button>
  );
};

export const Toolbar = () => {
  const { editor } = useEditorStore();

  const sections: {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    isActive?: boolean;
  }[][] = [
    [
      {
        label: "Undo",
        icon: Undo2Icon,
        onClick: () => editor?.chain().focus().undo().run(),
      },
      {
        label: "Redo",
        icon: Redo2Icon,
        onClick: () => editor?.chain().focus().redo().run(),
      },
      {
        label: "Print",
        icon: PrinterIcon,
        onClick: () => window.print(),
      },
      {
        label: "Spell Check",
        icon: SpellCheck,
        onClick: () => {
          const current = editor?.view.dom.getAttribute("spellcheck") ?? "true";
          editor?.view.dom.setAttribute("spellcheck", current === "true" ? "false" : "true");
        }
      },
    ],
    [
      {
        label: "Bold",
        icon: BoldIcon,
        isActive: editor?.isActive("bold"),
        onClick: () => editor?.chain().focus().toggleBold().run(),
      },
      {
        label: "Italic",
        icon: ItalicIcon,
        isActive: editor?.isActive("italic"),
        onClick: () => editor?.chain().focus().toggleItalic().run(),
      },
      {
        label: "Underline",
        icon: UnderlineIcon,
        isActive: editor?.isActive("underline"),
        onClick: () => editor?.chain().focus().toggleUnderline().run(),
      },
      {
        label: "Strikethrough",
        icon: StrikethroughIcon,
        isActive: editor?.isActive("strike"),
        onClick: () => editor?.chain().focus().toggleStrike().run(),
      }
    ],
    [
      {
        label: "Comment",
        icon: MessageSquarePlusIcon,
        onClick: () => editor?.chain().focus().addPendingComment().run(),
        isActive: editor?.isActive("liveblocksCommentMark"),
      },
      {
        label: "List Todo",
        icon: ListTodoIcon,
        onClick: () => editor?.chain().focus().toggleTaskList().run(),
        isActive: editor?.isActive("taskList"),
      },
      {
        label: "Remove Formatting",
        icon: RemoveFormattingIcon,
        onClick: () => editor?.chain().focus().unsetAllMarks().clearNodes().run(),
      }
    ]
  ];

  return (
    <div className="bg-[#F1F4F9] px-2.5 py-0.5 rounded-[24px] min-h-[40px] flex items-center gap-x-0.5 overflow-x-auto">
      {/* First section - Basic actions */}
      <div className="flex items-center gap-x-0.5">
        {sections[0].map((item) => (
          <ToolbarButton key={item.label} {...item} />
        ))}
      </div>
      
      <Separator orientation='vertical' className='h-6 bg-neutral-300' />
      
      {/* Font controls - responsive */}
      <div className="flex items-center gap-x-0.5">
        <FontFamilyButton />
        <Separator orientation='vertical' className='h-6 bg-neutral-300' />
        <HeadingLevelButton />
        <Separator orientation='vertical' className='h-6 bg-neutral-300' />
        <FontSizeButton />
      </div>
      
      <Separator orientation='vertical' className='h-6 bg-neutral-300' />
      
      {/* Text formatting */}
      <div className="flex items-center gap-x-0.5">
        {sections[1].map((item) => (
          <ToolbarButton key={item.label} {...item} />
        ))}
        <TextColorButton />
        <HighlightColorButton />
      </div>
      
      <Separator orientation='vertical' className='h-6 bg-neutral-300' />
      
      {/* Insert and layout */}
      <div className="flex items-center gap-x-0.5">
        <LinkButton />
        <ImageButton />
        <AlignButton />
        <LineHeightButton />
        <ListButton />
      </div>
      
      <Separator orientation='vertical' className='h-6 bg-neutral-300' />
      
      {/* Additional actions */}
      <div className="flex items-center gap-x-0.5">
        {sections[2].map((item) => (
          <ToolbarButton key={item.label} {...item} />
        ))}
      </div>
    </div>
  );
};