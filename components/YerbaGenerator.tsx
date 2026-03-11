import React, { useState, useEffect } from 'react';
import { ImageUploader } from './ImageUploader';
import { generateYerbaProductShot } from '../services/geminiService';
import { AspectRatio } from '../types';

export const YerbaGenerator: React.FC = () => {
  const [productImage, setProductImage] = useState<string | null>(null);
  const [description, setDescription] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedAspectRatio, setDetectedAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE);

  const handleImageSelected = (base64: string) => {
    setProductImage(base64);
    setError(null);
    
    // Detect aspect ratio
    const img = new Image();
    img.onload = () => {
      const ratio = img.width / img.height;
      let ar = AspectRatio.SQUARE;
      
      // Simple logic to find closest supported aspect ratio
      if (ratio > 1.5) ar = AspectRatio.LANDSCAPE; // ~16:9
      else if (ratio < 0.7) ar = AspectRatio.PORTRAIT; // ~9:16
      else if (ratio < 0.9) ar = AspectRatio.PORTRAIT; // Fallback for tall images, though 3:4/4:3 not in enum yet, sticking to supported ones
      else ar = AspectRatio.SQUARE;

      setDetectedAspectRatio(ar);
    };
    img.src = base64;
  };

  const handleGenerate = async () => {
    if (!productImage) {
      setError("Kérlek tölts fel egy termékfotót!");
      return;
    }
    if (!description.trim()) {
      setError("Kérlek adj meg egy rövid leírást a termékről és a hozzávalókról!");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const result = await generateYerbaProductShot(productImage, description, detectedAspectRatio);
      setGeneratedImage(result.imageUrl);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Hiba történt a generálás során. Kérlek próbáld újra.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
      {/* Left Column: Input */}
      <div className="lg:col-span-5 space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-4 text-slate-200">1. Termékfotó</h2>
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Töltsd fel a Yerba Mate csomagolás fotóját. A generálás során a csomagolás érintetlen marad.
            </p>
            <ImageUploader 
              onImageSelected={handleImageSelected} 
              currentImage={productImage}
              label="Húzd ide a terméket"
              subLabel="Yerba Mate csomagolás (kb. 500g)"
              onClear={() => setProductImage(null)}
            />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4 text-slate-200">2. Termékleírás és Hozzávalók</h2>
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Írd le röviden a terméket és sorold fel a hozzávalókat, amiket a termék köré szeretnél helyezni (pl. citrom, menta, guarana).
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Pl.: Ez egy frissítő mentás yerba mate. Hozzávalók: friss mentalevelek, lédús citromszeletek, jégkockák."
              className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
            />
          </div>
        </section>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !productImage || !description}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-white shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2
            ${isGenerating || !productImage || !description
              ? 'bg-slate-700 cursor-not-allowed opacity-50' 
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/25'
            }`}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Generálás folyamatban...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <span>Termékfotó Generálása</span>
            </>
          )}
        </button>
      </div>

      {/* Right Column: Result */}
      <div className="lg:col-span-7">
        <h2 className="text-lg font-semibold mb-4 text-slate-200">Eredmény</h2>
        {generatedImage ? (
          <div className="bg-slate-800/50 rounded-3xl p-4 border border-slate-700/50">
            <div className="relative aspect-square w-full bg-white rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={generatedImage} 
                alt="Generált termékfotó" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="mt-4 flex justify-end">
              <a 
                href={generatedImage} 
                download={`yerba-product-${Date.now()}.png`}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Letöltés
              </a>
            </div>
          </div>
        ) : (
          <div className="h-[500px] flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-800/20">
            <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>Itt jelenik meg a generált termékfotó.</p>
          </div>
        )}
      </div>
    </div>
  );
};
