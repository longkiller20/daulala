
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ActionBarProps {
  onCultivate: () => void;
  onHunt: () => void;
  onSaveGame: () => void;
  onBackToMenu: () => void;
  isLoading: boolean;
  canHunt: boolean;
}

const ActionBar: React.FC<ActionBarProps> = ({ onCultivate, onHunt, onSaveGame, onBackToMenu, isLoading, canHunt }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-4 text-slate-300">Hành Động</h2>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onCultivate}
          disabled={isLoading}
          className="w-full flex justify-center items-center bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-md transform hover:scale-105"
        >
          {isLoading ? <LoadingSpinner /> : 'Tu Luyện'}
        </button>
        <button
          onClick={onHunt}
          disabled={isLoading || !canHunt}
          title={!canHunt ? "Cần đạt cấp 10, 20, 30... để đi săn" : "Săn tìm Hồn Thú để nhận Hồn Hoàn mới"}
          className="w-full flex justify-center items-center bg-red-700 hover:bg-red-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-md transform hover:scale-105"
        >
          {isLoading ? <LoadingSpinner /> : 'Săn Hồn Thú'}
        </button>
      </div>
       {!canHunt && <p className="text-xs text-center text-slate-400 italic mt-4">Bạn cần đạt cấp 10, 20, 30... để có thể đi săn Hồn Thú tiếp theo.</p>}
       
       <div className="mt-4 border-t border-slate-700 pt-4 grid grid-cols-2 gap-4">
        <button
          onClick={onSaveGame}
          disabled={isLoading}
          className="w-full flex justify-center items-center bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-md transform hover:scale-105"
        >
          {isLoading ? <LoadingSpinner /> : 'Lưu Game'}
        </button>
         <button
          onClick={onBackToMenu}
          disabled={isLoading}
          className="w-full flex justify-center items-center bg-amber-600 hover:bg-amber-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-md transform hover:scale-105"
        >
          {isLoading ? <LoadingSpinner /> : 'Menu Chính'}
        </button>
       </div>
    </div>
  );
};

export default ActionBar;
