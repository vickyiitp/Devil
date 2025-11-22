import React, { useState, useRef } from 'react';
import { cmsApi, Project } from '../../api/cms';
import resolveContentMedia from '../../lib/resolveMedia';

interface ProjectFormProps {
  token: string;
  project?: Project;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ token, project, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    long_description: project?.long_description || '',
    demo_url: project?.demo_url || '',
    github_url: project?.github_url || '',
    live_url: project?.live_url || '',
    tech_stack: project?.tech_stack ? JSON.parse(project.tech_stack) : [],
    status: project?.status || 'Completed',
    published: project?.published || false,
    featured: project?.featured || false,
  });
  const [publishOnSave, setPublishOnSave] = useState(false);

  const [techInput, setTechInput] = useState('');
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [thumbnailImage, setThumbnailImage] = useState<File | null>(null);
  const [featuredPreview, setFeaturedPreview] = useState<string | undefined>(project?.featured_image);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | undefined>(project?.thumbnail_image);
  
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const featuredInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddTech = () => {
    if (techInput.trim() && !formData.tech_stack.includes(techInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tech_stack: [...prev.tech_stack, techInput.trim()]
      }));
      setTechInput('');
    }
  };

  const handleRemoveTech = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      tech_stack: prev.tech_stack.filter((t: string) => t !== tech)
    }));
  };

  const handleImageSelect = (type: 'featured' | 'thumbnail', e: React.ChangeEvent<HTMLInputElement>) => {
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
      let featured_image_url = project?.featured_image;
      let thumbnail_image_url = project?.thumbnail_image;

      if (featuredImage) {
        const uploadedImage = await cmsApi.uploadImage(token, featuredImage, 'projects', {
          used_in: 'project',
          alt_text: formData.title
        });
        featured_image_url = uploadedImage.storage_url;
      }

      if (thumbnailImage) {
        const uploadedImage = await cmsApi.uploadImage(token, thumbnailImage, 'projects', {
          used_in: 'project_thumbnail',
          alt_text: `${formData.title} thumbnail`
        });
        thumbnail_image_url = uploadedImage.storage_url;
      }

      const projectData = {
        ...formData,
        tech_stack: JSON.stringify(formData.tech_stack),
        featured_image: featured_image_url,
        thumbnail_image: thumbnail_image_url,
      };

      if (publishOnSave) projectData.published = true;

      if (project) {
        await cmsApi.updateProject(token, project.id, projectData);
        setSuccess('Project updated successfully!');
      } else {
        await cmsApi.createProject(token, projectData);
        setSuccess('Project created successfully!');
      }
      
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setUploading(false);
    }
  };

  const handlePreview = async () => {
    setUploading(true);
    setError('');
    try {
      const authToken = token;
      let featured_image_url = project?.featured_image;
      let thumbnail_image_url = project?.thumbnail_image;

      if (featuredImage) {
        const uploadedImage = await cmsApi.uploadImage(authToken, featuredImage, 'projects', {
          used_in: 'project',
          alt_text: formData.title
        });
        featured_image_url = uploadedImage.storage_url;
      }

      if (thumbnailImage) {
        const uploadedImage = await cmsApi.uploadImage(authToken, thumbnailImage, 'projects', {
          used_in: 'project_thumbnail',
          alt_text: `${formData.title} thumbnail`
        });
        thumbnail_image_url = uploadedImage.storage_url;
      }

      const projectData = {
        ...formData,
        tech_stack: JSON.stringify(formData.tech_stack),
        featured_image: featured_image_url,
        thumbnail_image: thumbnail_image_url,
      };

      let savedProject;
      if (project) {
        savedProject = await cmsApi.updateProject(authToken, project.id, projectData);
      } else {
        savedProject = await cmsApi.createProject(authToken, projectData);
      }

      // Open preview page (simple content rendering)
      const html = `
      <!doctype html>
      <html>
      <head><meta charset="utf-8"><title>${savedProject.title}</title></head>
      <body style="background:#0b0b0b;color:#fff;padding:32px;font-family:sans-serif;">
        <h1>${savedProject.title}</h1>
        ${resolveContentMedia(savedProject.long_description || savedProject.description) || ''}
      </body>
      </html>`;
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(html);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preview project');
    } finally {
      setUploading(false);
    }
  };

  const handleInlinePreview = async () => {
    setUploading(true);
    setError('');
    try {
      let featured_image_url = project?.featured_image;
      let thumbnail_image_url = project?.thumbnail_image;

      if (featuredImage) {
        const uploadedImage = await cmsApi.uploadImage(token, featuredImage, 'projects', {
          used_in: 'project',
          alt_text: formData.title
        });
        featured_image_url = uploadedImage.storage_url;
      }

      if (thumbnailImage) {
        const uploadedImage = await cmsApi.uploadImage(token, thumbnailImage, 'projects', {
          used_in: 'project_thumbnail',
          alt_text: `${formData.title} thumbnail`
        });
        thumbnail_image_url = uploadedImage.storage_url;
      }

      const projectData = {
        ...formData,
        tech_stack: JSON.stringify(formData.tech_stack),
        featured_image: featured_image_url,
        thumbnail_image: thumbnail_image_url,
      };

      let savedProject;
      if (project) {
        savedProject = await cmsApi.updateProject(token, project.id, projectData);
      } else {
        savedProject = await cmsApi.createProject(token, projectData);
      }

      // Show inline preview modal
      setShowPreview(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preview project');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-devil-gray/50 rounded-lg p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-devil-red">
          {project ? 'Edit Project' : 'Create New Project'}
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
            placeholder="Enter project title"
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
            placeholder="Brief description (shown in project cards)"
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
            rows={8}
            className="w-full bg-devil-gray border border-gray-700 rounded-md p-3 text-white focus:ring-devil-red focus:border-devil-red"
            placeholder="Full project details, features, challenges, outcomes..."
          />
        </div>

        {/* Tech Stack */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Tech Stack
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
              className="flex-1 bg-devil-gray border border-gray-700 rounded-md p-3 text-white focus:ring-devil-red focus:border-devil-red"
              placeholder="Add technology (e.g., React, Python)"
            />
            <button
              type="button"
              onClick={handleAddTech}
              className="px-4 py-2 bg-devil-red text-white rounded-md hover:bg-devil-red-dark transition-colors"
            >
              Add
            </button>
          </div>
          {formData.tech_stack.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tech_stack.map((tech: string) => (
                <span
                  key={tech}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-devil-gray border border-devil-red/50 rounded-full text-sm text-white"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => handleRemoveTech(tech)}
                    className="text-devil-red hover:text-red-400"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* URLs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="demo_url" className="block text-sm font-semibold text-white mb-2">
              Demo URL
            </label>
            <input
              type="url"
              id="demo_url"
              name="demo_url"
              value={formData.demo_url}
              onChange={handleChange}
              className="w-full bg-devil-gray border border-gray-700 rounded-md p-3 text-white focus:ring-devil-red focus:border-devil-red"
              placeholder="https://..."
            />
          </div>
          <div>
            <label htmlFor="github_url" className="block text-sm font-semibold text-white mb-2">
              GitHub URL
            </label>
            <input
              type="url"
              id="github_url"
              name="github_url"
              value={formData.github_url}
              onChange={handleChange}
              className="w-full bg-devil-gray border border-gray-700 rounded-md p-3 text-white focus:ring-devil-red focus:border-devil-red"
              placeholder="https://github.com/..."
            />
          </div>
          <div>
            <label htmlFor="live_url" className="block text-sm font-semibold text-white mb-2">
              Live URL
            </label>
            <input
              type="url"
              id="live_url"
              name="live_url"
              value={formData.live_url}
              onChange={handleChange}
              className="w-full bg-devil-gray border border-gray-700 rounded-md p-3 text-white focus:ring-devil-red focus:border-devil-red"
              placeholder="https://..."
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-semibold text-white mb-2">
            Status *
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="w-full bg-devil-gray border border-gray-700 rounded-md p-3 text-white focus:ring-devil-red focus:border-devil-red"
          >
            <option value="Planning">Planning</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </select>
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

        {/* Thumbnail Image */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Thumbnail Image
          </label>
          <div className="flex flex-col gap-4">
            {thumbnailPreview && (
              <div className="relative w-48 h-48 rounded-md overflow-hidden border border-gray-700">
                <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
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
            {uploading ? 'Creating Project...' : project ? 'Update Project' : 'Create Project'}
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
            className="px-4 py-3 font-semibold text-white bg-devil-gray border border-gray-700 hover:bg-devil-gray/90 rounded-md transition-colors disabled:opacity-50"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={handleInlinePreview}
            disabled={uploading}
            className="px-6 py-3 font-semibold text-white border border-gray-700 hover:bg-devil-gray rounded-md transition-colors disabled:opacity-50"
          >
            Preview
          </button>
        </div>
      </form>
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/60">
          <div className="bg-devil-gray rounded-lg max-w-4xl w-full p-6">
            <div className="flex items-start justify-between">
              <h2 className="text-2xl font-bold">Project Preview</h2>
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
