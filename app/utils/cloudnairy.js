var cloudinary = require('cloudinary');
const CONFIG = require('../../config/config.js');

cloudinary.v2.config({
  cloud_name: CONFIG.CLOUD_NAME,
  api_key: CONFIG.API_KEY,
  api_secret: CONFIG.API_SECRET,
});

module.exports.cloudinary=cloudinary
