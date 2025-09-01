import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Button } from './ui/button';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link,
  Unlink,
  Table as TableIcon,
  Code
} from 'lucide-react';

interface TipTapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const TipTapEditor: React.FC<TipTapEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start typing here...'
}) => {


  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      // Get plain text content instead of HTML
      const plainText = editor.getText();
      onChange(plainText);
    },
    editorProps: {
      attributes: {
        placeholder: placeholder,
      },
    },
    parseOptions: {
      preserveWhitespace: 'full',
    },
  });

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getText()) {
      try {
        if (value && value.trim()) {
          // Since we're now storing plain text, just set it directly
          editor.commands.setContent(value, { emitUpdate: false });
        } else {
          editor.commands.clearContent();
        }
      } catch (error) {
        console.warn('Error setting content:', error);
        // Fallback: try to set as plain text
        editor.commands.setContent(value || '');
      }
    }
  }, [value, editor]);

  // Remove debug logging
  // useEffect(() => {
  //   if (editor) {
  //     console.log('Editor initialized with content:', editor.getHTML());
  //   }
  // }, [editor]);

  if (!editor) {
    return null;
  }

  const insertLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run();
  };

  const toggleCodeView = () => {
    editor.chain().focus().toggleCodeBlock().run();
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-200' : ''}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-200' : ''}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Lists */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Links */}
        <Button
          variant="ghost"
          size="sm"
          onClick={insertLink}
          className={editor.isActive('link') ? 'bg-gray-200' : ''}
          title="Insert Link"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={removeLink}
          disabled={!editor.isActive('link')}
          title="Remove Link"
        >
          <Unlink className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Table */}
        <Button
          variant="ghost"
          size="sm"
          onClick={insertTable}
          title="Insert Table"
        >
          <TableIcon className="h-4 w-4" />
        </Button>

        {/* Code View */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCodeView}
          className={editor.isActive('codeBlock') ? 'bg-gray-200' : ''}
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div className="min-h-[200px] p-4">
        <EditorContent 
          editor={editor} 
          className="prose max-w-none focus:outline-none"
        />
      </div>

      <style>{`
        .ProseMirror {
          outline: none;
          min-height: 150px;
        }
        
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        
        .ProseMirror p {
          margin: 0.5em 0;
        }
        
        .ProseMirror ul,
        .ProseMirror ol {
          padding: 0 1rem;
        }
        
        .ProseMirror table {
          border-collapse: collapse;
          margin: 0;
          overflow: hidden;
          table-layout: fixed;
          width: 100%;
        }
        
        .ProseMirror table td,
        .ProseMirror table th {
          border: 2px solid #ced4da;
          box-sizing: border-box;
          min-width: 1em;
          padding: 3px 5px;
          position: relative;
          vertical-align: top;
        }
        
        .ProseMirror table th {
          background-color: #f1f3f4;
          font-weight: bold;
        }
        
        .ProseMirror code {
          background-color: #f1f3f4;
          border-radius: 0.25em;
          box-decoration-break: clone;
          color: #616161;
          font-size: 0.9em;
          padding: 0.25em;
        }
        
        .ProseMirror pre {
          background: #0d0d0d;
          border-radius: 0.5rem;
          color: #fff;
          font-family: 'JetBrainsMono', monospace;
          padding: 0.75rem 1rem;
        }
        
        .ProseMirror pre code {
          background: none;
          color: inherit;
          font-size: 0.8rem;
          padding: 0;
        }
      `}</style>
    </div>
  );
};
