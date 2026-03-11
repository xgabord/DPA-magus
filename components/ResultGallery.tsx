import React, { useState, useEffect } from 'react';
import { GeneratedImage } from '../types';

interface ResultGalleryProps {
  images: GeneratedImage[];
}

export const ResultGallery: React.FC<ResultGalleryProps> = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  if (images.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
        <span className="bg-indigo-500 w-1.5 h-6 rounded-full inline-block"></span>
        Elkészült variációk
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((img) => (
          <div key={img.id} className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 shadow-xl group">
            <div className="relative aspect-square bg-slate-900 cursor-pointer" onClick={() => setSelectedImage(img)}>
              {img.generatedImageUrl ? (
                <img 
                  src={img.generatedImageUrl} 
                  alt="Generated Ad" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  Betöltési hiba
                </div>
              )}
              
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4 backdrop-blur-[2px]">
                 <button 
                   onClick={(e) => { e.stopPropagation(); setSelectedImage(img); }}
                   className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-500 transform hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20 w-40 justify-center"
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                   Nagyítás
                 </button>
                 <a 
                   href={img.generatedImageUrl || '#'} 
                   download={`dpa-magus-${img.id}.png`}
                   onClick={(e) => e.stopPropagation()}
                   className="bg-white text-slate-900 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-100 transform hover:scale-105 transition-all flex items-center gap-2 shadow-lg w-40 justify-center"
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                   Letöltés
                 </a>
              </div>
            </div>
            <div className="p-4">
               <p className="text-xs text-slate-400 line-clamp-2 font-mono">
                 {/* Show only first few chars in card view since full prompt is long */}
                 {img.prompt.substring(0, 100)}...
               </p>
               <div className="mt-2 text-xs text-slate-500 flex justify-between">
                 <span>{new Date(img.timestamp).toLocaleTimeString()}</span>
                 <span className="bg-slate-700 px-2 py-0.5 rounded text-slate-300">AI Generated</span>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-7xl w-full max-h-full flex flex-col bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
              <h3 className="text-slate-200 font-semibold truncate pr-4">Részletes nézet</h3>
              <div className="flex gap-2">
                 <a 
                   href={selectedImage.generatedImageUrl || '#'} 
                   download={`dpa-magus-${selectedImage.id}.png`}
                   className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-700 rounded-lg transition-colors"
                   title="Letöltés"
                 >
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                 </a>
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden relative bg-black/20 flex items-center justify-center p-4">
               {selectedImage.generatedImageUrl && (
                 <img 
                   src={selectedImage.generatedImageUrl} 
                   alt="Full size" 
                   className="max-w-full max-h-[60vh] object-contain shadow-2xl"
                 />
               )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-800 border-t border-slate-700 max-h-64 overflow-y-auto">
               <div className="text-xs uppercase text-indigo-400 font-bold tracking-wider mb-2">Használt Prompt:</div>
               <p className="text-sm text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                 {selectedImage.prompt}
               </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};