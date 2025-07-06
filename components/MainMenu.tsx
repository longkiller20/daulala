
import React from 'react';

interface MainMenuProps {
  onStartNewGame: () => void;
  onContinueGame: () => void;
  onOpenSettings: () => void;
  hasSavedGame: boolean;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStartNewGame, onContinueGame, onOpenSettings, hasSavedGame }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-yellow-400 py-2">
             Đấu La Đại Lục: Long Vương Sim
          </h1>
        </header>

        <main className="space-y-5 animate-fade-in">
          <button
            onClick={onStartNewGame}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-4 rounded-lg transition-all duration-300 shadow-lg text-xl transform hover:scale-105"
          >
            Bắt Đầu Mới
          </button>
          <button
            onClick={onContinueGame}
            disabled={!hasSavedGame}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-lg transition-all duration-300 shadow-lg text-xl transform hover:scale-105"
          >
            Tiếp Tục
          </button>
          <button
            onClick={onOpenSettings}
            className="w-full bg-slate-600 hover:bg-slate-500 text-white font-bold py-4 px-4 rounded-lg transition-all duration-300 shadow-lg text-xl transform hover:scale-105"
          >
            Cài Đặt
          </button>
        </main>
      </div>
      <style>{`
        @keyframes animate-fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: animate-fade-in 0.8s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default MainMenu;
