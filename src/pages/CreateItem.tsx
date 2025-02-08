import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  MapPin, 
  AlertCircle, 
  X,
  Image as ImageIcon,
  Info
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';

interface CreateItemForm {
  title: string;
  description: string;
  category: string;
  condition: 'LIKE_NEW' | 'GOOD' | 'WORN' | 'BROKEN';
  photos: File[];
  location: string;
  availability: 'AVAILABLE' | 'PENDING' | 'CLAIMED';
  pickupInstructions: string;
  tags: string[];
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

const CONDITIONS = [
  { value: 'LIKE_NEW', label: 'Like New', description: 'Item is in perfect condition' },
  { value: 'GOOD', label: 'Good', description: 'Item shows minimal wear' },
  { value: 'WORN', label: 'Worn', description: 'Item shows significant wear but is functional' },
  { value: 'BROKEN', label: 'Broken', description: 'Item needs repair' }
];

export default function CreateItem() {
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  
  const [formData, setFormData] = useState<CreateItemForm>({
    title: '',
    description: '',
    category: '',
    condition: 'GOOD',
    photos: [],
    location: '',
    availability: 'AVAILABLE',
    pickupInstructions: '',
    tags: []
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

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      if (formData.tags.length >= 5) {
        setError('Maximum 5 tags allowed');
        return;
      }
      if (!formData.tags.includes(currentTag.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, currentTag.trim()]
        }));
      }
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please sign in to create a listing');
      return;
    }

    setLoading(true);
    setError(null);

    try {
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
            title: formData.title,
            description: formData.description,
            category: formData.category,
            condition: formData.condition,
            photos: photoUrls,
            location: formData.location,
            status: formData.availability,
            pickup_instructions: formData.pickupInstructions,
            tags: formData.tags
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Create New Listing
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center text-red-700 dark:text-red-400">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title <span className="text-red-500">*</span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">
                    ({formData.title.length}/50 characters)
                  </span>
                </label>
                <input
                  type="text"
                  maxLength={50}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                  placeholder="e.g., Wooden dining table"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
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

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description <span className="text-red-500">*</span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">
                    ({formData.description.length}/500 characters)
                  </span>
                </label>
                <textarea
                  maxLength={500}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                  placeholder="Describe the item's features, condition, and any important details..."
                  required
                />
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Condition <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {CONDITIONS.map((condition) => (
                    <label
                      key={condition.value}
                      className={`
                        relative flex items-start p-4 cursor-pointer rounded-lg border
                        ${formData.condition === condition.value
                          ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }
                      `}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="condition"
                            value={condition.value}
                            checked={formData.condition === condition.value}
                            onChange={(e) => setFormData({ ...formData, condition: e.target.value as CreateItemForm['condition'] })}
                            className="h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                          />
                          <span className="ml-3 font-medium text-gray-900 dark:text-white">
                            {condition.label}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {condition.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Photos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Photos
                  <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">
                    (Maximum 5 photos, 5MB each)
                  </span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {[...Array(5)].map((_, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center relative overflow-hidden"
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
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <ImageIcon className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                          <span className="text-sm text-gray-500 dark:text-gray-400 text-center">
                            Click to upload
                          </span>
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-lg">
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 pl-10"
                    placeholder="Enter your location"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <Info className="w-4 h-4 mr-1" />
                  For privacy, your exact location will be approximated
                </p>
              </div>

              {/* Pickup Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pickup Instructions
                </label>
                <textarea
                  value={formData.pickupInstructions}
                  onChange={(e) => setFormData({ ...formData, pickupInstructions: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                  placeholder="Add any specific instructions for item pickup..."
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                  <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">
                    (Press Enter to add, maximum 5 tags)
                  </span>
                </label>
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                  placeholder="Add tags to help others find your item..."
                  disabled={formData.tags.length >= 5}
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <>
                      <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Listing'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}