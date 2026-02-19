// src/config/cloudinary.js
export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  apiUrl: `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}`,
};

export const validateConfig = () => {
  if (!CLOUDINARY_CONFIG.cloudName || CLOUDINARY_CONFIG.cloudName === 'tu-cloud-name-aqui') {
    console.error('ERROR: VITE_CLOUDINARY_CLOUD_NAME no está configurado en .env');
    return false;
  }
  if (!CLOUDINARY_CONFIG.uploadPreset || CLOUDINARY_CONFIG.uploadPreset === 'tu-upload-preset-unsigned-aqui') {
    console.error('ERROR: VITE_CLOUDINARY_UPLOAD_PRESET no está configurado en .env');
    return false;
  }
  return true;
};