'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ErrorPage({ error, reset }) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
    
    // Check if it's a cookie parsing error
    if (error.message && (
      error.message.includes('Failed to parse cookie') || 
      error.message.includes('is not valid JSON')
    )) {
      // Redirect to the cookie error page
      router.push('/cookie-error');
    }
  }, [error, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        
        <p className="mb-6">
          We encountered an error while processing your request. This might be due to:
        </p>
        
        <ul className="list-disc pl-5 space-y-1 mb-6">
          <li>A temporary server issue</li>
          <li>An authentication problem</li>
          <li>An unexpected application error</li>
        </ul>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try again
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Go to homepage
          </button>
        </div>
      </div>
    </div>
  );
}