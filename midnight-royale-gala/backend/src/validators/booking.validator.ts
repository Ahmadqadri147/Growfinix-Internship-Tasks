import { body } from 'express-validator';

export const createBookingValidator = [
  body('eventId')
    .isUUID()
    .withMessage('Please provide a valid event ID'),
  body('tickets')
    .isArray({ min: 1 })
    .withMessage('At least one ticket type is required'),
  body('tickets.*.ticketTypeId')
    .isUUID()
    .withMessage('Invalid ticket type ID'),
  body('tickets.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('seatIds')
    .optional()
    .isArray()
    .withMessage('Seat IDs must be an array'),
  body('seatIds.*')
    .optional()
    .isUUID()
    .withMessage('Invalid seat ID'),
  body('couponCode')
    .optional()
    .isString()
    .trim()
    .withMessage('Coupon code must be a string'),
];

export const confirmBookingValidator = [
  body('paymentIntentId')
    .notEmpty()
    .withMessage('Payment intent ID is required'),
];
