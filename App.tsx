import React, { useState } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { GeneratorControls } from './components/GeneratorControls';
import { ResultGallery } from './components/ResultGallery';
import { FeedParser } from './components/FeedParser';
import { YerbaGenerator } from './components/YerbaGenerator';
import { GeneratedImage, AdStyle, AspectRatio, CameraAngle, BrandType } from './types';
import { generateMarketingImage } from './services/geminiService';

type Tab = 'dpa' | 'yerba';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dpa');
  
  // DPA Generator State
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [secondaryImage, setSecondaryImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedContext, setFeedContext] = useState<string>('');
  const [brand, setBrand] = useState<BrandType>('matezz');

  const handleImageSelected = (base64: string) => {
    setCurrentImage(base64);
    setError(null);
  };

  const handleSecondaryImageSelected = (base64: string) => {
    setSecondaryImage(base64);
  };

  const handleFeedParsed = (data: string) => {
    setFeedContext(data);
  };

  const handleGenerate = async (style: AdStyle, customPrompt: string, aspectRatio: AspectRatio, destylize: boolean, zoomOut: boolean, cameraAngle: CameraAngle) => {
    if (!currentImage) return;

    setIsGenerating(true);
    setError(null);

    const finalPrompt = customPrompt 
      ? `${style.promptModifier}. Additional details: ${customPrompt}` 
      : style.promptModifier;

    try {
      // Expecting an object return with imageUrl and fullPrompt
      const { imageUrl, fullPrompt } = await generateMarketingImage(
        currentImage, 
        secondaryImage, 
        finalPrompt, 
        aspectRatio,
        destylize,
        zoomOut,
        cameraAngle
      );
      
      const newImage: GeneratedImage = {
        id: crypto.randomUUID(),
        originalImage: currentImage,
        generatedImageUrl: imageUrl,
        // Store the FULL prompt used by the system for the Quick View
        prompt: fullPrompt,
        timestamp: Date.now()
      };

      setGeneratedImages(prev => [newImage, ...prev]);
    } catch (err: any) {
      setError(err.message || "Hiba történt a generálás során. Kérlek próbáld újra.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                DPA Mágus
              </h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex gap-1">
              <button
                onClick={() => setActiveTab('dpa')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'dpa' 
                    ? 'bg-slate-800 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Hirdetés Generátor
              </button>
              <button
                onClick={() => setActiveTab('yerba')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'yerba' 
                    ? 'bg-slate-800 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Yerba Termékfotó
              </button>
            </nav>
          </div>

          <div className="text-sm text-slate-400 hidden sm:block">
            Gemini 2.5 Flash Image alapú generátor
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dpa' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left Column: Input */}
            <div className="lg:col-span-5 space-y-8">
              <section>
                <h2 className="text-lg font-semibold mb-4 text-slate-200">1. Termékképek</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Fő termék (Kötelező)</label>
                    <ImageUploader 
                      onImageSelected={handleImageSelected} 
                      currentImage={currentImage}
                      label="Húzd ide a terméket"
                      subLabel="Ez lesz a hirdetés központja"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Kiegészítő elem / Logó (Opcionális)</label>
                    <ImageUploader 
                      onImageSelected={handleSecondaryImageSelected} 
                      currentImage={secondaryImage}
                      label="Másodlagos kép"
                      subLabel="Logó, ikon vagy dekoráció"
                      heightClass="h-40"
                      onClear={() => setSecondaryImage(null)}
                    />
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-4 text-slate-200">2. Beállítások</h2>
                <FeedParser onDataParsed={handleFeedParsed} />
                <GeneratorControls 
                  onGenerate={handleGenerate} 
                  isGenerating={isGenerating} 
                  hasImage={!!currentImage}
                  initialPrompt={feedContext}
                  brand={brand}
                  setBrand={setBrand}
                />
              </section>

               {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                  ⚠️ {error}
                </div>
              )}
            </div>

            {/* Right Column: Results */}
            <div className="lg:col-span-7">
              {generatedImages.length > 0 ? (
                <ResultGallery images={generatedImages} />
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-800/20">
                  <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>Még nincsenek generált képek.</p>
                  <p className="text-sm mt-2 opacity-50">Tölts fel egy képet és válassz stílust a kezdéshez.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <YerbaGenerator />
        )}
      </main>
    </div>
  );
};

export default App;