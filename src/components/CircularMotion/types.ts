// types.ts
export type ModeState =
  | ''
  | 'compare'
  | 'rainbow'
  | 'simplePosition'
  | 'simpleVelocity'
  | 'simpleAcceleration';

export interface Point {
  x: number;
  y: number;
  angle: number;
}

export interface VelocityAcceleration {
  velocity: { x: number; y: number };
  acceleration: { x: number; y: number };
}
