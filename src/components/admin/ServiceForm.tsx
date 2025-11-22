import React, { useState, useRef } from 'react';
import { cmsApi, Service } from '../../api/cms';
import resolveContentMedia from '../../lib/resolveMedia';

interface ServiceFormProps {
  token: string;
  service?: Service;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ServiceForm: React.FC<ServiceFormProps> = ({ token, service, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: service?.title || '',
    description: service?.description || '',
    long_description: service?.long_description || '',
    price: service?.price || 0,
    price_range: service?.price_range || '',
    currency: service?.currency || 'USD',
    duration: service?.duration || '',
    features: service?.features ? JSON.parse(service.features) : [],
    deliverables: service?.deliverables ? JSON.parse(service.deliverables) : [],
    active: service?.active !== undefined ? service.active : true,
    featured: service?.featured || false,
  });

  const [featureInput, setFeatureInput] = useState('');
  const [deliverableInput, setDeliverableInput] = useState('');
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [iconImage, setIconImage] = useState<File | null>(null);
  const [featuredPreview, setFeaturedPreview] = useState<string | undefined>(service?.featured_image);
  const [iconPreview, setIconPreview] = useState<string | undefined>(service?.icon);
  
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [publishOnSave, setPublishOnSave] = useState(false);

  const featuredInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  const handleAddFeature = () => {
    if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((f: string) => f !== feature)
    }));
  };

  const handleAddDeliverable = () => {
    if (deliverableInput.trim() && !formData.deliverables.includes(deliverableInput.trim())) {
      setFormData(prev => ({
        ...prev,
        deliverables: [...prev.deliverables, deliverableInput.trim()]
      }));
      setDeliverableInput('');
    }
  };

  const handleRemoveDeliverable = (deliverable: string) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((d: string) => d !== deliverable)
    }));
  };

  const handleImageSelect = (type: 'featured' | 'icon', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'featured') {
        setFeaturedImage(file);
        setFeaturedPreview(reader.result as string);
      } else {
        setIconImage(file);
        setIconPreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setError('');
    setSuccess('');

    try {
      let featured_image_url = service?.featured_image;
      let icon_url = service?.icon;

      if (featuredImage) {
        const uploadedImage = await cmsApi.uploadImage(token, featuredImage, 'services', {
          used_in: 'service',
          alt_text: formData.title
        });
        featured_image_url = uploadedImage.storage_url;
      }

      if (iconImage) {
        const uploadedImage = await cmsApi.uploadImage(token, iconImage, 'services', {
          used_in: 'service_icon',
          alt_text: `${formData.title} icon`
        });
        icon_url = uploadedImage.storage_url;
      }

      const serviceData = {
        ...formData,
        features: JSON.stringify(formData.features),
        deliverables: JSON.stringify(formData.deliverables),
        featured_image: featured_image_url,
        icon: icon_url,
      };
      if (publishOnSave) serviceData.active = true;

      if (service) {
        await cmsApi.updateService(token, service.id, serviceData);
        setSuccess('Service updated successfully!');
      } else {
        await cmsApi.createService(token, serviceData);
        setSuccess('Service created successfully!');
      }
      
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create service');
    } finally {
      setUploading(false);
    }
  };

  const handlePreview = async () => {
    setUploading(true);
    setError('');
    try {
      let featured_image_url = service?.featured_image;
      let icon_url = service?.icon;

      if (featuredImage) {
        const uploadedImage = await cmsApi.uploadImage(token, featuredImage, 'services', {
          used_in: 'service',
          alt_text: formData.title
        });
        featured_image_url = uploadedImage.storage_url;
      }

      if (iconImage) {
        const uploadedImage = await cmsApi.uploadImage(token, iconImage, 'services', {
          used_in: 'service_icon',
          alt_text: `${formData.title} icon`
        });
        icon_url = uploadedImage.storage_url;
      }

      const serviceData = {
        ...formData,
        features: JSON.stringify(formData.features),
        deliverables: JSON.stringify(formData.deliverables),
        featured_image: featured_image_url,
        icon: icon_url,
      };

      if (service) {
        await cmsApi.updateService(token, service.id, serviceData);
      } else {
        await cmsApi.createService(token, serviceData);
      }

      setShowPreview(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preview service');
    } finally {
      setUploading(false);
    }
  };

  const handlePreviewNewTab = async () => {
    setUploading(true);
    setError('');
    try {
      const authToken = token;
      let featured_image_url = service?.featured_image;
      let icon_url = service?.icon;

      if (featuredImage) {
        const uploadedImage = await cmsApi.uploadImage(authToken, featuredImage, 'services', {
          used_in: 'service',
          alt_text: formData.title
        });
        featured_image_url = uploadedImage.storage_url;
      }

      if (iconImage) {
        const uploadedImage = await cmsApi.uploadImage(authToken, iconImage, 'services', {
          used_in: 'service_icon',
          alt_text: `${formData.title} icon`
        });
        icon_url = uploadedImage.storage_url;
      }

      const serviceData = {
        ...formData,
        features: JSON.stringify(formData.features),
        deliverables: JSON.stringify(formData.deliverables),
        featured_image: featured_image_url,
        icon: icon_url,
      };

      let savedService;
      if (service) {
        savedService = await cmsApi.updateService(authToken, service.id, serviceData);
      } else {
        savedService = await cmsApi.createService(authToken, serviceData);
      }

      // Open minimal preview page
      const html = `
      <!doctype html>
      <html>
      <head><meta charset="utf-8"><title>${savedService.title}</title></head>
      <body style="background:#0b0b0b;color:#fff;padding:32px;font-family:sans-serif;">
        <h1>${savedService.title}</h1>
        ${resolveContentMedia(savedService.long_description || savedService.description) || ''}
      </body>
      </html>`;
      const win = window.open('', '_blank');
      if (win) win.document.write(html);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preview service');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-devil-gray/50 rounded-lg p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-devil-red">
          {service ? 'Edit Service' : 'Create New Service'}
        </h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
          ✕
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-md text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-md text-green-400">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-white mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full bg-devil-gray border border-gray-700 rounded-md p-3 text-white focus:ring-devil-red focus:border-devil-red"
            placeholder="Enter service title"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-white mb-2">
            Short Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            className="w-full bg-devil-gray border border-gray-700 rounded-md p-3 text-white focus:ring-devil-red focus:border-devil-red"
            placeholder="Brief description (shown in service cards)"
          />
        </div>

        {/* Long Description */}
        <div>
          <label htmlFor="long_description" className="block text-sm font-semibold text-white mb-2">
            Detailed Description
          </label>
          <textarea
            id="long_description"
            name="long_description"
            value={formData.long_description}
            onChange={handleChange}
            rows={6}
            className="w-full bg-devil-gray border border-gray-700 rounded-md p-3 text-white focus:ring-devil-red focus:border-devil-red"
            placeholder="Full service details, process, benefits..."
          />
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-semibold text-white mb-2">
              Price
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full bg-devil-gray border border-gray-700 rounded-md p-3 text-white focus:ring-devil-red focus:border-devil-red"
              placeholder="0.00"
            />
          </div>
          <div>
            <label htmlFor="price_range" className="block text-sm font-semibold text-white mb-2">
              Price Range
            </label>
            <input
              type="text"
              id="price_range"
              name="price_range"
              value={formData.price_range}
              onChange={handleChange}
              className="w-full bg-devil-gray border border-gray-700 rounded-md p-3 text-white focus:ring-devil-red focus:border-devil-red"
              placeholder="$500 - $1000"
            />
          </div>
          <div>
            <label htmlFor="currency" className="block text-sm font-semibold text-white mb-2">
              Currency *
            </label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              required
              className="w-full bg-devil-gray border border-gray-700 rounded-md p-3 text-white focus:ring-devil-red focus:border-devil-red"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>
        </div>

        {/* Duration */}
        <div>
          <label htmlFor="duration" className="block text-sm font-semibold text-white mb-2">
            Duration
          </label>
          <input
            type="text"
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            className="w-full bg-devil-gray border border-gray-700 rounded-md p-3 text-white focus:ring-devil-red focus:border-devil-red"
            placeholder="e.g., 2-4 weeks, 1 month"
          />
        </div>

        {/* Features */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Features
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
              className="flex-1 bg-devil-gray border border-gray-700 rounded-md p-3 text-white focus:ring-devil-red focus:border-devil-red"
              placeholder="Add feature (e.g., Custom Design)"
            />
            <button
              type="button"
              onClick={handleAddFeature}
              className="px-4 py-2 bg-devil-red text-white rounded-md hover:bg-devil-red-dark transition-colors"
            >
              Add
            </button>
          </div>
          {formData.features.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.features.map((feature: string) => (
                <span
                  key={feature}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-devil-gray border border-devil-red/50 rounded-full text-sm text-white"
                >
                  {feature}
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(feature)}
                    className="text-devil-red hover:text-red-400"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Deliverables */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Deliverables
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={deliverableInput}
              onChange={(e) => setDeliverableInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDeliverable())}
              className="flex-1 bg-devil-gray border border-gray-700 rounded-md p-3 text-white focus:ring-devil-red focus:border-devil-red"
              placeholder="Add deliverable (e.g., Source Code)"
            />
            <button
              type="button"
              onClick={handleAddDeliverable}
              className="px-4 py-2 bg-devil-red text-white rounded-md hover:bg-devil-red-dark transition-colors"
            >
              Add
            </button>
          </div>
          {formData.deliverables.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.deliverables.map((deliverable: string) => (
                <span
                  key={deliverable}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-devil-gray border border-devil-red/50 rounded-full text-sm text-white"
                >
                  {deliverable}
                  <button
                    type="button"
                    onClick={() => handleRemoveDeliverable(deliverable)}
                    className="text-devil-red hover:text-red-400"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Icon Image */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Icon Image
          </label>
          <div className="flex flex-col gap-4">
            {iconPreview && (
              <div className="relative w-24 h-24 rounded-md overflow-hidden border border-gray-700">
                <img src={iconPreview} alt="Icon preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setIconImage(null);
                    setIconPreview(undefined);
                    if (iconInputRef.current) iconInputRef.current.value = '';
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors text-xs"
                >
                  ✕
                </button>
              </div>
            )}
            <input
              ref={iconInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageSelect('icon', e)}
              aria-label="Upload icon image"
              className="w-full bg-devil-gray border border-gray-700 rounded-md p-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-devil-red file:text-white file:cursor-pointer hover:file:bg-devil-red-dark"
            />
            <p className="text-xs text-gray-400">Recommended: 64x64px or 128x128px, max 5MB</p>
          </div>
        </div>

        {/* Featured Image */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Featured Image
          </label>
          <div className="flex flex-col gap-4">
            {featuredPreview && (
              <div className="relative w-full h-48 rounded-md overflow-hidden border border-gray-700">
                <img src={featuredPreview} alt="Featured preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setFeaturedImage(null);
                    setFeaturedPreview(undefined);
                    if (featuredInputRef.current) featuredInputRef.current.value = '';
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            )}
            <input
              ref={featuredInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageSelect('featured', e)}
              aria-label="Upload featured image"
              className="w-full bg-devil-gray border border-gray-700 rounded-md p-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-devil-red file:text-white file:cursor-pointer hover:file:bg-devil-red-dark"
            />
            <p className="text-xs text-gray-400">Recommended: 1200x630px, max 5MB</p>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              className="w-5 h-5 bg-devil-gray border border-gray-700 rounded focus:ring-devil-red"
            />
            <span className="text-white">Active</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={publishOnSave}
              onChange={() => setPublishOnSave(!publishOnSave)}
              className="w-5 h-5 bg-devil-gray border border-gray-700 rounded focus:ring-devil-red"
            />
            <span className="text-white">Publish on Save</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="w-5 h-5 bg-devil-gray border border-gray-700 rounded focus:ring-devil-red"
            />
            <span className="text-white">Featured</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t border-gray-700">
          <button
            type="submit"
            disabled={uploading}
            className="flex-1 px-6 py-3 font-bold text-white bg-devil-red hover:bg-devil-red-dark rounded-md transition-colors disabled:bg-devil-red/50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Creating Service...' : service ? 'Update Service' : 'Create Service'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={uploading}
            className="px-6 py-3 font-semibold text-gray-400 border border-gray-700 hover:bg-devil-gray rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePreview}
            disabled={uploading}
            className="px-6 py-3 font-semibold text-white border border-gray-700 hover:bg-devil-gray rounded-md transition-colors disabled:opacity-50"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={handlePreviewNewTab}
            disabled={uploading}
            className="px-4 py-3 font-semibold text-white bg-devil-gray border border-gray-700 hover:bg-devil-gray/90 rounded-md transition-colors disabled:opacity-50"
          >
            Preview (new tab)
          </button>
        </div>
      </form>
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/60">
          <div className="bg-devil-gray rounded-lg max-w-4xl w-full p-6">
            <div className="flex items-start justify-between">
              <h2 className="text-2xl font-bold">Service Preview</h2>
              <button onClick={() => setShowPreview(false)} className="text-gray-300">✕</button>
            </div>
            <div className="mt-6">
              <h3 className="text-xl font-bold">{formData.title}</h3>
              <p className="mt-2 text-gray-300">{formData.description}</p>
              {formData.long_description && (
                <div className="prose prose-invert mt-4" dangerouslySetInnerHTML={{ __html: resolveContentMedia(formData.long_description as string) || '' }} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
