import React, { ChangeEvent, useRef } from 'react';

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
  currentImage: string | null;
  label?: string;
  subLabel?: string;
  heightClass?: string;
  onClear?: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageSelected, 
  currentImage, 
  label = "Kattints a feltöltéshez",
  subLabel = "JPG, PNG formátum (max 5MB)",
  heightClass = "h-64",
  onClear
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onImageSelected(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClear) onClear();
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      
      {!currentImage ? (
        <div 
          onClick={triggerSelect}
          className={`w-full ${heightClass} border-2 border-dashed border-slate-600 hover:border-indigo-400 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-800/50 hover:bg-slate-800 group`}
        >
          <div className="p-3 bg-slate-700 rounded-full mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-slate-300 font-medium text-center px-4">{label}</p>
          <p className="text-slate-500 text-xs mt-1 text-center px-4">{subLabel}</p>
        </div>
      ) : (
        <div className="relative group rounded-2xl overflow-hidden border border-slate-600 bg-slate-800">
          <img src={currentImage} alt="Uploaded content" className={`w-full ${heightClass} object-contain p-2`} />
          <div className="absolute inset-0 bg-black/60 flex flex-col gap-2 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={triggerSelect}
              className="px-4 py-2 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 text-sm"
            >
              Csere
            </button>
            {onClear && (
              <button 
                onClick={handleClear}
                className="px-4 py-2 bg-red-500/20 text-red-200 border border-red-500/50 rounded-lg font-medium hover:bg-red-500/30 text-sm"
              >
                Törlés
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};