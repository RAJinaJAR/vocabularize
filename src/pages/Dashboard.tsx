import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Progress } from '../components/ui/Progress';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { BookOpen, CheckCircle, BrainCircuit } from 'lucide-react';
import type { WordData } from '../types';

import rawData from '../data/words.json';

const wordsData = rawData as WordData[];

export default function Dashboard() {
  const [progress] = useLocalStorage<Record<string, number>>('vocab-progress', {});

  // Group data
  const groups = Array.from(new Set(wordsData.map(w => w.group))).sort((a, b) => a - b);
  
  const groupStats = groups.map(g => {
    const groupWords = wordsData.filter(w => w.group === g);
    let mastered = 0;
    let learning = 0;
    groupWords.forEach(w => {
      if (progress[w.word] === 2) mastered++;
      else if (progress[w.word] === 1) learning++;
    });
    return {
      group: g,
      total: groupWords.length,
      mastered,
      learning,
      percent: Math.round((mastered / groupWords.length) * 100) || 0
    };
  });

  const totalMastered = Object.values(progress).filter(v => v === 2).length;
  const totalWords = wordsData.length;
  const overallPercent = Math.round((totalMastered / totalWords) * 100) || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Your Progress</h1>
        <Card className="bg-indigo-50 border-indigo-100">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="space-y-2 flex-1 w-full">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Overall Mastery</span>
                  <span className="text-2xl font-black text-indigo-900">{overallPercent}%</span>
                </div>
                <Progress value={overallPercent} className="h-3" />
                <p className="text-sm font-medium text-slate-500">{totalMastered} of {totalWords} words mastered</p>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 min-w-24">
                  <BookOpen className="w-6 h-6 text-amber-500 mb-2" />
                  <span className="text-2xl font-black">{Object.values(progress).filter(v => v === 1).length}</span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Learning</span>
                </div>
                <div className="flex flex-col items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 min-w-24">
                  <CheckCircle className="w-6 h-6 text-emerald-500 mb-2" />
                  <span className="text-2xl font-black">{totalMastered}</span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Mastered</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Word Groups</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupStats.map(stat => (
            <Card key={stat.group} className="flex flex-col hover:shadow-md transition-shadow group">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between text-slate-800">
                  Group {stat.group}
                  <span className="text-sm font-bold text-slate-400">{stat.percent}%</span>
                </CardTitle>
                <Progress value={stat.percent} className="h-1.5 mt-2 transition-all group-hover:bg-indigo-100" />
              </CardHeader>
              <CardContent className="flex flex-col justify-between flex-1 mt-2">
                <p className="text-sm text-slate-500 font-medium mb-6">
                  {stat.total} words • {stat.mastered} mastered
                </p>
                <div className="flex gap-3">
                  <Link to={"/study/" + stat.group} className="flex-1">
                    <Button variant="outline" className="w-full gap-2">
                      <BookOpen className="w-4 h-4" /> Study
                    </Button>
                  </Link>
                  <Link to={"/quiz/" + stat.group} className="flex-1">
                    <Button className="w-full gap-2">
                      <BrainCircuit className="w-4 h-4" /> Quiz
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
