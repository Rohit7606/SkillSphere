"use server";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function uploadChatAttachment(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) throw new Error("No file");
  
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const isImage = file.type.startsWith('image/');
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');

  return new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'skillsphere/chat_attachments',
        resource_type: isImage ? 'image' : 'raw',
        public_id: isImage ? undefined : cleanName,
      },
      (error, result) => {
        if (error) return reject(error);
        if (result) resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
}
