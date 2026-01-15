
import React, { useState } from 'react';
import { Flashcard } from '../types';
import { ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';

interface FlashcardDeckProps {
  cards: Flashcard[];
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ cards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!cards || cards.length === 0) return null;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 200);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 200);
  };

  const currentCard = cards[currentIndex];

  return (
    <div className="my-8 w-full max-w-md mx-auto relative group z-10">
        
        {/* Decorative Label */}
        <div className="absolute -top-3 left-0 bg-p5-red text-white text-xs font-bold px-3 py-1 transform -rotate-2 z-20 border border-black shadow-sm">
            CONFIDANT MEMORY
        </div>

        {/* Card Container */}
        <div 
            className="relative h-64 w-full cursor-pointer perspective-1000"
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                
                {/* FRONT */}
                <div className="absolute inset-0 backface-hidden">
                    <div className="w-full h-full bg-white border-4 border-black p-6 flex flex-col items-center justify-center text-center shadow-[8px_8px_0_#D91C24] transform rotate-1">
                        <div className="absolute top-2 right-2 text-gray-400 font-mono text-xs">
                            {currentIndex + 1} / {cards.length}
                        </div>
                        <h3 className="text-3xl font-display uppercase text-black mb-4 tracking-tighter">
                            {currentCard.term}
                        </h3>
                        <div className="mt-4 text-p5-red text-sm font-bold flex items-center gap-1 animate-pulse">
                            <RotateCw size={16} /> TAP TO REVEAL
                        </div>
                    </div>
                    {/* Corner decoration */}
                    <div className="absolute bottom-2 left-2 w-8 h-8 border-l-4 border-b-4 border-black"></div>
                </div>

                {/* BACK */}
                <div className="absolute inset-0 backface-hidden rotate-y-180">
                     <div className="w-full h-full bg-black border-4 border-p5-yellow p-6 flex flex-col items-center justify-center text-center shadow-[8px_8px_0_#fff] transform -rotate-1">
                         <div className="absolute top-2 right-2 text-gray-500 font-mono text-xs">
                            DEFINITION
                        </div>
                        <p className="text-white font-body text-lg leading-relaxed">
                            {currentCard.definition}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mt-6 px-4">
             <button 
                onClick={handlePrev}
                className="bg-black border border-white text-white p-2 hover:bg-p5-red hover:text-black transition-colors"
                title="Previous Card"
             >
                 <ChevronLeft />
             </button>
             
             <span className="font-display text-white text-xl tracking-widest bg-black px-2 transform skew-x-12">
                 MEMORIZE
             </span>

             <button 
                onClick={handleNext}
                className="bg-black border border-white text-white p-2 hover:bg-p5-red hover:text-black transition-colors"
                title="Next Card"
             >
                 <ChevronRight />
             </button>
        </div>
        
        <style>{`
            .perspective-1000 { perspective: 1000px; }
            .transform-style-3d { transform-style: preserve-3d; }
            .backface-hidden { backface-visibility: hidden; }
            .rotate-y-180 { transform: rotateY(180deg); }
        `}</style>
    </div>
  );
};
