import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Home, BrainCircuit } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import StudyMode from './pages/StudyMode';
import QuizMode from './pages/QuizMode';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">V</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              Vocabularize
            </h1>
          </Link>
          <nav className="flex gap-4">
            <Link to="/" className="text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 text-sm font-medium tracking-widest uppercase">
              <Home className="w-4 h-4" /> Home
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/study/:groupId" element={<StudyMode />} />
          <Route path="/quiz/:groupId" element={<QuizMode />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
