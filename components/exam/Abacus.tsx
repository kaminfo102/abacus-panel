"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Abacus } from "../../lib/abacusReact";

interface AbacusProps {
  onNumberChange?: (number: number) => void;
}

export function AbacusComponent({ onNumberChange }: AbacusProps) {
  const abacusContainerRef = useRef<HTMLDivElement>(null);
  const abacusInstanceRef = useRef<Abacus | null>(null);
  const [currentNumber, setCurrentNumber] = useState<number>(0);

  useEffect(() => {
    if (!abacusContainerRef.current) return;

    abacusContainerRef.current.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.id = 'abacus-canvas';
    abacusContainerRef.current.appendChild(canvas);

    function calculateDimensions() {
      const containerWidth = abacusContainerRef.current?.clientWidth || window.innerWidth;
      const isMobile = window.innerWidth < 768;
      const width = isMobile 
        ? Math.min(containerWidth - 32, 400)
        : Math.min(Math.max(containerWidth - 64, 300), 800);
      const height = Math.max(Math.round(width * 0.6), 200);
      return { width, height, isMobile };
    }

    const { width, height, isMobile } = calculateDimensions();
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width}px`;
    canvas.style.minWidth = `${width}px`;
    canvas.style.maxWidth = isMobile ? '400px' : '800px';
    canvas.style.height = 'auto';
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';

    const abacus = new Abacus(10, 'normal', 'black', false, false);
    abacusInstanceRef.current = abacus;
    abacus.setCanvas(canvas);

    function resizeCanvas() {
      const { width, height, isMobile } = calculateDimensions();
      
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        canvas.style.maxWidth = isMobile ? '400px' : '800px';
        
        if (abacusInstanceRef.current) {
          abacusInstanceRef.current.setCanvas(canvas);
          abacusInstanceRef.current.draw();
        }
      }
    }

    function handleClick(e: MouseEvent) {
      if (!abacusInstanceRef.current) return;
      
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      
      abacusInstanceRef.current.handleClick(x, y);
      const newNumber = abacusInstanceRef.current.getCurrentNumber();
      setCurrentNumber(newNumber);
      if (onNumberChange) {
        onNumberChange(newNumber);
      }
    }

    function handleTouch(e: TouchEvent) {
      if (!abacusInstanceRef.current) return;
      
      e.preventDefault();
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const x = (touch.clientX - rect.left) * scaleX;
        const y = (touch.clientY - rect.top) * scaleY;
        
        abacusInstanceRef.current.handleClick(x, y);
        const newNumber = abacusInstanceRef.current.getCurrentNumber();
        setCurrentNumber(newNumber);
        if (onNumberChange) {
          onNumberChange(newNumber);
        }
      }
    }

    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleTouch, { passive: false });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('touchstart', handleTouch);
      if (abacusContainerRef.current) {
        abacusContainerRef.current.innerHTML = '';
      }
    };
  }, [onNumberChange]);

  const handleReset = () => {
    if (abacusInstanceRef.current) {
      abacusInstanceRef.current.reset();
      const newNumber = 0;
      setCurrentNumber(newNumber);
      if (onNumberChange) {
        onNumberChange(newNumber);
      }
    }
  };

  return (
    <Card className="p-0 mb-1 border-none shadow-none bg-transparent">
      <div className="flex flex-col items-center w-full">
        <div className="w-full bg-primary/5 rounded-lg p-2 sm:p-3 mb-2">
          <p className="text-center text-base sm:text-lg font-bold text-primary mt-1">
            عدد فعلی: <span className="text-xl sm:text-2xl text-primary-foreground bg-primary px-2 sm:px-3 py-1 rounded-md inline-block min-w-[60px]">{currentNumber}</span>
          </p>
          <div className="flex justify-center mt-2 mb-1">
            <Button 
              onClick={handleReset} 
              variant="outline" 
              size="sm"
              className="bg-white hover:bg-primary/10 text-primary border-primary/20 hover:border-primary/30 transition-colors duration-200 text-sm sm:text-base"
            >
              صفر کردن چرتکه
            </Button>
          </div>
        </div>
        <div
          ref={abacusContainerRef}
          className="flex flex-col justify-center items-center w-full px-4 sm:px-8"
          style={{ 
            minHeight: '120px',
            width: '100%',
            overflowX: 'auto',
            overflowY: 'hidden',
            padding: 0,
            margin: 0,
            WebkitOverflowScrolling: 'touch',
            maxWidth: '100vw',
            boxSizing: 'border-box'
          }}
        ></div>
      </div>
    </Card>
  );
} 