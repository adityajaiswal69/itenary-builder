import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  X, 
  Upload, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  FileText,
  Save,
  Loader2,
  Facebook,
  MessageCircle,
  Instagram,
  Youtube
} from 'lucide-react';
import { companyDetailsApi, imageApi, type CompanyDetails } from '../services/api';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  } | null;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user }) => {
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    logo: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    facebook_url: '',
    whatsapp_url: '',
    instagram_url: '',
    youtube_url: '',
    description: '',
  });

  useEffect(() => {
    if (isOpen && user) {
      loadCompanyDetails();
    }
  }, [isOpen, user]);

  const loadCompanyDetails = async () => {
    try {
      setLoading(true);
      const response = await companyDetailsApi.get();
      if (response.data.success && response.data.data) {
        const details = response.data.data;
        setCompanyDetails(details);
        setFormData({
          company_name: details.company_name || '',
          logo: details.logo || '',
          email: details.email || '',
          phone: details.phone || '',
          address: details.address || '',
          website: details.website || '',
          facebook_url: details.facebook_url || '',
          whatsapp_url: details.whatsapp_url || '',
          instagram_url: details.instagram_url || '',
          youtube_url: details.youtube_url || '',
          description: details.description || '',
        });
      } else {
        // Initialize with user data if no company details exist
        setFormData({
          company_name: '',
          logo: '',
          email: user?.email || '',
          phone: user?.phone || '',
          address: '',
          website: '',
          facebook_url: '',
          whatsapp_url: '',
          instagram_url: '',
          youtube_url: '',
          description: '',
        });
      }
    } catch (error) {
      console.error('Failed to load company details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const response = await imageApi.upload(file);
       const logoUrl = response.data.path; // Changed from response.data.url to response.data.path
      setFormData(prev => ({
        ...prev,
        logo: logoUrl
      }));
    } catch (error) {
      console.error('Failed to upload logo:', error);
      alert('Failed to upload logo. Please try again.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    // Frontend validation
    if (!formData.company_name.trim()) {
      alert('Company name is required');
      return;
    }

    // Validate email format if provided
    if (formData.email && formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Validate website URL format if provided
    if (formData.website && formData.website.trim() && !/^https?:\/\/.+/.test(formData.website)) {
      alert('Please enter a valid website URL (starting with http:// or https://)');
      return;
    }

    // Validate social media URLs if provided
    const socialUrls = [
      { field: 'facebook_url', name: 'Facebook' },
      { field: 'whatsapp_url', name: 'WhatsApp' },
      { field: 'instagram_url', name: 'Instagram' },
      { field: 'youtube_url', name: 'YouTube' }
    ];

    for (const { field, name } of socialUrls) {
      const url = formData[field as keyof typeof formData];
      if (url && url.trim() && !/^https?:\/\/.+/.test(url)) {
        alert(`Please enter a valid ${name} URL (starting with http:// or https://)`);
        return;
      }
    }

    try {
      setSaving(true);
      
      // Clean up the data - convert empty strings to undefined for optional fields
      const cleanedData = {
        company_name: formData.company_name.trim(),
        logo: formData.logo.trim() || undefined,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        website: formData.website.trim() || undefined,
        facebook_url: formData.facebook_url.trim() || undefined,
        whatsapp_url: formData.whatsapp_url.trim() || undefined,
        instagram_url: formData.instagram_url.trim() || undefined,
        youtube_url: formData.youtube_url.trim() || undefined,
        description: formData.description.trim() || undefined,
      };

      let response;
      if (companyDetails) {
        // Update existing company details
        response = await companyDetailsApi.update(companyDetails.id, cleanedData);
      } else {
        // Create new company details
        response = await companyDetailsApi.create(cleanedData);
      }
      
      if (response.data.success) {
        setCompanyDetails(response.data.data);
        alert('Company details saved successfully!');
        onClose(); // Close the modal after successful save
      }
    } catch (error: any) {
      console.error('Failed to save company details:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to save company details';
      if (error.response?.data?.errors) {
        // Handle validation errors from backend
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        errorMessage = errorMessages.join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Company Profile</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Loading company details...</span>
            </div>
          ) : (
            <>
              {/* Company Logo */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Company Logo
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {formData.logo ? (
                      <img 
                        src={formData.logo} 
                        alt="Company Logo" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                    >
                      {uploadingLogo ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                    </label>
                  </div>
                </div>
              </div>

              {/* Company Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Company Name *
                </label>
                <Input
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  placeholder="Enter company name"
                  required
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="company@example.com"
                    className={formData.email && formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {formData.email && formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                    <p className="text-red-500 text-xs">Please enter a valid email address</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Phone
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter company address"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Website */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <Globe className="h-4 w-4 inline mr-1" />
                  Website
                </label>
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://www.example.com"
                  className={formData.website && formData.website.trim() && !/^https?:\/\/.+/.test(formData.website) ? 'border-red-500 focus:border-red-500' : ''}
                />
                {formData.website && formData.website.trim() && !/^https?:\/\/.+/.test(formData.website) && (
                  <p className="text-red-500 text-xs">Please enter a valid URL (starting with http:// or https://)</p>
                )}
              </div>

              {/* Social Media Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Social Media Links</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <Facebook className="h-4 w-4 inline mr-1 text-blue-600" />
                      Facebook
                    </label>
                    <Input
                      type="url"
                      value={formData.facebook_url}
                      onChange={(e) => handleInputChange('facebook_url', e.target.value)}
                      placeholder="https://facebook.com/yourpage"
                      className={formData.facebook_url && formData.facebook_url.trim() && !/^https?:\/\/.+/.test(formData.facebook_url) ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {formData.facebook_url && formData.facebook_url.trim() && !/^https?:\/\/.+/.test(formData.facebook_url) && (
                      <p className="text-red-500 text-xs">Please enter a valid URL</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <MessageCircle className="h-4 w-4 inline mr-1 text-green-600" />
                      WhatsApp
                    </label>
                    <Input
                      type="url"
                      value={formData.whatsapp_url}
                      onChange={(e) => handleInputChange('whatsapp_url', e.target.value)}
                      placeholder="https://wa.me/1234567890"
                      className={formData.whatsapp_url && formData.whatsapp_url.trim() && !/^https?:\/\/.+/.test(formData.whatsapp_url) ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {formData.whatsapp_url && formData.whatsapp_url.trim() && !/^https?:\/\/.+/.test(formData.whatsapp_url) && (
                      <p className="text-red-500 text-xs">Please enter a valid URL</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <Instagram className="h-4 w-4 inline mr-1 text-pink-600" />
                      Instagram
                    </label>
                    <Input
                      type="url"
                      value={formData.instagram_url}
                      onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                      placeholder="https://instagram.com/yourpage"
                      className={formData.instagram_url && formData.instagram_url.trim() && !/^https?:\/\/.+/.test(formData.instagram_url) ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {formData.instagram_url && formData.instagram_url.trim() && !/^https?:\/\/.+/.test(formData.instagram_url) && (
                      <p className="text-red-500 text-xs">Please enter a valid URL</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <Youtube className="h-4 w-4 inline mr-1 text-red-600" />
                      YouTube
                    </label>
                    <Input
                      type="url"
                      value={formData.youtube_url}
                      onChange={(e) => handleInputChange('youtube_url', e.target.value)}
                      placeholder="https://youtube.com/yourchannel"
                      className={formData.youtube_url && formData.youtube_url.trim() && !/^https?:\/\/.+/.test(formData.youtube_url) ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {formData.youtube_url && formData.youtube_url.trim() && !/^https?:\/\/.+/.test(formData.youtube_url) && (
                      <p className="text-red-500 text-xs">Please enter a valid URL</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <FileText className="h-4 w-4 inline mr-1" />
                  Company Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Tell us about your company..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving || !formData.company_name.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Details
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
