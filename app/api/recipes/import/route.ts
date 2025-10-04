import { NextRequest, NextResponse } from "next/server";

// Redirect to bulk import for backward compatibility
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bulkUrl = `/api/recipes/import/bulk?${searchParams.toString()}`;
  
  return NextResponse.redirect(new URL(bulkUrl, request.url));
} 