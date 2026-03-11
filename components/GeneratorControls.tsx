import React, { useState, useEffect } from 'react';
import { AdStyle, AspectRatio, CameraAngle, BrandType } from '../types';
import { Button } from './Button';

interface GeneratorControlsProps {
  onGenerate: (style: AdStyle, customPrompt: string, aspectRatio: AspectRatio, destylize: boolean, zoomOut: boolean, cameraAngle: CameraAngle) => void;
  isGenerating: boolean;
  hasImage: boolean;
  initialPrompt?: string;
  brand: BrandType;
  setBrand: (brand: BrandType) => void;
}

const matezzStyles: AdStyle[] = [
  { id: 'minimal', name: 'Minimalista Stúdió', promptModifier: 'minimalist studio background, solid pastel colors, soft lighting, podium placement', icon: '✨' },
  { id: 'high-key', name: 'High-Key Minimal', promptModifier: 'High-key, tone-minimal product photo. Two white planes: a warm-toned white tabletop at the bottom and a cooler white background at the top, separated by a subtle horizon line creating depth. The product sits in the lower third, slightly offset to the left, creating negative space. Soft, directional side lighting from the right casting very subtle shadows. Clean, noiseless environment.', icon: '☁️' },
  { id: 'nature', name: 'Természetes', promptModifier: 'placed on a rock in a forest stream, nature bokeh background, sunlight filtering through leaves', icon: '🌿' },
  { id: 'luxury', name: 'Luxus / Elegáns', promptModifier: 'dark marble surface, dramatic rim lighting, gold accents in background, high-end feel', icon: '💎' },
  { id: 'kitchen', name: 'Modern Konyha', promptModifier: 'bright modern kitchen countertop, lifestyle photography, blurred kitchen background', icon: '🍳' },
  { id: 'cyber', name: 'Cyberpunk / Neon', promptModifier: 'neon lights, dark background, cyberpunk city reflection, vibrant purple and blue hues', icon: '⚡' },
];

