import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link,
  Unlink,
  Image,
  Table,
  Calendar,
  Code
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start typing here...'
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      editorRef.current.innerHTML = value || '';
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value && isInitialized) {
      // Store current cursor position safely
      const selection = window.getSelection();
      let startOffset = 0;
      let endOffset = 0;
      
      try {
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          startOffset = range.startOffset || 0;
          endOffset = range.endOffset || 0;
        }
      } catch (error) {
        // If there's any error getting the range, just use 0
        console.warn('Error getting selection range:', error);
      }
      
      editorRef.current.innerHTML = value;
      
      // Restore cursor position safely
      if (selection && editorRef.current.firstChild) {
        try {
          const newRange = document.createRange();
          const textLength = editorRef.current.firstChild.textContent?.length || 0;
          newRange.setStart(editorRef.current.firstChild, Math.min(startOffset, textLength));
          newRange.setEnd(editorRef.current.firstChild, Math.min(endOffset, textLength));
          selection.removeAllRanges();
          selection.addRange(newRange);
        } catch (error) {
          // Fallback: set cursor to end
          try {
            const range = document.createRange();
            range.selectNodeContents(editorRef.current);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          } catch (fallbackError) {
            console.warn('Error setting fallback cursor position:', fallbackError);
          }
        }
      }
    }
  }, [value, isInitialized]);

  const execCommand = (command: string, value?: string) => {
    try {
      document.execCommand(command, false, value);
      editorRef.current?.focus();
      updateValue();
    } catch (error) {
      console.warn('Error executing command:', command, error);
    }
  };

  const updateValue = () => {
    try {
      if (editorRef.current) {
        const newValue = editorRef.current.innerHTML;
        if (newValue !== value) {
          onChange(newValue);
        }
      }
    } catch (error) {
      console.warn('Error updating value:', error);
    }
  };

  const handleInput = () => {
    // Store current cursor position safely
    const selection = window.getSelection();
    let startOffset = 0;
    let endOffset = 0;
    
    try {
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        startOffset = range.startOffset || 0;
        endOffset = range.endOffset || 0;
      }
    } catch (error) {
      // If there's any error getting the range, just use 0
      console.warn('Error getting selection range in handleInput:', error);
    }
    
    updateValue();
    
    // Restore cursor position after update
    if (selection && editorRef.current?.firstChild) {
      try {
        const newRange = document.createRange();
        const textLength = editorRef.current.firstChild.textContent?.length || 0;
        newRange.setStart(editorRef.current.firstChild, Math.min(startOffset, textLength));
        newRange.setEnd(editorRef.current.firstChild, Math.min(endOffset, textLength));
        selection.removeAllRanges();
        selection.addRange(newRange);
      } catch (error) {
        // Fallback: set cursor to end
        try {
          const range = document.createRange();
          range.selectNodeContents(editorRef.current!);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        } catch (fallbackError) {
          console.warn('Error setting fallback cursor position in handleInput:', fallbackError);
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    try {
      if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        execCommand('insertLineBreak');
      }
    } catch (error) {
      console.warn('Error handling keydown:', error);
    }
  };

  const insertLink = () => {
    const selection = window.getSelection();
    try {
      if (selection && selection.toString()) {
        setSelectedText(selection.toString());
        setIsLinkModalOpen(true);
      }
    } catch (error) {
      console.warn('Error getting selection for link:', error);
    }
  };

  const applyLink = () => {
    try {
      if (linkUrl.trim()) {
        execCommand('createLink', linkUrl);
        setLinkUrl('');
        setIsLinkModalOpen(false);
      }
    } catch (error) {
      console.warn('Error applying link:', error);
    }
  };

  const removeLink = () => {
    try {
      execCommand('unlink');
    } catch (error) {
      console.warn('Error removing link:', error);
    }
  };

  const insertTable = () => {
    try {
      const tableHTML = `
        <table border="1" style="border-collapse: collapse; width: 100%;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">Cell 1</td>
            <td style="padding: 8px; border: 1px solid #ddd;">Cell 2</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">Cell 3</td>
            <td style="padding: 8px; border: 1px solid #ddd;">Cell 4</td>
          </tr>
        </table>
      `;
      execCommand('insertHTML', tableHTML);
    } catch (error) {
      console.warn('Error inserting table:', error);
    }
  };

  const insertImage = () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        try {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              try {
                const imgHTML = `<img src="${e.target?.result}" alt="Uploaded image" style="max-width: 100%; height: auto;" />`;
                execCommand('insertHTML', imgHTML);
              } catch (error) {
                console.warn('Error inserting image HTML:', error);
              }
            };
            reader.onerror = (error) => {
              console.warn('Error reading file:', error);
            };
            reader.readAsDataURL(file);
          }
        } catch (error) {
          console.warn('Error handling file input:', error);
        }
      };
      input.click();
    } catch (error) {
      console.warn('Error creating file input:', error);
    }
  };

  const toggleCodeView = () => {
    try {
      if (editorRef.current) {
        if (editorRef.current.contentEditable === 'true') {
          editorRef.current.contentEditable = 'false';
          editorRef.current.style.backgroundColor = '#f5f5f5';
          editorRef.current.style.fontFamily = 'monospace';
        } else {
          editorRef.current.contentEditable = 'true';
          editorRef.current.style.backgroundColor = 'white';
          editorRef.current.style.fontFamily = 'inherit';
        }
      }
    } catch (error) {
      console.warn('Error toggling code view:', error);
    }
  };

  // Add error handling for the entire component
  try {
    return (
      <div className="border rounded-lg overflow-hidden">
        {/* Toolbar */}
        <div className="bg-gray-50 border-b p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand('bold')}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand('italic')}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand('underline')}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Alignment */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand('justifyLeft')}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand('justifyCenter')}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand('justifyRight')}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand('justifyFull')}
          title="Justify"
        >
          <AlignJustify className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Lists */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand('insertUnorderedList')}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand('insertOrderedList')}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Links */}
        <Button
          variant="ghost"
          size="sm"
          onClick={insertLink}
          title="Insert Link"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={removeLink}
          title="Remove Link"
        >
          <Unlink className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Media */}
        <Button
          variant="ghost"
          size="sm"
          onClick={insertImage}
          title="Insert Image"
        >
          <Image className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={insertTable}
          title="Insert Table"
        >
          <Table className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand('insertDate')}
          title="Insert Date"
        >
          <Calendar className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Code View */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCodeView}
          title="Source Code"
        >
          <Code className="h-4 w-4" />
        </Button>
      </div>

             {/* Editor */}
       <div
         ref={editorRef}
         contentEditable
         className="min-h-[200px] p-4 focus:outline-none focus:ring-0 cursor-text"
         onInput={handleInput}
         onKeyDown={handleKeyDown}
         onFocus={() => editorRef.current?.focus()}
         data-placeholder={placeholder}
         style={{
           '--tw-placeholder-opacity': '0.5',
         } as React.CSSProperties}
       />

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full p-2 border rounded-md"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsLinkModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={applyLink}>
                  Insert
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
  } catch (error) {
    console.error('Error rendering RichTextEditor:', error);
    return (
      <div className="border rounded-lg p-4 bg-red-50">
        <p className="text-red-600">Error loading rich text editor. Please try again.</p>
      </div>
    );
  }
};
