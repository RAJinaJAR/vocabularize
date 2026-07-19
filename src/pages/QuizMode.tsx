import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Progress } from '../components/ui/Progress';
import rawData from '../data/words.json';
import type { WordData } from '../types';
import { cn } from '../lib/utils';
import { useLocalStorage } from '../hooks/useLocalStorage';

const wordsData = rawData as WordData[];

function shuffle<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export default function QuizMode() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [progress, setProgress] = useLocalStorage<Record<string, number>>('vocab-progress', {});

  const groupWords = useMemo(() => wordsData.filter(w => w.group === Number(groupId)), [groupId]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Generate question options only when going to a new question
  const currentQuestion = useMemo(() => {
    if (groupWords.length === 0 || isFinished) return null;
    const targetWord = groupWords[currentIndex];
    
    // Pick 3 random decoys from the same group
    const otherWords = groupWords.filter(w => w.word !== targetWord.word);
    const decoys = shuffle(otherWords).slice(0, 3);
    
    const options = shuffle([targetWord, ...decoys]);
    return {
      target: targetWord,
      options
    };
  }, [currentIndex, groupWords, isFinished]);

  if (groupWords.length === 0) {
    return <div>Group not found</div>;
  }

  if (isFinished) {
    const percent = Math.round((score / groupWords.length) * 100);
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-6 animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-black text-slate-900">Quiz Completed!</h2>
        <Card className="p-6">
          <p className="text-slate-500 font-bold uppercase tracking-widest mb-1 text-xs">Your Score</p>
          <div className="text-5xl font-black text-indigo-600 mb-4">{percent}%</div>
          <p className="text-sm text-slate-400 font-medium">{score} out of {groupWords.length} correct</p>
        </Card>
        <div className="flex gap-4">
          <Button variant="outline" className="flex-1" onClick={() => navigate('/')}>
            Back to Dashboard
          </Button>
          <Button className="flex-1" onClick={() => {
            setCurrentIndex(0);
            setScore(0);
            setSelectedAnswer(null);
            setIsFinished(false);
          }}>
            Retry Quiz
          </Button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const handleSelect = (word: string) => {
    if (selectedAnswer) return; // Prevent multiple selections
    setSelectedAnswer(word);
    
    const isCorrect = word === currentQuestion.target.word;
    if (isCorrect) {
      setScore(s => s + 1);
      // Auto-mark as learning if not mastered
      if ((progress[word] || 0) < 1) {
        setProgress(prev => ({ ...prev, [word]: 1 }));
      }
    }
  };

  const nextQuestion = () => {
    if (currentIndex < groupWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
    } else {
      setIsFinished(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-full animate-in fade-in">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Exit Quiz
        </Button>
        <div className="text-sm font-bold text-slate-500 tracking-wider">
          {currentIndex + 1} / {groupWords.length}
        </div>
      </div>

      <Progress value={(currentIndex / groupWords.length) * 100} className="mb-8" />

      <div className="flex-1">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">What is the meaning of...</h3>
        <Card className="p-8 mb-8 bg-white border-2 border-slate-200 text-center shadow-sm">
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900">{currentQuestion.target.word}</h2>
        </Card>

        <div className="space-y-3">
          {currentQuestion.options.map((opt) => {
            const isSelected = selectedAnswer === opt.word;
            const isCorrect = opt.word === currentQuestion.target.word;
            const displayMeaning = opt.meaning;
            
            let btnClass = "w-full justify-start h-auto p-4 text-left font-medium items-start group";
            if (selectedAnswer) {
              if (isCorrect) btnClass = cn(btnClass, "bg-emerald-50 border-emerald-200 text-emerald-900 ring-1 ring-emerald-500 shadow-sm");
              else if (isSelected) btnClass = cn(btnClass, "bg-rose-50 border-rose-200 text-rose-900 ring-1 ring-rose-500 shadow-sm");
              else btnClass = cn(btnClass, "opacity-50 pointer-events-none");
            } else {
              btnClass = cn(btnClass, "hover:border-indigo-300 hover:bg-indigo-50 border-slate-200");
            }

            return (
              <Button
                key={opt.word}
                variant="outline"
                className={btnClass}
                onClick={() => handleSelect(opt.word)}
                disabled={!!selectedAnswer}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="flex-1 text-base leading-relaxed">{displayMeaning}</span>
                  {selectedAnswer && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-4 shrink-0" />}
                  {selectedAnswer && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-500 ml-4 shrink-0" />}
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      {selectedAnswer && (
        <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center animate-in slide-in-from-bottom-4">
          <div className="text-sm text-slate-500 italic">
            {!isFinished && selectedAnswer !== currentQuestion.target.word && (
              <span>The correct answer was: <span className="font-bold text-slate-900">{currentQuestion.target.meaning}</span></span>
            )}
          </div>
          <Button size="lg" onClick={nextQuestion}>
            {currentIndex === groupWords.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </Button>
        </div>
      )}
    </div>
  );
}
