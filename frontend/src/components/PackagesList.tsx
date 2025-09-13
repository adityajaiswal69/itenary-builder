import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Plus, 
  Edit, 
  Copy, 
  Eye, 
  Share2, 
  Trash2, 
  Package, 
  LogOut,
  HelpCircle,
  // Bell,
  User,
  ChevronDown,
  Code,
  Facebook,
  MessageCircle,
  Instagram,
  Youtube,
  Mail,
  Phone,
  Globe,
  MapPin
} from 'lucide-react';
import { packageApi, companyDetailsApi } from '../services/api';
import type { Package as PackageType, CompanyDetails } from '../services/api';
import { ProfileModal } from './ProfileModal';

interface User {
  id: string;
  name: string;
  email: string;
}

interface PackagesListProps {
  user: User | null;
  onLogout: () => void;
  onCreatePackage: () => void;
  onEditPackage: (packageId: string) => void;
}

export const PackagesList: React.FC<PackagesListProps> = ({ 
  user,
  onLogout, 
  onCreatePackage, 
  onEditPackage 
}) => {
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchDestination, setSearchDestination] = useState('');
  const [publishStatus, setPublishStatus] = useState('all');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);

  useEffect(() => {
    loadPackages();
    loadCompanyDetails();
  }, []);

  const loadCompanyDetails = async () => {
    try {
      const response = await companyDetailsApi.get();
      if (response.data.success && response.data.data) {
        setCompanyDetails(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load company details:', error);
    }
  };

  const loadPackages = async () => {
    try {
      setLoading(true);
      const response = await packageApi.getAll();
      setPackages(response.data);
    } catch (error) {
      console.error('Failed to load packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePackage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    try {
      await packageApi.delete(id);
      await loadPackages();
    } catch (error) {
      console.error('Failed to delete package:', error);
    }
  };

  const duplicatePackage = async (pkg: PackageType) => {
    try {
      const newPackage = {
        ...pkg,
        title: `${pkg.title} (Copy)`,
        is_published: false,
      };
      delete (newPackage as any).id;
      delete (newPackage as any).created_at;
      delete (newPackage as any).updated_at;
      
      await packageApi.create(newPackage);
      await loadPackages();
    } catch (error) {
      console.error('Failed to duplicate package:', error);
    }
  };

  const getShareUrl = (pkg: PackageType) => {
    // Use the itinerary's share_uuid for the share URL
    if (!pkg.itinerary?.share_uuid) {
      throw new Error('Itinerary not published or share link not available');
    }
    return `${window.location.origin}/share/${pkg.itinerary.share_uuid}`;
  };

  const getIframeCode = (pkg: PackageType) => {
    // Use the itinerary's share_uuid for the iframe URL
    if (!pkg.itinerary?.share_uuid) {
      throw new Error('Itinerary not published or share link not available');
    }
    const iframeUrl = `${window.location.origin}/iframe/${pkg.itinerary.share_uuid}`;
    return `<iframe src="${iframeUrl}" width="100%" height="800" frameborder="0" style="border: none; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"></iframe>`;
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesDestination = searchDestination === '' || 
      pkg.locations.some(location => 
        location.toLowerCase().includes(searchDestination.toLowerCase())
      );
    const matchesStatus = publishStatus === 'all' || 
      (publishStatus === 'published' && pkg.is_published) ||
      (publishStatus === 'unpublished' && !pkg.is_published);
    
    return matchesDestination && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {companyDetails?.logo ? (
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src={companyDetails.logo.startsWith('http') ? companyDetails.logo : `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}${companyDetails.logo}`} 
                    alt="Company Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-white" />
                </div>
              )}
              <div>
                <div className="text-xl font-bold text-gray-800">
                  {companyDetails?.company_name || 'Itinerary Manager'}
                </div>
                {companyDetails?.description && (
                  <div className="text-xs text-gray-500 max-w-xs truncate">
                    {companyDetails.description}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <HelpCircle className="h-4 w-4 mr-2" />
              Help & Support
            </Button>
            {/* <div className="relative">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  1
                </span>
              </Button>
            </div> */}
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name || 'Guest'}</p>
                
              </div>
              <button
                onClick={() => setShowProfileModal(true)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                title="Profile Settings"
              >
                <User className="h-8 w-8 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <Button variant="ghost" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
              <div className="bg-white px-6 py-3 border-b">
          <div className="text-sm text-gray-600">
            MY PACKAGES
          </div>
        </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">List Packages</h1>
          <div className="flex items-center gap-3">
            
            <Button onClick={onCreatePackage} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              New Package
            </Button>
          </div>
        </div>

        {/* Company Information Card */}
        {companyDetails && (
          <div className="bg-white rounded-lg border p-6 mb-6">
            <div className="flex items-start gap-6">
              {/* Company Logo */}
              {companyDetails.logo && (
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img 
                    src={companyDetails.logo.startsWith('http') ? companyDetails.logo : `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}${companyDetails.logo}`} 
                    alt="Company Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              
              {/* Company Details */}
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {companyDetails.company_name}
                  </h3>
                  {companyDetails.description && (
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {companyDetails.description}
                    </p>
                  )}
                </div>
                
                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {companyDetails.email && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Mail className="h-3 w-3 text-blue-500" />
                      <span>{companyDetails.email}</span>
                    </div>
                  )}
                  {companyDetails.phone && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Phone className="h-3 w-3 text-blue-500" />
                      <span>{companyDetails.phone}</span>
                    </div>
                  )}
                  {companyDetails.website && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Globe className="h-3 w-3 text-blue-500" />
                      <a 
                        href={companyDetails.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {companyDetails.website}
                      </a>
                    </div>
                  )}
                  {companyDetails.address && (
                    <div className="flex items-start gap-2 text-gray-600 text-sm">
                      <MapPin className="h-3 w-3 text-blue-500 mt-0.5" />
                      <span>{companyDetails.address}</span>
                    </div>
                  )}
                </div>
                
                {/* Social Media Links */}
                {(companyDetails.facebook_url || 
                  companyDetails.whatsapp_url || 
                  companyDetails.instagram_url || 
                  companyDetails.youtube_url) && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <h5 className="text-xs font-medium text-gray-700 mb-2">Follow Us</h5>
                    <div className="flex flex-wrap gap-2">
                      {companyDetails.facebook_url && (
                        <a 
                          href={companyDetails.facebook_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                        >
                          <Facebook className="h-3 w-3" />
                          Facebook
                        </a>
                      )}
                      {companyDetails.whatsapp_url && (
                        <a 
                          href={companyDetails.whatsapp_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                        >
                          <MessageCircle className="h-3 w-3" />
                          WhatsApp
                        </a>
                      )}
                      {companyDetails.instagram_url && (
                        <a 
                          href={companyDetails.instagram_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2 py-1 bg-pink-600 text-white rounded text-xs hover:bg-pink-700 transition-colors"
                        >
                          <Instagram className="h-3 w-3" />
                          Instagram
                        </a>
                      )}
                      {companyDetails.youtube_url && (
                        <a 
                          href={companyDetails.youtube_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                        >
                          <Youtube className="h-3 w-3" />
                          YouTube
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
              <div className="relative">
                <Input
                  value={searchDestination}
                  onChange={(e) => setSearchDestination(e.target.value)}
                  placeholder="Search Destination"
                  className="pr-8"
                />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div className="w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Publish status</label>
              <select
                value={publishStatus}
                onChange={(e) => setPublishStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
              </select>
            </div>
          </div>
        </div>

        {/* Packages Table */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    S.NO.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TITLE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NO OF LEADS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PRICE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CREATED DATE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PUBLISHED
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DELETE
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPackages.map((pkg, index) => (
                  <tr key={pkg.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-4">
                        {/* Cover Image */}
                        <div className="w-24 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          {pkg.cover_image ? (
                            <img 
                              src={pkg.cover_image} 
                              alt="Cover" 
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <span className="text-xs text-gray-500 text-center">No Cover Image</span>
                          )}
                        </div>
                        
                        {/* Package Details */}
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900 mb-1">
                            {pkg.title}
                          </h3>
                          <p className="text-xs text-gray-500 mb-2">
                            Locations: {pkg.locations.join(', ')}
                          </p>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditPackage(pkg.id)}
                              className="text-xs h-6 px-2"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => duplicatePackage(pkg)}
                              className="text-xs h-6 px-2"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Duplicate
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                try {
                                  const shareUrl = getShareUrl(pkg);
                                  window.open(shareUrl, '_blank');
                                } catch (error) {
                                  alert('Cannot preview: Itinerary not published. Please publish the itinerary first.');
                                }
                              }}
                              className="text-xs h-6 px-2"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Preview
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                try {
                                  const shareUrl = getShareUrl(pkg);
                                  navigator.clipboard.writeText(shareUrl);
                                  alert('Share link copied to clipboard!');
                                } catch (error) {
                                  alert('Cannot share: Itinerary not published. Please publish the itinerary first.');
                                }
                              }}
                              className="text-xs h-6 px-2"
                            >
                              <Share2 className="h-3 w-3 mr-1" />
                              Share
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                try {
                                  const iframeCode = getIframeCode(pkg);
                                  navigator.clipboard.writeText(iframeCode);
                                  alert('Iframe code copied to clipboard! You can now embed this itinerary on any website.');
                                } catch (error) {
                                  alert('Cannot copy iframe: Itinerary not published. Please publish the itinerary first.');
                                }
                              }}
                              className="text-xs h-6 px-2"
                            >
                              <Code className="h-3 w-3 mr-1" />
                              Copy Iframe
                            </Button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      0
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{pkg.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(pkg.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        pkg.is_published 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {pkg.is_published ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePackage(pkg.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredPackages.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No packages found</h3>
              <p className="text-gray-500 mb-4">
                {searchDestination || publishStatus !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Get started by creating your first package'
                }
              </p>
              {!searchDestination && publishStatus === 'all' && (
                <Button onClick={onCreatePackage} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Package
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          // Reload company details when modal is closed
          loadCompanyDetails();
        }}
        user={user}
      />
    </div>
  );
};
