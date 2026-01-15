
import React, { useMemo } from 'react';
import { MascotAction } from '../types';

interface CharacterProps {
  className?: string;
  variant: 'full' | 'compact'; // Full for intro, Compact for chat
  action?: MascotAction;
}

// --- PIXEL ART SVG GENERATORS ---
// Menggunakan SVG Data URI agar gambar langsung muncul tanpa file eksternal.
// shape-rendering="crispEdges" memberikan efek pixel art yang tajam.

const getAlexandriaSVG = (action: MascotAction) => {
  // Warna Mata berdasarkan Aksi
  let eyeColor = '#00FFFF'; // Cyan (Idle)
  let glowColor = 'rgba(0, 255, 255, 0.5)';
  
  if (action === 'THINKING') { eyeColor = '#FF00FF'; glowColor = 'rgba(255, 0, 255, 0.5)'; } // Magenta
  if (action === 'SUCCESS') { eyeColor = '#FFE600'; glowColor = 'rgba(255, 230, 0, 0.5)'; } // Gold
  if (action === 'GREET') { eyeColor = '#FFFFFF'; glowColor = 'rgba(255, 255, 255, 0.5)'; } // White

  const svgString = `
    <svg width="200" height="200" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <!-- Glow Back -->
      <rect x="2" y="2" width="16" height="16" fill="${glowColor}" opacity="0.3" />
      
      <!-- Book Body (Blue) -->
      <rect x="4" y="4" width="12" height="14" fill="#002B49" />
      <rect x="5" y="5" width="10" height="12" fill="#0047BB" />
      
      <!-- Gold Trim -->
      <rect x="4" y="4" width="12" height="1" fill="#D4AF37" />
      <rect x="4" y="17" width="12" height="1" fill="#D4AF37" />
      <rect x="9" y="4" width="2" height="14" fill="#002B49" /> <!-- Spine -->

      <!-- Monocle / Eye (Changing Color) -->
      <rect x="6" y="8" width="4" height="4" fill="#000000" />
      <rect x="7" y="9" width="2" height="2" fill="${eyeColor}" />
      
      <!-- Wings (Mechanical) -->
      <rect x="1" y="6" width="3" height="8" fill="#888888" />
      <rect x="16" y="6" width="3" height="8" fill="#888888" />
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svgString)}`;
};

const getSpecterSVG = (action: MascotAction) => {
  // Warna Inti berdasarkan Aksi
  let coreColor = '#D91C24'; // Red (Idle)
  
  if (action === 'THINKING') coreColor = '#FF00FF'; // Purple
  if (action === 'SUCCESS') coreColor = '#00FF00'; // Green
  if (action === 'GREET') coreColor = '#FFE600'; // Yellow

  const svgString = `
    <svg width="200" height="200" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <!-- Gears / Background -->
      <rect x="2" y="2" width="16" height="16" fill="#1a1a1a" opacity="0.5" />
      <rect x="1" y="8" width="18" height="4" fill="#333" />
      <rect x="8" y="1" width="4" height="18" fill="#333" />

      <!-- Main Sphere Body -->
      <rect x="5" y="5" width="10" height="10" fill="#000000" />
      <rect x="6" y="6" width="8" height="8" fill="#333333" />
      
      <!-- Red Accents -->
      <rect x="5" y="5" width="2" height="2" fill="#D91C24" />
      <rect x="13" y="5" width="2" height="2" fill="#D91C24" />
      <rect x="5" y="13" width="2" height="2" fill="#D91C24" />
      <rect x="13" y="13" width="2" height="2" fill="#D91C24" />

      <!-- Central Eye / Core (Changing Color) -->
      <rect x="7" y="7" width="6" height="6" fill="#000000" />
      <rect x="8" y="8" width="4" height="4" fill="${coreColor}" />
      <rect x="9" y="9" width="2" height="2" fill="#FFFFFF" opacity="0.8" />
      
      <!-- Antenna -->
      <rect x="9" y="2" width="2" height="3" fill="#888888" />
      <rect x="9" y="1" width="2" height="1" fill="${coreColor}" />
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svgString)}`;
};

// --- COMPONENT IMPLEMENTATION ---

// Persona: ALEXANDRIA (The Floating Eye Book)
export const AlexandriaSprite: React.FC<CharacterProps> = ({ className, variant, action = 'IDLE' }) => {
  const imageSrc = useMemo(() => getAlexandriaSVG(action as MascotAction), [action]);

  return (
    <div className={`relative ${className} ${variant === 'full' ? 'w-64 h-64 md:w-96 md:h-96' : 'w-32 h-32 md:w-48 md:h-48'}`}>
      {/* Container Animation: Float (Melayang naik turun) */}
      <div className="animate-float relative w-full h-full flex items-center justify-center">
        
        {/* Glow Effect di belakang */}
        <div className={`absolute inset-0 rounded-full blur-3xl animate-pulse ${action === 'SUCCESS' ? 'bg-p5-yellow/30' : 'bg-p5-blue/30'}`}></div>
        
        <img 
            key={action} // Re-render on action change for smooth transition if needed
            src={imageSrc}
            alt="Alexandria Persona"
            className="w-full h-full object-contain drop-shadow-2xl relative z-10" 
        />
        
        {/* Nameplate */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-20 bg-black text-p5-yellow px-4 py-1 border-2 border-white transform skew-x-12 shadow-[4px_4px_0_#D91C24]">
           <span className="block transform -skew-x-12 font-display tracking-widest text-xs md:text-sm">ALEXANDRIA</span>
        </div>
      </div>
    </div>
  );
};

// Character: SPECTER (The Navigator)
export const SpecterSprite: React.FC<CharacterProps> = ({ className, variant, action = 'IDLE' }) => {
  const imageSrc = useMemo(() => getSpecterSVG(action as MascotAction), [action]);

  return (
    <div className={`relative ${className} ${variant === 'full' ? 'w-64 h-80 md:w-80 md:h-96' : 'w-40 h-48 md:w-48 md:h-60'}`}>
      {/* Container Animation: Breathe */}
      <div className={`w-full h-full relative flex flex-col items-center justify-end ${action === 'THINKING' ? 'animate-pulse' : 'animate-breathe'}`}>
        
        {/* Image Character */}
        <img 
            key={action}
            src={imageSrc}
            alt="Specter Navigator"
            className="w-full h-full object-contain drop-shadow-2xl relative z-10"
        />

        {/* Action Indicator (Debug/Visual Cue) */}
        {action !== 'IDLE' && (
             <div className="absolute top-0 right-10 z-50 animate-pop-in">
                <div className={`text-black text-[10px] font-bold px-2 py-0.5 border border-black transform rotate-12 shadow-sm ${
                    action === 'SUCCESS' ? 'bg-green-400' : 
                    action === 'THINKING' ? 'bg-purple-400' : 'bg-p5-yellow'
                }`}>
                    {action}
                </div>
             </div>
        )}

        {/* Nameplate */}
        <div className="absolute bottom-0 z-40 bg-black text-white px-6 py-1 border-2 border-p5-red transform -skew-x-12 shadow-lg">
             <span className="block transform skew-x-12 font-display text-lg tracking-wider">SPECTER</span>
        </div>
      </div>
    </div>
  );
};
