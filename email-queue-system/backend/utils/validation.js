const logger = require('./logger');

const validators = {
  required: (value, field) => {
    if (value === undefined || value === null || String(value).trim() === '') {
      return `${field} is required`;
    }
    return null;
  },
  email: (value, field = 'Email') => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim())) {
      return `${field} must be a valid email address`;
    }
    return null;
  },
  phone: (value, field = 'Phone Number') => {
    if (value && !/^\+?[0-9\s-]{7,15}$/.test(String(value).trim())) {
      return `${field} must be a valid phone number (7-15 digits)`;
    }
    return null;
  },
  lengthBetween: (value, field, min, max) => {
    const len = String(value || '').trim().length;
    if (len < min) return `${field} must be at least ${min} characters`;
    if (len > max) return `${field} must be at most ${max} characters`;
    return null;
  },
  dateNotInPast: (value, field = 'Booking Date') => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return `${field} must be a valid date`;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return `${field} cannot be in the past`;
    return null;
  },
  integerBetween: (value, field, min, max) => {
    if (value === '' || value === undefined || value === null) return null;
    const num = Number(value);
    if (!Number.isInteger(num) || num < min || num > max) {
      return `${field} must be a whole number between ${min} and ${max}`;
    }
    return null;
  },
  type: (value, field, allowed) => {
    if (value && !allowed.includes(value)) {
      return `${field} must be one of: ${allowed.join(', ')}`;
    }
    return null;
  },
};

// Runs a set of validator rules, collects the first error per field.
function validate(rules, data) {
  const errors = {};
  Object.entries(rules).forEach(([field, checks]) => {
    const checksArray = Array.isArray(checks) ? checks : [checks];
    for (const rule of checksArray) {
      const error = typeof rule === 'function' ? rule(data[field], field) : null;
      if (error) {
        errors[field] = error;
        break;
      }
    }
  });
  return errors;
}

module.exports = { validators, validate };