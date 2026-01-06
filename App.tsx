
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameStatus, GuessRecord, AiFeedback } from './types';
import { getAiFeedback } from './services/geminiService';

const App: React.FC = () => {
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [inputGuess, setInputGuess] = useState<string>('');
  const [guesses, setGuesses] = useState<GuessRecord[]>([]);
  const [status, setStatus] = useState<GameStatus>('playing');
  const [aiFeedback, setAiFeedback] = useState<AiFeedback | null>(null);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const initGame = useCallback(() => {
    setTargetNumber(Math.floor(Math.random() * 100) + 1);
    setGuesses([]);
    setStatus('playing');
    setAiFeedback({
      commentary: "1부터 100 사이의 숫자를 하나 골랐어요. 맞춰보시겠어요?",
      advice: "50부터 시작하는 게 정석이죠!",
      mood: 'happy'
    });
    setInputGuess('');
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    const guessValue = parseInt(inputGuess);

    if (isNaN(guessValue) || guessValue < 1 || guessValue > 100) {
      alert("1에서 100 사이의 숫자를 입력해주세요.");
      return;
    }

    if (guesses.some(g => g.value === guessValue)) {
      alert("이미 입력했던 숫자예요!");
      return;
    }

    const result = guessValue === targetNumber 
      ? 'correct' 
      : guessValue > targetNumber 
        ? 'too-high' 
        : 'too-low';

    const newRecord: GuessRecord = {
      value: guessValue,
      result,
      timestamp: Date.now()
    };

    const newGuesses = [newRecord, ...guesses];
    setGuesses(newGuesses);
    setInputGuess('');

    if (result === 'correct') {
      setStatus('won');
    }

    setIsThinking(true);
    const feedback = await getAiFeedback(targetNumber, guessValue, newGuesses);
    setAiFeedback(feedback);
    setIsThinking(false);
  };

  const getMoodEmoji = (mood: string) => {
    switch(mood) {
      case 'happy': return '😊';
      case 'sarcastic': return '😏';
      case 'encouraging': return '🚀';
      case 'impressed': return '🤯';
      default: return '🤖';
    }
  };

  const getResultLabel = (result: string) => {
    switch(result) {
      case 'too-high': return '낮춰주세요';
      case 'too-low': return '높여주세요';
      case 'correct': return '정답입니다';
      default: return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-16 flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 tracking-tight">
          GEMINI MIND READER
        </h1>
        <p className="text-slate-400 text-lg">제 농담이 떨어지기 전에 숨겨진 숫자를 찾아보세요!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        {/* Main Interaction Area */}
        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border-2 transition-all duration-500 ${status === 'won' ? 'border-green-500 bg-green-500/10 shadow-[0_0_30px_rgba(34,197,94,0.3)]' : 'border-slate-700 bg-slate-800/80 shadow-xl'}`}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-2xl shrink-0 shadow-lg shadow-indigo-500/20">
                {aiFeedback ? getMoodEmoji(aiFeedback.mood) : '🤖'}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Gemini AI</span>
                  {isThinking && <span className="text-xs text-indigo-300 animate-pulse font-medium">분석 중...</span>}
                </div>
                <p className="text-xl font-medium leading-relaxed">
                  {aiFeedback?.commentary || "첫 번째 숫자를 입력해보세요..."}
                </p>
                {aiFeedback?.advice && (
                  <p className="mt-2 text-sm text-slate-400 italic">
                    팁: {aiFeedback.advice}
                  </p>
                )}
              </div>
            </div>

            {status === 'playing' ? (
              <form onSubmit={handleGuess} className="flex gap-2">
                <input
                  ref={inputRef}
                  type="number"
                  value={inputGuess}
                  onChange={(e) => setInputGuess(e.target.value)}
                  placeholder="1-100"
                  className="flex-1 bg-slate-900 border-2 border-slate-700 rounded-xl px-4 py-3 text-2xl font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                  min="1"
                  max="100"
                />
                <button
                  type="submit"
                  disabled={isThinking || !inputGuess}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
                >
                  확인
                </button>
              </form>
            ) : (
              <div className="text-center space-y-4 py-4">
                <h2 className="text-3xl font-bold text-green-400">🎉 정답입니다!</h2>
                <p className="text-slate-300">목표 숫자는 <span className="text-white font-black text-2xl px-2 py-1 bg-slate-700 rounded-lg">{targetNumber}</span> 였습니다.</p>
                <button
                  onClick={initGame}
                  className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02]"
                >
                  다시 시작하기
                </button>
              </div>
            )}
          </div>
          {/* Stats component removed from here */}
        </div>

        {/* History Column */}
        <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 h-[500px] flex flex-col">
          <h3 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2">
            <span>📜 추측 기록</span>
            <span className="bg-slate-700 text-slate-400 text-xs py-0.5 px-2 rounded-full">{guesses.length}회 시도</span>
          </h3>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
            {guesses.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 italic">
                아직 기록이 없어요. 시작해보세요!
              </div>
            ) : (
              guesses.map((g, idx) => (
                <div 
                  key={g.timestamp} 
                  className={`flex items-center justify-between p-3 rounded-xl border animate-in slide-in-from-left duration-300 ${
                    g.result === 'correct' ? 'bg-green-500/20 border-green-500/30' : 
                    g.result === 'too-high' ? 'bg-red-500/10 border-red-500/20' : 
                    'bg-blue-500/10 border-blue-500/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 font-mono text-xs w-6">#{guesses.length - idx}</span>
                    <span className="text-2xl font-black">{g.value}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${
                      g.result === 'correct' ? 'text-green-400' : 
                      g.result === 'too-high' ? 'text-red-400' : 'text-blue-400'
                    }`}>
                      {getResultLabel(g.result)}
                    </span>
                    {g.result === 'too-high' ? (
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    ) : g.result === 'too-low' ? (
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                    ) : (
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="mt-16 text-slate-500 text-sm flex gap-8">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          Gemini 3 Flash 탑재
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
          React 18 사용
        </div>
      </footer>
    </div>
  );
};

export default App;
