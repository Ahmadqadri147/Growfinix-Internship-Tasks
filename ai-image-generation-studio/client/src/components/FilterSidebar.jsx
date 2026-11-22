import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, Search } from 'lucide-react';
import { cn } from '../utils/cn';

const FilterSidebar = ({ filters, onFilterChange, onClose }) => {
  const [showDropdowns, setShowDropdowns] = useState({});

  const dropdownOptions = {
    style: [
      'Realistic', 'Photorealistic', 'Anime', 'Cyberpunk', 'Oil Painting',
      'Watercolor', 'Fantasy', '3D Render', 'Pixar', 'Comic', 'Pixel Art'
    ],
    lighting: [
      'Natural', 'Studio', 'Golden Hour', 'Sunset', 'Neon', 'Soft', 'Cinematic', 'Volumetric'
    ],
    texture: [
      'Smooth', 'Rough', 'Metallic', 'Wood', 'Glass', 'Stone', 'Fabric', 'Leather', 'Paper'
    ],
    aspectRatio: [
      '1:1', '16:9', '9:16', '4:3', '3:2'
    ],
    resolution: [
      '256x256', '512x512', '1024x1024', '1024x1792', '1792x1024'
    ],
    sortBy: [
      { label: 'Newest', value: 'newest' },
      { label: 'Oldest', value: 'oldest' },
      { label: 'Favorites', value: 'favorites' }
    ]
  };

  const handleToggleDropdown = (filterType) => {
    setShowDropdowns(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  };

  const handleFilterChange = (filterType, value) => {
    onFilterChange(filterType, value);
  };

  const handleClearFilters = () => {
    Object.keys(filters).forEach(filterType => {
      handleFilterChange(filterType, '');
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== null && value !== undefined && value !== '');

  return (
    <div className="fixed inset-y-0 left-0 w-72 glass border-r border-white/10 overflow-y-auto z-40 transform transition-transform duration-300">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold gradient-text">Filters</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by prompt..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass border-none bg-white/5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
            />
          </div>
        </div>

        {/* Active Filters Tag */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between mb-4 px-3 py-2 bg-gradient-primary/20 rounded-lg"
            >
              <span className="text-sm text-purple-300">
                {Object.values(filters).filter(v => v !== null && v !== undefined && v !== '').length} active filter(s)
              </span>
              <button
                onClick={handleClearFilters}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Clear all
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Style Filter */}
        <div className="mb-4">
          <button
            onClick={() => handleToggleDropdown('style')}
            className="w-full flex items-center justify-between px-4 py-2.5 glass rounded-xl hover:bg-white/10 transition-colors text-left"
          >
            <span className="text-sm font-medium text-gray-300">Style</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdowns.style ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showDropdowns.style && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 px-2"
              >
                {dropdownOptions.style.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleFilterChange('style', option)}
                    className={cn(
                      'w-full text-left px-4 py-2 rounded-lg text-sm transition-colors',
                      filters.style === option ? 'bg-gradient-primary text-white' : 'text-gray-300 hover:bg-white/10'
                    )}
                  >
                    {option}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Lighting Filter */}
        <div className="mb-4">
          <button
            onClick={() => handleToggleDropdown('lighting')}
            className="w-full flex items-center justify-between px-4 py-2.5 glass rounded-xl hover:bg-white/10 transition-colors text-left"
          >
            <span className="text-sm font-medium text-gray-300">Lighting</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdowns.lighting ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showDropdowns.lighting && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 px-2"
              >
                {dropdownOptions.lighting.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleFilterChange('lighting', option)}
                    className={cn(
                      'w-full text-left px-4 py-2 rounded-lg text-sm transition-colors',
                      filters.lighting === option ? 'bg-gradient-primary text-white' : 'text-gray-300 hover:bg-white/10'
                    )}
                  >
                    {option}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Texture Filter */}
        <div className="mb-4">
          <button
            onClick={() => handleToggleDropdown('texture')}
            className="w-full flex items-center justify-between px-4 py-2.5 glass rounded-xl hover:bg-white/10 transition-colors text-left"
          >
            <span className="text-sm font-medium text-gray-300">Texture</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdowns.texture ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showDropdowns.texture && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 px-2"
              >
                {dropdownOptions.texture.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleFilterChange('texture', option)}
                    className={cn(
                      'w-full text-left px-4 py-2 rounded-lg text-sm transition-colors',
                      filters.texture === option ? 'bg-gradient-primary text-white' : 'text-gray-300 hover:bg-white/10'
                    )}
                  >
                    {option}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Aspect Ratio Filter */}
        <div className="mb-4">
          <button
            onClick={() => handleToggleDropdown('aspectRatio')}
            className="w-full flex items-center justify-between px-4 py-2.5 glass rounded-xl hover:bg-white/10 transition-colors text-left"
          >
            <span className="text-sm font-medium text-gray-300">Aspect Ratio</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdowns.aspectRatio ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showDropdowns.aspectRatio && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 px-2"
              >
                {dropdownOptions.aspectRatio.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleFilterChange('aspectRatio', option)}
                    className={cn(
                      'w-full text-left px-4 py-2 rounded-lg text-sm transition-colors',
                      filters.aspectRatio === option ? 'bg-gradient-primary text-white' : 'text-gray-300 hover:bg-white/10'
                    )}
                  >
                    {option}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Resolution Filter */}
        <div className="mb-4">
          <button
            onClick={() => handleToggleDropdown('resolution')}
            className="w-full flex items-center justify-between px-4 py-2.5 glass rounded-xl hover:bg-white/10 transition-colors text-left"
          >
            <span className="text-sm font-medium text-gray-300">Resolution</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdowns.resolution ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showDropdowns.resolution && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 px-2"
              >
                {dropdownOptions.resolution.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleFilterChange('resolution', option)}
                    className={cn(
                      'w-full text-left px-4 py-2 rounded-lg text-sm transition-colors',
                      filters.resolution === option ? 'bg-gradient-primary text-white' : 'text-gray-300 hover:bg-white/10'
                    )}
                  >
                    {option}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sort By Filter */}
        <div className="mb-4">
          <button
            onClick={() => handleToggleDropdown('sortBy')}
            className="w-full flex items-center justify-between px-4 py-2.5 glass rounded-xl hover:bg-white/10 transition-colors text-left"
          >
            <span className="text-sm font-medium text-gray-300">Sort By</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdowns.sortBy ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showDropdowns.sortBy && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 px-2"
              >
                {dropdownOptions.sortBy.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleFilterChange('sortBy', option.value)}
                    className={cn(
                      'w-full text-left px-4 py-2 rounded-lg text-sm transition-colors',
                      filters.sortBy === option.value ? 'bg-gradient-primary text-white' : 'text-gray-300 hover:bg-white/10'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClearFilters}
            className="w-full py-2.5 glass-button mt-6 text-sm"
          >
            Clear All Filters
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default FilterSidebar;