const laavaStyles: AdStyle[] = [
  // --- Alapok ---
  { id: 'minimal', name: 'Minimalista Stúdió', promptModifier: 'minimalist studio background, solid pastel colors, soft lighting, podium placement', icon: '✨' },
  { id: 'loft', name: 'Apartman "Loft"', promptModifier: 'modern industrial loft apartment background, concrete textures, large windows, blurred urban lifestyle interior, chic furniture', icon: '🏙️' },
  { id: 'nature', name: 'Természetes', promptModifier: 'placed on a rock in a forest stream, nature bokeh background, sunlight filtering through leaves', icon: '🌿' },
  { id: 'high-key', name: 'High-Key Minimal', promptModifier: 'High-key, tone-minimal product photo. Two white planes: a warm-toned white tabletop at the bottom and a cooler white background at the top. Soft, directional side lighting. Clean, noiseless environment.', icon: '☁️' },
  
  // --- Nanobanana Specials ---
  { id: 'direct-flash', name: 'Direkt Vakus', promptModifier: 'Direct flash photography aesthetic. Hard flash lighting, sharp shadows, high contrast, oversaturated colors. Dark textured background (velvet or stone). Raw, party snapshot vibe.', icon: '📸' },
  { id: 'mani-maxi', name: 'Manikűr & Maximalizmus', promptModifier: 'Focus on the hand holding the object. The hand features extreme, long, colorful nails and chunky rings (gold/silver) that match or contrast the mineral. Fashion-forward, bold accessories.', icon: '💅' },
  { id: 'y2k', name: 'Y2K Ezotéria', promptModifier: 'Y2K aesthetic nostalgia. Background elements: flip phones, Tamagotchi, plastic beads, stickers, glitter. Retro digital vibes, Windows 95 aesthetics. Playful and colorful.', icon: '👾' },
  { id: 'texture', name: 'Textúra Orgita', promptModifier: 'Texture mashup. Surround the mineral with contrasting materials: slime, hair gel, colorful faux fur, or bubbles in carbonated water. Tactile and sensory focus.', icon: '🧶' },
  { id: 'color-pop', name: 'Színrobbanás Aura', promptModifier: 'RGB lighting photography. Lit with strong colored LED lights (red, blue, magenta) from sides. Psychedelic aura effect, glowing energy field around the crystal. High saturation.', icon: '🌈' },
  
  // --- Clean / Lux / Specifics ---
  { id: 'clean-white', name: 'Clean Studio (White)', promptModifier: 'Pure white background (#FFFFFF), softbox lighting, sharp details, subtle drop shadow, no extra props. Clean e-commerce look.', icon: '⬜' },
  { id: 'beige', name: 'Minimal Krém/Beige', promptModifier: 'Warm cream/beige monochrome background, high-key, very soft shadows, premium e-commerce look. Calm and elegant.', icon: 'crm' },
  { id: 'dark-lux', name: 'Dark Luxury', promptModifier: 'Dark graphite/black background, dramatic directional rim lighting, high contrast, premium jewelry photography vibe, slight vignette.', icon: '🖤' },
  { id: 'macro', name: 'Makró "Texture Pop"', promptModifier: '100mm macro lens look. Close-up crop on the crystal texture. Shallow depth of field (blurred background). Focus on details and facets.', icon: '🔍' },
  { id: 'window', name: 'Ablakfény Lifestyle', promptModifier: 'Natural window light, soft shadows, warm skin tones if hand is visible, slight film color grade. Cozy home atmosphere.', icon: '🪟' },
  { id: 'earthy', name: 'Földes / Earthy', promptModifier: 'Blurred moss and wood texture background, forest bokeh, natural sunlight. Organic and grounded feel.', icon: '🪵' },
  { id: 'editorial', name: 'Skincare / Editorial', promptModifier: 'Editorial product photography, glossy, bright lighting, slight reflection/sheen, modern magazine style. Very clean.', icon: '📰' },
  { id: 'mystic', name: 'Misztikus "Aura"', promptModifier: 'Subtle glowing halo around the object, soft focus, dreamlike spiritual atmosphere, ethereal lighting, photorealistic but magical.', icon: '🔮' },
  { id: 'polaroid', name: 'Polaroid / Film', promptModifier: 'Polaroid frame border, vintage film grain, soft contrast, retro color tones, flash look. Nostalgic social media vibe.', icon: '🎞️' },
  { id: 'labeled', name: 'Címkézett Termékkép', promptModifier: 'Add clean, modern sans-serif typography overlay. Text should include the likely name of the mineral and 1-2 keywords like "Focus" or "Energy". Editorial layout.', icon: '🏷️' },
  
  // --- SPECIAL ---
  { id: 'nagyteszt', name: '✨ NAGYTESZT (Grid)', promptModifier: 'Create a 3x3 GRID (contact sheet) showing the MAIN PRODUCT in 9 distinct photography styles on one image: 1. Clean Studio, 2. Dark Luxury, 3. Nature, 4. Y2K/Retro, 5. Neon/Cyberpunk, 6. Direct Flash, 7. Macro, 8. Pastel, 9. Mystic. Label the cells if possible.', icon: '▦' },
];

