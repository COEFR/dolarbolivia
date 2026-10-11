export type MarioState = 'small' | 'super' | 'fire';

export type EnemyType = 'goomba' | 'koopa' | 'piranha';

export type BlockType = 'ground' | 'brick' | 'question' | 'pipe_top_left' | 'pipe_top_right' | 'pipe_body_left' | 'pipe_body_right' | 'hard_block' | 'underground_ground' | 'underground_brick';

export type ItemType = 'coin' | 'mushroom' | 'flower' | 'star';

export interface Entity {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  type: EnemyType | ItemType | 'fireball' | 'flag';
  isGrounded?: boolean;
  state?: 'normal' | 'squished' | 'shell' | 'shell_moving' | 'emerging';
  facing?: 'left' | 'right';
  animFrame?: number;
}

export interface Block {
  id: string;
  x: number;
  y: number;
  type: BlockType;
  content?: ItemType | 'coin' | null;
  coinsCount?: number;
  isHit?: boolean;
}

export interface LevelData {
  id: string;
  name: string;
  theme: 'overworld' | 'underground';
  width: number; // in tiles
  height: number; // in tiles (standard 15)
  blocks: Block[];
  enemies: Array<{ type: EnemyType; x: number; y: number }>;
  coins: Array<{ x: number; y: number }>;
  flagX: number;
  spawnX: number;
  spawnY: number;
}

export interface GameStats {
  score: number;
  coins: number;
  world: string;
  lives: number;
  time: number;
  highScore: number;
}