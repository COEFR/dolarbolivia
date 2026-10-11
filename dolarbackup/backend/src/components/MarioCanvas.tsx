import React, { useRef, useEffect, useCallback } from 'react';
import { LevelData, Entity, Block, MarioState, GameStats } from '@/types/mario';
import { soundManager } from '@/utils/audio';

interface MarioCanvasProps {
  level: LevelData;
  stats: GameStats;
  isPaused: boolean;
  activeKeys: Set<string>;
  onUpdateStats: (updater: (prev: GameStats) => GameStats) => void;
  onGameOver: () => void;
  onLevelComplete: () => void;
}

export const MarioCanvas: React.FC<MarioCanvasProps> = ({
  level,
  stats,
  isPaused,
  activeKeys,
  onUpdateStats,
  onGameOver,
  onLevelComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game Engine State
  const gameStateRef = useRef({
    mario: {
      x: level.spawnX * 32,
      y: level.spawnY * 32,
      vx: 0,
      vy: 0,
      width: 28,
      height: 32,
      state: 'small' as MarioState,
      facing: 'right' as 'left' | 'right',
      isGrounded: false,
      invulnerableTimer: 0,
      isDying: false,
      deathTimer: 0,
      animFrame: 0,
      animTimer: 0,
    },
    cameraX: 0,
    blocks: JSON.parse(JSON.stringify(level.blocks)) as Block[],
    entities: [] as Entity[],
    fireballs: [] as Array<{ x: number; y: number; vx: number; vy: number; bounces: number }>,
    particleEffects: [] as Array<{ x: number; y: number; vx: number; vy: number; color: string; life: number }>,
    flagCaptured: false,
    levelTimer: 300,
  });

  // Initialize Entities from Level Data
  useEffect(() => {
    const initialEntities: Entity[] = [];
    
    level.enemies.forEach((e, index) => {
      initialEntities.push({
        id: `enemy_${index}_${Date.now()}`,
        x: e.x * 32,
        y: e.y * 32,
        vx: -1.2,
        vy: 0,
        width: 30,
        height: 30,
        type: e.type,
        state: 'normal',
        isGrounded: true,
        facing: 'left',
        animFrame: 0,
      });
    });

    level.coins.forEach((c, index) => {
      initialEntities.push({
        id: `coin_${index}`,
        x: c.x * 32 + 8,
        y: c.y * 32 + 8,
        vx: 0,
        vy: 0,
        width: 16,
        height: 16,
        type: 'coin',
      });
    });

    gameStateRef.current.mario = {
      x: level.spawnX * 32,
      y: level.spawnY * 32,
      vx: 0,
      vy: 0,
      width: 28,
      height: 32,
      state: 'small',
      facing: 'right',
      isGrounded: false,
      invulnerableTimer: 0,
      isDying: false,
      deathTimer: 0,
      animFrame: 0,
      animTimer: 0,
    };

    gameStateRef.current.cameraX = 0;
    gameStateRef.current.blocks = JSON.parse(JSON.stringify(level.blocks));
    gameStateRef.current.entities = initialEntities;
    gameStateRef.current.fireballs = [];
    gameStateRef.current.particleEffects = [];
    gameStateRef.current.flagCaptured = false;
    gameStateRef.current.levelTimer = 300;
  }, [level]);

  // Main Physics and Render Game Loop
  const updateAndRender = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameStateRef.current;
    const mario = state.mario;

    // --- GAME LOGIC UPDATE ---
    if (!isPaused) {
      // 1. Mario Death logic
      if (mario.isDying) {
        mario.deathTimer++;
        mario.y += mario.vy;
        mario.vy += 0.5; // Gravity during death
        if (mario.deathTimer > 120) {
          onGameOver();
        }
      } else if (!state.flagCaptured) {
        // Invulnerability Timer countdown
        if (mario.invulnerableTimer > 0) {
          mario.invulnerableTimer--;
        }

        // Mario Controls Input Handling
        const speed = activeKeys.has('KeyZ') || activeKeys.has('ShiftLeft') ? 4.5 : 3.0;
        const accel = 0.4;
        const friction = 0.82;

        if (activeKeys.has('ArrowLeft') || activeKeys.has('KeyA')) {
          mario.vx -= accel;
          mario.facing = 'left';
        } else if (activeKeys.has('ArrowRight') || activeKeys.has('KeyD')) {
          mario.vx += accel;
          mario.facing = 'right';
        } else {
          mario.vx *= friction;
        }

        // Clamp Speed
        if (mario.vx > speed) mario.vx = speed;
        if (mario.vx < -speed) mario.vx = -speed;
        if (Math.abs(mario.vx) < 0.1) mario.vx = 0;

        // Jump
        if ((activeKeys.has('Space') || activeKeys.has('ArrowUp') || activeKeys.has('KeyW')) && mario.isGrounded) {
          mario.vy = mario.state === 'small' ? -11.5 : -12.5;
          mario.isGrounded = false;
          soundManager.playJump();
        }

        // Gravity
        mario.vy += 0.65; // Gravity constant
        if (mario.vy > 12) mario.vy = 12; // Terminal velocity

        // Update Mario Position X
        mario.x += mario.vx;
        if (mario.x < state.cameraX) mario.x = state.cameraX; // Prevent walking back offscreen

        // Horizontal Collision with Blocks
        state.blocks.forEach((block) => {
          const bx = block.x * 32;
          const by = block.y * 32;
          const marioHeight = mario.state === 'small' ? 32 : 52;

          if (
            mario.x < bx + 32 &&
            mario.x + mario.width > bx &&
            mario.y < by + 32 &&
            mario.y + marioHeight > by
          ) {
            if (mario.vx > 0) {
              mario.x = bx - mario.width;
              mario.vx = 0;
            } else if (mario.vx < 0) {
              mario.x = bx + 32;
              mario.vx = 0;
            }
          }
        });

        // Update Mario Position Y
        const currentMarioHeight = mario.state === 'small' ? 32 : 52;
        mario.y += mario.vy;
        mario.isGrounded = false;

        // Vertical Collision with Blocks
        state.blocks.forEach((block) => {
          const bx = block.x * 32;
          const by = block.y * 32;

          if (
            mario.x + 4 < bx + 32 &&
            mario.x + mario.width - 4 > bx &&
            mario.y < by + 32 &&
            mario.y + currentMarioHeight > by
          ) {
            if (mario.vy > 0) {
              // Landing on top of block
              mario.y = by - currentMarioHeight;
              mario.vy = 0;
              mario.isGrounded = true;
            } else if (mario.vy < 0) {
              // Hitting block from below
              mario.y = by + 32;
              mario.vy = 0;

              // Hit question block or brick
              if (!block.isHit) {
                if (block.type === 'question') {
                  block.isHit = true;
                  soundManager.playCoin();
                  if (block.content === 'mushroom' || block.content === 'flower' || block.content === 'star') {
                    // Spawn powerup item
                    state.entities.push({
                      id: `item_${Date.now()}`,
                      x: bx + 4,
                      y: by - 32,
                      vx: 1.5,
                      vy: 0,
                      width: 24,
                      height: 24,
                      type: block.content === 'flower' && mario.state === 'small' ? 'mushroom' : block.content,
                      state: 'normal',
                      isGrounded: true,
                    });
                  } else {
                    // Coin bonus
                    onUpdateStats((prev) => ({ ...prev, score: prev.score + 200, coins: prev.coins + 1 }));
                  }
                } else if (block.type === 'brick') {
                  if (mario.state !== 'small') {
                    // Break brick
                    soundManager.playBreak();
                    state.blocks = state.blocks.filter((b) => b.id !== block.id);
                    onUpdateStats((prev) => ({ ...prev, score: prev.score + 50 }));
                  } else {
                    soundManager.playStomp();
                  }
                }
              }
            }
          }
        });

        // Check Fall down Pit
        if (mario.y > 500) {
          mario.isDying = true;
          mario.vy = -10;
          soundManager.playGameOver();
        }

        // Camera Follow Mario
        if (mario.x - state.cameraX > 320) {
          state.cameraX = mario.x - 320;
        }

        // Check Flagpole Level Complete Trigger
        if (mario.x >= level.flagX * 32) {
          state.flagCaptured = true;
          soundManager.playFlagpole();
          onUpdateStats((prev) => ({ ...prev, score: prev.score + 1000 }));
          setTimeout(() => {
            onLevelComplete();
          }, 3000);
        }

        // 2. Update Entities (Enemies & Items)
        state.entities.forEach((entity) => {
          if (entity.state === 'squished') return;

          if (entity.type === 'goomba' || entity.type === 'koopa' || entity.type === 'mushroom' || entity.type === 'star') {
            entity.x += entity.vx;

            // Block collision for entities
            state.blocks.forEach((block) => {
              const bx = block.x * 32;
              const by = block.y * 32;
              if (
                entity.x < bx + 32 &&
                entity.x + entity.width > bx &&
                entity.y < by + 32 &&
                entity.y + entity.height > by
              ) {
                entity.vx *= -1; // Bounce back
              }
            });

            // Gravity for entities
            entity.vy = (entity.vy || 0) + 0.5;
            entity.y += entity.vy;

            // Floor check for entities
            state.blocks.forEach((block) => {
              const bx = block.x * 32;
              const by = block.y * 32;
              if (
                entity.x < bx + 32 &&
                entity.x + entity.width > bx &&
                entity.y + entity.height > by &&
                entity.y < by + 32
              ) {
                entity.y = by - entity.height;
                entity.vy = 0;
              }
            });
          }

          // Check Collision Mario vs Entities
          if (
            mario.x < entity.x + entity.width &&
            mario.x + mario.width > entity.x &&
            mario.y < entity.y + entity.height &&
            mario.y + currentMarioHeight > entity.y
          ) {
            if (entity.type === 'coin') {
              soundManager.playCoin();
              onUpdateStats((prev) => ({ ...prev, score: prev.score + 200, coins: prev.coins + 1 }));
              entity.state = 'squished'; // Remove coin
            } else if (entity.type === 'mushroom') {
              soundManager.playPowerup();
              mario.state = 'super';
              onUpdateStats((prev) => ({ ...prev, score: prev.score + 1000 }));
              entity.state = 'squished';
            } else if (entity.type === 'flower') {
              soundManager.playPowerup();
              mario.state = 'fire';
              onUpdateStats((prev) => ({ ...prev, score: prev.score + 1000 }));
              entity.state = 'squished';
            } else if (entity.type === 'goomba' || entity.type === 'koopa' || entity.type === 'piranha') {
              // Stomp check from top
              if (mario.vy > 0 && mario.y + currentMarioHeight - mario.vy <= entity.y + 12) {
                soundManager.playStomp();
                mario.vy = -8; // Bounce Mario up
                entity.state = 'squished';
                onUpdateStats((prev) => ({ ...prev, score: prev.score + 100 }));
              } else if (mario.invulnerableTimer === 0) {
                // Mario takes damage
                if (mario.state === 'super' || mario.state === 'fire') {
                  soundManager.playPowerdown();
                  mario.state = 'small';
                  mario.invulnerableTimer = 90; // 1.5s invulnerability flash
                } else {
                  // Mario dies
                  mario.isDying = true;
                  mario.vy = -10;
                  soundManager.playGameOver();
                }
              }
            }
          }
        });

        // Filter out consumed or dead entities
        state.entities = state.entities.filter((e) => e.state !== 'squished');
      }
    }

    // --- CANVAS RENDERING ---
    // Background color based on level theme
    ctx.fillStyle = level.theme === 'underground' ? '#000000' : '#5c94fc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Scroll camera
    ctx.translate(-Math.floor(state.cameraX), 0);

    // 1. Render Blocks
    state.blocks.forEach((block) => {
      const bx = block.x * 32;
      const by = block.y * 32;

      // Skip offscreen blocks for performance optimization
      if (bx + 32 < state.cameraX || bx > state.cameraX + canvas.width + 32) return;

      if (block.type === 'ground') {
        ctx.fillStyle = '#c84c0c';
        ctx.fillRect(bx, by, 32, 32);
        ctx.fillStyle = '#00a800';
        ctx.fillRect(bx, by, 32, 6);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(bx, by, 32, 32);
      } else if (block.type === 'underground_ground') {
        ctx.fillStyle = '#0050b0';
        ctx.fillRect(bx, by, 32, 32);
        ctx.strokeStyle = '#002060';
        ctx.strokeRect(bx, by, 32, 32);
      } else if (block.type === 'brick' || block.type === 'underground_brick') {
        ctx.fillStyle = block.type === 'underground_brick' ? '#0070ec' : '#b84418';
        ctx.fillRect(bx, by, 32, 32);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(bx, by, 32, 32);
        // Brick details
        ctx.fillStyle = '#000';
        ctx.fillRect(bx, by + 15, 32, 2);
        ctx.fillRect(bx + 15, by, 2, 15);
        ctx.fillRect(bx + 8, by + 15, 2, 17);
      } else if (block.type === 'question') {
        if (block.isHit) {
          ctx.fillStyle = '#8c8c8c';
          ctx.fillRect(bx, by, 32, 32);
          ctx.strokeStyle = '#000';
          ctx.strokeRect(bx, by, 32, 32);
        } else {
          ctx.fillStyle = '#fc9838';
          ctx.fillRect(bx, by, 32, 32);
          ctx.strokeStyle = '#000';
          ctx.strokeRect(bx, by, 32, 32);
          ctx.fillStyle = '#000';
          ctx.font = 'bold 20px monospace';
          ctx.fillText('?', bx + 10, by + 23);
        }
      } else if (block.type === 'pipe_top_left' || block.type === 'pipe_top_right') {
        ctx.fillStyle = '#00a800';
        ctx.fillRect(bx, by, 32, 32);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(bx, by, 32, 32);
      } else if (block.type === 'pipe_body_left' || block.type === 'pipe_body_right') {
        ctx.fillStyle = '#008800';
        ctx.fillRect(bx, by, 32, 32);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(bx, by, 32, 32);
      } else if (block.type === 'hard_block') {
        ctx.fillStyle = '#000';
        ctx.fillRect(bx, by, 32, 32);
        ctx.fillStyle = '#fc9838';
        ctx.fillRect(bx + 2, by + 2, 28, 28);
      }
    });

    // 2. Render Flagpole
    const fx = level.flagX * 32;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(fx + 14, 3 * 32, 4, 10 * 32); // Pole
    ctx.fillStyle = '#fc9838';
    ctx.beginPath();
    ctx.arc(fx + 16, 3 * 32, 10, 0, Math.PI * 2); // Top sphere
    ctx.fill();
    // Green Flag
    ctx.fillStyle = '#00a800';
    ctx.beginPath();
    ctx.moveTo(fx + 14, 3.5 * 32);
    ctx.lineTo(fx - 24, 4 * 32);
    ctx.lineTo(fx + 14, 4.5 * 32);
    ctx.fill();

    // 3. Render Entities (Enemies & Items)
    state.entities.forEach((entity) => {
      const ex = entity.x;
      const ey = entity.y;

      if (entity.type === 'goomba') {
        ctx.fillStyle = '#a84000';
        ctx.beginPath();
        ctx.arc(ex + 15, ey + 15, 14, 0, Math.PI * 2);
        ctx.fill();
        // Goomba eyes
        ctx.fillStyle = '#fff';
        ctx.fillRect(ex + 6, ey + 10, 4, 8);
        ctx.fillRect(ex + 20, ey + 10, 4, 8);
      } else if (entity.type === 'koopa') {
        ctx.fillStyle = '#00a800';
        ctx.fillRect(ex + 4, ey + 4, 22, 22);
        ctx.fillStyle = '#fc9838';
        ctx.fillRect(ex + 8, ey, 14, 10);
      } else if (entity.type === 'piranha') {
        ctx.fillStyle = '#e40058';
        ctx.beginPath();
        ctx.arc(ex + 15, ey + 15, 12, 0, Math.PI * 2);
        ctx.fill();
      } else if (entity.type === 'coin') {
        ctx.fillStyle = '#f8d800';
        ctx.beginPath();
        ctx.ellipse(ex + 8, ey + 8, 6, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (entity.type === 'mushroom') {
        ctx.fillStyle = '#e40058';
        ctx.beginPath();
        ctx.arc(ex + 12, ey + 10, 10, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#f8d878';
        ctx.fillRect(ex + 6, ey + 10, 12, 12);
      } else if (entity.type === 'flower') {
        ctx.fillStyle = '#fc9838';
        ctx.beginPath();
        ctx.arc(ex + 12, ey + 12, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ex + 12, ey + 12, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 4. Render Mario
    const mHeight = mario.state === 'small' ? 32 : 52;
    const isFlashing = mario.invulnerableTimer > 0 && Math.floor(mario.invulnerableTimer / 4) % 2 === 0;

    if (!isFlashing) {
      const mx = mario.x;
      const my = mario.y;

      // Suit color
      if (mario.state === 'fire') ctx.fillStyle = '#ffffff';
      else ctx.fillStyle = '#e40058'; // Classic red shirt/cap

      // Cap
      ctx.fillRect(mx + 4, my, 22, 8);
      // Face
      ctx.fillStyle = '#f8d878';
      ctx.fillRect(mx + 6, my + 8, 18, 10);
      // Overalls / Clothes
      ctx.fillStyle = mario.state === 'fire' ? '#e40058' : '#0000fc';
      ctx.fillRect(mx + 2, my + 18, 24, mHeight - 18);
    }

    ctx.restore();
  }, [isPaused, activeKeys, level, onGameOver, onLevelComplete, onUpdateStats]);

  useEffect(() => {
    let animationFrameId: number;

    const renderLoop = () => {
      updateAndRender();
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [updateAndRender]);

  return (
    <div className="relative w-full max-w-4xl bg-black rounded-lg overflow-hidden shadow-2xl border-4 border-slate-800 flex justify-center">
      <canvas
        ref={canvasRef}
        width={800}
        height={480}
        className="w-full h-auto object-contain block bg-sky-300"
      />
    </div>
  );
};