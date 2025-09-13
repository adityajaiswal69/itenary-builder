import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X } from 'lucide-react';

interface TableProperties {
  rows: number;
  cols: number;
  width: string;
  height: string;
  headers: 'none' | 'first_row' | 'first_col' | 'both';
  cellSpacing: number;
  borderSize: number;
  cellPadding: number;
  alignment: 'left' | 'center' | 'right' | 'not_set';
  caption: string;
  summary: string;
}

interface TablePropertiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (properties: TableProperties) => void;
  initialProperties?: Partial<TableProperties>;
}

export const TablePropertiesModal: React.FC<TablePropertiesModalProps> = ({
  isOpen,
  onClose,
  onApply,
  initialProperties
}) => {
  const [properties, setProperties] = useState<TableProperties>({
    rows: 3,
    cols: 2,
    width: '100%',
    height: '',
    headers: 'none',
    cellSpacing: 1,
    borderSize: 1,
    cellPadding: 1,
    alignment: 'not_set',
    caption: '',
    summary: '',
  });

  useEffect(() => {
    if (initialProperties) {
      setProperties(prev => ({ ...prev, ...initialProperties }));
    }
  }, [initialProperties]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Table modal form submitted with properties:', properties);
    onApply(properties);
    onClose();
    return false;
  };

  const updateProperty = (key: keyof TableProperties, value: any) => {
    setProperties(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Table Properties</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Table Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Rows</label>
              <Input
                type="number"
                min="1"
                max="50"
                value={properties.rows}
                onChange={(e) => updateProperty('rows', parseInt(e.target.value) || 1)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Columns</label>
              <Input
                type="number"
                min="1"
                max="20"
                value={properties.cols}
                onChange={(e) => updateProperty('cols', parseInt(e.target.value) || 1)}
                className="w-full"
              />
            </div>
          </div>

          {/* Table Sizing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Width</label>
              <Input
                value={properties.width}
                onChange={(e) => updateProperty('width', e.target.value)}
                placeholder="100%"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Height</label>
              <Input
                value={properties.height}
                onChange={(e) => updateProperty('height', e.target.value)}
                placeholder="auto"
                className="w-full"
              />
            </div>
          </div>

          {/* Headers */}
          <div>
            <label className="block text-sm font-medium mb-1">Headers</label>
            <select
              value={properties.headers}
              onChange={(e) => updateProperty('headers', e.target.value as TableProperties['headers'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="none">None</option>
              <option value="first_row">First Row</option>
              <option value="first_col">First Column</option>
              <option value="both">Both</option>
            </select>
          </div>

          {/* Table Styling */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Cell Spacing</label>
              <Input
                type="number"
                min="0"
                value={properties.cellSpacing}
                onChange={(e) => updateProperty('cellSpacing', parseInt(e.target.value) || 0)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Border Size</label>
              <Input
                type="number"
                min="0"
                value={properties.borderSize}
                onChange={(e) => updateProperty('borderSize', parseInt(e.target.value) || 0)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cell Padding</label>
              <Input
                type="number"
                min="0"
                value={properties.cellPadding}
                onChange={(e) => updateProperty('cellPadding', parseInt(e.target.value) || 0)}
                className="w-full"
              />
            </div>
          </div>

          {/* Alignment */}
          <div>
            <label className="block text-sm font-medium mb-1">Alignment</label>
            <select
              value={properties.alignment}
              onChange={(e) => updateProperty('alignment', e.target.value as TableProperties['alignment'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="not_set">&lt;not set&gt;</option>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm font-medium mb-1">Caption</label>
            <Input
              value={properties.caption}
              onChange={(e) => updateProperty('caption', e.target.value)}
              placeholder="Table caption"
              className="w-full"
            />
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium mb-1">Summary</label>
            <Input
              value={properties.summary}
              onChange={(e) => updateProperty('summary', e.target.value)}
              placeholder="Table summary"
              className="w-full"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="button" 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                console.log('Table modal OK clicked with properties:', properties);
                onApply(properties);
                onClose();
              }}
            >
              OK
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
