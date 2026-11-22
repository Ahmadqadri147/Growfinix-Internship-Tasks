import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Grid3x3, X, Filter, Search, Heart, Download, Copy, Sparkles } from 'lucide-react';
import { getGallery, getFavoriteImages, getRecentImages, toggleFavorite } from '../services/api';
import ImageCard from '../components/ImageCard';
import FilterSidebar from '../components/FilterSidebar';
import FullscreenModal from '../components/FullscreenModal';
import { LoadingSpinner, EmptyStateLoader } from '../components/Loader';
import { CardSkeleton } from '../components/Skeleton';
import toast from 'react-hot-toast';

const GalleryPage = () => {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isGallery, setIsGallery] = useState(true);
  const [error, setError] = useState(null);
  const [showMenu, setShowMenu] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    style: '',
    lighting: '',
    texture: '',
    aspectRatio: '',
    resolution: '',
    sortBy: 'newest'
  });

  const menuRef = React.useRef(null);

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchImages = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let response;
      if (filters.sortBy === 'favorites') {
        response = await getFavoriteImages();
      } else if (filters.sortBy === 'newest') {
        response = await getGallery(filters);
      } else {
        response = await getGallery(filters);
      }

      if (response.success) {
        setImages(response.data || []);
      } else {
        setError(response.message || 'Failed to load images');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load images. Please try again.');
      toast.error(err.response?.data?.message || 'Failed to load images. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setIsFiltersOpen(true);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      style: '',
      lighting: '',
      texture: '',
      aspectRatio: '',
      resolution: '',
      sortBy: 'newest'
    });
    setIsFiltersOpen(true);
  };

  const handleDownload = async (image) => {
    try {
      if (image.imageUrl) {
        const response = await fetch(image.imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-generated-${image.id}.jpg`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Image downloaded successfully');
      } else {
        toast.error('No image URL available');
      }
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  const handleCopyPrompt = (image) => {
    navigator.clipboard.writeText(image.prompt);
    toast.success('Prompt copied to clipboard');
    if (showMenu === image.id) {
      setShowMenu(null);
    }
  };

  const handleFavoriteToggle = async (image) => {
    try {
      const response = await toggleFavorite(image.id);
      if (response.success) {
        setImages(prev => prev.map(img =>
          img.id === image.id ? { ...img, isFavorite: response.data.isFavorite } : img
        ));
        toast.success(response.data.isFavorite ? 'Added to favorites' : 'Removed from favorites');
      } else {
        toast.error('Failed to update favorite status');
      }
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  const handleGenerateNew = () => {
    setIsGallery(false);
    setIsFiltersOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-dark pt-20 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <LayoutGrid className="w-8 h-8 text-purple-400" />
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text">
                Image Gallery
              </h1>
            </div>
            <p className="text-gray-400 text-lg">
              Explore all your AI-generated masterpieces
            </p>
          </motion.div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsGallery(true)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                isGallery ? 'gradient-text' : 'text-gray-400 hover:text-white'
              }`}
            >
              {isGallery ? (
                <>
                  <LayoutGrid className="w-5 h-5" />
                  Gallery
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate
                </>
              )}
            </motion.button>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerateNew}
              className="flex items-center gap-2 px-6 py-3 glass-button"
            >
              <Sparkles className="w-5 h-5" />
              Generate New
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsFiltersOpen(true)}
              className="flex items-center gap-2 px-6 py-3 glass-button"
            >
              <Filter className="w-5 h-5" />
              Filters
            </motion.button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-red-500/20 border border-red-500/30 rounded-xl"
          >
            <div className="flex items-start gap-4">
              <X className="w-6 h-6 text-red-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-400">Error Loading Images</h3>
                <p className="text-sm text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && images.length === 0 && (
          <EmptyStateLoader message="No images found yet. Generate your first AI masterpiece!" />
        )}

        {/* Images Grid */}
        {!isLoading && !error && images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="masonry-grid"
          >
            {images.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onImageClick={(img) => setSelectedImage(img)}
                onFavoriteToggle={handleFavoriteToggle}
                onDownload={handleDownload}
                onCopyPrompt={handleCopyPrompt}
              />
            ))}
          </motion.div>
        )}

        {/* Filters Sidebar */}
        <AnimatePresence>
          {isFiltersOpen && (
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClose={() => setIsFiltersOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>
      {selectedImage && (
        <FullscreenModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onFavoriteToggle={handleFavoriteToggle}
          onDownload={handleDownload}
          onCopyPrompt={handleCopyPrompt}
        />
      )}
    </div>
  );
};

export default GalleryPage;