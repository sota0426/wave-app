// SimulationCanvas.tsx
import React, { useRef, useEffect, useState } from 'react';
import { Point, ModeState, VelocityAcceleration } from './types';
import { calculatePoints } from './utils';

interface SimulationCanvasProps {
  numPoints: number;
  time: number;
  period: number;
  radius: number;
  rotationAngle: number;
  modeState: ModeState;
  selectedPoint: number | null;
  setSelectedPoint: React.Dispatch<React.SetStateAction<number | null>>;
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  numPoints,
  time,
  period,
  radius,
  rotationAngle,
  modeState,
  selectedPoint,
  setSelectedPoint,
}) => {
  const [svgSize, setSvgSize] = useState(0);
  const circularMotionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateSize = () => {
      if (circularMotionRef.current) {
        const width = circularMotionRef.current.offsetWidth;
        setSvgSize(width);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Points calculation
  const points1 = calculatePoints(
    numPoints,
    time,
    period,
    radius,
    rotationAngle,
    0
  );

  const getColor = (index: number) => {
    if (modeState === 'compare') {
      if (index === 0) return '#FF4136';
      if (index === selectedPoint) return '#0074D9';
      return '#AAAAAA';
    } else if (modeState === 'rainbow') {
      const hue = (index / numPoints) * 360;
      return `hsl(${hue}, 100%, 45%)`;
    } else {
      if (index === 0) return '#FF4136';
      return '#AAAAAA';
    }
  };

  const getPointSize = (index: number, start: boolean) => {
    if (modeState === 'compare') {
      if (index === 0 && start === true) return 9;
      if (index === selectedPoint && start === true) return 9;
      return 1.5;
    } else if (modeState === 'rainbow') {
      const size = 9 - (index / numPoints) * 6;
      return Math.max(size, 3);
    } else {
      if (index === 0 && start === true) return 9;
      return 1.5;
    }
  };

  const togglePoint = (index: number) => {
    if (modeState !== 'compare' || index === 0) return;
    setSelectedPoint((prev) => (prev === index ? null : index));
  };

  return (
    <div ref={circularMotionRef} className="w-full aspect-square relative border border-gray-300 rounded-lg shadow-md bg-white">
      <svg className="w-full h-full">
        {/* ここにSVG要素を描画 */}
        {points1.map((point, i) => (
          <g key={i}>
            {(i === 0 || i === selectedPoint) && (
              <line
                x1="50%"
                y1="50%"
                x2={`${50 + (point.x / svgSize) * 100}%`}
                y2={`${50 + (point.y / svgSize) * 100}%`}
                stroke={getColor(i)}
                strokeWidth={i === 0 ? '1' : '0.5'}
              />
            )}
            <circle
              cx={`${50 + (point.x / svgSize) * 100}%`}
              cy={`${50 + (point.y / svgSize) * 100}%`}
              r={getPointSize(i, true)}
              fill={getColor(i)}
              onClick={() => togglePoint(i)}
              style={{ cursor: 'pointer' }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
};
