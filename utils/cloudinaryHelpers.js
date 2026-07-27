import cloudinary from '../config/cloudinary.js';
import fs from 'fs';
import path from 'path';

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer from multer
 * @param {string} folder - The Cloudinary folder to upload to
 * @param {string} resourceType - The resource type
 * @returns {Promise<object>} Cloudinary upload result
 */
export const uploadToCloudinary = (fileBuffer, folder = 'car-dealer', resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    // Expert fix: Fallback to local storage if Cloudinary is not configured
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        const uploadDir = path.join(process.cwd(), 'uploads', folder);
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const ext = resourceType === 'video' ? 'mp4' : 'jpg';
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
        const filePath = path.join(uploadDir, filename);
        
        fs.writeFile(filePath, fileBuffer, (err) => {
          if (err) return reject(err);
          // Return a mock result compatible with Cloudinary structure
          const urlPath = `/uploads/${folder}/${filename}`;
          // Use absolute URL pointing to backend
          const absoluteUrl = `http://localhost:${process.env.PORT || 5000}${urlPath}`;
          resolve({ secure_url: absoluteUrl, public_id: urlPath });
        });
      } catch (err) {
        reject(err);
      }
      return;
    }

    const options = {
      folder,
      resource_type: resourceType,
    };
    if (resourceType === 'image') {
      options.transformation = [{ quality: 'auto', fetch_format: 'auto' }];
    }

    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

/**
 * Delete an image from Cloudinary by its public_id
 * @param {string} publicId - The public_id of the image
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      if (publicId && publicId.startsWith('/uploads/')) {
        const filePath = path.join(process.cwd(), publicId);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return;
    }
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
};

/**
 * Extract public_id from a Cloudinary URL
 * @param {string} url - The Cloudinary URL
 * @returns {string|null} The public_id
 */
export const getPublicIdFromUrl = (url) => {
  if (!url) return null;

  if (!process.env.CLOUDINARY_CLOUD_NAME && url.includes('/uploads/')) {
    try {
      const parsed = new URL(url);
      return parsed.pathname; // Returns "/uploads/..."
    } catch {
      return null;
    }
  }

  try {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;
    // Skip the version segment (e.g., v1234567890)
    const remaining = parts.slice(uploadIndex + 2).join('/');
    // Remove the file extension
    return remaining.replace(/\.[^/.]+$/, '');
  } catch {
    return null;
  }
};
