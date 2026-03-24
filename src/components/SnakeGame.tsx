import React, { useEffect, useRef, useState } from 'react';

const GRID_SIZE = 20;
const TILE_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * TILE_SIZE;

type Point = { x: number; y: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string };

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'PLAYING' | 'GAME_OVER' | 'PAUSED'>('PLAYING');
  
  // Game state refs to avoid re-renders during requestAnimationFrame
  const gameStateRef = useRef(gameState);
  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
  const dirRef = useRef<Point>({ x: 1, y: 0 });
  const nextDirRef = useRef<Point>({ x: 1, y: 0 });
  const foodRef = useRef<Point>({ x: 15, y: 10 });
  const particlesRef = useRef<Particle[]>([]);
  const shakeRef = useRef<number>(0);
  const lastMoveTimeRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const spawnFood = () => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const isOnSnake = snakeRef.current.some(s => s.x === newFood.x && s.y === newFood.y);
      if (!isOnSnake) break;
    }
    foodRef.current = newFood;
  };

  const spawnParticles = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x: x * TILE_SIZE + TILE_SIZE / 2,
        y: y * TILE_SIZE + TILE_SIZE / 2,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15,
        life: 1.0,
        maxLife: 0.5 + Math.random() * 0.5,
        color
      });
    }
  };

  const resetGame = () => {
    snakeRef.current = [{ x: 10, y: 10 }];
    dirRef.current = { x: 1, y: 0 };
    nextDirRef.current = { x: 1, y: 0 };
    scoreRef.current = 0;
    setScore(0);
    spawnFood();
    particlesRef.current = [];
    shakeRef.current = 0;
    setGameState('PLAYING');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling with spacebar
      if (e.key === ' ') e.preventDefault();

      if (gameStateRef.current === 'GAME_OVER') {
        if (e.key === 'Enter' || e.key === ' ') resetGame();
        return;
      }
      
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W':
          if (dirRef.current.y === 0) nextDirRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown': case 's': case 'S':
          if (dirRef.current.y === 0) nextDirRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft': case 'a': case 'A':
          if (dirRef.current.x === 0) nextDirRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight': case 'd': case 'D':
          if (dirRef.current.x === 0) nextDirRef.current = { x: 1, y: 0 };
          break;
        case ' ':
          setGameState(prev => prev === 'PLAYING' ? 'PAUSED' : 'PLAYING');
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      animationFrameId = requestAnimationFrame(loop);
      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      // Update Game Logic
      if (gameStateRef.current === 'PLAYING') {
        const speed = Math.max(40, 100 - Math.floor(scoreRef.current / 50) * 10);
        if (time - lastMoveTimeRef.current > speed) {
          lastMoveTimeRef.current = time;
          
          dirRef.current = nextDirRef.current;
          const head = snakeRef.current[0];
          const newHead = { x: head.x + dirRef.current.x, y: head.y + dirRef.current.y };

          // Wall collision
          if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
            setGameState('GAME_OVER');
            shakeRef.current = 25;
            spawnParticles(head.x, head.y, '#0ff', 40);
          } 
          // Self collision
          else if (snakeRef.current.some(s => s.x === newHead.x && s.y === newHead.y)) {
            setGameState('GAME_OVER');
            shakeRef.current = 25;
            spawnParticles(head.x, head.y, '#0ff', 40);
          } 
          else {
            snakeRef.current.unshift(newHead);
            
            // Food collision
            if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
              scoreRef.current += 10;
              setScore(scoreRef.current);
              shakeRef.current = 8;
              spawnParticles(foodRef.current.x, foodRef.current.y, '#f0f', 20);
              spawnFood();
            } else {
              snakeRef.current.pop();
            }
          }
        }
      }

      // Update particles
      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= deltaTime;
      });
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);

      // Update shake
      if (shakeRef.current > 0) {
        shakeRef.current -= deltaTime * 100;
        if (shakeRef.current < 0) shakeRef.current = 0;
      }

      // Draw
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      ctx.save();
      if (shakeRef.current > 0) {
        const dx = (Math.random() - 0.5) * shakeRef.current;
        const dy = (Math.random() - 0.5) * shakeRef.current;
        ctx.translate(dx, dy);
      }

      // Draw grid lines
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 1;
      for (let i = 0; i <= CANVAS_SIZE; i += TILE_SIZE) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, CANVAS_SIZE); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(CANVAS_SIZE, i); ctx.stroke();
      }

      // Draw food
      ctx.fillStyle = '#f0f';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#f0f';
      ctx.fillRect(foodRef.current.x * TILE_SIZE + 2, foodRef.current.y * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);

      // Draw snake
      snakeRef.current.forEach((segment, i) => {
        const isHead = i === 0;
        ctx.fillStyle = isHead ? '#fff' : '#0ff';
        ctx.shadowBlur = isHead ? 20 : 10;
        ctx.shadowColor = '#0ff';
        
        ctx.globalAlpha = Math.max(0.2, 1 - (i / snakeRef.current.length));
        ctx.fillRect(segment.x * TILE_SIZE + 1, segment.y * TILE_SIZE + 1, TILE_SIZE - 2, TILE_SIZE - 2);
      });
      ctx.globalAlpha = 1.0;

      // Draw particles
      particlesRef.current.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillRect(p.x, p.y, 4, 4);
      });
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;

      ctx.restore();
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-4 border-2 border-cyan-500 bg-black relative overflow-hidden shadow-[0_0_20px_rgba(0,255,255,0.2)]">
      <div className="w-full flex justify-between items-end mb-4 border-b-2 border-fuchsia-500 pb-2">
        <h2 className="text-lg md:text-xl font-digital text-cyan-400 glitch-text" data-text="SYS.SNAKE">
          SYS.SNAKE
        </h2>
        <div className="text-xs md:text-sm font-digital text-fuchsia-400">
          SCR:{score.toString().padStart(4, '0')}
        </div>
      </div>

      <div className="relative w-full max-w-[400px] aspect-square">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="bg-black border border-cyan-900 w-full h-full"
          style={{ imageRendering: 'pixelated' }}
        />
        
        {gameState === 'GAME_OVER' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10">
            <h3 className="text-xl md:text-2xl font-digital text-fuchsia-500 mb-6 glitch-text" data-text="FATAL_ERR">
              FATAL_ERR
            </h3>
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-transparent border-2 border-cyan-500 text-cyan-400 font-digital text-xs hover:bg-cyan-500 hover:text-black transition-colors uppercase shadow-[0_0_10px_rgba(0,255,255,0.5)] hover:shadow-[0_0_20px_rgba(0,255,255,0.8)]"
            >
              [ REBOOT ]
            </button>
          </div>
        )}
        
        {gameState === 'PAUSED' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10">
            <h3 className="text-xl font-digital text-cyan-500 mb-4 animate-pulse">
              HALTED
            </h3>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-cyan-700 text-[8px] md:text-[10px] font-digital w-full flex justify-between">
        <span>INPUT: WASD/ARROWS</span>
        <span>BRK: SPACE</span>
      </div>
    </div>
  );
}
