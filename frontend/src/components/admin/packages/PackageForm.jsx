// src/components/admin/packages/PackageForm.jsx - REMOVED GLOBAL INCLUSIONS
import React, { useState, useEffect } from "react";
import Button from "../../ui/Button";

const PackageForm = ({ initialData = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    itinerary: [],
    image: "",
    price: "",
    duration: "",
    status: "active"
    // REMOVED: Global inclusions (transport, meals, stay)
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      const itineraryData = initialData.itinerary && initialData.itinerary.length > 0 
        ? initialData.itinerary.map(day => ({
            day: day.day || 1,
            title: day.title || "",
            description: day.description || "",
            places: Array.isArray(day.places) ? day.places : [""],
            // support new array-of-strings inclusions, or migrate legacy object inclusions
            inclusions: Array.isArray(day.inclusions)
              ? day.inclusions
              : (day.inclusions && typeof day.inclusions === 'object')
                ? Object.keys(day.inclusions).filter(k => day.inclusions[k])
                : [],
            // temporary input buffer for adding new tags per day
            newInclusionInput: ""
          }))
        : [];

      setFormData({
        title: initialData.title || "",
        itinerary: itineraryData,
        image: initialData.image?.url || initialData.image || "",
        price: initialData.price || "",
        duration: initialData.duration || "",
        // REMOVED: Global inclusions
        status: initialData.status || "active"
      });

      if (initialData.image?.url || initialData.image) {
        setImagePreview(initialData.image?.url || initialData.image);
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, etc.)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      setImageFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      setFormData(prev => ({ ...prev, image: "" }));
    }
  };

  const handleItineraryChange = (index, field, value) => {
    const updatedItinerary = [...formData.itinerary];
    updatedItinerary[index] = {
      ...updatedItinerary[index],
      [field]: value
    };
    setFormData(prev => ({ ...prev, itinerary: updatedItinerary }));
  };

  const handleAddInclusion = (dayIndex, value) => {
    const val = String(value || '').trim();
    if (!val) return;

    const updatedItinerary = [...formData.itinerary];
    const currentDay = updatedItinerary[dayIndex] || {};
    const currentInclusions = Array.isArray(currentDay.inclusions) ? [...currentDay.inclusions] : [];

    if (!currentInclusions.includes(val)) {
      currentInclusions.push(val);
    }

    updatedItinerary[dayIndex] = {
      ...currentDay,
      inclusions: currentInclusions,
      newInclusionInput: ""
    };
    setFormData(prev => ({ ...prev, itinerary: updatedItinerary }));
  };

  const handleRemoveInclusion = (dayIndex, tagIndex) => {
    const updatedItinerary = [...formData.itinerary];
    const currentDay = updatedItinerary[dayIndex] || {};
    const currentInclusions = Array.isArray(currentDay.inclusions) ? [...currentDay.inclusions] : [];
    currentInclusions.splice(tagIndex, 1);
    updatedItinerary[dayIndex] = {
      ...currentDay,
      inclusions: currentInclusions
    };
    setFormData(prev => ({ ...prev, itinerary: updatedItinerary }));
  };

  const handleInclusionInputChange = (dayIndex, value) => {
    const updatedItinerary = [...formData.itinerary];
    const currentDay = updatedItinerary[dayIndex] || {};
    updatedItinerary[dayIndex] = {
      ...currentDay,
      newInclusionInput: value
    };
    setFormData(prev => ({ ...prev, itinerary: updatedItinerary }));
  };

  const handleInclusionKeyDown = (e, dayIndex) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = (e.target.value || '').replace(/,$/, '').trim();
      if (val) handleAddInclusion(dayIndex, val);
    }
  };

  const addItineraryDay = () => {
    const newDay = {
      day: formData.itinerary.length + 1,
      title: "",
      description: "",
      places: [""],
      inclusions: [],
      newInclusionInput: ""
    };
    setFormData(prev => ({
      ...prev,
      itinerary: [...prev.itinerary, newDay]
    }));
  };

  const removeItineraryDay = (index) => {
    const updatedItinerary = formData.itinerary.filter((_, i) => i !== index)
      .map((item, i) => ({ ...item, day: i + 1 }));
    setFormData(prev => ({ ...prev, itinerary: updatedItinerary }));
  };

  const handlePlaceChange = (dayIndex, placeIndex, value) => {
    const updatedItinerary = [...formData.itinerary];
    const currentDay = updatedItinerary[dayIndex] || {};
    const currentPlaces = Array.isArray(currentDay.places) ? [...currentDay.places] : [""];
    
    currentPlaces[placeIndex] = value;
    
    updatedItinerary[dayIndex] = {
      ...currentDay,
      places: currentPlaces
    };
    setFormData(prev => ({ ...prev, itinerary: updatedItinerary }));
  };

  const addPlace = (dayIndex) => {
    const updatedItinerary = [...formData.itinerary];
    const currentDay = updatedItinerary[dayIndex] || {};
    const currentPlaces = Array.isArray(currentDay.places) ? [...currentDay.places] : [""];
    
    currentPlaces.push("");
    
    updatedItinerary[dayIndex] = {
      ...currentDay,
      places: currentPlaces
    };
    setFormData(prev => ({ ...prev, itinerary: updatedItinerary }));
  };

  const removePlace = (dayIndex, placeIndex) => {
    const updatedItinerary = [...formData.itinerary];
    const currentDay = updatedItinerary[dayIndex] || {};
    const currentPlaces = Array.isArray(currentDay.places) ? [...currentDay.places] : [""];
    
    if (currentPlaces.length > 1) {
      currentPlaces.splice(placeIndex, 1);
      
      updatedItinerary[dayIndex] = {
        ...currentDay,
        places: currentPlaces
      };
      setFormData(prev => ({ ...prev, itinerary: updatedItinerary }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.title || !formData.price || !formData.duration) {
        alert("Please fill in required fields (Title, Price & Duration).");
        setLoading(false);
        return;
      }

      if (formData.price < 0) {
        alert("Price cannot be negative.");
        setLoading(false);
        return;
      }

      if (formData.duration < 1) {
        alert("Duration must be at least 1 day.");
        setLoading(false);
        return;
      }

      if (formData.itinerary.length === 0) {
        alert("Please add at least one itinerary day.");
        setLoading(false);
        return;
      }

      for (let i = 0; i < formData.itinerary.length; i++) {
        const day = formData.itinerary[i];
        if (!day?.title?.trim() || !day?.description?.trim()) {
          alert(`Please fill in all fields for Day ${day?.day || i + 1}.`);
          setLoading(false);
          return;
        }
        
        if (!Array.isArray(day.inclusions)) {
          if (day.inclusions && typeof day.inclusions === 'object') {
            day.inclusions = Object.keys(day.inclusions).filter(k => day.inclusions[k]);
          } else {
            day.inclusions = [];
          }
        }

        if (!Array.isArray(day.places)) {
          day.places = [""];
        }
      }

      const sanitizedItinerary = formData.itinerary.map(d => ({
        day: d.day,
        title: d.title,
        description: d.description,
        places: Array.isArray(d.places) ? d.places : [""],
        inclusions: Array.isArray(d.inclusions) ? d.inclusions : []
      }));

      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('price', Number(formData.price));
      submitData.append('duration', Number(formData.duration));
      // REMOVED: Global inclusion appends
      submitData.append('status', formData.status);
      submitData.append('itinerary', JSON.stringify(sanitizedItinerary));

      if (imageFile) {
        submitData.append('image', imageFile);
      } else if (formData.image) {
        submitData.append('image', formData.image);
      }

      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPriceDisplay = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pr-2">
      {/* Package Title */}
      <div>
        <label className="block mb-2 font-medium text-gray-700">Package Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Bali Adventure Package 7 Days"
          required
        />
      </div>

      {/* Itinerary Section */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <label className="block font-medium text-gray-700">Itinerary *</label>
          <Button
            type="button"
            variant="outline"
            onClick={addItineraryDay}
            className="text-sm"
          >
            + Add Day
          </Button>
        </div>

        {!formData.itinerary || formData.itinerary.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No itinerary days added yet.</p>
            <p className="text-sm">Click "Add Day" to start building your package itinerary.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {formData.itinerary.map((day, index) => {
              const dayData = day || {};
              const dayTitle = dayData.title || "";
              const dayDescription = dayData.description || "";
              const dayNumber = dayData.day || index + 1;
              const places = Array.isArray(dayData.places) ? dayData.places : [""];
              
              return (
                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-700">Day {dayNumber}</h4>
                    {formData.itinerary.length > 1 && (
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => removeItineraryDay(index)}
                        className="text-sm px-2 py-1"
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Day Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Day Title *</label>
                      <input
                        type="text"
                        value={dayTitle}
                        onChange={(e) => handleItineraryChange(index, 'title', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="e.g., Arrival & City Tour"
                        required
                      />
                    </div>

                    {/* Day Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Description *</label>
                      <textarea
                        value={dayDescription}
                        onChange={(e) => handleItineraryChange(index, 'description', e.target.value)}
                        rows="3"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Describe the activities and experiences for this day..."
                        required
                      />
                    </div>

                    {/* Day-Specific Inclusions */}
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Day {dayNumber} Inclusions
                      </label>
                      <div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {Array.isArray(dayData.inclusions) && dayData.inclusions.length > 0 ? (
                            dayData.inclusions.map((tag, tIdx) => (
                              <span key={tIdx} className="inline-flex items-center bg-white border border-blue-100 rounded-md px-2 py-1 text-sm">
                                <span className="text-gray-700">{tag}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveInclusion(index, tIdx)}
                                  className="ml-2 text-red-600 hover:text-red-700 text-xs"
                                >
                                  ×
                                </button>
                              </span>
                            ))
                          ) : (
                            <div className="text-sm text-gray-500">No inclusions added for this day.</div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={dayData.newInclusionInput || ""}
                            onChange={(e) => handleInclusionInputChange(index, e.target.value)}
                            onKeyDown={(e) => handleInclusionKeyDown(e, index)}
                            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Add inclusion (press Enter or comma) e.g., Transport"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleAddInclusion(index, dayData.newInclusionInput)}
                            className="text-sm px-3"
                          >
                            Add
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Common tags: Transport, Meals, Stay. Press Enter or comma to add quickly.</p>
                      </div>
                    </div>

                    {/* Places to Visit */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-600">Places to Visit</label>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => addPlace(index)}
                          className="text-xs px-2 py-1"
                        >
                          + Add Place
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {places.map((place, placeIndex) => (
                          <div key={placeIndex} className="flex gap-2">
                            <input
                              type="text"
                              value={place || ""}
                              onChange={(e) => handlePlaceChange(index, placeIndex, e.target.value)}
                              className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="e.g., Tanah Lot Temple"
                            />
                            {places.length > 1 && (
                              <Button
                                type="button"
                                variant="danger"
                                onClick={() => removePlace(index, placeIndex)}
                                className="text-xs px-2 py-1"
                              >
                                ×
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Image Section */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <label className="block mb-3 font-medium text-gray-700">Package Image</label>
        
        {/* File Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-2">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-500 mt-1">Max 5MB. JPEG, PNG, WebP supported.</p>
        </div>

        {/* OR Divider */}
        <div className="flex items-center mb-4">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="mx-3 text-sm text-gray-500">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Image URL</label>
          <input
            type="url"
            name="image"
            value={formData.image}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="https://example.com/package-image.jpg"
            disabled={!!imageFile}
          />
        </div>

        {/* Image Preview */}
        {(imagePreview || formData.image) && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Preview:</p>
            <div className="relative inline-block">
              <img 
                src={imagePreview || formData.image} 
                alt="Package preview" 
                className="h-32 w-48 object-cover rounded-lg border-2 border-gray-300"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Price & Duration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 font-medium text-gray-700">Price (₱) *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">₱</span>
            </div>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
              required
            />
          </div>
          {formData.price && (
            <p className="text-xs text-gray-500 mt-1">
              Display: ₱{formatPriceDisplay(formData.price)}
            </p>
          )}
        </div>
        <div>
          <label className="block mb-2 font-medium text-gray-700">Duration (Days) *</label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            min="1"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Number of days"
            required
          />
        </div>
      </div>

      {/* REMOVED: Global Inclusions Section */}

      {/* Status */}
      <div>
        <label className="block mb-2 font-medium text-gray-700">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="active">🟢 Active - Available for booking</option>
          <option value="inactive">🔴 Inactive - Hidden from customers</option>
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
          {loading ? "Saving..." : (initialData ? "Update Package" : "Create Package")}
        </Button>
      </div>
    </form>
  );
};

export default PackageForm;