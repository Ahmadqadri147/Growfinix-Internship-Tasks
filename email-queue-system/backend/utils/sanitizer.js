// Strip control characters and collapse whitespace from user input.
function sanitizeString(value) {
  if (typeof value !== 'string') return value;
  return value.replace(/[\u0000-\u001F\u007F]/g, '').trim();
}

function sanitizeBody(body) {
  const clean = {};
  Object.entries(body || {}).forEach(([key, value]) => {
    if (typeof value === 'string') clean[key] = sanitizeString(value);
    else clean[key] = value;
  });
  return clean;
}

module.exports = { sanitizeString, sanitizeBody };