import React, { useState, useRef } from 'react';
import { cmsApi, Blog } from '../../api/cms';

interface BlogFormProps {
  token: string;
  blog?: Blog;
  onSuccess: () => void;
  onCancel: () => void;
}

export const BlogForm: React.FC<BlogFormProps> = ({ token, blog, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: blog?.title || '',
    excerpt: blog?.excerpt || '',
    content: blog?.content || '',
    author: blog?.author || 'Technoyuga',
    published: blog?.published || false,
    featured: blog?.featured || false,
  });
  const [publishOnSave, setPublishOnSave] = useState(false);

  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [thumbnailImage, setThumbnailImage] = useState<File | null>(null);
  const [featuredPreview, setFeaturedPreview] = useState<string | undefined>(blog?.featured_image);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | undefined>(blog?.thumbnail_image);
  
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const featuredInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageSelect = (type: 'featured' | 'thumbnail', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'featured') {
        setFeaturedImage(file);
        setFeaturedPreview(reader.result as string);
      } else {
        setThumbnailImage(file);
        setThumbnailPreview(reader.result as string);
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
      let featured_image_url = blog?.featured_image;
      let thumbnail_image_url = blog?.thumbnail_image;

      // Upload featured image if selected
      if (featuredImage) {
        const uploadedImage = await cmsApi.uploadImage(token, featuredImage, 'blogs', {
          used_in: 'blog',
          alt_text: formData.title
        });
        featured_image_url = uploadedImage.storage_url;
      }

      // Upload thumbnail image if selected
      if (thumbnailImage) {
        const uploadedImage = await cmsApi.uploadImage(token, thumbnailImage, 'blogs', {
          used_in: 'blog_thumbnail',
          alt_text: `${formData.title} thumbnail`
        });
        thumbnail_image_url = uploadedImage.storage_url;
      }

      // Create or update blog with image URLs
      const blogData: any = {
        ...formData,
        featured_image: featured_image_url,
        thumbnail_image: thumbnail_image_url,
      };
      // Apply publish-on-save if set
      if (publishOnSave) blogData.published = true;

      if (blog) {
        await cmsApi.updateBlog(token, blog.id, blogData);
        setSuccess('Blog updated successfully!');
      } else {
        await cmsApi.createBlog(token, blogData);
        setSuccess('Blog created successfully!');
      }

      setTimeout(() => {
        onSuccess();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create blog');
    } finally {
      setUploading(false);
    }
  };

  const handlePreview = async (e: React.MouseEvent) => {
    e.preventDefault();
    setUploading(true);
    setError('');

    try {
      const authToken = token;
      let featured_image_url = blog?.featured_image;
      let thumbnail_image_url = blog?.thumbnail_image;

      // Upload images if selected
      if (featuredImage) {
        const uploadedImage = await cmsApi.uploadImage(authToken, featuredImage, 'blogs', {
          used_in: 'blog',
          alt_text: formData.title
        });
        featured_image_url = uploadedImage.storage_url;
      }

      if (thumbnailImage) {
        const uploadedImage = await cmsApi.uploadImage(authToken, thumbnailImage, 'blogs', {
          used_in: 'blog_thumbnail',
          alt_text: `${formData.title} thumbnail`
        });
        thumbnail_image_url = uploadedImage.storage_url;
      }

      const blogData = {
        ...formData,
        featured_image: featured_image_url,
        thumbnail_image: thumbnail_image_url,
        published: false // preview shouldn't publish
      };

      let saved;
      if (blog) {
        saved = await cmsApi.updateBlog(authToken, blog.id, blogData);
      } else {
        saved = await cmsApi.createBlog(authToken, blogData);
      }

      const url = `${window.location.origin}/#/blog/${saved.slug}?preview=1`;
      window.open(url, '_blank');
      setSuccess('Preview opened in a new tab');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preview blog');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-devil-gray/50 rounded-lg p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-devil-red">
          {blog ? 'Edit Blog' : 'Create New Blog'}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white transition-colors"
        >
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
            placeholder="Enter blog title"
          />
        </div>

        {/* Author */}
        <div>
          <label htmlFor="author" className="block text-sm font-semibold text-white mb-2">
            Author *
          </label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            required
            className="w-full bg-devil-gray border border-gray-700 rounded-md p-3 text-white focus:ring-devil-red focus:border-devil-red"
            placeholder="Author name"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label htmlFor="excerpt" className="block text-sm font-semibold text-white mb-2">
            Excerpt *
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            required
            rows={3}
            className="w-full bg-devil-gray border border-gray-700 rounded-md p-3 text-white focus:ring-devil-red focus:border-devil-red"
            placeholder="Short description (shown in blog lists)"
          />
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-semibold text-white mb-2">
            Content *
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows={12}
            className="w-full bg-devil-gray border border-gray-700 rounded-md p-3 text-white focus:ring-devil-red focus:border-devil-red font-mono text-sm"
            placeholder="Full blog content (Markdown supported)"
          />
          <p className="text-xs text-gray-400 mt-1">Supports Markdown formatting</p>
        </div>

        {/* Featured Image */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Featured Image
          </label>
          <div className="flex flex-col gap-4">
            {featuredPreview && (
              <div className="relative w-full h-48 rounded-md overflow-hidden border border-gray-700">
                <img
                  src={featuredPreview}
                  alt="Featured preview"
                  className="w-full h-full object-cover"
                />
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

        {/* Thumbnail Image */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Thumbnail Image
          </label>
          <div className="flex flex-col gap-4">
            {thumbnailPreview && (
              <div className="relative w-48 h-48 rounded-md overflow-hidden border border-gray-700">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setThumbnailImage(null);
                    setThumbnailPreview(undefined);
                    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            )}
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageSelect('thumbnail', e)}
              aria-label="Upload thumbnail image"
              className="w-full bg-devil-gray border border-gray-700 rounded-md p-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-devil-red file:text-white file:cursor-pointer hover:file:bg-devil-red-dark"
            />
            <p className="text-xs text-gray-400">Recommended: 400x400px, max 5MB</p>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="published"
              checked={formData.published}
              onChange={handleChange}
              className="w-5 h-5 bg-devil-gray border border-gray-700 rounded focus:ring-devil-red"
            />
            <span className="text-white">Published</span>
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
            {uploading ? 'Creating Blog...' : blog ? 'Update Blog' : 'Create Blog'}
          </button>
          <button
            type="button"
            onClick={handlePreview}
            disabled={uploading}
            className="px-4 py-3 font-semibold text-white bg-devil-gray border border-gray-700 hover:bg-devil-gray/90 rounded-md transition-colors disabled:opacity-50"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={uploading}
            className="px-6 py-3 font-semibold text-gray-400 border border-gray-700 hover:bg-devil-gray rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
