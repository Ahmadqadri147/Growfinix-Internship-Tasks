const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const { validateImageGeneration, validateGalleryFilters, validateImageId } = require('../middleware/validators');

// Generate image endpoint
router.post('/generate', validateImageGeneration, imageController.generateImage);

// Get all images with filters
router.get('/gallery', validateGalleryFilters, imageController.getGallery);

// Get recent images
router.get('/gallery/recent', imageController.getRecentImages);

// Get favorite images
router.get('/gallery/favorites', imageController.getFavoriteImages);

// Get single image
router.get('/gallery/:id', validateImageId, imageController.getImageById);

// Delete image
router.delete('/gallery/:id', validateImageId, imageController.deleteImage);

// Toggle favorite
router.patch('/gallery/:id/favorite', validateImageId, imageController.toggleFavorite);

// Get prompt history
router.get('/history', imageController.getHistory);

module.exports = router;