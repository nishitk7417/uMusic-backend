import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"  // Automatically detect the resource type (audio/video/images)
        });

        // Remove the local temporary file after successful upload
        fs.unlinkSync(localFilePath);
        
        // Return the Cloudinary response (URL of the uploaded file)
        return response;
    } catch (error) {
        // In case of error, remove the temporary file
        fs.unlinkSync(localFilePath);
        return null;
    }
}

export { uploadOnCloudinary };
