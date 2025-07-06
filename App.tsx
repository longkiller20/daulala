
import React from 'react';
import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Player, GameEvent, SpiritRing } from './types';
import { GameState } from './types';
import { INITIAL_PLAYER } from './constants';
import { generateCultivationEvent, generateHuntEvent, initializeAi } from './services/geminiService';
import PlayerStats from './components/PlayerStats';
import ActionBar from './components/ActionBar';
import EventLog from './components/EventLog';
import CharacterCreation from './components/CharacterCreation';
import ApiKeyEntry from './components/ApiKeyEntry';
import MainMenu from './components/MainMenu';
import LoadingSpinner from './components/LoadingSpinner';


const SAVE_GAME_KEY = 'douluo_save_game';
type View = 'loading' | 'menu' | 'game' | 'creation' | 'settings';

const App: React.FC = () => {
  // Game State
  const [player, setPlayer] = useState<Player>(INITIAL_PLAYER);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [gameState, setGameState] = useState<GameState>(GameState.Idle);
  const [error, setError] = useState<string | null>(null);
  
  // App State
  const [currentView, setCurrentView] = useState<View>('loading');
  const [apiKeys, setApiKeys] = useState<string[]>([]);
  const [hasSavedGame, setHasSavedGame] = useState(false);

  // Initial load effect
  useEffect(() => {
    // 1. Load API keys
    const storedKeysJSON = localStorage.getItem('GEMINI_API_KEYS');
    let loadedKeys: string[] = [];
    if (storedKeysJSON) {
      try {
        const parsedKeys = JSON.parse(storedKeysJSON);
        if (Array.isArray(parsedKeys) && parsedKeys.length > 0 && parsedKeys.every(k => typeof k === 'string' && k.length > 0)) {
          loadedKeys = parsedKeys;
          setApiKeys(loadedKeys);
          initializeAi(loadedKeys);
        }
      } catch (e) {
        console.error("Lỗi khi đọc khóa API từ localStorage:", e);
        localStorage.removeItem('GEMINI_API_KEYS');
      }
    }
    
    // 2. Check for saved game
    const savedGameJSON = localStorage.getItem(SAVE_GAME_KEY);
    setHasSavedGame(!!savedGameJSON);

    // 3. Set initial view
    if (loadedKeys.length > 0) {
      setCurrentView('menu');
    } else {
      setCurrentView('settings'); // Force setup if no keys
    }
  }, []);


  const addEvent = (message: string) => {
    setEvents(prevEvents => [{ id: crypto.randomUUID(), message }, ...prevEvents]);
  };

  // --- Navigation Handlers ---
  const handleNavigateToMenu = () => setCurrentView('menu');
  const handleNavigateToCreation = () => {
     if (currentView === 'game' && player.name !== '') { 
       if (!window.confirm("Bạn có chắc muốn bắt đầu một hành trình mới? Tiến trình hiện tại sẽ không được lưu và sẽ bị mất nếu không lưu trước.")) {
         return;
       }
    }
    setError(null);
    setCurrentView('creation');
  }
  const handleNavigateToSettings = () => setCurrentView('settings');
  
  // --- Game Flow Handlers ---
  const handleContinueGame = () => {
    const savedGameJSON = localStorage.getItem(SAVE_GAME_KEY);
    if (savedGameJSON) {
      try {
        const savedGame = JSON.parse(savedGameJSON);
        if (savedGame.player && savedGame.events) {
          setPlayer(savedGame.player);
          setEvents(savedGame.events);
          setError(null);
          setCurrentView('game');
          console.log("Trò chơi đã được tải từ save game.");
        }
      } catch (e) {
        console.error("Lỗi khi tải save game:", e);
        localStorage.removeItem(SAVE_GAME_KEY);
        setHasSavedGame(false);
      }
    }
  };

  const handleApiKeysSubmit = (keys: string[]) => {
    localStorage.setItem('GEMINI_API_KEYS', JSON.stringify(keys));
    setApiKeys(keys);
    initializeAi(keys);
    setCurrentView('menu');
  };

  const handleStartGame = (name: string, spiritSoul: string, backgroundName: string, startPower: number) => {
    localStorage.removeItem(SAVE_GAME_KEY);
    setHasSavedGame(false);

    const newPlayer: Player = {
        ...INITIAL_PLAYER,
        name,
        spiritSoul,
        background: backgroundName,
        spiritPower: startPower,
    };
    setPlayer(newPlayer);
    setEvents([{ id: crypto.randomUUID(), message: `Chào mừng ${name} đến với Đấu La Đại Lục. Với xuất thân từ "${backgroundName}", hành trình của bạn với Võ Hồn ${spiritSoul} chính thức bắt đầu!` }]);
    setCurrentView('game');
  };

  const handleSaveGame = useCallback(() => {
    if (currentView !== 'game') return;
    const gameStateToSave = { player, events };
    localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(gameStateToSave));
    setHasSavedGame(true);
    addEvent("Đã lưu tiến trình của bạn.");
  }, [player, events, currentView]);

  // --- Game Action Handlers ---
  const canHunt = useMemo(() => {
    if (player.spiritPower === 0) return false;
    const currentRingCount = player.spiritRings.length;
    return player.spiritPower >= (currentRingCount + 1) * 10 && currentRingCount < 9;
  }, [player.spiritPower, player.spiritRings.length]);

  const handleCultivate = useCallback(async () => {
    setGameState(GameState.Loading);
    setError(null);
    try {
        const result = await generateCultivationEvent(player.name, player.spiritPower);
        if (result) {
            setPlayer(p => ({ ...p, spiritPower: p.spiritPower + result.powerGained }));
            addEvent(result.description);
        } else {
            setError('AI trả về kết quả không hợp lệ. Vui lòng thử lại.');
            addEvent('Minh tưởng thất bại, dường như có một nút thắt trong kinh mạch.');
        }
    } catch (err) {
        console.error("Lỗi trong lúc tu luyện:", err);
        const error = err as Error;
        if (error.message && (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED'))) {
            setError("Bạn đã hành động quá nhanh! Giới hạn truy cập API đã bị vượt qua. Hãy nghỉ ngơi và thử lại sau một phút.");
            addEvent("Tu luyện quá dồn dập khiến Hồn Lực của bạn trở nên bất ổn. Bạn buộc phải dừng lại để điều tức.");
        } else {
            setError('Không thể tu luyện lúc này. Có lỗi xảy ra với AI.');
            addEvent('Một luồng năng lượng hỗn loạn từ bên ngoài đã làm gián đoạn buổi tu luyện của bạn.');
        }
    } finally {
        setGameState(GameState.Idle);
    }
  }, [player.name, player.spiritPower]);

  const handleHunt = useCallback(async () => {
    if (!canHunt) return;
    setGameState(GameState.Loading);
    setError(null);
    try {
        const ringSlot = player.spiritRings.length + 1;
        const result = await generateHuntEvent(player.name, player.spiritPower, ringSlot);

        if (result) {
            addEvent(result.description);
            if (result.success && result.ring) {
                const newRing: SpiritRing = result.ring;
                setPlayer(p => ({
                    ...p,
                    spiritRings: [...p.spiritRings, newRing],
                    spiritPower: p.spiritPower + 1,
                }));
            }
        } else {
            setError('AI trả về kết quả không hợp lệ. Vui lòng thử lại.');
            addEvent('Bạn cảm thấy nguy hiểm rình rập trong rừng và quyết định không tiến sâu hơn.');
        }
    } catch (err) {
        console.error("Lỗi trong lúc đi săn:", err);
        const error = err as Error;
        if (error.message && (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED'))) {
            setError("Bạn đã hành động quá nhanh! Giới hạn truy cập API đã bị vượt qua. Hãy nghỉ ngơi và thử lại sau một phút.");
            addEvent("Sự vội vàng của bạn đã kinh động những Hồn Thú hùng mạnh. Bạn buộc phải rút lui để bảo toàn tính mạng.");
        } else {
            setError('Không thể đi săn lúc này. Có lỗi xảy ra với AI.');
            addEvent('Sương mù dày đặc bất ngờ bao phủ khu rừng, bạn quyết định quay về an toàn.');
        }
    } finally {
        setGameState(GameState.Idle);
    }
  }, [canHunt, player.name, player.spiritPower, player.spiritRings.length]);
  

  // --- Render Logic ---
  const renderContent = () => {
    switch (currentView) {
      case 'loading':
        return (
          <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
            <LoadingSpinner />
            <span className="ml-4 text-xl">Đang tải...</span>
          </div>
        );

      case 'settings':
        return (
          <ApiKeyEntry 
            initialKeys={apiKeys}
            onApiKeysSubmit={handleApiKeysSubmit} 
            onCancel={apiKeys.length > 0 ? handleNavigateToMenu : undefined}
          />
        );

      case 'menu':
        return (
          <MainMenu 
            onStartNewGame={handleNavigateToCreation}
            onContinueGame={handleContinueGame}
            onOpenSettings={handleNavigateToSettings}
            hasSavedGame={hasSavedGame}
          />
        );

      case 'creation':
        return (
          <CharacterCreation 
            onStart={handleStartGame} 
            onCancel={handleNavigateToMenu}
          />
        );
      
      case 'game':
        return (
          <div className="min-h-screen bg-slate-900 text-slate-200 p-4 md:p-8 flex flex-col items-center">
            <div className="w-full max-w-5xl">
              <header className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-yellow-400 py-2">
                  Đấu La Đại Lục: Long Vương Sim
                </h1>
              </header>

              {error && <div className="bg-red-800/50 border border-red-600 text-red-200 p-4 rounded-lg mb-6 text-center">{error}</div>}

              <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                  <PlayerStats player={player} />
                  <ActionBar 
                    onCultivate={handleCultivate} 
                    onHunt={handleHunt}
                    onSaveGame={handleSaveGame}
                    onBackToMenu={handleNavigateToMenu}
                    isLoading={gameState === GameState.Loading}
                    canHunt={canHunt}
                  />
                </div>

                <div className="lg:col-span-2">
                  <EventLog events={events} isLoading={gameState === GameState.Loading}/>
                </div>
              </main>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return renderContent();
};

export default App;
