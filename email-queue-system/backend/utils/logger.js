const LEVELS = {
  info: ['\x1b[36m', 'INFO'],
  success: ['\x1b[32m', 'OK  '],
  warn: ['\x1b[33m', 'WARN'],
  error: ['\x1b[31m', 'ERR '],
};

function stamp() {
  return new Date().toISOString();
}

function log(level, message) {
  const [color, tag] = LEVELS[level] || LEVELS.info;
  // eslint-disable-next-line no-console
  console.log(`${color}[${tag}]\x1b[0m ${stamp()} ${message}`);
}

module.exports = {
  info: (m) => log('info', m),
  success: (m) => log('success', m),
  warn: (m) => log('warn', m),
  error: (m) => log('error', m),
};