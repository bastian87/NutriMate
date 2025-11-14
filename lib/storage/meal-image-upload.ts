import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database';

/**
 * Valid image MIME types for meal photos
 */
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

/**
 * Maximum file size: 5MB (in bytes)
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Storage bucket name for meal images
 */
const MEAL_IMAGES_BUCKET = 'meal-images';

/**
 * Uploads a meal image to Supabase Storage and returns the public URL
 * 
 * @param supa - Supabase client instance
 * @param userId - User ID for organizing files
 * @param fileBuffer - File buffer/Blob to upload
 * @param mimeType - MIME type of the file (e.g., 'image/jpeg')
 * @returns Promise resolving to the public image URL
 * @throws Error if validation fails or upload fails
 */
export async function uploadMealImage(
  supa: SupabaseClient<Database>,
  userId: string,
  fileBuffer: Buffer | Blob | ArrayBuffer,
  mimeType: string
): Promise<string> {
  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(mimeType as any)) {
    throw new Error(
      `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
    );
  }

  // Convert to Buffer if needed
  let buffer: Buffer;
  if (fileBuffer instanceof Buffer) {
    buffer = fileBuffer;
  } else if (fileBuffer instanceof Blob) {
    const arrayBuffer = await fileBuffer.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } else {
    buffer = Buffer.from(fileBuffer);
  }

  // Validate file size
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(
      `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`
    );
  }

  // Generate unique filename: userId/timestamp-random.extension
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = mimeType.split('/')[1] || 'jpg';
  const fileName = `${userId}/${timestamp}-${random}.${extension}`;

  // Upload to Supabase Storage
  const { data, error } = await supa.storage
    .from(MEAL_IMAGES_BUCKET)
    .upload(fileName, buffer, {
      contentType: mimeType,
      upsert: false, // Don't overwrite existing files
    });

  if (error) {
    console.error('Error uploading meal image:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supa.storage
    .from(MEAL_IMAGES_BUCKET)
    .getPublicUrl(data.path);

  if (!urlData?.publicUrl) {
    throw new Error('Failed to get public URL for uploaded image');
  }

  return urlData.publicUrl;
}

/**
 * Deletes a meal image from Supabase Storage
 * 
 * @param supa - Supabase client instance
 * @param imageUrl - Public URL of the image to delete
 * @returns Promise resolving when deletion is complete
 */
export async function deleteMealImage(
  supa: SupabaseClient<Database>,
  imageUrl: string
): Promise<void> {
  try {
    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.findIndex(part => part === MEAL_IMAGES_BUCKET);
    
    if (bucketIndex === -1) {
      throw new Error('Invalid image URL format');
    }

    const filePath = pathParts.slice(bucketIndex + 1).join('/');

    const { error } = await supa.storage
      .from(MEAL_IMAGES_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting meal image:', error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to delete image');
  }
}

