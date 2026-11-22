const fs = require('fs').promises;
const path = require('path');
const config = require('../config');

class GalleryImageService {
  constructor() {
    this.storagePath = config.storage.path;
    this.dbFile = path.join(__dirname, '../generated_images.json');
  }

  async initialize() {
    try {
      await fs.mkdir(this.storagePath, { recursive: true });
      await this.ensureDbExists();
    } catch (error) {
      console.error('Error initializing gallery service:', error);
    }
  }

  async ensureDbExists() {
    try {
      await fs.access(this.dbFile);
    } catch (error) {
      await fs.writeFile(this.dbFile, JSON.stringify([], null, 2));
    }
  }

  async getImages(filters = {}) {
    try {
      const db = await this.loadDb();
      let images = [...db];

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        images = images.filter(img =>
          img.prompt.toLowerCase().includes(searchTerm) ||
          img.style.toLowerCase().includes(searchTerm) ||
          img.subject?.toLowerCase().includes(searchTerm)
        );
      }

      if (filters.style) {
        images = images.filter(img => img.style === filters.style);
      }

      if (filters.lighting) {
        images = images.filter(img => img.lighting === filters.lighting);
      }

      if (filters.texture) {
        images = images.filter(img => img.texture === filters.texture);
      }

      if (filters.aspectRatio) {
        images = images.filter(img => img.aspectRatio === filters.aspectRatio);
      }

      if (filters.resolution) {
        images = images.filter(img => img.resolution === filters.resolution);
      }

      if (filters.sortBy === 'newest') {
        images.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (filters.sortBy === 'oldest') {
        images.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      } else if (filters.sortBy === 'favorites') {
        images.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
      }

      return images.slice(0, 50);
    } catch (error) {
      console.error('Error getting images:', error);
      return [];
    }
  }

  async getImageById(id) {
    try {
      const db = await this.loadDb();
      return db.find(img => img.id === id);
    } catch (error) {
      console.error('Error getting image by id:', error);
      return null;
    }
  }

  async saveImage(imageData) {
    try {
      const db = await this.loadDb();
      const newImage = {
        id: this.generateId(),
        prompt: imageData.prompt,
        subject: imageData.subject,
        style: imageData.style,
        lighting: imageData.lighting,
        texture: imageData.texture,
        colorPalette: imageData.colorPalette,
        background: imageData.background,
        cameraAngle: imageData.cameraAngle,
        negativePrompt: imageData.negativePrompt,
        imageType: imageData.imageType,
        imageSize: imageData.imageSize,
        aspectRatio: imageData.aspectRatio,
        quality: imageData.quality,
        seed: imageData.seed,
        creativity: imageData.creativity,
        n: imageData.n,
        imageUrl: imageData.imageUrl,
        resolution: imageData.resolution,
        generationTime: imageData.generationTime,
        createdAt: new Date().toISOString(),
        isFavorite: false
      };

      db.unshift(newImage);
      await this.saveDb(db);

      return newImage;
    } catch (error) {
      console.error('Error saving image:', error);
      throw error;
    }
  }

  async deleteImage(id) {
    try {
      const db = await this.loadDb();
      const imageIndex = db.findIndex(img => img.id === id);

      if (imageIndex !== -1) {
        const image = db[imageIndex];
        db.splice(imageIndex, 1);
        await this.saveDb(db);
        return { success: true };
      }

      return { success: false, error: 'Image not found' };
    } catch (error) {
      console.error('Error deleting image:', error);
      return { success: false, error: error.message };
    }
  }

  async updateImage(id, updates) {
    try {
      const db = await this.loadDb();
      const imageIndex = db.findIndex(img => img.id === id);

      if (imageIndex !== -1) {
        db[imageIndex] = { ...db[imageIndex], ...updates };
        await this.saveDb(db);
        return db[imageIndex];
      }

      return null;
    } catch (error) {
      console.error('Error updating image:', error);
      throw error;
    }
  }

  async toggleFavorite(id) {
    try {
      const image = await this.getImageById(id);
      if (image) {
        return await this.updateImage(id, { isFavorite: !image.isFavorite });
      }
      return null;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }

  async loadDb() {
    try {
      const data = await fs.readFile(this.dbFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        await fs.writeFile(this.dbFile, JSON.stringify([], null, 2));
        return [];
      }
      throw error;
    }
  }

  async saveDb(db) {
    try {
      await fs.writeFile(this.dbFile, JSON.stringify(db, null, 2));
    } catch (error) {
      console.error('Error saving db:', error);
      throw error;
    }
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async getRecentImages(limit = 10) {
    try {
      const db = await this.loadDb();
      return db.slice(0, limit);
    } catch (error) {
      console.error('Error getting recent images:', error);
      return [];
    }
  }

  async getFavoriteImages() {
    try {
      const db = await this.loadDb();
      return db.filter(img => img.isFavorite);
    } catch (error) {
      console.error('Error getting favorite images:', error);
      return [];
    }
  }

  async getImagesBySeed(seed) {
    try {
      const db = await this.loadDb();
      return db.filter(img => img.seed === seed);
    } catch (error) {
      console.error('Error getting images by seed:', error);
      return [];
    }
  }
}

module.exports = new GalleryImageService();