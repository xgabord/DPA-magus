import React, { useState } from 'react';

interface AssetSelectorProps {
  onAssetSelected: (base64: string) => void;
}

const MATEZZ_ASSETS = [
  'https://file-service-full-210129219.us-central1.run.app/image/22.png',
  'https://file-service-full-210129219.us-central1.run.app/image/23.png',
  'https://file-service-full-210129219.us-central1.run.app/image/24.png',
  'https://file-service-full-210129219.us-central1.run.app/image/25.png',
  'https://file-service-full-210129219.us-central1.run.app/image/26.png',
  'https://file-service-full-210129219.us-central1.run.app/image/27.png',
  'https://file-service-full-210129219.us-central1.run.app/image/28.png',
  'https://file-service-full-210129219.us-central1.run.app/image/29.png',
  'https://file-service-full-210129219.us-central1.run.app/image/30.png',
  'https://file-service-full-210129219.us-central1.run.app/image/31.png',
  'https://file-service-full-210129219.us-central1.run.app/image/32.png',
  'https://file-service-full-210129219.us-central1.run.app/image/33.png',
  'https://file-service-full-210129219.us-central1.run.app/image/34.png',
  'https://file-service-full-210129219.us-central1.run.app/image/35.png',
  'https://file-service-full-210129219.us-central1.run.app/image/36.png',
  'https://file-service-full-210129219.us-central1.run.app/image/37.png',
];

export const AssetSelector: React.FC<AssetSelectorProps> = ({ onAssetSelected }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loadingUrl, setLoadingUrl] = useState<string | null>(null);

  const handleAssetClick = async (url: string) => {
    try {
      setLoadingUrl(url);
      
      let response;
      try {
        // Try direct fetch first
        response = await fetch(url);
        if (!response.ok) throw new Error('Direct fetch failed');
      } catch (err) {
        // Fallback to CORS proxy
        console.log('Direct fetch failed, using proxy...');
        response = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
      }
      
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const blob = await response.blob();
      
      // Convert to Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onAssetSelected(base64String);
        setLoadingUrl(null);
      };
      reader.onerror = () => {
        console.error('Error reading blob');
        setLoadingUrl(null);
      };
      reader.readAsDataURL(blob);
      
    } catch (error) {
      console.error('Error loading asset:', error);
      alert('Nem sikerült betölteni a képet (CORS hiba lehetséges).');
      setLoadingUrl(null);
    }
  };

  return (
    <div className="bg-slate-800/30 border border-slate-700 rounded-xl overflow-hidden mt-4 transition-all">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
      >
        <span className="font-semibold flex items-center gap-2 text-sm">
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Matézz Assetek (Választható Kiegészítők)
        </span>
        <svg className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="p-4 grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-64 overflow-y-auto custom-scrollbar bg-slate-900/50">
          {MATEZZ_ASSETS.map((url, index) => (
            <button
              key={index}
              onClick={() => handleAssetClick(url)}
              disabled={loadingUrl !== null}
              className={`relative aspect-square rounded-lg overflow-hidden border border-slate-700 hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500/50 transition-all group ${
                loadingUrl === url ? 'opacity-50 cursor-wait' : ''
              }`}
            >
              <img 
                src={url} 
                alt={`Asset ${index + 1}`} 
                className="w-full h-full object-contain bg-white/5" 
                loading="lazy"
              />
              {loadingUrl === url && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};