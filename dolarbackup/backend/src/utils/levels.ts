import { Block, LevelData } from '@/types/mario';

export function createOverworldLevel(): LevelData {
  const width = 120; // 120 tiles wide
  const height = 15; // 15 tiles tall
  const blocks: Block[] = [];

  // Ground (y = 13 and 14) with a couple of gaps
  for (let x = 0; x < width; x++) {
    // Gap 1: x between 38 and 40
    // Gap 2: x between 72 and 74
    if ((x >= 38 && x <= 40) || (x >= 72 && x <= 74)) {
      continue;
    }
    blocks.push({ id: `g1_${x}`, x, y: 13, type: 'ground' });
    blocks.push({ id: `g2_${x}`, x, y: 14, type: 'ground' });
  }

  // Question blocks and Bricks - Section 1
  blocks.push({ id: 'q1', x: 10, y: 9, type: 'question', content: 'coin' });
  blocks.push({ id: 'b1', x: 14, y: 9, type: 'brick' });
  blocks.push({ id: 'q2', x: 15, y: 9, type: 'question', content: 'mushroom' });
  blocks.push({ id: 'b2', x: 16, y: 9, type: 'brick' });
  blocks.push({ id: 'q3', x: 17, y: 9, type: 'question', content: 'coin' });
  blocks.push({ id: 'b3', x: 18, y: 9, type: 'brick' });

  // Elevated question block
  blocks.push({ id: 'q4', x: 15, y: 5, type: 'question', content: 'star' });

  // Pipes
  const addPipe = (pipeX: number, pipeHeight: number) => {
    const topY = 13 - pipeHeight;
    blocks.push({ id: `p_tl_${pipeX}`, x: pipeX, y: topY, type: 'pipe_top_left' });
    blocks.push({ id: `p_tr_${pipeX}`, x: pipeX + 1, y: topY, type: 'pipe_top_right' });
    for (let py = topY + 1; py < 13; py++) {
      blocks.push({ id: `p_bl_${pipeX}_${py}`, x: pipeX, y: py, type: 'pipe_body_left' });
      blocks.push({ id: `p_br_${pipeX}_${py}`, x: pipeX + 1, y: py, type: 'pipe_body_right' });
    }
  };

  addPipe(22, 2);
  addPipe(30, 3);
  addPipe(35, 4);

  // Section 2: Bricks with flower
  blocks.push({ id: 'b4', x: 45, y: 9, type: 'brick' });
  blocks.push({ id: 'q5', x: 46, y: 9, type: 'question', content: 'flower' });
  blocks.push({ id: 'b5', x: 47, y: 9, type: 'brick' });

  // High brick line
  for (let bx = 52; bx <= 58; bx++) {
    blocks.push({ id: `b_h_${bx}`, x: bx, y: 5, type: 'brick' });
  }

  addPipe(62, 3);
  addPipe(68, 2);

  // Staircase 1
  for (let i = 1; i <= 4; i++) {
    for (let j = 0; j < i; j++) {
      blocks.push({ id: `st1_${i}_${j}`, x: 78 + (i - 1), y: 13 - 1 - j, type: 'hard_block' });
    }
  }

  // Staircase 2 down
  for (let i = 4; i >= 1; i--) {
    for (let j = 0; j < i; j++) {
      blocks.push({ id: `st2_${i}_${j}`, x: 82 + (4 - i), y: 13 - 1 - j, type: 'hard_block' });
    }
  }

  // Final stairs before Flag
  for (let i = 1; i <= 8; i++) {
    for (let j = 0; j < i; j++) {
      blocks.push({ id: `st_final_${i}_${j}`, x: 98 + (i - 1), y: 13 - 1 - j, type: 'hard_block' });
    }
  }

  return {
    id: '1-1',
    name: 'Mundo 1-1',
    theme: 'overworld',
    width,
    height,
    blocks,
    enemies: [
      { type: 'goomba', x: 16, y: 12 },
      { type: 'goomba', x: 26, y: 12 },
      { type: 'goomba', x: 32, y: 12 },
      { type: 'koopa', x: 48, y: 12 },
      { type: 'goomba', x: 55, y: 4 },
      { type: 'goomba', x: 65, y: 12 },
      { type: 'koopa', x: 84, y: 12 },
      { type: 'piranha', x: 35, y: 8 },
      { type: 'piranha', x: 62, y: 9 },
    ],
    coins: [
      { x: 12, y: 12 },
      { x: 13, y: 12 },
      { x: 53, y: 4 },
      { x: 54, y: 4 },
      { x: 55, y: 4 },
      { x: 56, y: 4 },
      { x: 57, y: 4 },
    ],
    flagX: 108,
    spawnX: 2,
    spawnY: 11,
  };
}

export function createUndergroundLevel(): LevelData {
  const width = 100;
  const height = 15;
  const blocks: Block[] = [];

  // Underground ground and ceiling
  for (let x = 0; x < width; x++) {
    blocks.push({ id: `ug_g1_${x}`, x, y: 13, type: 'underground_ground' });
    blocks.push({ id: `ug_g2_${x}`, x, y: 14, type: 'underground_ground' });
    blocks.push({ id: `ug_c_${x}`, x, y: 0, type: 'underground_ground' });
  }

  // Underground brick clusters
  for (let x = 12; x <= 22; x++) {
    blocks.push({ id: `ug_b1_${x}`, x, y: 9, type: 'underground_brick' });
  }
  blocks.push({ id: 'ug_q1', x: 16, y: 9, type: 'question', content: 'flower' });

  for (let x = 30; x <= 42; x++) {
    blocks.push({ id: `ug_b2_${x}`, x, y: 6, type: 'underground_brick' });
  }

  return {
    id: '1-2',
    name: 'Mundo 1-2 (Subterráneo)',
    theme: 'underground',
    width,
    height,
    blocks,
    enemies: [
      { type: 'goomba', x: 14, y: 12 },
      { type: 'goomba', x: 18, y: 12 },
      { type: 'koopa', x: 35, y: 5 },
      { type: 'goomba', x: 50, y: 12 },
    ],
    coins: [
      { x: 31, y: 5 },
      { x: 33, y: 5 },
      { x: 35, y: 5 },
      { x: 37, y: 5 },
      { x: 39, y: 5 },
    ],
    flagX: 90,
    spawnX: 2,
    spawnY: 11,
  };
}