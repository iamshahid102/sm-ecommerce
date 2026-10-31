"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function ToolbarButton({ active, onClick, label, children }) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="icon-sm"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  );
}

export function RichTextEditor({ value, onChange, placeholder }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
    ],
    content: value || "<p></p>",
    onUpdate: ({ editor: current }) => {
      const html = current.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm min-h-64 max-w-none px-4 py-3 outline-none",
          "prose-headings:font-heading prose-headings:font-semibold",
          "prose-a:text-primary prose-blockquote:border-primary/30",
        ),
        "data-placeholder": placeholder || "Write the page content…",
      },
    },
  });

  if (!editor) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-xl border bg-muted/30 text-sm text-muted-foreground">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-background">
      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/40 p-1.5">
        <ToolbarButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          label="Bold"
        >
          <Bold className="size-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          label="Italic"
        >
          <Italic className="size-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          label="Strikethrough"
        >
          <Strikethrough className="size-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          label="Heading 2"
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          label="Heading 3"
        >
          H3
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          label="Bullet list"
        >
          <List className="size-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          label="Numbered list"
        >
          <ListOrdered className="size-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          label="Quote"
        >
          <Quote className="size-4" aria-hidden="true" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-border" />
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          label="Undo"
        >
          <Undo2 className="size-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          label="Redo"
        >
          <Redo2 className="size-4" aria-hidden="true" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} className="[&_.ProseMirror]:min-h-64" />
    </div>
  );
}
