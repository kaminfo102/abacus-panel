"use client";

// Simplified abacus functionality for React components

// Constants
const DISTANCE_RODS = 60;
const TOP_MARGIN = 60;
const NUMBER_HEIGHT = 20;
const LEFT_MARGIN = 10;
const FRAME_LINE_WIDTH = 10;
const ROD_STROKE_STYLE = 'rgba(212,85,0,0.5)';
const ROD_LINE_WIDTH = 6;
const DOT_STROKE_STYLE = 'rgba(0, 0, 0, 1)';
const DOT_FILL_STYLE = 'rgba(255, 255, 255, 1)';
const DOT_SIZE = 3;
const BEAD_WIDTH = 56;
const BEAD_HEIGHT = 30;
const BEAD_STROKE = 'black';
const HEAVEN = BEAD_HEIGHT * 2 + FRAME_LINE_WIDTH;
const EARTH = BEAD_HEIGHT * 5;
const HEIGHT = HEAVEN + EARTH + FRAME_LINE_WIDTH;

// Classes
class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

class Bead {
  rod: Rod;
  heaven: boolean;
  order: number;
  active: boolean;

  constructor(rod: Rod, heaven: boolean, order: number, active: boolean) {
    this.rod = rod;
    this.heaven = heaven;
    this.order = order;
    this.active = active;
  }

  getPoints(): Point[] {
    const points: Point[] = [];
    const center = this.evalPosition();
    const abacus = this.rod.abacus;
    const BEAD_WIDTH = abacus.BEAD_WIDTH;
    const BEAD_HEIGHT = abacus.BEAD_HEIGHT;
    points.push(new Point(center.x - BEAD_WIDTH / 2, center.y));
    points.push(new Point(center.x + BEAD_WIDTH / 2, center.y));
    points.push(new Point(center.x + BEAD_WIDTH / 6, center.y - BEAD_HEIGHT / 2));
    points.push(new Point(center.x - BEAD_WIDTH / 6, center.y - BEAD_HEIGHT / 2));
    points.push(new Point(center.x - BEAD_WIDTH / 2, center.y));
    points.push(new Point(center.x - BEAD_WIDTH / 6, center.y + BEAD_HEIGHT / 2));
    points.push(new Point(center.x + BEAD_WIDTH / 6, center.y + BEAD_HEIGHT / 2));
    points.push(new Point(center.x + BEAD_WIDTH / 2, center.y));
    return points;
  }

  evalPosition(): Point {
    const abacus = this.rod.abacus;
    const x = abacus.LEFT_MARGIN + this.rod.position * abacus.DISTANCE_RODS;
    let y: number;
    if (this.heaven) {
      if (this.active) {
        y = abacus.TOP_MARGIN + abacus.NUMBER_HEIGHT + abacus.HEAVEN - abacus.BEAD_HEIGHT / 2 - abacus.FRAME_LINE_WIDTH / 2;
      } else {
        y = abacus.TOP_MARGIN + abacus.NUMBER_HEIGHT + abacus.BEAD_HEIGHT / 2 + abacus.FRAME_LINE_WIDTH / 2;
      }
    } else {
      if (this.active) {
        y = abacus.TOP_MARGIN + abacus.NUMBER_HEIGHT + abacus.HEAVEN + (this.order - 1) * abacus.BEAD_HEIGHT + abacus.BEAD_HEIGHT / 2 + abacus.FRAME_LINE_WIDTH / 2;
      } else {
        y = abacus.TOP_MARGIN + abacus.NUMBER_HEIGHT + abacus.HEAVEN + this.order * abacus.BEAD_HEIGHT + abacus.BEAD_HEIGHT / 2 + abacus.FRAME_LINE_WIDTH / 2;
      }
    }
    return new Point(x, y);
  }

  createPath(context: CanvasRenderingContext2D): void {
    const points = this.getPoints();
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; ++i) {
      context.lineTo(points[i].x, points[i].y);
    }
  }

  draw(context: CanvasRenderingContext2D): void {
    context.save();
    context.shadowColor = 'rgba(0,0,0,0.5)';
    context.shadowOffsetX = 3;
    context.shadowOffsetY = 3;
    context.shadowBlur = 8;
    
    if (this.active) {
      context.fillStyle = 'sienna';
    } else {
      context.fillStyle = 'ivory';
    }
    
    if (this.rod.invisible) {
      context.globalAlpha = 0;
    } else if (this.rod.disabled) {
      context.globalAlpha = 0.1;
    } else {
      context.globalAlpha = 1;
    }
    
    context.strokeStyle = BEAD_STROKE;
    context.lineWidth = 1;
    this.createPath(context);
    context.fill();
    context.stroke();
    context.restore();
  }

  erase(context: CanvasRenderingContext2D): void {
    context.save();
    context.lineWidth = 0;
    context.fillStyle = "rgba(255,255,255,0)";
    this.createPath(context);
    context.fill();
    context.stroke();
    context.restore();
  }

  reset(): void {
    this.active = false;
  }
}

