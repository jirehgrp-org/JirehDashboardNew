/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// @/components/auth/AuthDebugger.tsx

import React, { useEffect, useState } from 'react';
import { parseCookies } from 'nookies';
import { authService } from '@/lib/services/auth';

export const AuthDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({
    hasToken: false,
    tokenFragment: '',
    cookies: {},
    user: null,
    endpoints: {
      fetching: false,
      results: {}
    }
  });

  useEffect(() => {
    const checkAuth = async () => {
      // Get token information
      const token = authService.getToken();
      const cookies = parseCookies();
      const user = authService.getUser();

      setDebugInfo((prev: any) => ({
        ...prev,
        hasToken: !!token,
        tokenFragment: token ? `${token.substring(0, 10)}...` : 'No token',
        cookies,
        user
      }));

      // Test endpoints
      setDebugInfo((prev: { endpoints: any; }) => ({ ...prev, endpoints: { ...prev.endpoints, fetching: true } }));

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
      
      const endpoints = [
        `${API_URL}/auth/user/`,
        `${API_URL}/auth/user/me/`,
        `${API_URL}/user/me/`,
        `${API_URL}/user/profile/`,
        `${API_URL}/user/`
      ];

      const results: Record<string, any> = {};

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: token ? {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            } : {
              'Content-Type': 'application/json'
            }
          });

          results[endpoint] = {
            status: response.status,
            ok: response.ok,
            statusText: response.statusText
          };

          if (response.ok) {
            try {
              const data = await response.json();
              results[endpoint].data = data;
            } catch (e) {
              results[endpoint].parseError = 'Could not parse JSON';
            }
          }
        } catch (error: any) {
          results[endpoint] = {
            error: error.message || 'Request failed'
          };
        }
      }

      setDebugInfo((prev: any) => ({
        ...prev,
        endpoints: {
          fetching: false,
          results
        }
      }));
    };

    checkAuth();
  }, []);

  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-6 text-xs overflow-auto max-h-64">
        <h3 className="font-bold mb-2">🔍 Auth Debugger</h3>
        
        <div className="mb-2">
          <strong>Token:</strong> {debugInfo.hasToken ? 
            <span className="text-green-600 dark:text-green-400">{debugInfo.tokenFragment}</span> : 
            <span className="text-red-600 dark:text-red-400">No token found</span>
          }
        </div>
        
        <div className="mb-2">
          <strong>Cookies:</strong> 
          <pre className="text-xs mt-1 bg-gray-200 dark:bg-gray-700 p-1 rounded">
            {JSON.stringify(debugInfo.cookies, null, 2)}
          </pre>
        </div>
        
        <div className="mb-2">
          <strong>User:</strong> 
          {debugInfo.user ? (
            <pre className="text-xs mt-1 bg-gray-200 dark:bg-gray-700 p-1 rounded">
              {JSON.stringify(debugInfo.user, null, 2)}
            </pre>
          ) : (
            <span className="text-red-600 dark:text-red-400">No user data</span>
          )}
        </div>
        
        <div className="mb-2">
          <strong>API Endpoints:</strong>
          {debugInfo.endpoints.fetching ? (
            <p>Testing endpoints...</p>
          ) : (
            <div className="mt-1">
              {Object.entries(debugInfo.endpoints.results).map(([endpoint, result]: [string, any]) => (
                <div key={endpoint} className="mb-2 border-b pb-1 border-gray-300 dark:border-gray-600">
                  <p className="font-semibold">{endpoint}</p>
                  {result.error ? (
                    <p className="text-red-600 dark:text-red-400">{result.error}</p>
                  ) : (
                    <div>
                      <span className={result.ok ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        Status: {result.status} {result.statusText}
                      </span>
                      
                      {result.data && (
                        <pre className="text-xs mt-1 bg-gray-200 dark:bg-gray-700 p-1 rounded">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      )}
                      
                      {result.parseError && (
                        <p className="text-orange-600 dark:text-orange-400">{result.parseError}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Don't render anything in production
  return null;
};

export default AuthDebugger;