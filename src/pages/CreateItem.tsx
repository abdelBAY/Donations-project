import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, MapPin, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CreateItemForm {
  type: 'DONATION' | 'REQUEST';
  category: string;
  title: string;
  description: string;
  availability: 'AVAILABLE' | 'PENDING' | 'CLAIMED';
  condition: 'LIKE_NEW' | 'GOOD' | 'WORN' | 'BROKEN';
  photos: File[];
  location: string;
}

const CATEGORIES = [
  'Furniture',
  'Electronics',
  'Clothing',
  'Books',
  'Kitchen',
  'Sports',
  'Toys',
  'Tools',
  'Other'
];

export default function CreateItem() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<CreateItemForm>({
    type: 'DONATION',
    category: '',
    title: '',
    description: '',
    availability: 'AVAILABLE',
    condition: 'GOOD',
    photos: [],
    location: '13 Place du Trocadéro, Paris'
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.photos.length > 5) {
      setError('Maximum 5 photos allowed');
      return;
    }

    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValid && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setError('Some files were skipped. Please ensure all files are images under 5MB.');
    }

    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...validFiles].slice(0, 5)
    }));

    // Generate previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(prev => [...prev, reader.result as string].slice(0, 5));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
    setPhotoPreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please sign in to create a listing');

      // Upload photos first
      const photoUrls = await Promise.all(
        formData.photos.map(async (photo) => {
          const fileExt = photo.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;

          const { error: uploadError, data } = await supabase.storage
            .from('item-photos')
            .upload(filePath, photo);

          if (uploadError) throw uploadError;
          
          const { data: { publicUrl } } = supabase.storage
            .from('item-photos')
            .getPublicUrl(filePath);

          return publicUrl;
        })
      );

      // Create the announcement
      const { error: insertError } = await supabase
        .from('announcements')
        .insert([
          {
            user_id: user.id,
            type: formData.type,
            category: formData.category,
            title: formData.title,
            description: formData.description,
            status: formData.availability,
            condition: formData.condition,
            photos: photoUrls
          }
        ]);

      if (insertError) throw insertError;

      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating item:', error);
      setError(error instanceof Error ? error.message : 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Listing</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center text-red-700">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type of Ad <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'DONATION' | 'REQUEST' })}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="DONATION">Donation</option>
                  <option value="REQUEST">Request</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                  <span className="text-gray-500 text-xs ml-2">
                    ({formData.title.length}/50 characters)
                  </span>
                </label>
                <input
                  type="text"
                  maxLength={50}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., Wooden dining table"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                  <span className="text-gray-500 text-xs ml-2">
                    ({formData.description.length}/500 characters)
                  </span>
                </label>
                <textarea
                  maxLength={500}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Describe the item's color, size, condition, and pickup details..."
                  required
                />
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value as CreateItemForm['condition'] })}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="LIKE_NEW">Like New</option>
                  <option value="GOOD">Good condition</option>
                  <option value="WORN">Worn</option>
                  <option value="BROKEN">Broken</option>
                </select>
              </div>

              {/* Photos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photos <span className="text-gray-500 text-xs ml-2">(Maximum 5 photos, 5MB each)</span>
                </label>
                <div className="grid grid-cols-5 gap-4">
                  {[...Array(5)].map((_, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center relative overflow-hidden"
                    >
                      {photoPreview[index] ? (
                        <>
                          <img
                            src={photoPreview[index]}
                            alt={`Preview ${index + 1}`}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            ×
                          </button>
                        </>
                      ) : (
                        <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                          <Upload className="h-6 w-6 text-gray-400" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="flex items-center space-x-2 text-gray-500 bg-gray-50 p-4 rounded-lg">
                  <MapPin className="h-5 w-5 flex-shrink-0" />
                  <div>
                    <p className="text-sm">{formData.location}</p>
                    <p className="text-xs mt-1">
                      For privacy reasons, your exact location will be replaced by a random point within 100 meters.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? 'Creating...' : 'Create listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}