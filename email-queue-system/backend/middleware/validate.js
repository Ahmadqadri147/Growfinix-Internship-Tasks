const { validate } = require('../utils/validation');

// Returns an Express middleware that runs `rules` against req.body.
function validateBody(rules) {
  return (req, res, next) => {
    const errors = validate(rules, req.body);
    if (Object.keys(errors).length) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }
    next();
  };
}

module.exports = { validateBody };