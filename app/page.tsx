'use client';

import { useEffect } from 'react';

export default function HomePage() {
  useEffect(() => {
    // Redirect to the static HTML page
    window.location.href = '/index-new.html';
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <p>Loading Budget Explorer...</p>
    </div>
  );
}