"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { useEffect } from "react";
import type { Editor } from "@tiptap/react";
import {
	Bold,
	Italic,
	Underline as UnderlineIcon,
	Strikethrough,
	Heading1,
	Heading2,
	Heading3,
	List,
	ListOrdered,
	AlignLeft,
	AlignCenter,
	AlignRight,
	Link as LinkIcon,
	Image as ImageIcon,
	Code,
	Palette,
	Undo,
	Redo,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
}

export function RichTextEditor({
	value,
	onChange,
	placeholder = "Enter content...",
	disabled = false,
}: RichTextEditorProps) {
	const editor = useEditor(
		{
			extensions: [
				StarterKit.configure({
					heading: {
						levels: [1, 2, 3, 4, 5, 6],
					},
				}),
				Underline,
				TextAlign.configure({
					types: ["heading", "paragraph"],
				}),
				Link.configure({
					openOnClick: false,
					HTMLAttributes: {
						class: "text-primary underline",
					},
				}),
				Image.configure({
					HTMLAttributes: {
						class: "max-w-full h-auto rounded-md",
					},
				}),
				TextStyle,
				Color,
			],
			content: value,
			onUpdate: ({ editor }: { editor: Editor }) => {
				onChange(editor.getHTML());
			},
			editable: !disabled,
			immediatelyRender: false,
			editorProps: {
				attributes: {
					class:
						"prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-3",
					"data-placeholder": placeholder,
				},
			},
		},
		[]
	);

	useEffect(() => {
		if (editor && value !== editor.getHTML()) {
			editor.commands.setContent(value);
		}
	}, [value, editor]);

	if (!editor) {
		return (
			<div className="h-[300px] border rounded-md p-4 flex items-center justify-center text-muted-foreground">
				Loading editor...
			</div>
		);
	}

	const setLink = () => {
		const previousUrl = editor.getAttributes("link").href;
		const url = window.prompt("URL", previousUrl);

		if (url === null) {
			return;
		}

		if (url === "") {
			editor.chain().focus().extendMarkRange("link").unsetLink().run();
			return;
		}

		editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
	};

	const addImage = () => {
		const url = window.prompt("Image URL");

		if (url) {
			editor.chain().focus().setImage({ src: url }).run();
		}
	};

	return (
		<div className="rich-text-editor border rounded-md overflow-hidden">
			{/* Toolbar */}
			<div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/50">
				{/* Text Formatting */}
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleBold().run()}
					disabled={!editor.can().chain().focus().toggleBold().run()}
					className={editor.isActive("bold") ? "bg-muted" : ""}
				>
					<Bold className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleItalic().run()}
					disabled={!editor.can().chain().focus().toggleItalic().run()}
					className={editor.isActive("italic") ? "bg-muted" : ""}
				>
					<Italic className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleUnderline().run()}
					disabled={!editor.can().chain().focus().toggleUnderline().run()}
					className={editor.isActive("underline") ? "bg-muted" : ""}
				>
					<UnderlineIcon className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleStrike().run()}
					disabled={!editor.can().chain().focus().toggleStrike().run()}
					className={editor.isActive("strike") ? "bg-muted" : ""}
				>
					<Strikethrough className="h-4 w-4" />
				</Button>

				<div className="w-px h-6 bg-border mx-1" />

				{/* Headings */}
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
					className={editor.isActive("heading", { level: 1 }) ? "bg-muted" : ""}
				>
					<Heading1 className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
					className={editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""}
				>
					<Heading2 className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
					className={editor.isActive("heading", { level: 3 }) ? "bg-muted" : ""}
				>
					<Heading3 className="h-4 w-4" />
				</Button>

				<div className="w-px h-6 bg-border mx-1" />

				{/* Lists */}
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					className={editor.isActive("bulletList") ? "bg-muted" : ""}
				>
					<List className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
					className={editor.isActive("orderedList") ? "bg-muted" : ""}
				>
					<ListOrdered className="h-4 w-4" />
				</Button>

				<div className="w-px h-6 bg-border mx-1" />

				{/* Alignment */}
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().setTextAlign("left").run()}
					className={editor.isActive({ textAlign: "left" }) ? "bg-muted" : ""}
				>
					<AlignLeft className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().setTextAlign("center").run()}
					className={editor.isActive({ textAlign: "center" }) ? "bg-muted" : ""}
				>
					<AlignCenter className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().setTextAlign("right").run()}
					className={editor.isActive({ textAlign: "right" }) ? "bg-muted" : ""}
				>
					<AlignRight className="h-4 w-4" />
				</Button>

				<div className="w-px h-6 bg-border mx-1" />

				{/* Links & Media */}
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={setLink}
					className={editor.isActive("link") ? "bg-muted" : ""}
				>
					<LinkIcon className="h-4 w-4" />
				</Button>
				<Button type="button" variant="ghost" size="sm" onClick={addImage}>
					<ImageIcon className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleCodeBlock().run()}
					className={editor.isActive("codeBlock") ? "bg-muted" : ""}
				>
					<Code className="h-4 w-4" />
				</Button>

				<div className="w-px h-6 bg-border mx-1" />

				{/* Color Picker */}
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => {
						const color = window.prompt("Text Color (hex)", "#000000");
						if (color) {
							editor.chain().focus().setColor(color).run();
						}
					}}
				>
					<Palette className="h-4 w-4" />
				</Button>

				<div className="w-px h-6 bg-border mx-1" />

				{/* Undo/Redo */}
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().undo().run()}
					disabled={!editor.can().chain().focus().undo().run()}
				>
					<Undo className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().redo().run()}
					disabled={!editor.can().chain().focus().redo().run()}
				>
					<Redo className="h-4 w-4" />
				</Button>
			</div>

			{/* Editor Content */}
			<div className="bg-background">
				<EditorContent editor={editor} />
			</div>

			<style jsx global>{`
				.rich-text-editor .ProseMirror {
					outline: none;
					min-height: 300px;
				}
				.rich-text-editor .ProseMirror p.is-editor-empty:first-child::before {
					content: attr(data-placeholder);
					float: left;
					color: hsl(var(--muted-foreground));
					pointer-events: none;
					height: 0;
				}
				.rich-text-editor .ProseMirror p {
					margin: 0.5em 0;
				}
				.rich-text-editor .ProseMirror h1,
				.rich-text-editor .ProseMirror h2,
				.rich-text-editor .ProseMirror h3,
				.rich-text-editor .ProseMirror h4,
				.rich-text-editor .ProseMirror h5,
				.rich-text-editor .ProseMirror h6 {
					margin: 1em 0 0.5em 0;
					font-weight: 600;
				}
				.rich-text-editor .ProseMirror ul,
				.rich-text-editor .ProseMirror ol {
					padding-left: 1.5em;
					margin: 0.5em 0;
				}
				.rich-text-editor .ProseMirror blockquote {
					border-left: 3px solid hsl(var(--border));
					padding-left: 1em;
					margin: 1em 0;
					color: hsl(var(--muted-foreground));
				}
				.rich-text-editor .ProseMirror code {
					background-color: hsl(var(--muted));
					padding: 0.2em 0.4em;
					border-radius: 0.25rem;
					font-size: 0.9em;
				}
				.rich-text-editor .ProseMirror pre {
					background-color: hsl(var(--muted));
					padding: 1em;
					border-radius: 0.5rem;
					overflow-x: auto;
					margin: 1em 0;
				}
				.rich-text-editor .ProseMirror pre code {
					background-color: transparent;
					padding: 0;
				}
				.rich-text-editor .ProseMirror img {
					max-width: 100%;
					height: auto;
					margin: 1em 0;
				}
			`}</style>
		</div>
	);
}
