
import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../gameEngine';
import { TILE_SIZE, COLORS } from '../constants';
import { Faction, EntityType } from '../types';

interface GameMapProps {
  engine: GameEngine;
  onSelect: (id: string | null) => void;
}

const GameMap: React.FC<GameMapProps> = ({ engine, onSelect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [touchStart, setTouchStart] = useState< { x: number, y: number } | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      engine.update(deltaTime);

      // Clear
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(offset.x, offset.y);

      // Draw Grid
      ctx.strokeStyle = '#2d3748';
      ctx.lineWidth = 1;
      for (let x = 0; x <= 40; x++) {
        ctx.beginPath();
        ctx.moveTo(x * TILE_SIZE, 0);
        ctx.lineTo(x * TILE_SIZE, 40 * TILE_SIZE);
        ctx.stroke();
      }
      for (let y = 0; y <= 40; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * TILE_SIZE);
        ctx.lineTo(40 * TILE_SIZE, y * TILE_SIZE);
        ctx.stroke();
      }

      // Draw Resources
      engine.resources.forEach(res => {
        ctx.fillStyle = res.name === 'Forest' ? COLORS.NEUTRAL.WOOD : COLORS.NEUTRAL.GOLD;
        ctx.beginPath();
        if (res.name === 'Forest') {
            ctx.moveTo(res.pos.x * TILE_SIZE + 20, res.pos.y * TILE_SIZE + 5);
            ctx.lineTo(res.pos.x * TILE_SIZE + 5, res.pos.y * TILE_SIZE + 35);
            ctx.lineTo(res.pos.x * TILE_SIZE + 35, res.pos.y * TILE_SIZE + 35);
            ctx.fill();
        } else {
            ctx.fillRect(res.pos.x * TILE_SIZE + 4, res.pos.y * TILE_SIZE + 4, 32, 32);
        }
      });

      // Draw Units
      engine.units.forEach(unit => {
        const color = unit.faction === Faction.HUMAN ? COLORS.HUMAN.PRIMARY : COLORS.ORC.PRIMARY;
        ctx.fillStyle = color;
        
        // Selection Circle
        if (unit.id === engine.selectedEntityId) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(unit.pos.x * TILE_SIZE + 20, unit.pos.y * TILE_SIZE + 20, 22, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Body
        ctx.beginPath();
        ctx.arc(unit.pos.x * TILE_SIZE + 20, unit.pos.y * TILE_SIZE + 20, 12, 0, Math.PI * 2);
        ctx.fill();

        // HP Bar
        const hpPercent = unit.hp / unit.maxHp;
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(unit.pos.x * TILE_SIZE + 5, unit.pos.y * TILE_SIZE - 5, 30, 4);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(unit.pos.x * TILE_SIZE + 5, unit.pos.y * TILE_SIZE - 5, 30 * hpPercent, 4);
      });

      ctx.restore();
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [engine, offset]);

  const handlePointerDown = (e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left - offset.x;
    const y = e.clientY - rect.top - offset.y;
    
    setTouchStart({ x: e.clientX, y: e.clientY });

    const worldX = x / TILE_SIZE;
    const worldY = y / TILE_SIZE;

    if (engine.selectedEntityId) {
      // If something selected, issue order
      engine.issueOrder(engine.selectedEntityId, worldX, worldY);
      // Optional: keep selection or deselect
    } else {
      const selected = engine.selectAt(worldX, worldY);
      onSelect(selected?.id || null);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!touchStart) return;
    // Simple drag to pan
    const dx = e.clientX - touchStart.x;
    const dy = e.clientY - touchStart.y;
    setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    setTouchStart({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = () => {
    setTouchStart(null);
  };

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="cursor-crosshair block"
    />
  );
};

export default GameMap;
