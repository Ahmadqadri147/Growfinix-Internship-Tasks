const router = require('express').Router();
const { createEnquiry, createEnquirySync, listEnquiries, getEnquiry } = require('../controllers/enquiryController');
const { validateBody } = require('../middleware/validate');
const { validators } = require('../utils/validation');
const { enquiryLimiter } = require('../middleware/rateLimiter');

const enquiryRules = {
  fullName: [validators.required, (v) => validators.lengthBetween(v, 'Full Name', 2, 100)],
  email: [validators.required, validators.email],
  phone: [validators.required, validators.phone],
  subject: [validators.required, (v) => validators.lengthBetween(v, 'Subject', 3, 200)],
  message: [validators.required, (v) => validators.lengthBetween(v, 'Message', 10, 5000)],
  bookingDate: [validators.dateNotInPast],
  guests: [(v) => validators.integerBetween(v, 'Number of Guests', 1, 50)],
  type: [(v) => validators.type(v, 'Type', ['enquiry', 'booking'])],
};

router.post('/', enquiryLimiter, validateBody(enquiryRules), createEnquiry);
router.post('/sync', enquiryLimiter, validateBody(enquiryRules), createEnquirySync);
router.get('/', listEnquiries);
router.get('/:id', getEnquiry);

module.exports = router;