
import React from 'react';
import type { GameEvent } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface EventLogProps {
  events: GameEvent[];
  isLoading: boolean;
}

const EventLog: React.FC<EventLogProps> = ({ events, isLoading }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-lg h-full max-h-[70vh] flex flex-col">
      <h2 className="text-2xl font-bold text-center mb-4 text-slate-300">Nhật Ký Sự Kiện</h2>
      <div className="flex-grow overflow-y-auto pr-2 space-y-4">
        {isLoading && (
            <div className="flex items-center justify-center p-4 bg-slate-700/50 rounded-lg">
                <LoadingSpinner />
                <span className="ml-3 text-slate-300 animate-pulse">AI đang suy nghĩ...</span>
            </div>
        )}
        {events.map((event, index) => (
          <div
            key={event.id}
            className={`p-4 rounded-lg border animate-fade-in ${index === 0 ? 'bg-slate-700/80 border-blue-500' : 'bg-slate-700/40 border-slate-600'}`}
          >
            <p className="text-slate-200">{event.message}</p>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes animate-fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: animate-fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default EventLog;
