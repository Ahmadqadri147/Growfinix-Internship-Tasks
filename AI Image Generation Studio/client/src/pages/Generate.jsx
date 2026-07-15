import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Upload, Eye, Download, RefreshCw, Settings, Image as ImageIcon, Zap, Shield, Info, X } from 'lucide-react';
import { generateImage, checkHealth, toggleFavorite } from '../services/api';
import { LoadingSpinner, ProgressLoader } from '../components/Loader';
import FullscreenModal from '../components/FullscreenModal';
import ImageCard from '../components/ImageCard';
import toast from 'react-hot-toast';

const GeneratePage = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHealthCheck, setIsHealthCheck] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  const [formData, setFormData] = useState({
    prompt: '',
    subject: '',
    style: 'Realistic',
    lighting: 'Studio',
    texture: 'Smooth',
    colorPalette: '',
    background: '',
    cameraAngle: 'Portrait',
    negativePrompt: '',
    imageSize: '1024x1024',
    aspectRatio: '1:1',
    quality: 'standard',
    seed: '',
    creativity: 7,
    n: 1
  });

  useEffect(() => {
    checkHealth();
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!formData.prompt.trim() || formData.prompt.length < 10) {
      toast.error('Please enter a prompt with at least 10 characters');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setError(null);

    // Clean form data - remove empty string values so optional validators don't fail
    const cleanedData = {};
    for (const [key, value] of Object.entries(formData)) {
      if (value !== '' && value !== null && value !== undefined) {
        cleanedData[key] = value;
      }
    }

    try {
      // Run progress animation in parallel with the API call
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 2;
        });
      }, 500);

      const response = await generateImage(cleanedData);
      clearInterval(progressInterval);
      setProgress(100);

      if (response.success) {
        setGeneratedImages(prev => [...response.data.images, ...prev]);
        toast.success('Image generated successfully!');
      } else {
        setError(response.message);
        toast.error(response.message);
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate image. Please try again.');
      toast.error(err.response?.data?.message || 'Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
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
      }
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  const handleCopyPrompt = (image) => {
    navigator.clipboard.writeText(image.prompt);
    toast.success('Prompt copied to clipboard');
  };

  const handleFavoriteToggle = async (image) => {
    try {
      const response = await toggleFavorite(image.id);
      if (response.success) {
        setGeneratedImages(prev => prev.map(img =>
          img.id === image.id ? { ...img, isFavorite: response.data.isFavorite } : img
        ));
        toast.success(response.data.isFavorite ? 'Added to favorites' : 'Removed from favorites');
      } else {
        toast.error('Failed to update favorite status');
      }
    } catch (err) {
      toast.error('Failed to update favorites');
    }
  };

  const renderFormFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Prompt */}
      <div className="lg:col-span-3">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Prompt <span className="text-red-400">*</span>
        </label>
        <textarea
          value={formData.prompt}
          onChange={(e) => handleChange('prompt', e.target.value)}
          placeholder="Describe exactly what you want to create..."
          rows={4}
          className="w-full px-4 py-3 glass rounded-xl border-none bg-white/5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder-gray-500 resize-none"
          disabled={isGenerating}
        />
        <p className="text-xs text-gray-500 mt-2">
          Be specific and detailed for better results
        </p>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Subject
        </label>
        <input
          type="text"
          value={formData.subject}
          onChange={(e) => handleChange('subject', e.target.value)}
          placeholder="Main subject"
          className="w-full px-4 py-3 glass rounded-xl border-none bg-white/5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder-gray-500 disabled:opacity-50"
          disabled={isGenerating}
        />
      </div>

      {/* Style */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Style
        </label>
        <select
          value={formData.style}
          onChange={(e) => handleChange('style', e.target.value)}
          className="w-full px-4 py-3 glass rounded-xl border-none bg-white/5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white disabled:opacity-50"
          disabled={isGenerating}
        >
          <option value="Realistic">Realistic</option>
          <option value="Photorealistic">Photorealistic</option>
          <option value="Anime">Anime</option>
          <option value="Cyberpunk">Cyberpunk</option>
          <option value="Oil Painting">Oil Painting</option>
          <option value="Watercolor">Watercolor</option>
          <option value="Fantasy">Fantasy</option>
          <option value="3D Render">3D Render</option>
          <option value="Pixar">Pixar</option>
          <option value="Comic">Comic</option>
          <option value="Pixel Art">Pixel Art</option>
        </select>
      </div>

      {/* Lighting */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Lighting
        </label>
        <select
          value={formData.lighting}
          onChange={(e) => handleChange('lighting', e.target.value)}
          className="w-full px-4 py-3 glass rounded-xl border-none bg-white/5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white disabled:opacity-50"
          disabled={isGenerating}
        >
          <option value="Studio">Studio</option>
          <option value="Natural">Natural</option>
          <option value="Golden Hour">Golden Hour</option>
          <option value="Sunset">Sunset</option>
          <option value="Neon">Neon</option>
          <option value="Soft">Soft</option>
          <option value="Cinematic">Cinematic</option>
          <option value="Volumetric">Volumetric</option>
        </select>
      </div>

      {/* Texture */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Texture
        </label>
        <select
          value={formData.texture}
          onChange={(e) => handleChange('texture', e.target.value)}
          className="w-full px-4 py-3 glass rounded-xl border-none bg-white/5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white disabled:opacity-50"
          disabled={isGenerating}
        >
          <option value="Smooth">Smooth</option>
          <option value="Rough">Rough</option>
          <option value="Metallic">Metallic</option>
          <option value="Wood">Wood</option>
          <option value="Glass">Glass</option>
          <option value="Stone">Stone</option>
          <option value="Fabric">Fabric</option>
          <option value="Leather">Leather</option>
          <option value="Paper">Paper</option>
        </select>
      </div>

      {/* Color Palette */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Color Palette
        </label>
        <input
          type="text"
          value={formData.colorPalette}
          onChange={(e) => handleChange('colorPalette', e.target.value)}
          placeholder="e.g., Pastel, Vibrant, Monochromatic"
          className="w-full px-4 py-3 glass rounded-xl border-none bg-white/5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder-gray-500 disabled:opacity-50"
          disabled={isGenerating}
        />
      </div>

      {/* Background */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Background
        </label>
        <select
          value={formData.background}
          onChange={(e) => handleChange('background', e.target.value)}
          className="w-full px-4 py-3 glass rounded-xl border-none bg-white/5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white disabled:opacity-50"
          disabled={isGenerating}
        >
          <option value="">None</option>
          <option value="Forest">Forest</option>
          <option value="Mountains">Mountains</option>
          <option value="Ocean">Ocean</option>
          <option value="Space">Space</option>
          <option value="City">City</option>
          <option value="Minimal">Minimal</option>
          <option value="Abstract">Abstract</option>
          <option value="White Studio">White Studio</option>
        </select>
      </div>

      {/* Camera Angle */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Camera Angle
        </label>
        <select
          value={formData.cameraAngle}
          onChange={(e) => handleChange('cameraAngle', e.target.value)}
          className="w-full px-4 py-3 glass rounded-xl border-none bg-white/5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white disabled:opacity-50"
          disabled={isGenerating}
        >
          <option value="Portrait">Portrait</option>
          <option value="Close-up">Close-up</option>
          <option value="Wide">Wide</option>
          <option value="Top View">Top View</option>
          <option value="Low Angle">Low Angle</option>
          <option value="Bird Eye">Bird Eye</option>
          <option value="Macro">Macro</option>
        </select>
      </div>

      {/* Negative Prompt */}
      <div className="lg:col-span-3">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Negative Prompt
        </label>
        <input
          type="text"
          value={formData.negativePrompt}
          onChange={(e) => handleChange('negativePrompt', e.target.value)}
          placeholder="What to avoid in the image (e.g., blurry, distorted)"
          className="w-full px-4 py-3 glass rounded-xl border-none bg-white/5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder-gray-500 disabled:opacity-50"
          disabled={isGenerating}
        />
      </div>

      {/* Image Size */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Image Size
        </label>
        <select
          value={formData.imageSize}
          onChange={(e) => handleChange('imageSize', e.target.value)}
          className="w-full px-4 py-3 glass rounded-xl border-none bg-white/5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white disabled:opacity-50"
          disabled={isGenerating}
        >
          <option value="256x256">256x256 (Fast)</option>
          <option value="512x512">512x512 (Standard)</option>
          <option value="1024x1024">1024x1024 (HD)</option>
          <option value="1024x1792">1024x1792 (Landscape 16:9)</option>
          <option value="1792x1024">1792x1024 (Portrait 9:16)</option>
        </select>
      </div>

      {/* Aspect Ratio */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Aspect Ratio
        </label>
        <select
          value={formData.aspectRatio}
          onChange={(e) => handleChange('aspectRatio', e.target.value)}
          className="w-full px-4 py-3 glass rounded-xl border-none bg-white/5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white disabled:opacity-50"
          disabled={isGenerating}
        >
          <option value="1:1">1:1 (Square)</option>
          <option value="16:9">16:9 (Landscape)</option>
          <option value="9:16">9:16 (Portrait)</option>
          <option value="4:3">4:3 (Standard)</option>
          <option value="3:2">3:2 (Classic)</option>
        </select>
      </div>

      {/* Quality */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Quality
        </label>
        <select
          value={formData.quality}
          onChange={(e) => handleChange('quality', e.target.value)}
          className="w-full px-4 py-3 glass rounded-xl border-none bg-white/5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white disabled:opacity-50"
          disabled={isGenerating}
        >
          <option value="standard">Standard</option>
          <option value="hd">HD</option>
        </select>
      </div>

      {/* Seed */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Seed <span className="text-gray-500">(Optional)</span>
        </label>
        <input
          type="number"
          value={formData.seed}
          onChange={(e) => handleChange('seed', e.target.value)}
          placeholder="Random number for reproducibility"
          className="w-full px-4 py-3 glass rounded-xl border-none bg-white/5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder-gray-500 disabled:opacity-50"
          disabled={isGenerating}
        />
      </div>

      {/* Creativity Slider */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Creativity: <span className="text-purple-400">{formData.creativity}/10</span>
        </label>
        <input
          type="range"
          min="0"
          max="10"
          value={formData.creativity}
          onChange={(e) => handleChange('creativity', parseInt(e.target.value))}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          disabled={isGenerating}
        />
      </div>

      {/* Number of Images */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Number of Images
        </label>
        <select
          value={formData.n}
          onChange={(e) => handleChange('n', parseInt(e.target.value))}
          className="w-full px-4 py-3 glass rounded-xl border-none bg-white/5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white disabled:opacity-50"
          disabled={isGenerating}
        >
          <option value="1">1 Image</option>
          <option value="2">2 Images</option>
          <option value="3">3 Images</option>
          <option value="4">4 Images</option>
          <option value="5">5 Images</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-dark pt-20 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block mb-4"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-purple-400" />
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text">
                AI Image Generation Studio
              </h1>
            </div>
          </motion.div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Transform your ideas into stunning visuals with professional-grade AI image generation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold gradient-text">Create New Image</h2>
                <button
                  onClick={() => {
                    setFormData({
                      prompt: '',
                      subject: '',
                      style: 'Realistic',
                      lighting: 'Studio',
                      texture: 'Smooth',
                      colorPalette: '',
                      background: '',
                      cameraAngle: 'Portrait',
                      negativePrompt: '',
                      imageSize: '1024x1024',
                      aspectRatio: '1:1',
                      quality: 'standard',
                      seed: '',
                      creativity: 7,
                      n: 1
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 glass-button text-sm"
                  disabled={isGenerating}
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset
                </button>
              </div>

              <form onSubmit={handleGenerate} className="space-y-6">
                {renderFormFields()}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isGenerating}
                  className="w-full py-4 glass-button flex items-center justify-center gap-2 text-lg"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Image
                    </>
                  )}
                </motion.button>
              </form>

              {/* Loading State */}
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <ProgressLoader progress={progress} />
                </motion.div>
              )}

              {/* Error State */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-400 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-400">Error</h3>
                      <p className="text-sm text-red-300 mt-1">{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Info Side Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Tips */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6 text-yellow-400" />
                <h3 className="text-xl font-bold gradient-text">Quick Tips</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>Be specific and detailed in your prompt</span>
                </li>
                <li className="flex items-start gap-2">
                  <ImageIcon className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>Use style, lighting, and texture for better results</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>Seed ensures reproducible results</span>
                </li>
              </ul>
            </div>

            {/* Generated Images Preview */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold gradient-text">Recent Generations</h3>
                <span className="text-sm text-gray-400">{generatedImages.length} images</span>
              </div>
              {generatedImages.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {generatedImages.slice(0, 4).map((image) => (
                    <ImageCard
                      key={image.id}
                      image={image}
                      onImageClick={(img) => setSelectedImage(img)}
                      onFavoriteToggle={handleFavoriteToggle}
                      onDownload={handleDownload}
                      onCopyPrompt={handleCopyPrompt}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No images generated yet</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
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

export default GeneratePage;
