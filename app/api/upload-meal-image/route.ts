import { NextRequest, NextResponse } from 'next/server';
import { createServerClientWithCookies } from '@/lib/supabase/server';
import { uploadMealImage } from '@/lib/storage/meal-image-upload';

/**
 * POST /api/upload-meal-image
 * 
 * Uploads a meal image and returns the public URL
 * 
 * Request:
 * - FormData with 'image' field containing the image file
 * - Must be authenticated
 * 
 * Response:
 * - 200: { imageUrl: string }
 * - 400: { error: string } - Validation error
 * - 401: { error: string } - Not authenticated
 * - 500: { error: string } - Server error
 */
export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.next();
    const supa = createServerClientWithCookies(req, response);

    // Check authentication
    const { data: { session }, error: authError } = await supa.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided. Please include an "image" field in the form data.' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload image
    const imageUrl = await uploadMealImage(
      supa,
      userId,
      buffer,
      file.type
    );

    return NextResponse.json(
      { imageUrl },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error uploading meal image:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to upload image';

    // Return appropriate status code based on error type
    const status = errorMessage.includes('Invalid file type') || 
                   errorMessage.includes('File size exceeds') ||
                   errorMessage.includes('No image file')
      ? 400 
      : 500;

    return NextResponse.json(
      { error: errorMessage },
      { status }
    );
  }
}

