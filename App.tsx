
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Loader2, PlayCircle, User } from 'lucide-react';
import { GameStatus, GameState, ChatMessage, MessageRole, MascotAction } from './types';
import { initializeLumina, sendMessageToLumina } from './services/geminiService';
import { extractTextFromPDF } from './services/pdfService';
import { HUD } from './components/HUD';
import { MarkdownView } from './components/MarkdownView';
import { SpecterSprite, AlexandriaSprite } from './components/LiveCharacters';
import { FlashcardDeck } from './components/FlashcardDeck';
import { ShadowChallenge } from './components/ShadowChallenge';

const JokerAvatar = () => (
    <div className="hidden md:flex relative w-12 h-12 flex-shrink-0 z-20 items-center justify-center bg-white border-2 border-black transform -rotate-3 shadow-[-4px_4px_0_#000]">
        <User size={28} className="text-black" />
    </div>
);

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [inputText, setInputText] = useState('');
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Mascot State
  const [mascotAction, setMascotAction] = useState<MascotAction>('IDLE');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Game State
  const [gameState, setGameState] = useState<GameState>({
    currentLevel: 0,
    maxLevel: 5,
    xp: 0,
    maxXp: 100,
    levelTitle: "Menunggu Target...",
    isBossFight: false,
    corePillars: []
  });

  useEffect(() => {
    const interval = setInterval(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
    
    const timeout = setTimeout(() => clearInterval(interval), 5000);
    return () => {
        clearInterval(interval);
        clearTimeout(timeout);
    }
  }, [messages]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
      setStatus(GameStatus.ANALYZING);
      setMascotAction('THINKING');
      try {
        const text = await extractTextFromPDF(file);
        setFileContent(text);
        startGame(text);
      } catch (error) {
        console.error(error);
        alert("Gagal membaca file PDF. Pastikan tidak dikunci password.");
        setStatus(GameStatus.IDLE);
        setMascotAction('IDLE');
      }
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setFileContent(text);
        setMascotAction('THINKING');
        startGame(text);
      };
      reader.readAsText(file);
    }
  };

  const startGame = async (content: string) => {
    setStatus(GameStatus.ANALYZING);
    try {
      const response = await initializeLumina(content);
      
      const initialMessage: ChatMessage = {
        id: 'init',
        role: MessageRole.LUMINA,
        content: response.markdown_response,
        flashcards: response.flashcards,
        challenge: response.active_challenge, // Capture challenge if exists
        timestamp: Date.now()
      };

      setMessages([initialMessage]);
      setMascotAction(response.mascot_action || 'GREET');
      
      if (response.game_state_update) {
        setGameState(prev => ({
          ...prev,
          currentLevel: response.game_state_update?.current_level || 1,
          levelTitle: response.game_state_update?.level_title || "Infiltrasi Dimulai",
          corePillars: response.game_state_update?.core_pillars || [],
        }));
      }
      setStatus(GameStatus.PLAYING);
    } catch (e) {
      console.error(e);
      alert("Gagal memulai Infiltrasi. Cek API Key.");
      setStatus(GameStatus.IDLE);
      setMascotAction('IDLE');
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      content: inputText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    setMascotAction('THINKING');

    try {
      const response = await sendMessageToLumina(userMsg.content);
      
      const luminaMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.LUMINA,
        content: response.markdown_response,
        flashcards: response.flashcards,
        challenge: response.active_challenge, // Capture new challenge
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, luminaMsg]);
      
      // Update Mascot Action based on quiz result or explicit action
      if (response.quiz_result === 'WRONG') {
          setMascotAction('ANGRY');
      } else if (response.quiz_result === 'CORRECT') {
          setMascotAction('SUCCESS');
      } else {
          setMascotAction(response.mascot_action || 'IDLE');
      }

      if (response.game_state_update) {
        setGameState(prev => {
           const gainedXp = response.game_state_update?.xp_gained || 0;
           let newXp = prev.xp + gainedXp;
           
           // Ensure XP doesn't drop below 0
           if (newXp < 0) newXp = 0;

           let newLevel = response.game_state_update?.current_level || prev.currentLevel;
           
           if (newXp >= prev.maxXp && newLevel === prev.currentLevel) {
               newXp = newXp - prev.maxXp; 
               // Trigger level up visual logic here if needed
           }

           return {
             ...prev,
             currentLevel: newLevel,
             levelTitle: response.game_state_update?.level_title || prev.levelTitle,
             isBossFight: response.game_state_update?.is_boss_fight || false,
             xp: newXp
           };
        });
      }

    } catch (e) {
      console.error(e);
      setMascotAction('IDLE');
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER ---

  if (status === GameStatus.IDLE || status === GameStatus.ANALYZING) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-p5-red">
        {/* Background Patterns */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-pulse"></div>
        <div className="absolute -left-20 top-20 w-96 h-96 bg-black transform rotate-45 opacity-20"></div>
        <div className="absolute -right-20 bottom-20 w-96 h-96 bg-black transform -rotate-12 opacity-20"></div>

        {/* Character Stage - Intro */}
        <div className="absolute bottom-10 left-10 md:left-20 z-10 opacity-90 transition-all duration-1000 transform translate-y-0">
           <SpecterSprite variant="full" action={status === GameStatus.ANALYZING ? 'THINKING' : 'GREET'} />
        </div>
        <div className="absolute top-10 right-10 md:right-20 z-10 opacity-80 transition-all duration-1000">
           <AlexandriaSprite variant="full" action={status === GameStatus.ANALYZING ? 'THINKING' : 'IDLE'} />
        </div>

        <div className="max-w-2xl w-full bg-black border-4 border-white transform -skew-x-2 shadow-[10px_10px_0px_rgba(0,0,0,0.5)] z-20 p-1 relative">
          <div className="bg-p5-gray p-8 border border-white/20 transform skew-x-0 relative overflow-hidden">
            
            <div className="absolute top-0 right-0 p-4">
                 <div className="bg-p5-yellow text-black font-bold px-4 py-1 transform rotate-12 text-sm border-2 border-black shadow-md">TAKE YOUR HEART</div>
            </div>

            <h1 className="text-5xl md:text-6xl font-display text-center mb-2 text-white uppercase italic tracking-tighter" style={{ textShadow: "4px 4px 0 #D91C24" }}>
              PHANTOM NAVIGATOR
            </h1>
            <p className="text-center text-gray-300 font-body text-xl mb-10 border-b-2 border-p5-red pb-4 inline-block w-full">
              Ubah Dokumen Membosankan Menjadi Petualangan
            </p>

            {status === GameStatus.ANALYZING ? (
               <div className="flex flex-col items-center gap-6 py-8">
                  <div className="relative">
                      <Loader2 className="animate-spin text-white" size={64} />
                      <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-4 h-4 bg-p5-red rounded-full animate-ping"></div>
                      </div>
                  </div>
                  <div className="bg-black text-white px-6 py-2 transform -skew-x-12 border-l-4 border-p5-yellow">
                      <p className="font-display tracking-widest text-lg transform skew-x-12 animate-pulse">SPECTER SEDANG MERETAS...</p>
                  </div>
               </div>
            ) : (
              <label className="group relative block w-full cursor-pointer overflow-hidden">
                 <div className="absolute inset-0 bg-p5-red transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
                 <div className="relative z-10 border-2 border-dashed border-gray-500 group-hover:border-white p-8 flex flex-col items-center justify-center transition-colors bg-black/50 hover:bg-transparent">
                    <Upload className="w-12 h-12 mb-4 text-p5-yellow group-hover:text-white group-hover:scale-110 transition-transform" />
                    <p className="text-lg font-bold text-white uppercase mb-1">Upload "Calling Card" (Dokumen)</p>
                    <p className="text-sm text-gray-400">PDF, TXT, MD, atau Kode Program</p>
                 </div>
                 <input type="file" className="hidden" accept=".pdf,.txt,.md,.js,.ts,.json" onChange={handleFileUpload} />
              </label>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#1a1a1a] relative font-body overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-p5-red/30 to-transparent pointer-events-none"></div>

      {/* Visual Novel Layer - Fixed Characters */}
      <div className="absolute bottom-0 left-0 md:left-10 z-0 pointer-events-none opacity-90">
         <SpecterSprite variant="compact" action={mascotAction} className="transform scale-110 origin-bottom" />
      </div>
      <div className="absolute top-32 right-0 md:right-10 z-0 pointer-events-none opacity-60">
         <AlexandriaSprite variant="compact" action={mascotAction} className="transform scale-90" />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto pb-36 z-10 relative">
        
        {/* Sticky HUD */}
        <HUD state={gameState} />

        <div className="max-w-5xl mx-auto space-y-12 p-4 md:p-8 mt-4">
            {messages.map((msg) => (
                <div 
                    key={msg.id} 
                    className={`flex flex-col w-full ${msg.role === MessageRole.USER ? 'items-end' : 'items-start'}`}
                >
                    <div className={`flex w-full ${msg.role === MessageRole.USER ? 'justify-end' : 'justify-start items-start gap-4'}`}>
                        {msg.role === MessageRole.LUMINA && (
                        <div className="w-full md:max-w-[85%] relative group pl-12 md:pl-0">
                                {/* Dialogue Box */}
                                <div className="relative bg-black/95 border-2 border-white/80 p-6 md:p-8 rounded-tr-3xl rounded-bl-3xl shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-sm">
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-p5-red"></div>
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-p5-red"></div>
                                    
                                    <div className="relative z-10 min-h-[50px]">
                                        <MarkdownView content={msg.content} variant="dark" />
                                    </div>
                                </div>
                        </div>
                        )}

                        {msg.role === MessageRole.USER && (
                        <div className="w-full md:max-w-[70%] relative flex justify-end items-center gap-4">
                            <div className="relative bg-white transform -skew-x-12 border-4 border-black shadow-[8px_8px_0_rgba(217,28,36,1)] hover:scale-[1.02] transition-transform duration-200 cursor-default">
                                <div className="absolute left-0 top-0 bottom-0 w-3 bg-p5-red border-r-2 border-black"></div>
                                <div className="px-8 py-6 transform skew-x-12">
                                    <p className="text-2xl font-display uppercase tracking-wide text-black leading-tight">
                                        {msg.content}
                                    </p>
                                </div>
                            </div>
                            <JokerAvatar />
                        </div>
                        )}
                    </div>
                    
                    {/* Render Challenge/Quiz if present */}
                    {msg.role === MessageRole.LUMINA && msg.challenge && (
                        <ShadowChallenge data={msg.challenge} />
                    )}

                    {/* Render Flashcards if they exist for this message */}
                    {msg.role === MessageRole.LUMINA && msg.flashcards && msg.flashcards.length > 0 && (
                        <div className="w-full md:max-w-[85%] pl-12 md:pl-0 mt-4 animate-pop-in" style={{ animationDelay: '0.5s' }}>
                            <FlashcardDeck cards={msg.flashcards} />
                        </div>
                    )}
                </div>
            ))}
            
            {isLoading && (
               <div className="flex justify-start items-center w-full md:max-w-[85%] gap-4 pl-12 md:pl-0">
                  <div className="bg-black border border-white/50 p-4 flex items-center gap-4 animate-pulse">
                      <Loader2 className="animate-spin text-p5-red" size={24} />
                      <span className="text-white font-mono uppercase tracking-widest text-sm">ALEXANDRIA MENGANALISIS...</span>
                  </div>
               </div>
            )}
            <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 w-full z-50 px-0 pb-0">
         <div className="h-2 w-full bg-gradient-to-r from-p5-red via-black to-p5-yellow border-t-2 border-black"></div>
         
         <div className="bg-p5-gray border-t-4 border-white shadow-[0_-10px_30px_rgba(0,0,0,0.8)] px-4 py-4 md:px-8 md:py-6 relative overflow-hidden">
            {/* Input Background Character Hint */}
            <div className="absolute -left-10 bottom-0 opacity-10 pointer-events-none transform -skew-x-12">
                <div className="w-64 h-20 bg-p5-red"></div>
            </div>

            <div className="max-w-5xl mx-auto flex items-stretch gap-0 md:gap-4 relative z-10">
                <div className="hidden md:flex items-center bg-black border-2 border-white px-4 transform skew-x-12 mr-4">
                    <span className="text-p5-yellow font-display text-xl transform -skew-x-12">COMMAND</span>
                </div>

                <div className="flex-1 relative group">
                    <div className="absolute inset-0 bg-white transform -skew-x-12 translate-x-1 translate-y-1 group-focus-within:translate-x-2 group-focus-within:translate-y-2 transition-transform"></div>
                    <div className="relative bg-black border-2 border-white transform -skew-x-12 h-full flex items-center overflow-hidden">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Ketik jawabanmu..."
                            className="w-full bg-transparent text-white placeholder-gray-500 font-bold text-xl px-6 py-3 outline-none transform skew-x-12 font-body tracking-wider"
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <button 
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputText.trim()}
                    className="ml-2 relative group w-20 md:w-24 bg-p5-red border-2 border-black transform -skew-x-12 hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-[4px_4px_0_white]"
                >
                    <div className="flex flex-col items-center justify-center transform skew-x-12 py-2">
                        <PlayCircle size={24} className="text-black fill-white mb-1" />
                        <span className="text-[10px] font-bold text-black uppercase leading-none">KIRIM</span>
                    </div>
                </button>
            </div>
         </div>
      </div>

    </div>
  );
};

export default App;
