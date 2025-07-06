export interface SpiritRing {
  year: number;
  color: string;
  ability: string;
  tailwindColor: string;
}

export interface Player {
  name: string;
  spiritSoul: string;
  background: string;
  spiritPower: number;
  spiritRings: SpiritRing[];
}

export interface GameEvent {
  id: string;
  message: string;
}

export enum GameState {
  Idle,
  Loading,
  Error,
}

export interface BackgroundOption {
    id: string;
    name: string;
    description: string;
    bonus: {
        spiritPower: number;
    };
}