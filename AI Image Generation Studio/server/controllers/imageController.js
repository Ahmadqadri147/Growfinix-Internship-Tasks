const huggingFaceService = require('../services/huggingFaceService');
const galleryService = require('../services/galleryService');
const config = require('../config');

class ImageController {
  constructor() {
    this.generateImage = this.generateImage.bind(this);
    this.getGallery = this.getGallery.bind(this);
    this.getImageById = this.getImageById.bind(this);
    this.getRecentImages = this.getRecentImages.bind(this);
    this.getFavoriteImages = this.getFavoriteImages.bind(this);
    this.deleteImage = this.deleteImage.bind(this);
    this.toggleFavorite = this.toggleFavorite.bind(this);
    this.getHistory = this.getHistory.bind(this);
  }

  async generateImage(req, res) {
    try {
      const { prompt, subject, style, lighting, texture, colorPalette, background, cameraAngle, negativePrompt, imageSize, aspectRatio, quality, seed, creativity, n } = req.body;

      const startTime = Date.now();

      // Validate required prompt
      if (!prompt || prompt.trim().length < 10) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Prompt must be at least 10 characters'
        });
      }

      // Determine image size based on aspect ratio
      let resolvedSize = imageSize;
      if (!resolvedSize) {
        const sizeMap = {
          '1:1': '1024x1024',
          '16:9': '1024x1792',
          '9:16': '1792x1024',
          '4:3': '1024x768',
          '3:2': '1024x682'
        };
        resolvedSize = sizeMap[aspectRatio] || '1024x1024';
      }

      // Map options for Replicate
      const replicateOptions = {
        imageSize: resolvedSize,
        n: parseInt(n) || 1,
        seed: seed ? parseInt(seed) : null,
        numInferenceSteps: this.mapQuality(quality),
        guidanceScale: parseInt(creativity) || 7.5
      };

      // Build prompt with style and other parameters
      const promptOptions = {
        style,
        lighting,
        texture,
        colorPalette,
        background,
        cameraAngle,
        negativePrompt
      };

      const optimizedPrompt = huggingFaceService.buildPrompt(prompt, promptOptions);

      // Generate image
      const result = await huggingFaceService.generateImage(optimizedPrompt, replicateOptions);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
          message: result.message
        });
      }

      const generationTime = Date.now() - startTime;

      // Extract resolution from the size
      const resolution = resolvedSize;

      // Extract subject if provided
      const subjectName = subject || this.extractSubject(prompt);

      // Save to gallery
      const savedImages = [];
      for (const imageData of result.images) {
        const savedImage = await galleryService.saveImage({
          prompt: optimizedPrompt,
          subject: subjectName,
          style,
          lighting,
          texture,
          colorPalette,
          background,
          cameraAngle,
          negativePrompt,
          imageType: 'huggingface-stable-diffusion',
          imageSize: resolvedSize,
          aspectRatio,
          quality: quality || 'standard',
          seed: seed ? parseInt(seed) : null,
          imageUrl: imageData.url,
          resolution,
          generationTime
        });
        savedImages.push(savedImage);
      }

      res.status(200).json({
        success: true,
        data: {
          images: savedImages,
          generationTime,
          usage: result.usage,
          model: result.model
        },
        message: 'Image generated successfully'
      });

    } catch (error) {
      console.error('Error in generateImage controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to generate image. Please try again later.'
      });
    }
  }

  async getGallery(req, res) {
    try {
      const filters = {
        search: req.query.search,
        style: req.query.style,
        lighting: req.query.lighting,
        texture: req.query.texture,
        aspectRatio: req.query.aspectRatio,
        resolution: req.query.resolution,
        sortBy: req.query.sortBy
      };

      const images = await galleryService.getImages(filters);

      res.status(200).json({
        success: true,
        data: images,
        total: images.length
      });

    } catch (error) {
      console.error('Error in getGallery controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve images'
      });
    }
  }

  async getImageById(req, res) {
    try {
      const { id } = req.params;
      const image = await galleryService.getImageById(id);

      if (!image) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Image not found'
        });
      }

      res.status(200).json({
        success: true,
        data: image
      });

    } catch (error) {
      console.error('Error in getImageById controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve image'
      });
    }
  }

  async getRecentImages(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const images = await galleryService.getRecentImages(limit);

      res.status(200).json({
        success: true,
        data: images
      });

    } catch (error) {
      console.error('Error in getRecentImages controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve recent images'
      });
    }
  }

  async getFavoriteImages(req, res) {
    try {
      const images = await galleryService.getFavoriteImages();

      res.status(200).json({
        success: true,
        data: images
      });

    } catch (error) {
      console.error('Error in getFavoriteImages controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve favorite images'
      });
    }
  }

  async deleteImage(req, res) {
    try {
      const { id } = req.params;
      const result = await galleryService.deleteImage(id);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          error: result.error,
          message: result.message
        });
      }

      res.status(200).json({
        success: true,
        message: 'Image deleted successfully'
      });

    } catch (error) {
      console.error('Error in deleteImage controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to delete image'
      });
    }
  }

  async toggleFavorite(req, res) {
    try {
      const { id } = req.params;
      const image = await galleryService.toggleFavorite(id);

      if (!image) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Image not found'
        });
      }

      res.status(200).json({
        success: true,
        data: image,
        message: image.isFavorite ? 'Image added to favorites' : 'Image removed from favorites'
      });

    } catch (error) {
      console.error('Error in toggleFavorite controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to update favorite status'
      });
    }
  }

  async getHistory(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const images = await galleryService.getRecentImages(limit);

      res.status(200).json({
        success: true,
        data: images
      });

    } catch (error) {
      console.error('Error in getHistory controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve history'
      });
    }
  }

  extractSubject(prompt) {
    const firstPeriod = prompt.indexOf('.');
    const firstComma = prompt.indexOf(',');

    if (firstPeriod !== -1 && (firstComma === -1 || firstComma > firstPeriod)) {
      return prompt.substring(0, firstPeriod).trim();
    }

    if (firstComma !== -1 && (firstPeriod === -1 || firstPeriod > firstComma)) {
      return prompt.substring(0, firstComma).trim();
    }

    return prompt.substring(0, 50);
  }

  mapQuality(quality) {
    const qualityMap = {
      'standard': 50,
      'hd': 75,
      'ultra': 100
    };
    return qualityMap[quality] || 50;
  }
}

module.exports = new ImageController();