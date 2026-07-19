import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Volume2, Star } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useLocalStorage } from '../hooks/useLocalStorage';
import rawData from '../data/words.json';
import type { WordData } from '../types';
import { cn } from '../lib/utils';

const wordsData = rawData as WordData[];

export default function StudyMode() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const words = wordsData.filter(w => w.group === Number(groupId));
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [progress, setProgress] = useLocalStorage<Record<string, number>>('vocab-progress', {});
  const [jumpValue, setJumpValue] = useState((currentIndex + 1).toString());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setJumpValue((currentIndex + 1).toString());
  }, [currentIndex]);

  const handleJump = () => {
    const target = parseInt(jumpValue);
    if (!isNaN(target) && target >= 1 && target <= words.length) {
      setIsFlipped(false);
      setCurrentIndex(target - 1);
    } else {
      setJumpValue((currentIndex + 1).toString());
    }
  };

  if (words.length === 0) {
    return <div>Group not found</div>;
  }

  const word = words[currentIndex];
  const wordStatus = progress[word.word] || 0;

  const nextCard = () => {
    setIsFlipped(false);
    if (currentIndex < words.length - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 150);
    }
  };

  const prevCard = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setTimeout(() => setCurrentIndex(currentIndex - 1), 150);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      switch(e.code) {
        case 'Space':
          e.preventDefault();
          setIsFlipped(prev => !prev);
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextCard();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevCard();
          break;
        case 'ArrowUp':
          if (isFlipped && scrollRef.current) {
            e.preventDefault();
            scrollRef.current.scrollBy({ top: -100, behavior: 'smooth' });
          }
          break;
        case 'ArrowDown':
          if (isFlipped && scrollRef.current) {
            e.preventDefault();
            scrollRef.current.scrollBy({ top: 100, behavior: 'smooth' });
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, words.length, isFlipped]);

  const markStatus = (status: number) => {
    setProgress(prev => ({ ...prev, [word.word]: status }));
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/')} className="gap-2 px-2 -ml-2 text-slate-500 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="h-6 w-px bg-slate-200 hidden sm:block" />
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            Group {groupId}
          </h1>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
            <input
              type="text"
              value={jumpValue}
              onChange={(e) => setJumpValue(e.target.value)}
              onBlur={handleJump}
              onKeyDown={(e) => e.key === 'Enter' && handleJump()}
              className="w-10 text-center font-bold text-slate-700 outline-none bg-transparent"
              aria-label="Jump to card number"
            />
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider select-none">
              of {words.length}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 relative perspective-1000 w-full mb-8" onClick={() => setIsFlipped(!isFlipped)}>
        <motion.div
          className="w-full h-full relative preserve-3d cursor-pointer"
          animate={{ rotateX: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
        >
          {/* Front */}
          <Card className={cn(
            "absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 bg-white border-2 overflow-hidden",
            wordStatus === 2 ? "border-emerald-200" : wordStatus === 1 ? "border-amber-200" : "border-slate-200"
          )}>
            <div className="absolute top-4 right-4 flex gap-2 z-20">
              <Button size="icon" variant="ghost" className="rounded-full" onClick={(e) => { e.stopPropagation(); speak(word.word); }}>
                <Volume2 className="w-5 h-5 text-slate-400" />
              </Button>
            </div>
            
            {word.synonyms && word.synonyms.map((syn, i) => {
              const positions = [
                "top-[15%] left-[10%] -rotate-12",
                "top-[20%] right-[10%] rotate-12",
                "bottom-[20%] left-[15%] rotate-6",
                "bottom-[15%] right-[12%] -rotate-6",
                "top-[45%] left-[5%] -rotate-6",
              ];
              const posClass = positions[i % positions.length];
              return (
                <motion.div
                  key={syn}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, y: [0, -8, 0] }}
                  transition={{ 
                    opacity: { duration: 0.5 },
                    y: { duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }
                  }}
                  className={cn(
                    "absolute px-3 py-1 font-serif text-2xl sm:text-3xl font-bold text-slate-300 pointer-events-none mix-blend-multiply",
                    posClass
                  )}
                >
                  {syn}
                </motion.div>
              );
            })}

            <header className="text-center relative z-10">
               <h2 className="text-6xl sm:text-8xl font-black text-slate-900 mb-2">{word.word}</h2>
            </header>

            <div className="absolute bottom-4 flex gap-2 z-20">
              <div className={cn("w-2 h-2 rounded-full", wordStatus >= 1 ? "bg-amber-400" : "bg-slate-200")} />
              <div className={cn("w-2 h-2 rounded-full", wordStatus === 2 ? "bg-emerald-400" : "bg-slate-200")} />
            </div>
          </Card>

          {/* Back */}
          <Card ref={scrollRef} className="absolute inset-0 backface-hidden [transform:rotateX(180deg)] flex flex-col p-6 sm:p-10 bg-slate-50 overflow-y-auto border border-slate-200 shadow-sm">
            <div className="flex-1 space-y-8 text-left">
              <header className="border-b border-slate-200 pb-4 flex justify-between items-end">
                <div>
                  <h2 className="text-4xl font-black text-slate-900 mb-1 truncate">{word.word}</h2>
                </div>
                <Button size="icon" variant="ghost" className="rounded-full shrink-0" onClick={(e) => { e.stopPropagation(); speak(word.word); }}>
                  <Volume2 className="w-5 h-5 text-indigo-600" />
                </Button>
              </header>

              <section>
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Core Definition</h3>
                 <p className="text-2xl font-medium leading-snug text-slate-800 border-l-4 border-indigo-200 pl-6">{word.meaning}</p>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-7 space-y-6">
                  {word.synonyms && word.synonyms.length > 0 && (
                    <section>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">High-Level Synonyms</h3>
                      <div className="flex flex-wrap gap-2">
                        {word.synonyms.map((syn, i) => (
                          <button
                            key={i}
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://www.google.com/search?q=define+${encodeURIComponent(syn)}`, '_blank', 'noopener,noreferrer');
                            }}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-indigo-700 font-semibold hover:bg-indigo-50 hover:border-indigo-300 active:bg-indigo-100 transition-all cursor-pointer text-left"
                            title={`Search meaning of "${syn}"`}
                          >
                            {syn}
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  {word.example && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mt-6">
                       <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Usage Example</h3>
                       <p className="text-slate-700 italic leading-relaxed text-sm">"{word.example}"</p>
                    </div>
                  )}
                </div>
                
                <div className="md:col-span-5 flex flex-col justify-center">
                  {word.mnemonic && (
                    <section className="bg-indigo-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden h-full flex flex-col justify-center">
                      <div className="relative z-10">
                        <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Star className="w-4 h-4" /> Mnemonic
                        </h3>
                        <p className="text-base leading-relaxed font-light">{word.mnemonic}</p>
                      </div>
                      <div className="absolute -right-8 -bottom-8 opacity-10">
                        <svg width="160" height="160" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
        
        {!isFlipped && (
          <div className="absolute -bottom-6 left-0 right-0 text-center text-slate-400 text-sm font-medium animate-pulse pointer-events-none">
            Spacebar or click to reveal • Use arrow keys to navigate
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <Button variant="outline" size="lg" onClick={prevCard} disabled={currentIndex === 0} className="w-full sm:w-auto">
          Previous Word
        </Button>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant={wordStatus === 1 ? "secondary" : "outline"} 
            className={cn("flex-1 px-8", wordStatus === 1 && "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200")}
            onClick={() => markStatus(wordStatus === 1 ? 0 : 1)}
          >
            Learning
          </Button>
          <Button 
            variant={wordStatus === 2 ? "default" : "outline"} 
            className={cn("flex-1 px-8", wordStatus === 2 ? "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200" : "hover:border-emerald-200 hover:text-emerald-700")}
            onClick={() => markStatus(wordStatus === 2 ? 0 : 2)}
          >
            Mastered
          </Button>
        </div>

        <Button size="lg" onClick={nextCard} disabled={currentIndex === words.length - 1} className="w-full sm:w-auto">
          Next Word
        </Button>
      </div>
    </div>
  );
}
