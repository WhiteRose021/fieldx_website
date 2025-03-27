// File: middleware.js (root directory)

import { NextResponse } from 'next/server';

// This function is the middleware
export function middleware(request) {
  // Define folders that should redirect to 404 if they have no content
  const emptyFolderPaths = [
    '/products',
    '/products/field-management',
    '/products/office-tools',
    '/products/ai-scheduler',
    '/about',
    '/docs',
    '/help',
    // Add more paths as needed
  ];
  
  // Check if the current URL path is in the list of potentially empty folders
  const pathname = request.nextUrl.pathname;
  
  // If it's a path we want to check for emptiness
  if (emptyFolderPaths.includes(pathname)) {
    // For paths that should show 404 when empty
    const url = request.nextUrl.clone();
    url.pathname = '/not-found';
    return NextResponse.rewrite(url);
  }
  
  return NextResponse.next();
}

// Configure which paths this middleware should run on
export const config = {
  matcher: [
    // Match all paths in the emptyFolderPaths array
    '/products/:path*',
    '/about/:path*',
    '/docs/:path*',
    '/help/:path*',
    // Add more as needed to match your empty folder paths
  ],
};