
import React, { useState } from 'react';
import { AVAILABLE_SPIRIT_SOULS, AVAILABLE_BACKGROUNDS } from '../constants';
import { generateRandomBackground, generateRandomSpiritSoul } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

interface CharacterCreationProps {
  onStart: (name: string, spiritSoul: string, backgroundName: string, startPower: number) => void;
  onCancel: () => void;
}

type CreationMode = 'select' | 'custom';

const CharacterCreation: React.FC<CharacterCreationProps> = ({ onStart, onCancel }) => {
  const [name, setName] = useState('');
  
  const [soulMode, setSoulMode] = useState<CreationMode>('select');
  const [selectedSoul, setSelectedSoul] = useState(AVAILABLE_SPIRIT_SOULS[0]);
  const [customSoul, setCustomSoul] = useState('');
  const [customSoulDescription, setCustomSoulDescription] = useState<string | null>(null);


  const [backgroundMode, setBackgroundMode] = useState<CreationMode>('select');
  const [selectedBackgroundId, setSelectedBackgroundId] = useState(AVAILABLE_BACKGROUNDS[0].id);
  const [customBackground, setCustomBackground] = useState('');
  
  const [isGeneratingSoul, setIsGeneratingSoul] = useState(false);
  const [soulGenerationError, setSoulGenerationError] = useState<string | null>(null);
  const [isGeneratingBg, setIsGeneratingBg] = useState(false);
  const [bgGenerationError, setBgGenerationError] = useState<string | null>(null);


  const finalSoul = soulMode === 'select' ? selectedSoul : customSoul.trim();
  const isBackgroundValid = backgroundMode === 'select' || (backgroundMode === 'custom' && customBackground.trim() !== '');

  const handleGenerateRandomSoul = async () => {
      if (!name.trim()) {
        setSoulGenerationError("Vui lòng nhập tên nhân vật trước.");
        return;
      }
      setIsGeneratingSoul(true);
      setSoulGenerationError(null);
      setCustomSoulDescription(null);
      try {
        const result = await generateRandomSpiritSoul(name.trim());
        if (result?.name && result?.description) {
          setCustomSoul(result.name);
          setCustomSoulDescription(result.description);
        } else {
          setSoulGenerationError("Không thể tạo Võ Hồn. Vui lòng thử lại.");
        }
      } catch (err) {
        console.error("Lỗi khi tạo Võ Hồn:", err);
        const error = err as Error;
        if (error.message && (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED'))) {
            setSoulGenerationError("Bạn đã sáng tạo quá nhanh! Giới hạn truy cập API đã bị vượt qua. Hãy nghỉ ngơi và thử lại sau một phút.");
        } else {
            setSoulGenerationError("Không thể tạo Võ Hồn do lỗi từ AI. Vui lòng thử lại.");
        }
      } finally {
        setIsGeneratingSoul(false);
      }
    };

  const handleGenerateRandomBackground = async () => {
    if (!name.trim() || !finalSoul) {
        setBgGenerationError("Vui lòng nhập tên và chọn Võ Hồn trước.");
        return;
    }
    setIsGeneratingBg(true);
    setBgGenerationError(null);
    try {
        const result = await generateRandomBackground(name.trim(), finalSoul);
        if (result?.background) {
            setCustomBackground(result.background);
        } else {
            setBgGenerationError("Không thể tạo xuất thân. Vui lòng thử lại.");
        }
    } catch (err) {
        console.error("Lỗi khi tạo Xuất Thân:", err);
        const error = err as Error;
        if (error.message && (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED'))) {
            setBgGenerationError("Bạn đã sáng tạo quá nhanh! Giới hạn truy cập API đã bị vượt qua. Hãy nghỉ ngơi và thử lại sau một phút.");
        } else {
            setBgGenerationError("Không thể tạo xuất thân do lỗi từ AI. Vui lòng thử lại.");
        }
    } finally {
        setIsGeneratingBg(false);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let backgroundName: string;
    let startPower: number;

    if (backgroundMode === 'select') {
        const selectedBg = AVAILABLE_BACKGROUNDS.find(bg => bg.id === selectedBackgroundId);
        if (!selectedBg) return; // Should not happen
        backgroundName = selectedBg.name;
        startPower = selectedBg.bonus.spiritPower;
    } else {
        backgroundName = customBackground.trim();
        startPower = 3; // Default power for custom background
    }

    if (name.trim() && finalSoul && backgroundName) {
      onStart(name.trim(), finalSoul, backgroundName, startPower);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Tạo Nhân Vật
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-lg font-medium text-slate-300 mb-2">
              Tên Nhân Vật
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên của bạn..."
              className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
              required
              maxLength={20}
            />
          </div>

          <div>
            <h3 className="block text-lg font-medium text-slate-300 mb-2">
              Chọn Võ Hồn
            </h3>
            <div className="flex bg-slate-700/50 rounded-lg p-1 mb-4">
                <button
                    type="button"
                    onClick={() => setSoulMode('select')}
                    className={`w-1/2 p-2 rounded-md font-semibold transition-all duration-300 ${soulMode === 'select' ? 'bg-blue-600 text-white shadow' : 'bg-transparent text-slate-300 hover:bg-slate-600/50'}`}
                >
                    Chọn có sẵn
                </button>
                <button
                    type="button"
                    onClick={() => setSoulMode('custom')}
                    className={`w-1/2 p-2 rounded-md font-semibold transition-all duration-300 ${soulMode === 'custom' ? 'bg-blue-600 text-white shadow' : 'bg-transparent text-slate-300 hover:bg-slate-600/50'}`}
                >
                    Tự định nghĩa
                </button>
            </div>
            
            {soulMode === 'select' && (
                <div className="grid grid-cols-2 gap-4 animate-fade-in-fast">
                {AVAILABLE_SPIRIT_SOULS.map((soul) => (
                    <button
                    type="button"
                    key={soul}
                    onClick={() => setSelectedSoul(soul)}
                    className={`p-4 rounded-lg text-center font-semibold border-2 transition-all duration-200 ${
                        selectedSoul === soul
                        ? 'bg-blue-600/60 border-blue-500 shadow-lg scale-105'
                        : 'bg-slate-700/80 border-slate-600 hover:bg-slate-700 hover:border-slate-500'
                    }`}
                    >
                    {soul}
                    </button>
                ))}
                </div>
            )}

            {soulMode === 'custom' && (
                <div className="animate-fade-in-fast space-y-3">
                    <label htmlFor="custom-soul" className="sr-only">Tên Võ Hồn tự định nghĩa</label>
                    <div className="relative">
                        <input
                            type="text"
                            id="custom-soul"
                            value={customSoul}
                            onChange={(e) => {
                                setCustomSoul(e.target.value);
                                if (customSoulDescription) setCustomSoulDescription(null);
                            }}
                            placeholder="Ví dụ: Hạo Thiên Chùy..."
                            className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                            required
                            maxLength={25}
                        />
                         <button
                            type="button"
                            onClick={handleGenerateRandomSoul}
                            disabled={isGeneratingSoul}
                            className="absolute bottom-2 right-2 flex items-center justify-center bg-purple-600 hover:bg-purple-500 disabled:bg-slate-500 text-white font-semibold py-1 px-3 rounded-md text-sm transition-all duration-300"
                        >
                            {isGeneratingSoul ? <LoadingSpinner /> : 'Tạo Ngẫu Nhiên'}
                         </button>
                    </div>
                     {soulGenerationError && <p className="text-xs text-red-400 text-center">{soulGenerationError}</p>}
                     {customSoulDescription && (
                        <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600 animate-fade-in-fast">
                            <p className="text-sm text-slate-300">{customSoulDescription}</p>
                        </div>
                    )}
                </div>
            )}
          </div>
          
           <div>
            <h3 className="block text-lg font-medium text-slate-300 mb-2">
              Chọn Xuất Thân
            </h3>
            <div className="flex bg-slate-700/50 rounded-lg p-1 mb-4">
                <button
                    type="button"
                    onClick={() => setBackgroundMode('select')}
                    className={`w-1/2 p-2 rounded-md font-semibold transition-all duration-300 ${backgroundMode === 'select' ? 'bg-blue-600 text-white shadow' : 'bg-transparent text-slate-300 hover:bg-slate-600/50'}`}
                >
                    Chọn có sẵn
                </button>
                <button
                    type="button"
                    onClick={() => setBackgroundMode('custom')}
                    className={`w-1/2 p-2 rounded-md font-semibold transition-all duration-300 ${backgroundMode === 'custom' ? 'bg-blue-600 text-white shadow' : 'bg-transparent text-slate-300 hover:bg-slate-600/50'}`}
                >
                    Tự định nghĩa
                </button>
            </div>
            {backgroundMode === 'select' && (
              <div className="space-y-3 animate-fade-in-fast">
                {AVAILABLE_BACKGROUNDS.map(bg => (
                  <button
                    type="button"
                    key={bg.id}
                    onClick={() => setSelectedBackgroundId(bg.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${selectedBackgroundId === bg.id ? 'bg-blue-600/30 border-blue-500 shadow-lg scale-105' : 'bg-slate-700/80 border-slate-600 hover:bg-slate-700 hover:border-slate-500'}`}
                  >
                    <p className="font-bold text-slate-100">{bg.name}</p>
                    <p className="text-sm text-slate-300">{bg.description}</p>
                  </button>
                ))}
              </div>
            )}
            {backgroundMode === 'custom' && (
                <div className="animate-fade-in-fast space-y-3">
                    <div className="relative">
                        <textarea
                            id="custom-background"
                            value={customBackground}
                            onChange={(e) => setCustomBackground(e.target.value)}
                            placeholder="Mô tả xuất thân của bạn, hoặc tạo ngẫu nhiên..."
                            className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300 resize-none"
                            required
                            maxLength={150}
                            rows={3}
                        />
                         <button
                            type="button"
                            onClick={handleGenerateRandomBackground}
                            disabled={isGeneratingBg}
                            className="absolute bottom-2 right-2 flex items-center justify-center bg-purple-600 hover:bg-purple-500 disabled:bg-slate-500 text-white font-semibold py-1 px-3 rounded-md text-sm transition-all duration-300"
                        >
                            {isGeneratingBg ? <LoadingSpinner /> : 'Tạo Ngẫu Nhiên'}
                         </button>
                    </div>
                     {bgGenerationError && <p className="text-xs text-red-400 text-center">{bgGenerationError}</p>}
                     <p className="text-xs text-slate-400 text-center italic">Xuất thân tự định nghĩa sẽ bắt đầu với 3 điểm Hồn Lực.</p>
                </div>
            )}
          </div>
          
          <div className="space-y-3 pt-4">
            <button
              type="submit"
              disabled={!name.trim() || !finalSoul || !isBackgroundValid || isGeneratingSoul || isGeneratingBg}
              className="w-full bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg text-xl transform hover:scale-105"
            >
              Bắt Đầu Hành Trình
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
            >
              Quay Lại Menu
            </button>
          </div>
        </form>
      </div>
       <style>{`
        @keyframes animate-fade-in {
          from { opacity: 0; transform: translateY(-20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes animate-fade-in-fast {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: animate-fade-in 0.6s ease-out forwards; }
        .animate-fade-in-fast { animation: animate-fade-in-fast 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default CharacterCreation;
