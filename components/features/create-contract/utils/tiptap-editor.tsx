"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import FontFamily from '@tiptap/extension-font-family';
import { Extension } from '@tiptap/core';
import { TextFormatting } from "./types";

interface TipTapEditorProps {
  value: string;
  onChange: (value: string, formatting?: TextFormatting) => void;
  formatting?: TextFormatting;
  onFormattingChange?: (formatting: TextFormatting) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const TipTapEditor = ({
  value,
  onChange,
  formatting = {},
  onFormattingChange,
  placeholder = "Type something...",
  onFocus,
  onBlur,
}: TipTapEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Track when formatting is updated via the toolbar
  const [localFormatting, setLocalFormatting] = useState<TextFormatting>(formatting);

  // Create TipTap editor instance
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
      }),
      TextStyle,
      Color,
      Underline,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Extension.create({
        name: 'lineHeight',
        addGlobalAttributes() {
          return [
            {
              types: ['paragraph', 'heading'],
              attributes: {
                lineHeight: {
                  default: 1.35,
                  parseHTML: element => element.style.lineHeight,
                  renderHTML: attributes => {
                    if (!attributes.lineHeight) return {}
                    return { style: `line-height: ${attributes.lineHeight}` }
                  },
                },
              },
            },
          ]
        },
      }),
    ],
    content: value || `<p>${placeholder}</p>`,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose max-w-none focus:outline-none min-h-[22px] p-1',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    onFocus: ({ editor, event }) => {
      setIsFocused(true);
      if (onFocus) onFocus();
    },
    onBlur: ({ editor, event }) => {
      setIsFocused(false);
      if (onBlur) onBlur();
    },
  });

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || `<p>${placeholder}</p>`);
    }
  }, [editor, value, placeholder]);

  // Update formatting when it changes externally
  useEffect(() => {
    if (editor && formatting) {
      // Prevent unnecessary state updates by comparing with current local formatting
      // This helps break the circular update pattern that causes infinite loops
      const hasFormatChanged = JSON.stringify(formatting) !== JSON.stringify(localFormatting);
      
      if (hasFormatChanged) {
        setLocalFormatting(formatting);
        
        // Apply formatting to editor based on the current state
        if (formatting.bold && !editor.isActive('bold')) {
          editor.chain().setBold().run();
        } else if (formatting.bold === false && editor.isActive('bold')) {
          editor.chain().unsetBold().run();
        }
        
        if (formatting.italic && !editor.isActive('italic')) {
          editor.chain().setItalic().run();
        } else if (formatting.italic === false && editor.isActive('italic')) {
          editor.chain().unsetItalic().run();
        }
        
        if (formatting.underline && !editor.isActive('underline')) {
          editor.chain().setUnderline().run();
        } else if (formatting.underline === false && editor.isActive('underline')) {
          editor.chain().unsetUnderline().run();
        }
        
        if (formatting.alignment) {
          editor.chain().setTextAlign(formatting.alignment).run();
        }
        
        if (formatting.color) {
          editor.chain().setColor(formatting.color).run();
        }
        
        if (formatting.fontSize) {
          const element = editor.view.dom as HTMLElement;
          if (element) {
            element.style.fontSize = `${formatting.fontSize}px`;
          }
        }

        if (formatting.fontFamily) {
          editor.chain().setFontFamily(formatting.fontFamily).run();
        }

        if (formatting.lineHeight) {
          editor.chain().updateAttributes('paragraph', { lineHeight: formatting.lineHeight }).run();
          editor.chain().updateAttributes('heading', { lineHeight: formatting.lineHeight }).run();
        }
      }
    }
  }, [editor, formatting, localFormatting]);

  // Function to toggle formatting and notify parent
  const toggleFormat = useCallback((type: keyof TextFormatting, value?: any) => {
    if (!editor || !onFormattingChange) return;
    
    const newFormatting = { ...localFormatting };
    
    switch (type) {
      case 'bold':
        editor.chain().toggleBold().focus().run();
        newFormatting.bold = !newFormatting.bold;
        break;
      case 'italic':
        editor.chain().toggleItalic().focus().run();
        newFormatting.italic = !newFormatting.italic;
        break;
      case 'underline':
        editor.chain().toggleUnderline().focus().run();
        newFormatting.underline = !newFormatting.underline;
        break;
      case 'alignment':
        editor.chain().setTextAlign(value as string).focus().run();
        newFormatting.alignment = value as 'left' | 'center' | 'right';
        newFormatting.textAlign = value as 'left' | 'center' | 'right';
        break;
      case 'fontSize':
        const element = editor.view.dom as HTMLElement;
        if (element) {
          element.style.fontSize = `${value}px`;
        }
        newFormatting.fontSize = value;
        break;
      case 'color':
        editor.chain().setColor(value as string).focus().run();
        newFormatting.color = value as string;
        break;
      case 'fontFamily':
        // Apply font family to both the editor and the formatting state
        editor.chain().setFontFamily(value as string).focus().run();
        newFormatting.fontFamily = value as string;
        // Update the editor's font family style
        const editorElement = editor.view.dom as HTMLElement;
        if (editorElement) {
          editorElement.style.fontFamily = value as string;
        }
        break;
      case 'lineHeight':
        // Fix: Use updateAttributes instead of setAttributes
        editor.chain().updateAttributes('paragraph', { lineHeight: value }).focus().run();
        editor.chain().updateAttributes('heading', { lineHeight: value }).focus().run();
        newFormatting.lineHeight = value as number;
        // Update the editor's line height style
        const editorDom = editor.view.dom as HTMLElement;
        if (editorDom) {
          editorDom.style.lineHeight = String(value);
        }
        break;
    }
    
    setLocalFormatting(newFormatting);
    onFormattingChange(newFormatting);
  }, [editor, localFormatting, onFormattingChange]);

  // Helper to check if formatting is active
  const isActive = useCallback((type: string, value?: string) => {
    if (!editor) return false;
    
    if (value) {
      return editor.isActive(type, { [type]: value });
    }
    
    return editor.isActive(type);
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Editor Content - Removing the formatting toolbar */}
      <div 
        ref={editorRef}
        className={`tiptap-editor-container transition-colors ${isFocused ? 'bg-blue-50 rounded' : ''}`}
      >
        <EditorContent editor={editor} />
      </div>
      
      <style jsx global>{`
        .tiptap-editor-container .ProseMirror {
          min-height: 22px; /* More compact display */
          outline: none;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          /* Make sure the editor styling matches the preview */
          line-height: 1.35;
          padding: 2px 4px;
          word-wrap: break-word; /* Ensure text wraps properly */
          overflow-wrap: break-word; /* Modern browsers */
          white-space: pre-wrap; /* Preserve whitespace but wrap text */
          width: 100%; /* Ensure full width */
          box-sizing: border-box; /* Include padding in width calculation */
        }
        
        .tiptap-editor-container .ProseMirror p {
          margin: 0; /* Remove margins for more compact display */
        }
        
        .tiptap-editor-container .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        
        .tiptap-editor-container .ProseMirror:focus {
          outline: none;
        }
        
        /* Ensure formatting is visually consistent between editor and preview */
        .tiptap-editor-container .ProseMirror strong {
          font-weight: bold;
        }
        
        .tiptap-editor-container .ProseMirror em {
          font-style: italic;
        }
        
        .tiptap-editor-container .ProseMirror u {
          text-decoration: underline;
        }
        
        /* Make header styles consistent with PDF output */
        .tiptap-editor-container .ProseMirror h1 {
          font-size: 24px;
          font-weight: bold;
          margin-top: 6px;
          margin-bottom: 6px;
        }
        
        .tiptap-editor-container .ProseMirror h2 {
          font-size: 20px;
          font-weight: bold;
          margin-top: 4px;
          margin-bottom: 4px;
        }
        
        .tiptap-editor-container .ProseMirror h3 {
          font-size: 18px;
          font-weight: bold;
          margin-top: 3px;
          margin-bottom: 3px;
        }
      `}</style>
    </div>
  );
};