# Rich Text Editor Installation

The rich text editor now uses **Tiptap** instead of React Quill, which is fully compatible with React 19.

## Installation

Install the required packages:

```bash
yarn add @tiptap/react @tiptap/starter-kit @tiptap/extension-underline @tiptap/extension-text-align @tiptap/extension-link @tiptap/extension-image @tiptap/extension-text-style @tiptap/extension-color
```

Or if using npm:

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-underline @tiptap/extension-text-align @tiptap/extension-link @tiptap/extension-image @tiptap/extension-text-style @tiptap/extension-color
```

## Features

The rich text editor includes:

- **Text Formatting**: Bold, italic, underline, strikethrough
- **Headers**: H1-H6
- **Lists**: Ordered and unordered lists
- **Alignment**: Left, center, right
- **Links**: Insert and edit links
- **Images**: Insert images via URL
- **Code Blocks**: Syntax highlighting for code
- **Text Color**: Custom text color picker
- **HTML Support**: Full HTML and CSS support
- **Undo/Redo**: Full history support

The editor outputs HTML that can be saved directly to the database.

## Why Tiptap?

Tiptap is a modern, headless rich text editor that:

- ✅ Fully compatible with React 19
- ✅ No deprecated APIs (no findDOMNode)
- ✅ Better performance
- ✅ More extensible
- ✅ Better TypeScript support
