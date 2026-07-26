const crypto = require('crypto');

const adminUser = [
  {
    public_id: crypto.randomUUID(),
    name: 'Admin',
    email: 'admin@gmail.com',
    password: 'Admin@123',
    role: 'admin',
    status: 'active',
    preferred_language: 'en',
  },
];

module.exports = adminUser;
