const { body, query, param, validationResult } = require('express-validator');

const validateImageGeneration = [
  body('prompt')
    .trim()
    .notEmpty()
    .withMessage('Prompt is required')
    .isLength({ min: 10, max: 4000 })
    .withMessage('Prompt must be between 10 and 4000 characters'),

  body('subject')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Subject must be less than 100 characters'),

  body('style')
    .optional({ values: 'falsy' })
    .trim()
    .isIn([
      'Realistic', 'Photorealistic', 'Anime', 'Cyberpunk', 'Oil Painting',
      'Watercolor', 'Fantasy', '3D Render', 'Pixar', 'Comic', 'Pixel Art'
    ])
    .withMessage('Invalid style'),

  body('lighting')
    .optional({ values: 'falsy' })
    .trim()
    .isIn([
      'Natural', 'Studio', 'Golden Hour', 'Sunset', 'Neon', 'Soft', 'Cinematic', 'Volumetric'
    ])
    .withMessage('Invalid lighting'),

  body('texture')
    .optional({ values: 'falsy' })
    .trim()
    .isIn([
      'Smooth', 'Rough', 'Metallic', 'Wood', 'Glass', 'Stone', 'Fabric', 'Leather', 'Paper'
    ])
    .withMessage('Invalid texture'),

  body('colorPalette')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Color palette must be less than 50 characters'),

  body('background')
    .optional({ values: 'falsy' })
    .trim()
    .isIn([
      'Forest', 'Mountains', 'Ocean', 'Space', 'City', 'Minimal', 'Abstract', 'White Studio'
    ])
    .withMessage('Invalid background'),

  body('cameraAngle')
    .optional({ values: 'falsy' })
    .trim()
    .isIn([
      'Close-up', 'Portrait', 'Wide', 'Top View', 'Low Angle', 'Bird Eye', 'Macro'
    ])
    .withMessage('Invalid camera angle'),

  body('negativePrompt')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Negative prompt must be less than 500 characters'),

  body('imageSize')
    .optional({ values: 'falsy' })
    .trim()
    .isIn(['256x256', '512x512', '1024x1024', '1024x1792', '1792x1024'])
    .withMessage('Invalid image size'),

  body('aspectRatio')
    .optional({ values: 'falsy' })
    .trim()
    .isIn(['1:1', '16:9', '9:16', '4:3', '3:2'])
    .withMessage('Invalid aspect ratio'),

  body('quality')
    .optional({ values: 'falsy' })
    .trim()
    .isIn(['standard', 'hd', 'ultra'])
    .withMessage('Invalid quality'),

  body('seed')
    .optional({ values: 'falsy' })
    .isInt({ min: 1, max: 2147483647 })
    .withMessage('Seed must be a positive integer'),

  body('creativity')
    .optional({ values: 'falsy' })
    .isInt({ min: 0, max: 10 })
    .withMessage('Creativity must be between 0 and 10'),

  body('n')
    .optional({ values: 'falsy' })
    .isInt({ min: 1, max: 10 })
    .withMessage('Number of images must be between 1 and 10'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', JSON.stringify(errors.array()));
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Please fix the validation errors',
        errors: errors.array()
      });
    }
    next();
  }
];

const validateGalleryFilters = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search must be less than 100 characters'),

  query('style')
    .optional()
    .trim()
    .isIn([
      'Realistic', 'Photorealistic', 'Anime', 'Cyberpunk', 'Oil Painting',
      'Watercolor', 'Fantasy', '3D Render', 'Pixar', 'Comic', 'Pixel Art'
    ])
    .withMessage('Invalid style'),

  query('lighting')
    .optional()
    .trim()
    .isIn([
      'Natural', 'Studio', 'Golden Hour', 'Sunset', 'Neon', 'Soft', 'Cinematic', 'Volumetric'
    ])
    .withMessage('Invalid lighting'),

  query('texture')
    .optional()
    .trim()
    .isIn([
      'Smooth', 'Rough', 'Metallic', 'Wood', 'Glass', 'Stone', 'Fabric', 'Leather', 'Paper'
    ])
    .withMessage('Invalid texture'),

  query('aspectRatio')
    .optional()
    .trim()
    .isIn(['1:1', '16:9', '9:16', '4:3', '3:2'])
    .withMessage('Invalid aspect ratio'),

  query('resolution')
    .optional()
    .trim()
    .isIn(['256x256', '512x512', '1024x1024', '1024x1792', '1792x1024'])
    .withMessage('Invalid resolution'),

  query('sortBy')
    .optional()
    .trim()
    .isIn(['newest', 'oldest', 'favorites'])
    .withMessage('Invalid sort option')
];

const validateImageId = [
  param('id')
    .notEmpty()
    .withMessage('Image ID is required')
    .trim()
    .matches(/^[a-zA-Z0-9-]+$/)
    .withMessage('Invalid image ID'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Invalid image ID',
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  validateImageGeneration,
  validateGalleryFilters,
  validateImageId
};