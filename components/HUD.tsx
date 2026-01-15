import React from 'react';
import { GameState } from '../types';
import { Crown, Star, Map, Skull, Zap } from 'lucide-react';

interface HUDProps {
  state: GameState;
}

export const HUD: React.FC<HUDProps> = ({ state }) => {
  const xpPercentage = Math.min(100, (state.xp / state.maxXp) * 100);

  return (
    <div className="sticky top-0 left-0 w-full z-50 pointer-events-none p-2 md:p-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Left: Security Level (Skewed Box) */}
        <div className="relative group pointer-events-auto">
            {/* Background shape */}
            <div className={`absolute inset-0 transform -skew-x-12 ${state.isBossFight ? 'bg-black border-2 border-p5-red shadow-[0_0_15px_rgba(217,28,36,0.8)]' : 'bg-p5-red border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,1)]'}`}></div>
            
            <div className="relative flex items-center gap-4 px-6 py-3 transform -skew-x-6">
                <div className={`p-2 rounded-full border-2 border-black bg-white text-black animate-pulse-fast`}>
                    {state.isBossFight ? <Skull size={28} /> : <Map size={28} />}
                </div>
                <div>
                    <h2 className="text-xs font-bold text-black bg-p5-yellow px-1 inline-block mb-1">MISI SAAT INI</h2>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-2xl font-display uppercase ${state.isBossFight ? 'text-p5-red' : 'text-white'}`}>
                            LVL {state.currentLevel}:
                        </span>
                        <span className={`text-xl font-display uppercase tracking-wider ${state.isBossFight ? 'text-p5-red' : 'text-white'}`}>
                            {state.levelTitle}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        {/* Center: Style Points (XP) */}
        <div className="w-full md:max-w-md pointer-events-auto">
             <div className="relative">
                {/* Background jagged shape */}
                <div className="absolute inset-0 bg-black transform skew-x-12 border-2 border-white translate-y-2 translate-x-2"></div>
                <div className="relative bg-black border-2 border-white p-2 transform skew-x-12">
                    <div className="flex justify-between items-end mb-1 transform -skew-x-12 px-4">
                        <span className="text-p5-yellow font-display text-lg flex items-center gap-1">
                            <Zap size={18} fill="#FFE600" /> STYLE PTS
                        </span>
                        <span className="text-white font-mono text-xl">{state.xp} <span className="text-xs text-gray-400">/ {state.maxXp}</span></span>
                    </div>
                    
                    {/* Progress Bar Container */}
                    <div className="h-4 w-full bg-gray-800 transform -skew-x-12 border border-gray-600 relative overflow-hidden">
                        {/* Pattern overlay */}
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>
                        <div 
                            className="h-full bg-gradient-to-r from-p5-red via-red-500 to-p5-yellow transition-all duration-500 ease-out"
                            style={{ width: `${xpPercentage}%` }}
                        />
                    </div>
                </div>
             </div>
        </div>

        {/* Right: Treasures (Core Pillars) */}
        <div className="hidden md:flex flex-col items-end gap-1 pointer-events-auto">
            <div className="bg-black text-white px-2 py-1 text-xs font-bold transform skew-x-12 border border-p5-red">
                <span className="transform -skew-x-12 block">HARTA KARUN UTAMA</span>
            </div>
            <div className="flex flex-col gap-2 items-end mt-1">
                {state.corePillars.slice(0, 3).map((pillar, idx) => (
                    <div key={idx} className="bg-white border-l-4 border-p5-red text-black text-sm px-3 py-1 shadow-md font-bold max-w-[200px] truncate hover:scale-105 transition-transform">
                        {pillar}
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};