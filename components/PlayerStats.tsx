import React from 'react';
import type { Player } from '../types';
import { SPIRIT_RANK_NAMES } from '../constants';

interface PlayerStatsProps {
  player: Player;
}

const getRank = (power: number): string => {
  const rankLevel = Math.floor(power / 10) * 10;
  return SPIRIT_RANK_NAMES[rankLevel] || 'Chưa xếp hạng';
};

const PlayerStats: React.FC<PlayerStatsProps> = ({ player }) => {
  const rank = getRank(player.spiritPower);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-300 to-slate-400">Thông Tin Nhân Vật</h2>
      <div className="space-y-3 text-lg">
        <div className="flex justify-between">
          <span className="font-semibold text-slate-400">Tên:</span>
          <span className="text-blue-300 font-medium">{player.name}</span>
        </div>
         <div className="flex justify-between">
          <span className="font-semibold text-slate-400">Xuất Thân:</span>
          <span className="text-orange-300 font-medium">{player.background}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold text-slate-400">Võ Hồn:</span>
          <span className="text-green-400 font-medium">{player.spiritSoul}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold text-slate-400">Hồn Lực:</span>
          <span className="text-yellow-400 font-bold">{player.spiritPower}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold text-slate-400">Cấp Bậc:</span>
          <span className="text-purple-400 font-medium">{rank}</span>
        </div>
      </div>
      <div className="mt-6">
        <h3 className="text-xl font-bold mb-3 text-center text-slate-300">Hồn Hoàn</h3>
        <div className="space-y-3">
          {player.spiritRings.length > 0 ? (
            player.spiritRings.map((ring, index) => (
              <div key={index} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                <div className="flex items-center justify-between mb-1">
                  <span className={`px-3 py-1 text-sm font-bold rounded-full ${ring.tailwindColor}`}>
                    {ring.color} ({ring.year} năm)
                  </span>
                  <span className="text-slate-400 text-sm">Vị trí {index + 1}</span>
                </div>
                <p className="text-slate-300"><span className="font-semibold">Kỹ năng:</span> {ring.ability}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-slate-500 italic">Chưa có Hồn Hoàn nào.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerStats;