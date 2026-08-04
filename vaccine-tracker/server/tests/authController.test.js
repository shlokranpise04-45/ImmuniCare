const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('module');

const originalLoad = Module._load;
let savedUser;

function createRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

function loadController() {
  const mockUser = {
    findOne: async (query) => {
      if (query && typeof query === 'object' && query._id) {
        return savedUser && savedUser._id === query._id ? savedUser : null;
      }
      if (query && typeof query === 'object' && query.email) {
        if (savedUser && savedUser.email === query.email) return savedUser;
        if (savedUser && query.email === 'taken@example.com') return { _id: 'another-user' };
        return null;
      }
      return savedUser;
    },
    create: async (data) => ({ ...data, _id: 'user1' }),
  };
  const mockMailer = {
    sendPasswordResetEmail: async () => ({ success: true }),
  };

  Module._load = function (request, parent, isMain) {
    if (request === '../models/User' || request === './models/User' || request.endsWith('/models/User')) {
      return mockUser;
    }
    if (request === '../config/mailer' || request === './config/mailer' || request.endsWith('/config/mailer')) {
      return mockMailer;
    }
    return originalLoad.apply(this, arguments);
  };

  delete require.cache[require.resolve('../controllers/authController')];
  return require('../controllers/authController');
}

test('forgotPassword rejects missing email addresses', async () => {
  savedUser = null;
  const controller = loadController();
  const req = { body: {} };
  const res = createRes();

  await controller.forgotPassword(req, res);

  assert.equal(res.statusCode, 400);
});

test('forgotPassword creates a reset token for an existing account', async () => {
  savedUser = {
    email: 'test@example.com',
    save: async function () {
      this.saved = true;
      return this;
    },
  };

  const controller = loadController();
  const req = { body: { email: 'TEST@Example.com' } };
  const res = createRes();

  await controller.forgotPassword(req, res);

  assert.equal(res.statusCode, 200);
  assert.ok(savedUser.resetToken);
  assert.ok(savedUser.resetTokenExpires);
});

test('updateEmail changes the current user email when it is available', async () => {
  savedUser = {
    _id: 'user1',
    email: 'old@example.com',
    save: async function () {
      this.saved = true;
      return this;
    },
  };

  const controller = loadController();
  const req = { userId: 'user1', body: { email: 'new@example.com' } };
  const res = createRes();

  await controller.updateEmail(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(savedUser.email, 'new@example.com');
  assert.equal(res.body.user.email, 'new@example.com');
});
