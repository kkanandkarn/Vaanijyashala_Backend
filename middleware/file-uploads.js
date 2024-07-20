const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer to use Cloudinary as storage
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "seller-img", // Folder where you want to store uploads
    allowed_formats: ["jpg", "jpeg", "png"], // Optional: Restrict file types
    filename: function (req, file, cb) {
      cb(
        null,
        new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
      );
    },
  },
});

const sellerUpload = multer({
  storage: cloudinaryStorage,
  fileFilter: fileFilter, // Define your file filter function here
}).single("agentDp");

module.exports = sellerUpload;
