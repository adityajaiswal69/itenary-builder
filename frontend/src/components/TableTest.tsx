import React, { useState } from 'react';
import { TipTapEditor } from './TipTapEditor';

export const TableTest: React.FC = () => {
  const [content, setContent] = useState('');

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Table Test</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">TipTap Editor:</h2>
        <TipTapEditor
          value={content}
          onChange={setContent}
          placeholder="Test table insertion..."
        />
      </div>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Raw HTML Output:</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {content}
        </pre>
      </div>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Rendered HTML:</h2>
        <div 
          className="prose max-w-none border p-4 rounded"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
};
