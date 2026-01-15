
import React from 'react';
import { ChallengeData } from '../types';
import { Skull, AlertTriangle, HelpCircle, Target, Zap } from 'lucide-react';

interface ShadowChallengeProps {
  data: ChallengeData;
}

export const ShadowChallenge: React.FC<ShadowChallengeProps> = ({ data }) => {
  const isBoss = data.difficulty === 'BOSS';

  const getDifficultyStyles = (diff: string) => {
    switch(diff) {
      case 'EASY': 
        return { 
          color: 'text-green-400', 
          border: 'border-green-400', 
          bg: 'bg-green-900',
          label: 'EASY TARGET' 
        };
      case 'MEDIUM': 
        return { 
          color: 'text-p5-yellow', 
          border: 'border-p5-yellow', 
          bg: 'bg-yellow-900',
          label: 'GUARD CAPTAIN' 
        };
      case 'HARD': 
        return { 
          color: 'text-orange-500', 
          border: 'border-orange-500', 
          bg: 'bg-orange-900',
          label: 'MINI BOSS' 
        };
      case 'BOSS': 
        return { 
          color: 'text-p5-red', 
          border: 'border-p5-red', 
          bg: 'bg-red-900',
          label: 'PALACE RULER' 
        };
      default: 
        return { 
          color: 'text-white', 
          border: 'border-white', 
          bg: 'bg-gray-800',
          label: 'UNKNOWN' 
        };
    }
  };

  const style = getDifficultyStyles(data.difficulty);

  return (
    <div className="w-full md:max-w-[85%] pl-12 md:pl-0 mt-6 mb-8 animate-pop-in">
      <div className="relative group">
        
        {/* Animated Background Layers for Intensity */}
        <div className={`absolute inset-0 transform translate-x-2 translate-y-2 ${isBoss ? 'bg-p5-red animate-pulse' : 'bg-black'} -skew-x-2`}></div>
        <div className={`absolute -inset-1 ${isBoss ? 'bg-p5-red/50 animate-ping' : 'bg-transparent'}`}></div>

        {/* Main Card Container */}
        <div className={`relative bg-p5-gray border-4 ${style.border} p-6 md:p-8 shadow-[10px_10px_0px_rgba(0,0,0,0.8)] overflow-hidden`}>
          
          {/* Jagged Pattern Top */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-[url('https://www.transparenttextures.com/patterns/zigzag.png')] opacity-50"></div>

          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b-2 border-white/20 pb-4 relative z-10">
            <div className="flex items-center gap-4">
                <div className={`p-3 border-2 border-black shadow-md transform rotate-3 ${isBoss ? 'bg-black text-p5-red' : `${style.bg} ${style.color}`}`}>
                    {isBoss ? <Skull size={32} className="animate-pulse" /> : <AlertTriangle size={24} />}
                </div>
                
                <div className="flex flex-col">
                    <div className={`flex items-center gap-2 font-display text-xs tracking-widest uppercase ${style.color} bg-black px-2 py-0.5 border border-white/20 self-start transform -skew-x-12`}>
                        <Target size={12} />
                        <span className="transform skew-x-12">{style.label}</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-display uppercase text-white tracking-tighter leading-none mt-1" style={{ textShadow: "2px 2px 0 #000" }}>
                        {data.title}
                    </h3>
                </div>
            </div>

            {/* Bounty Badge */}
            <div className="flex items-center gap-2 bg-black border-2 border-white px-4 py-2 transform skew-x-12 shadow-[4px_4px_0_rgba(255,255,255,0.2)]">
                <div className="transform -skew-x-12 flex items-center gap-2">
                    <Zap size={20} className={style.color} fill="currentColor" />
                    <div className="flex flex-col leading-none">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">REWARD</span>
                        <span className={`text-xl font-display ${style.color}`}>{data.xpReward || '??'} XP</span>
                    </div>
                </div>
            </div>
          </div>

          {/* Question Content */}
          <div className={`relative z-10 bg-black/40 p-4 border-l-4 ${style.border} transform skew-x-2`}>
             <p className="font-body text-xl md:text-2xl text-white leading-relaxed font-bold transform -skew-x-2">
               "{data.description}"
             </p>
          </div>

          {/* Footer / Prompt */}
          <div className="mt-6 flex justify-end items-center gap-2">
             <span className="text-gray-400 font-mono text-xs uppercase animate-blink">Awaiting Input...</span>
             <HelpCircle size={18} className="text-p5-yellow" />
          </div>

          {/* Background Decorative Element */}
          <div className="absolute -bottom-10 -right-10 opacity-10 pointer-events-none text-9xl font-display text-white transform -rotate-12 select-none">
            {isBoss ? '!!!' : '?'}
          </div>

        </div>
      </div>
    </div>
  );
};
