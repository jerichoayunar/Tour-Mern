// src/components/admin/destinations/DestinationForm.jsx - UPDATED
import React, { useState, useEffect } from 'react';
import Button from "../../ui/Button";

const DestinationForm = ({ 
  destination = null, 
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    image: '',
    embedUrl: '',
    status: 'active'
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  // Pre-fill form if editing - UPDATED
  useEffect(() => {
    if (destination) {
      setFormData({
        name: destination.name || '',
        location: destination.location || '',
        description: destination.description || '',
        image: destination.image?.url || destination.image || '',
        embedUrl: destination.embedUrl || '',
        status: destination.status || 'active'
      });
      
      // Set image preview if destination has an image
      if (destination.image?.url || destination.image) {
        setImagePreview(destination.image?.url || destination.image);
      }
    }
  }, [destination]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, imageFile: 'Please select an image file' }));
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, imageFile: 'Image must be less than 5MB' }));
        return;
      }

      setImageFile(file);
      setErrors(prev => ({ ...prev, imageFile: '' }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Clear URL input when file is selected
      setFormData(prev => ({ ...prev, image: '' }));
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, image: url }));
    
    // Clear file input when URL is entered
    if (url) {
      setImageFile(null);
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
    
    // Clear errors
    if (errors.imageFile) {
      setErrors(prev => ({ ...prev, imageFile: '' }));
    }
  };

  const clearImageSelection = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: '' }));
    setErrors(prev => ({ ...prev, imageFile: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Destination name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      let submitData;

      if (imageFile) {
        // Use FormData for file upload - UPDATED
        submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('location', formData.location);
        submitData.append('description', formData.description || 'No description provided');
        submitData.append('embedUrl', formData.embedUrl);
        submitData.append('status', formData.status);
        submitData.append('image', imageFile);
      } else if (formData.image) {
        // Use regular JSON for URL - UPDATED
        submitData = {
          ...formData,
          description: formData.description || 'No description provided',
          embedUrl: formData.embedUrl
        };
      } else {
        // No image provided - use regular JSON - UPDATED
        submitData = {
          ...formData,
          description: formData.description || 'No description provided',
          image: '',
          embedUrl: formData.embedUrl
        };
      }

      onSubmit(submitData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name - SINGLE COLUMN */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Destination Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., Bali Paradise"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
        )}
      </div>

      {/* Location - SINGLE COLUMN */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location *
        </label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.location ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., Indonesia"
        />
        {errors.location && (
          <p className="text-red-500 text-sm mt-1">{errors.location}</p>
        )}
      </div>

      {/* IMAGE UPLOAD SECTION */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Destination Image
        </label>
        <p className="text-sm text-gray-500 mb-3">
          Upload an image file or provide a URL. File upload is recommended for better quality.
        </p>

        {/* File Upload Option */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Upload Image File
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {errors.imageFile && (
            <p className="text-red-500 text-sm mt-1">{errors.imageFile}</p>
          )}
          <p className="text-xs text-gray-500">
            Supported formats: JPG, PNG, WebP. Max size: 5MB
          </p>
        </div>

        {/* OR Separator */}
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-sm text-gray-500">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* URL Input Option */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image URL
          </label>
          <input
            type="url"
            name="image"
            value={formData.image}
            onChange={handleImageUrlChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com/image.jpg"
            disabled={!!imageFile}
          />
        </div>

        {/* Image Preview */}
        {(imagePreview || formData.image) && (
          <div className="mt-4 p-4 border border-gray-200 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Image Preview:</p>
            <div className="flex items-center space-x-4">
              <img 
                src={imagePreview || formData.image} 
                alt="Preview" 
                className="w-20 h-20 rounded-lg object-cover border"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/80x80?text=Invalid+Image';
                }}
              />
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  {imageFile ? `File: ${imageFile.name}` : 'URL provided'}
                </p>
                <button
                  type="button"
                  onClick={clearImageSelection}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  Remove Image
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe this destination..."
        />
      </div>

      {/* Google Maps Embed */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Google Maps Embed
        </label>
        <p className="text-sm text-gray-500">
          Paste the embed iframe code from Google Maps. 
          <a 
            href="https://www.google.com/maps" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 ml-1"
          >
            Get embed code ↗
          </a>
        </p>
        
        <textarea
          name="embedUrl"
          value={formData.embedUrl}
          onChange={handleChange}
          rows="4"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>'
        />
        
        {/* Map Preview */}
        {formData.embedUrl && (
          <div className="mt-4 p-4 border border-gray-200 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Map Preview:</p>
            <div 
              className="bg-white p-4 rounded border"
              dangerouslySetInnerHTML={{ __html: formData.embedUrl }}
            />
            <p className="text-xs text-gray-500 mt-2">
              This is how the map will appear to users
            </p>
          </div>
        )}
      </div>

      {/* Status Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={onCancel}
          className="px-6"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="primary"
          className="px-6"
          disabled={loading}
        >
          {loading ? "Saving..." : (destination ? "Update Destination" : "Create Destination")}
        </Button>
      </div>
    </form>
  );
};

export default DestinationForm;