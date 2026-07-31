import { body } from 'express-validator';

export const createEventValidator = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date in ISO 8601 format'),
  body('time')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Time must be in HH:mm format'),
  body('venueId')
    .isUUID()
    .withMessage('Please provide a valid venue ID'),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Please provide a valid image URL'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
];

export const updateEventValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date in ISO 8601 format'),
  body('time')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Time must be in HH:mm format'),
  body('venueId')
    .optional()
    .isUUID()
    .withMessage('Please provide a valid venue ID'),
  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'CANCELLED'])
    .withMessage('Status must be DRAFT, PUBLISHED, or CANCELLED'),
];
