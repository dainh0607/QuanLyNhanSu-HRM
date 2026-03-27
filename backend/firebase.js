// firebaseAdmin.js
const admin = require("firebase-admin");

// Đường dẫn trỏ tới file JSON bạn vừa tải về (nhớ đổi tên file cho đúng)
const serviceAccount = require("./path/to/your/firebase-service-account-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Export auth để sử dụng cho các API Sign Up / Sign In
const adminAuth = admin.auth();
module.exports = { adminAuth };
