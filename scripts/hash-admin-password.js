const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('Usage: node hash-admin-password.js <password>');
  process.exit(1);
}

const saltRounds = 10;
const hash = bcrypt.hashSync(password, saltRounds);

console.log('Password:', password);
console.log('Hash (Add to .env.local as ADMIN_PASSWORD_HASH):');
console.log(hash);