export const GeneratorControls: React.FC<GeneratorControlsProps> = ({ 
  onGenerate, 
  isGenerating, 
  hasImage, 
  initialPrompt,
  brand,
  setBrand
}) => {
  const [activeStyles, setActiveStyles] = useState<AdStyle[]>(matezzStyles);
  const [selectedStyle, setSelectedStyle] = useState<AdStyle>(matezzStyles[0]);
  
  const [customPrompt, setCustomPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [destylize, setDestylize] = useState(false);
  const [zoomOut, setZoomOut] = useState(false);
  const [cameraAngle, setCameraAngle] = useState<CameraAngle>('high');

  // Switch styles when brand changes
  useEffect(() => {
    if (brand === 'matezz') {
      setActiveStyles(matezzStyles);
      setSelectedStyle(matezzStyles[0]);
    } else {
      setActiveStyles(laavaStyles);
      setSelectedStyle(laavaStyles[0]);
    }
  }, [brand]);

  // Update local state when initialPrompt prop changes (from FeedParser)
  useEffect(() => {
    if (initialPrompt) {
      setCustomPrompt(prev => {
        if (prev && prev.includes(initialPrompt)) return prev;
        return initialPrompt + (prev ? `\n\n${prev}` : '');
      });
    }
  }, [initialPrompt]);

  const handleGenerate = () => {
    onGenerate(selectedStyle, customPrompt, aspectRatio, destylize, zoomOut, cameraAngle);
  };

  return (
    <div className="space-y-6">
      {/* Brand Switcher */}
      <div className="bg-slate-800 p-1.5 rounded-2xl flex relative border border-slate-700">
        <div 
          className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-indigo-600 rounded-xl transition-all duration-300 shadow-lg ${
            brand === 'laava' ? 'translate-x-[calc(100%+6px)]' : 'translate-x-0'
          }`}
        />
        <button 
          onClick={() => setBrand('matezz')}
          className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider relative z-10 transition-colors ${
            brand === 'matezz' ? 'text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Matézz
        </button>
        <button 
          onClick={() => setBrand('laava')}
          className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider relative z-10 transition-colors ${
            brand === 'laava' ? 'text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Laava
        </button>
      </div>

      {/* Aspect Ratio Selector */}
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
        <label className="text-sm text-slate-400 font-semibold uppercase tracking-wider mb-3 block">Képarány</label>
        <div className="flex gap-2">
          {Object.values(AspectRatio).map((ratio) => (
            <button
              key={ratio}
              onClick={() => setAspectRatio(ratio)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors border ${
                aspectRatio === ratio 
                  ? 'bg-indigo-600 border-indigo-500 text-white' 
                  : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>

      {/* Style Selector */}
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
        <label className="text-sm text-slate-400 font-semibold uppercase tracking-wider mb-3 block">
          {brand === 'laava' ? 'Laava Stílusok (Ásvány & Ékszer)' : 'Matézz Stílusok'}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {activeStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style)}
              className={`p-3 rounded-xl text-left transition-all border flex flex-col justify-between h-full ${
                selectedStyle.id === style.id
                  ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500 shadow-lg shadow-indigo-900/20'
                  : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500'
              } ${style.id === 'nagyteszt' ? 'col-span-2 sm:col-span-3 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border-purple-500/50' : ''}`}
            >
              <div className="text-2xl mb-2">{style.icon}</div>
              <div className="font-medium text-xs leading-tight">{style.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Conditional Camera Angle Selector (Only for High-Key style) */}
      {selectedStyle.id === 'high-key' && (
        <div className="bg-indigo-900/20 p-4 rounded-xl border border-indigo-500/30 animate-fadeIn">
          <label className="text-sm text-indigo-300 font-semibold uppercase tracking-wider mb-3 block">Kamera Nézet (High-Key)</label>
          <div className="flex gap-2">
            <button
              onClick={() => setCameraAngle('low')}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-colors border ${
                cameraAngle === 'low'
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Enyhén alulról
            </button>
            <button
              onClick={() => setCameraAngle('front')}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-colors border ${
                cameraAngle === 'front'
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Szemből
            </button>
            <button
              onClick={() => setCameraAngle('high')}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-colors border ${
                cameraAngle === 'high'
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Enyhén felülről
            </button>
          </div>
        </div>
      )}

      {/* Options */}
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 space-y-4">
         {/* Destylize */}
         <div className="flex items-center justify-between">
            <div>
              <label className="text-sm text-slate-300 font-semibold block">Destilizálás (Raw Mode)</label>
              <p className="text-xs text-slate-500 mt-1">Valósághűbb, kevésbé "tökéletes" kompozíció</p>
            </div>
            <button 
              onClick={() => setDestylize(!destylize)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                destylize ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${destylize ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
         </div>

         <div className="h-px bg-slate-700/50 w-full"></div>

         {/* Zoom Out */}
         <div className="flex items-center justify-between">
            <div>
              <label className="text-sm text-slate-300 font-semibold block">Távolabbi nézet (Zoom Out)</label>
              <p className="text-xs text-slate-500 mt-1">A termék kisebb lesz, több környezet látszik</p>
            </div>
            <button 
              onClick={() => setZoomOut(!zoomOut)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                zoomOut ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${zoomOut ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
         </div>
      </div>

      {/* Custom Prompt */}
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
        <label className="text-sm text-slate-400 font-semibold uppercase tracking-wider mb-3 block">Egyedi utasítás / Termékadatok</label>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Pl: Legyen ünnepi hangulat, karácsonyi díszekkel a háttérben..."
          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none h-32 resize-none placeholder-slate-500"
        />
      </div>

      <Button 
        onClick={handleGenerate} 
        disabled={!hasImage} 
        isLoading={isGenerating} 
        className="w-full text-lg shadow-xl shadow-indigo-900/20"
      >
        {hasImage ? 'Hirdetés Generálása' : 'Válassz képet először'}
      </Button>
    </div>
  );
};