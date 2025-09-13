import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X } from 'lucide-react';

interface LinkProperties {
  displayText: string;
  linkType: 'url' | 'email' | 'phone' | 'anchor';
  protocol: 'http://' | 'https://' | 'mailto:' | 'tel:' | '';
  url: string;
  target: 'not_set' | 'frame' | 'popup' | '_blank' | '_top' | '_self' | '_parent';
  title: string;
  rel: string;
}

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (properties: LinkProperties) => void;
  initialProperties?: Partial<LinkProperties>;
}

export const LinkModal: React.FC<LinkModalProps> = ({
  isOpen,
  onClose,
  onApply,
  initialProperties
}) => {
  const [activeTab, setActiveTab] = useState<'linkInfo' | 'target'>('linkInfo');
  const [properties, setProperties] = useState<LinkProperties>({
    displayText: '',
    linkType: 'url',
    protocol: 'https://',
    url: '',
    target: 'not_set',
    title: '',
    rel: '',
  });

  useEffect(() => {
    if (initialProperties) {
      setProperties(prev => ({ ...prev, ...initialProperties }));
    }
  }, [initialProperties]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Link modal form submitted with properties:', properties);
    onApply(properties);
    onClose();
    return false;
  };

  const updateProperty = (key: keyof LinkProperties, value: any) => {
    setProperties(prev => ({ ...prev, [key]: value }));
  };

  const handleLinkTypeChange = (linkType: LinkProperties['linkType']) => {
    let protocol: LinkProperties['protocol'] = 'https://';
    
    switch (linkType) {
      case 'email':
        protocol = 'mailto:';
        break;
      case 'phone':
        protocol = 'tel:';
        break;
      case 'anchor':
        protocol = '';
        break;
      default:
        protocol = 'https://';
    }
    
    setProperties(prev => ({ 
      ...prev, 
      linkType, 
      protocol,
      url: linkType === 'anchor' ? prev.url.replace(/^(https?:\/\/|mailto:|tel:)/, '') : prev.url
    }));
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Link</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            type="button"
            onClick={() => setActiveTab('linkInfo')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'linkInfo'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Link Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('target')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'target'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Target
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {activeTab === 'linkInfo' && (
            <>
              {/* Display Text */}
              <div>
                <label className="block text-sm font-medium mb-1">Display Text</label>
                <Input
                  value={properties.displayText}
                  onChange={(e) => updateProperty('displayText', e.target.value)}
                  placeholder="Link text"
                  className="w-full"
                />
              </div>

              {/* Link Type */}
              <div>
                <label className="block text-sm font-medium mb-1">Link Type</label>
                <select
                  value={properties.linkType}
                  onChange={(e) => handleLinkTypeChange(e.target.value as LinkProperties['linkType'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="url">URL</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="anchor">Anchor</option>
                </select>
              </div>

              {/* Protocol */}
              {properties.linkType !== 'anchor' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Protocol</label>
                  <select
                    value={properties.protocol}
                    onChange={(e) => updateProperty('protocol', e.target.value as LinkProperties['protocol'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {properties.linkType === 'url' && (
                      <>
                        <option value="https://">https://</option>
                        <option value="http://">http://</option>
                      </>
                    )}
                    {properties.linkType === 'email' && (
                      <option value="mailto:">mailto:</option>
                    )}
                    {properties.linkType === 'phone' && (
                      <option value="tel:">tel:</option>
                    )}
                  </select>
                </div>
              )}

              {/* URL */}
              <div>
                <label className="block text-sm font-medium mb-1">URL</label>
                <Input
                  value={properties.url}
                  onChange={(e) => updateProperty('url', e.target.value)}
                  placeholder={
                    properties.linkType === 'email' 
                      ? 'email@example.com'
                      : properties.linkType === 'phone'
                      ? '+1234567890'
                      : properties.linkType === 'anchor'
                      ? 'anchor-name'
                      : 'www.example.com'
                  }
                  className="w-full"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  value={properties.title}
                  onChange={(e) => updateProperty('title', e.target.value)}
                  placeholder="Link title (tooltip)"
                  className="w-full"
                />
              </div>

              {/* Rel */}
              <div>
                <label className="block text-sm font-medium mb-1">Rel</label>
                <Input
                  value={properties.rel}
                  onChange={(e) => updateProperty('rel', e.target.value)}
                  placeholder="nofollow, noopener, etc."
                  className="w-full"
                />
              </div>
            </>
          )}

          {activeTab === 'target' && (
            <div>
              <label className="block text-sm font-medium mb-2">Target</label>
              <select
                value={properties.target}
                onChange={(e) => updateProperty('target', e.target.value as LinkProperties['target'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="not_set">&lt;not set&gt;</option>
                <option value="frame">&lt;frame&gt;</option>
                <option value="popup">&lt;popup window&gt;</option>
                <option value="_blank">New Window (_blank)</option>
                <option value="_top">Topmost Window (_top)</option>
                <option value="_self">Same Window (_self)</option>
                <option value="_parent">Parent Window (_parent)</option>
              </select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="button" 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                console.log('Link modal OK clicked with properties:', properties);
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
