const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const path = require("path");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const sellerImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "seller-img",
    allowed_formats: ["jpg", "jpeg", "png"],
    public_id: (req, file) => {
      const name = path.parse(file.originalname).name;
      return new Date().toISOString().replace(/:/g, "-") + "-" + name;
    },
  },
});
const employeeStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "employee",
    allowed_formats: ["jpg", "jpeg", "png", "application/pdf"],
    public_id: (req, file) => {
      const name = path.parse(file.originalname).name;
      return new Date().toISOString().replace(/:/g, "-") + "-" + name;
    },
  },
});

const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "jpeg", "png"],
    public_id: (req, file) => {
      const name = path.parse(file.originalname).name;
      return new Date().toISOString().replace(/:/g, "-") + "-" + name;
    },
  },
});

const imageMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
const pdfMimeTypes = ["application/pdf"];
const audioMimeTypes = ["audio/mpeg", "audio/wav", "audio/mp3"];

const fileFilter = (req, file, cb) => {
  if (
    imageMimeTypes.includes(file.mimetype) ||
    pdfMimeTypes.includes(file.mimetype) ||
    audioMimeTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const sellerUpload = (req, res, next) => {
  multer({
    storage: sellerImageStorage,
    fileFilter: fileFilter,
  }).single("sellerProfileImg")(req, res, function (err) {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: err.message });
    }
    return next();
  });
};
const employeeUpload = (req, res, next) => {
  multer({
    storage: employeeStorage,
    fileFilter: fileFilter,
  }).fields([
    { name: "profileImg", maxCount: 1 },
    { name: "idFile", maxCount: 1 },
  ])(req, res, function (err) {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: err.message });
    }
    return next();
  });
};
const productUpload = (req, res, next) => {
  multer({
    storage: productStorage,
    fileFilter: fileFilter,
  }).fields([{ name: "productImages", maxCount: 10 }])(
    req,
    res,
    function (err) {
      if (err) {
        console.log(err);
        return res.status(400).json({ error: err.message });
      }
      return next();
    }
  );
};

module.exports = {
  sellerUpload,
  employeeUpload,
  productUpload,
};
