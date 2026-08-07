const test = require('node:test');
const assert = require('node:assert/strict');
const { shouldForcePageBreak } = require('../config/mailer');

test('forces a new page before a row that would overflow the current page', () => {
  assert.equal(shouldForcePageBreak(720, 40, 740), true);
  assert.equal(shouldForcePageBreak(700, 20, 740), false);
});

test('keeps a row on the current page when it fits with a small bottom buffer', () => {
  assert.equal(shouldForcePageBreak(680, 40, 740), false);
});
