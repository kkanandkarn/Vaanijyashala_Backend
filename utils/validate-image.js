const allowedImageTypes = ["image/jpeg", "image/png", "image/jpg"];
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const isValidFile = (req) => {
  const { mimetype, size } = req.file;

  if (!allowedImageTypes.includes(mimetype)) {
    return { success: false, error: "Inavlid image type." };
  }

  if (size > MAX_FILE_SIZE_BYTES) {
    return { success: false, error: "Image should be less than 5 mb" };
  }

  return { success: true };
};

module.exports = {
  isValidFile,
};
