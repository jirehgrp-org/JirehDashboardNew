/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// @/components/auth/UserProfileDebug.tsx

import React, { useState } from 'react';
import { authService } from '@/lib/services/auth';

export const UserProfileDebug: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
  
  const testUserProfileFetch = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const token = authService.getToken();
      
      if (!token) {
        setError("No authentication token available");
        setLoading(false);
        return;
      }
      
      // Try to fetch from the UserProfileView endpoint
      const response = await fetch(`${API_URL}/user/profile/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const responseText = await response.text();
      
      if (response.ok) {
        try {
          const data = JSON.parse(responseText);
          setResult({
            endpoint: `${API_URL}/user/profile/`,
            status: response.status,
            data
          });
        } catch (e) {
          setResult({
            endpoint: `${API_URL}/user/profile/`,
            status: response.status,
            rawResponse: responseText
          });
        }
      } else {
        setError(`Error ${response.status}: ${responseText}`);
      }
    } catch (e: any) {
      setError(`Fetch error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
      <h2 className="text-lg font-semibold mb-4">User Profile Debug</h2>
      
      <div className="mb-4">
        <button 
          onClick={testUserProfileFetch}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test User Profile Endpoint'}
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {result && (
        <div className="mb-4">
          <h3 className="font-medium mb-2">Result:</h3>
          <div className="bg-white dark:bg-gray-900 p-3 rounded border overflow-auto max-h-80">
            <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
          </div>
        </div>
      )}
      
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <p>Current token: {authService.getToken() ? 
          <span className="text-green-600 dark:text-green-400">{authService.getToken()?.substring(0, 10)}...</span> : 
          <span className="text-red-600 dark:text-red-400">No token</span>}
        </p>
      </div>
    </div>
  );
};

export default UserProfileDebug;