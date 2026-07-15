import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Copy, Share2, Heart, Search } from 'lucide-react';
import { useTheme } from '../context/ThemeProvider';
import { cn } from '../utils/cn';

const ImageCard = ({ image, onImageClick, onFavoriteToggle, onDownload, onCopyPrompt }) => {
  const [isFavorite, setIsFavorite] = useState(image.isFavorite || false);
  const [showMenu, setShowMenu] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const menuRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownload = () => {
    onDownload(image);
  };

  const handleCopyPrompt = () => {
    onCopyPrompt(image);
    setShowMenu(false);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'AI Generated Image',
          text: `Check out this AI-generated image: ${image.prompt}`,
          url: window.location.href,
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
      }
      setShowMenu(false);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    onFavoriteToggle(image);
  };

  const handleImageClick = () => {
    onImageClick(image);
  };

  const handleMouseDown = (e) => {
    if (isZoomed) {
      setIsDragging(true);
      setPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="masonry-item"
    >
      <div className="glass rounded-2xl overflow-hidden group hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300">
        {/* Image Container */}
        <div className="relative">
          <motion.div
            className="aspect-square bg-gradient-dark cursor-pointer"
            onClick={handleImageClick}
            whileHover={{ scale: 1.02 }}
          >
            {image.imageUrl ? (
              <img
                src={image.imageUrl}
                alt={image.prompt}
                className="w-full h-full object-cover transition-transform duration-300"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">No image preview available</p>
                </div>
              </div>
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <motion.button
                onClick={handleImageClick}
                className="px-4 py-2 glass rounded-xl font-semibold hover:scale-105 transition-transform"
              >
                View Fullscreen
              </motion.button>
            </div>

            {/* Favorite Button */}
            <button
              onClick={handleToggleFavorite}
              className="absolute top-3 right-3 p-2 rounded-xl glass hover:bg-red-500/20 transition-all"
            >
              {isFavorite ? (
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              ) : (
                <Heart className="w-5 h-5 text-white" />
              )}
            </button>

            {/* Menu Button */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="absolute top-3 left-3 p-2 rounded-xl glass hover:bg-white/20 transition-all"
            >
              <Search className="w-5 h-5 text-white" />
            </button>
          </motion.div>

          {/* Prompt Preview on Hover */}
          {showPrompt && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-black/80 backdrop-blur-xl p-4 max-h-32 overflow-y-auto"
            >
              <p className="text-sm text-gray-300 line-clamp-3">{image.prompt}</p>
            </motion.div>
          )}

          {/* Context Menu */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                ref={menuRef}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="absolute bottom-16 left-3 glass rounded-xl overflow-hidden"
              >
                <div className="py-2">
                  <button
                    onClick={handleDownload}
                    className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/10 transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={handleCopyPrompt}
                    className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/10 transition-colors text-sm"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Prompt
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/10 transition-colors text-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Image Info */}
        <div className="p-4 space-y-2">
          <div className="flex items-start gap-2">
            <p className="flex-1 text-sm text-gray-300 line-clamp-2">{image.prompt}</p>
          </div>

          {image.style && (
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 text-xs rounded-lg bg-white/10 text-gray-300">
                {image.style}
              </span>
              {image.lighting && (
                <span className="px-2 py-1 text-xs rounded-lg bg-white/10 text-gray-300">
                  {image.lighting}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
            <span>✨ {image.resolution}</span>
            <span>⏱️ {Math.round(image.generationTime / 1000)}s</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ImageCard;