class Rod {
  abacus: Abacus;
  position: number;
  beads: Bead[];
  value: number;
  disabled: boolean;
  invisible: boolean;

  constructor(abacus: Abacus, position: number, beads: Bead[], value: number) {
    this.abacus = abacus;
    this.position = position;
    this.beads = beads;
    this.value = 0;
    this.disabled = false;
    this.invisible = false;
  }

  drawBeads(context: CanvasRenderingContext2D): void {
    for (let i = 0; i < this.beads.length; i++) {
      this.beads[i].draw(context);
    }
  }

  drawRod(context: CanvasRenderingContext2D): void {
    const abacus = this.abacus;
    context.save();
    context.strokeStyle = ROD_STROKE_STYLE;
    context.lineWidth = ROD_LINE_WIDTH;
    if (this.invisible) {
      context.globalAlpha = 0;
    } else if (this.disabled) {
      context.globalAlpha = 0.1;
    } else {
      context.globalAlpha = 1;
    }
    context.shadowColor = 'rgba(0,0,0,0.5)';
    context.shadowOffsetX = 3;
    context.shadowOffsetY = 3;
    context.shadowBlur = 8;
    context.beginPath();
    context.moveTo(this.evalXPos(), abacus.TOP_MARGIN + abacus.NUMBER_HEIGHT);
    context.lineTo(this.evalXPos(), abacus.TOP_MARGIN + abacus.NUMBER_HEIGHT + abacus.HEIGHT);
    context.stroke();
    context.restore();
  }

  draw(context: CanvasRenderingContext2D): void {
    this.drawRod(context);
    this.drawBeads(context);
  }

  evalXPos(): number {
    return this.abacus.LEFT_MARGIN + this.position * this.abacus.DISTANCE_RODS;
  }

  reset(): void {
    for (let i = 0; i < this.beads.length; i++) {
      this.beads[i].reset();
    }
    this.value = 0;
  }
}

export class Abacus {
  numberOfRods: number;
  rods: Rod[];
  mode: string;
  frameColor: string;
  showNumbers: boolean;
  middleRod: number;
  width: number;
  canvas: HTMLCanvasElement | null = null;
  context: CanvasRenderingContext2D | null = null;

  // ابعاد داینامیک
  DISTANCE_RODS: number = 60;
  BEAD_WIDTH: number = 56;
  BEAD_HEIGHT: number = 30;
  LEFT_MARGIN: number = 10;
  TOP_MARGIN: number = 60;
  NUMBER_HEIGHT: number = 20;
  FRAME_LINE_WIDTH: number = 10;
  HEAVEN: number = 0;
  EARTH: number = 0;
  HEIGHT: number = 0;

  constructor(numberOfRods: number, mode: string, frameColor: string, showNumbers: boolean, clockMode: boolean) {
    const rods: Rod[] = [];
    for (let i = 0; i < numberOfRods; i++) {
      const beads: Bead[] = [];
      const rod = new Rod(this, i + 1, beads, 0);
      for (let j = 0; j < 5; j++) {
        let bead: Bead;
        if (j === 0) {
          bead = new Bead(rod, true, j, false);
        } else {
          bead = new Bead(rod, false, j, false);
        }
        beads.push(bead);
      }
      rods.push(rod);
    }
    this.numberOfRods = numberOfRods;
    this.rods = rods;
    this.mode = mode;
    this.frameColor = frameColor;
    this.showNumbers = showNumbers;
    this.middleRod = Math.floor(numberOfRods / 2) + 1;
    this.width = 0; // مقداردهی در setCanvas
  }

  setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    // محاسبه داینامیک ابعاد
    const availableWidth = canvas.width - 20;
    this.DISTANCE_RODS = availableWidth / (this.numberOfRods + 1);
    this.BEAD_WIDTH = this.DISTANCE_RODS * 0.9;
    this.BEAD_HEIGHT = this.BEAD_WIDTH * 0.55;
    this.LEFT_MARGIN = 10;
    this.TOP_MARGIN = 60;
    this.NUMBER_HEIGHT = 20;
    this.FRAME_LINE_WIDTH = 10;
    this.HEAVEN = this.BEAD_HEIGHT * 2 + this.FRAME_LINE_WIDTH;
    this.EARTH = this.BEAD_HEIGHT * 5;
    this.HEIGHT = this.HEAVEN + this.EARTH + this.FRAME_LINE_WIDTH;
    this.width = availableWidth;
    if (this.context) {
      this.draw();
    }
  }

  drawFrame(): void {
    if (!this.context || !this.canvas) return;
    
    this.context.save();
    this.context.strokeStyle = this.frameColor;
    this.context.lineWidth = this.FRAME_LINE_WIDTH;
    this.context.shadowColor = 'rgba(0,0,0,0.5)';
    this.context.shadowOffsetX = 3;
    this.context.shadowOffsetY = 3;
    this.context.shadowBlur = 8;
    
    this.context.beginPath();
    this.context.rect(this.LEFT_MARGIN, this.TOP_MARGIN + this.NUMBER_HEIGHT, this.width, this.HEIGHT);
    this.context.moveTo(this.LEFT_MARGIN + this.FRAME_LINE_WIDTH / 2, this.TOP_MARGIN + this.NUMBER_HEIGHT + this.HEAVEN);
    this.context.lineTo(this.LEFT_MARGIN + this.width - this.FRAME_LINE_WIDTH / 2, this.TOP_MARGIN + this.NUMBER_HEIGHT + this.HEAVEN);
    this.context.stroke();
    
    const middle = Math.floor(this.numberOfRods / 2);
    this.context.lineWidth = 1;
    this.context.strokeStyle = DOT_STROKE_STYLE;
    this.context.fillStyle = DOT_FILL_STYLE;
    
    for (let i = 0, x = this.LEFT_MARGIN + this.DISTANCE_RODS; i < this.numberOfRods; ++i, x += this.DISTANCE_RODS) {
      if ((i - middle) % 3 === 0) {
        this.context.beginPath();
        this.context.arc(x, this.TOP_MARGIN + this.NUMBER_HEIGHT + this.HEAVEN, DOT_SIZE, 0, Math.PI * 2, false);
        this.context.fill();
        this.context.stroke();
      }
    }
    
    this.context.restore();
  }

  drawRods(): void {
    if (!this.context) return;
    
    this.context.save();
    this.context.strokeStyle = ROD_STROKE_STYLE;
    this.context.lineWidth = ROD_LINE_WIDTH;
    
    for (let i = 0, x = this.LEFT_MARGIN + this.DISTANCE_RODS; i < this.numberOfRods; ++i, x += this.DISTANCE_RODS) {
      const rod = this.rods[i];
      rod.draw(this.context);
    }
    
    this.context.restore();
  }

  draw(): void {
    if (!this.context || !this.canvas) return;
    
    this.context.save();
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawRods();
    this.drawFrame();
    this.context.restore();
  }

  reset(): void {
    for (let i = 0; i < this.numberOfRods; i++) {
      const rod = this.rods[i];
      rod.reset();
    }
    this.showNumbers = true;
    this.draw();
  }

  handleClick(x: number, y: number): void {
    if (!this.context || !this.canvas) return;
    
    let found = false;
    for (let i = 0; i < this.numberOfRods && !found; i++) {
      const currentRod = this.rods[i];
      
      for (let j = 0; j < currentRod.beads.length && !found; j++) {
        const currentBead = currentRod.beads[j];
        currentBead.createPath(this.context);
        
        if (this.context.isPointInPath(x, y)) {
          found = true;
          this.clickedBead(currentBead);
          this.draw();
        }
      }
    }
  }

  clickedBead(bead: Bead): void {
    if (bead.heaven) {
      if (bead.active) {
        bead.active = false;
        bead.rod.value -= 5;
      } else {
        bead.active = true;
        bead.rod.value += 5;
      }
    } else {
      if (bead.active) {
        bead.active = false;
        bead.rod.value--;
        
        for (let i = bead.order + 1; i <= 4; i++) {
          const nextBead = this.getBead(bead.rod, false, i);
          if (nextBead && nextBead.active) {
            nextBead.active = false;
            nextBead.rod.value--;
          }
        }
      } else {
        bead.active = true;
        bead.rod.value++;
        
        for (let i = 1; i < bead.order; i++) {
          const nextBead = this.getBead(bead.rod, false, i);
          if (nextBead && !nextBead.active) {
            nextBead.active = true;
            nextBead.rod.value++;
          }
        }
      }
    }
  }

  getBead(rod: Rod, heaven: boolean, order: number): Bead | undefined {
    for (let i = 0; i < rod.beads.length; i++) {
      if (rod.beads[i].heaven === heaven && rod.beads[i].order === order) {
        return rod.beads[i];
      }
    }
    return undefined;
  }

  getCurrentNumber(): number {
    let total = 0;
    for (let i = 0; i < this.rods.length; i++) {
      total += this.rods[i].value * Math.pow(10, this.rods.length - 1 - i);
    }
    return total;
  }
} 