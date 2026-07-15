import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, Download, Copy, Share2, Heart, Maximize2 } from 'lucide-react';
import { useTheme } from '../context/ThemeProvider';
import ImageCard from './ImageCard';

const FullscreenModal = ({ image, onClose, onFavoriteToggle, onDownload, onCopyPrompt }) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const { isDark } = useTheme();

  const minZoom = 1;
  const maxZoom = 4;

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [zoom]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === '+' || e.key === '=') {
      handleZoomIn();
    } else if (e.key === '-' || e.key === '_') {
      handleZoomOut();
    } else if (e.key === 'ArrowLeft') {
      handlePan('left');
    } else if (e.key === 'ArrowRight') {
      handlePan('right');
    } else if (e.key === 'ArrowUp') {
      handlePan('up');
    } else if (e.key === 'ArrowDown') {
      handlePan('down');
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, maxZoom));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, minZoom));
  };

  const handlePan = (direction) => {
    const step = 50;
    switch (direction) {
      case 'left':
        setPan(prev => ({ x: prev.x + step, y: prev.y }));
        break;
      case 'right':
        setPan(prev => ({ x: prev.x - step, y: prev.y }));
        break;
      case 'up':
        setPan(prev => ({ x: prev.x, y: prev.y + step }));
        break;
      case 'down':
        setPan(prev => ({ x: prev.x, y: prev.y - step }));
        break;
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setImagePosition({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

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
    onFavoriteToggle(image);
  };

  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const hasPrompt = image.prompt && image.prompt.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-3 glass rounded-xl hover:bg-white/20 transition-all"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Navigation Buttons */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          disabled={zoom >= maxZoom}
          className="p-3 glass rounded-xl hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ZoomIn className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={handleZoomOut}
          disabled={zoom <= minZoom}
          className="p-3 glass rounded-xl hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ZoomOut className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={resetZoom}
          className="p-3 glass rounded-xl hover:bg-white/20 transition-all"
        >
          <Maximize2 className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Image Container */}
      <div
        ref={containerRef}
        className="absolute inset-0 flex items-center justify-center overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: zoom }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.2 }}
            className="relative"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
            }}
          >
            {image.imageUrl ? (
              <img
                src={image.imageUrl}
                alt={image.prompt}
                className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <svg className="w-32 h-32 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg font-medium">No image preview available</p>
                  <p className="text-sm mt-2">The image URL is not accessible</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Image Info and Actions */}
      <div className="absolute bottom-0 left-0 right-0 z-50">
        <div className="glass mx-4 mb-4 rounded-2xl p-4">
          <div className="flex items-start justify-between gap-4">
            {/* Image Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-white mb-2 truncate">
                AI Generated Image
              </h3>
              <p className="text-sm text-gray-300 line-clamp-2 mb-2">
                {image.prompt || 'No prompt available'}
              </p>
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
            </div>

            {/* Action Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-3 glass rounded-xl hover:bg-white/20 transition-all"
              >
                <Share2 className="w-5 h-5 text-white" />
              </button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute bottom-full right-0 mb-2 glass rounded-xl overflow-hidden min-w-[200px]"
                  >
                    <div className="py-2">
                      <button
                        onClick={handleDownload}
                        className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-white/10 transition-colors text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button
                        onClick={handleCopyPrompt}
                        className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-white/10 transition-colors text-sm"
                      >
                        <Copy className="w-4 h-4" />
                        Copy Prompt
                      </button>
                      <button
                        onClick={handleShare}
                        className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-white/10 transition-colors text-sm"
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                      <button
                        onClick={handleToggleFavorite}
                        className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-white/10 transition-colors text-sm"
                      >
                        {image.isFavorite ? (
                          <>
                            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                            Remove Favorite
                          </>
                        ) : (
                          <>
                            <Heart className="w-4 h-4" />
                            Add to Favorites
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-white/10">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= minZoom}
              className="p-2 glass rounded-lg hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ZoomOut className="w-4 h-4 text-white" />
            </button>
            <span className="text-sm font-medium text-gray-300 min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= maxZoom}
              className="p-2 glass rounded-lg hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ZoomIn className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullscreenModal;