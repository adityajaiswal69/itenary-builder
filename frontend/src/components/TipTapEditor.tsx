import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Button } from './ui/button';
import { TablePropertiesModal } from './TablePropertiesModal';
import { LinkModal } from './LinkModal';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
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
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-blue-600 underline cursor-pointer',
          },
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-gray-300',
        },
        allowTableNodeSelection: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      // Get HTML content to preserve formatting, tables, and links
      const htmlContent = editor.getHTML();
      console.log('Editor content updated:', htmlContent);
      onChange(htmlContent);
    },
    editorProps: {
      attributes: {
        placeholder: placeholder,
      },
    },
    parseOptions: {
      preserveWhitespace: 'full',
    },
    enablePasteRules: true,
    enableInputRules: true,
  }, [value]);

  // Content is now handled by the useEditor dependency array

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
    console.log('Link button clicked, opening modal');
    setIsLinkModalOpen(true);
  };

  const handleLinkApply = (linkProperties: any) => {
    try {
      if (!editor) {
        console.error('Editor not ready');
        return;
      }
      
      const { displayText, linkType, protocol, url, target, title, rel } = linkProperties;
      
      let href = '';
      if (linkType === 'anchor') {
        href = url.startsWith('#') ? url : `#${url}`;
      } else {
        href = protocol + url;
      }
      
      const attributes: any = { href };
      if (target && target !== 'not_set') {
        attributes.target = target;
      }
      if (title) {
        attributes.title = title;
      }
      if (rel) {
        attributes.rel = rel;
      }
      
      console.log('Inserting link with properties:', { displayText, href, attributes });
      
      if (displayText) {
        // Insert new link with display text using TipTap's command
        editor.chain().focus().insertContent(displayText).setLink(attributes).run();
      } else {
        // Apply link to selected text
        editor.chain().focus().extendMarkRange('link').setLink(attributes).run();
      }
      
      console.log('Link inserted successfully');
    } catch (error) {
      console.error('Error inserting link:', error);
    }
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
  };

  const insertTable = () => {
    console.log('Table button clicked, opening modal');
    setIsTableModalOpen(true);
  };

  const handleTableApply = (tableProperties: any) => {
    try {
      if (!editor) {
        console.error('Editor not ready');
        return;
      }
      
      const { rows, cols, headers } = tableProperties;
      
      // Use TipTap's built-in table insertion command
      const withHeaderRow = headers === 'first_row' || headers === 'both';
      
      console.log('Inserting table with properties:', { rows, cols, withHeaderRow });
      console.log('Editor state before insertion:', {
        canInsertTable: editor.can().insertTable({ rows, cols, withHeaderRow }),
        currentContent: editor.getHTML(),
        selection: editor.state.selection
      });
      
      // Force focus first
      editor.commands.focus();
      
      // Insert the table
      const success = editor.chain()
        .focus()
        .insertTable({ 
          rows: rows, 
          cols: cols, 
          withHeaderRow: withHeaderRow 
        })
        .run();
      
      console.log('Table insertion result:', success);
      
      if (success) {
        console.log('Table inserted successfully');
        console.log('Editor HTML after insertion:', editor.getHTML());
        
        // Add caption if provided
        if (tableProperties.caption) {
          editor.chain().focus().insertContent(`<p><em>${tableProperties.caption}</em></p>`).run();
        }
      } else {
        console.error('Table insertion failed');
      }
    } catch (error) {
      console.error('Error inserting table:', error);
    }
  };

  const toggleCodeView = () => {
    editor.chain().focus().toggleCodeBlock().run();
  };

  return (
    <>
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
          <LinkIcon className="h-4 w-4" />
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
        
        .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
          cursor: pointer;
        }
        
        .ProseMirror a:hover {
          color: #1d4ed8;
        }
        
        .ProseMirror table {
          border-collapse: collapse;
          margin: 1rem 0;
          width: 100%;
        }
        
        .ProseMirror table th,
        .ProseMirror table td {
          border: 1px solid #d1d5db;
          padding: 0.5rem;
          text-align: left;
        }
        
        .ProseMirror table th {
          background-color: #f9fafb;
          font-weight: 600;
        }
        
        .ProseMirror table tr:nth-child(even) {
          background-color: #f9fafb;
        }
        
        .ProseMirror table tr:hover {
          background-color: #f3f4f6;
        }
        
        .ProseMirror table caption {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.5rem;
          text-align: left;
        }
        
        .ProseMirror table th {
          background-color: #f9fafb;
          font-weight: 600;
        }
        
        .ProseMirror table td,
        .ProseMirror table th {
          border: 1px solid #d1d5db;
          padding: 0.5rem;
          text-align: left;
          vertical-align: top;
        }
      `}</style>
      </div>

      {/* Modals */}
      <TablePropertiesModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        onApply={handleTableApply}
      />
      
      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onApply={handleLinkApply}
      />
    </>
  );
};
