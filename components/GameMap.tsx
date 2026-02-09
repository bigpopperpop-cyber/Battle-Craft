import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../gameEngine';
import { TILE_SIZE, COLORS, MAP_SIZE } from '../constants';
import { Faction } from '../types';

interface GameMapProps {
  engine: GameEngine;
  onSelect: (id: string | null) => void;
}

const GameMap: React.FC<GameMapProps> = ({ engine, onSelect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridCacheRef = useRef<HTMLCanvasElement | null>(null);
  const [offset, setOffset] = useState({ x: 100, y: 100 });
  const lastPointer = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  // Cache the grid layer
  useEffect(() => {
    const gridCanvas = document.createElement('canvas');
    gridCanvas.width = MAP_SIZE * TILE_SIZE;
    gridCanvas.height = MAP_SIZE * TILE_SIZE;
    const gctx = gridCanvas.getContext('2d');
    if (gctx) {
      gctx.fillStyle = COLORS.NEUTRAL.GROUND;
      gctx.fillRect(0, 0, gridCanvas.width, gridCanvas.height);
      
      gctx.strokeStyle = COLORS.NEUTRAL.GRID;
      gctx.lineWidth = 1;
      for (let x = 0; x <= MAP_SIZE; x++) {
        gctx.beginPath();
        gctx.moveTo(x * TILE_SIZE, 0);
        gctx.lineTo(x * TILE_SIZE, MAP_SIZE * TILE_SIZE);
        gctx.stroke();
      }
      for (let y = 0; y <= MAP_SIZE; y++) {
        gctx.beginPath();
        gctx.moveTo(0, y * TILE_SIZE);
        gctx.lineTo(MAP_SIZE * TILE_SIZE, y * TILE_SIZE);
        gctx.stroke();
      }
    }
    gridCacheRef.current = gridCanvas;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;
      engine.update(deltaTime);

      // Background
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(offset.x, offset.y);

      // 1. Grid
      if (gridCacheRef.current) {
        ctx.drawImage(gridCacheRef.current, 0, 0);
      }

      // 2. Resources
      engine.resources.forEach(res => {
        const tx = res.pos.x * TILE_SIZE;
        const ty = res.pos.y * TILE_SIZE;
        if (res.name === 'Forest') {
          ctx.fillStyle = COLORS.NEUTRAL.WOOD;
          ctx.beginPath();
          ctx.moveTo(tx + 20, ty + 2);
          ctx.lineTo(tx + 5, ty + 38);
          ctx.lineTo(tx + 35, ty + 38);
          ctx.fill();
        } else {
          ctx.fillStyle = COLORS.NEUTRAL.GOLD;
          ctx.fillRect(tx + 4, ty + 4, 32, 32);
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1;
          ctx.strokeRect(tx + 8, ty + 8, 24, 24);
        }
      });

      // 3. Units
      engine.units.forEach(unit => {
        const tx = unit.pos.x * TILE_SIZE;
        const ty = unit.pos.y * TILE_SIZE;
        const color = unit.faction === Faction.HUMAN ? COLORS.HUMAN.PRIMARY : COLORS.ORC.PRIMARY;
        
        // Selection
        if (unit.id === engine.selectedEntityId) {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 2]);
          ctx.beginPath();
          ctx.arc(tx + 20, ty + 20, 22, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Unit Body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(tx + 20, ty + 20, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();

        // HP Bar
        const hpPct = unit.hp / unit.maxHp;
        const hpColor = hpPct > 0.6 ? '#22c55e' : hpPct > 0.25 ? '#eab308' : '#ef4444';
        ctx.fillStyle = '#000';
        ctx.fillRect(tx + 5, ty - 10, 30, 4);
        ctx.fillStyle = hpColor;
        ctx.fillRect(tx + 5, ty - 10, 30 * hpPct, 4);
      });

      ctx.restore();
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [engine, offset]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = false;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    canvasRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const dx = Math.abs(e.clientX - lastPointer.current.x);
    const dy = Math.abs(e.clientY - lastPointer.current.y);
    if (dx > 4 || dy > 4) {
      isDragging.current = true;
      setOffset(prev => ({
        x: prev.x + (e.clientX - lastPointer.current.x),
        y: prev.y + (e.clientY - lastPointer.current.y)
      }));
      lastPointer.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    canvasRef.current?.releasePointerCapture(e.pointerId);
    if (!isDragging.current) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const wx = (e.clientX - rect.left - offset.x) / TILE_SIZE;
      const wy = (e.clientY - rect.top - offset.y) / TILE_SIZE;

      if (engine.selectedEntityId) {
        engine.issueOrder(engine.selectedEntityId, wx, wy);
      } else {
        const sel = engine.selectAt(wx, wy);
        onSelect(sel?.id || null);
      }
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="block cursor-crosshair"
    />
  );
};

export default GameMap;