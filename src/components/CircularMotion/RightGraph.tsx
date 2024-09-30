import React from 'react';

// Propsの型を定義します
interface RightGraphProps {
  modeState: string;
  points1: Array<{ x: number; y: number }>;
  points2: Array<{ x: number; y: number }>;
  svgSize: number;
  numPoints: number;
  selectedPoint: number | null;
  getColor: (index: number) => string;
  getPointSize: (index: number, start: boolean) => number;
  togglePoint: (index: number) => void;
}

const RightGraph: React.FC<RightGraphProps> = ({
  modeState,
  points1,
  points2,
  svgSize,
  numPoints,
  selectedPoint,
  getColor,
  getPointSize,
  togglePoint,
}) => {
  return (
    <div className="flex flex-col md:flex-row mb-8 space-y-6 md:space-y-0 md:space-x-6">
      {/* "compare" または "rainbow" モードの場合に表示されるグラフ */}
      {(modeState === 'compare' || modeState === 'rainbow') && (
        <div className="w-full md:w-1/2 aspect-square relative border border-gray-300 rounded-lg shadow-md bg-white">
          <svg className="w-full h-full">
            {/* ガイドライン */}
            <line
              x1="0"
              y1={`calc(50% + ${(points1[0].y / svgSize) * 100}%)`}
              x2="100%"
              y2={`calc(50% + ${(points1[0].y / svgSize) * 100}%)`}
              stroke="#FF4136"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
            {modeState === 'compare' && selectedPoint !== null && (
              <line
                x1="0"
                y1={`calc(50% + ${(points1[selectedPoint].y / svgSize) * 100}%)`}
                x2="100%"
                y2={`calc(50% + ${(points1[selectedPoint].y / svgSize) * 100}%)`}
                stroke="#0074D9"
                strokeWidth="1"
                strokeDasharray="2 4"
              />
            )}
            {points1.map((point, i) => (
              <circle
                key={`1-${i}`}
                cx={`${3 + (i / numPoints) * 50}%`}
                cy={`${50 + (point.y / svgSize) * 100}%`}
                r={getPointSize(i, true)}
                fill={getColor(i)}
              />
            ))}
            {points2.map((point, i) => (
              <circle
                key={`2-${i}`}
                cx={`${53 + (i / numPoints) * 50}%`}
                cy={`${50 + (point.y / svgSize) * 100}%`}
                r={getPointSize(i, false)}
                fill={getColor(i)}
              />
            ))}
          </svg>
          <div className="absolute bottom-0 left-0 w-full h-6 flex justify-between px-2 text-gray-600">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="text-xs">{i * (numPoints / 4)}</div>
            ))}
          </div>
        </div>
      )}

      {/* 単振動モードの場合に表示されるグラフ */}
      {(modeState === 'simpleAcceleration' || modeState === 'simplePosition' || modeState === 'simpleVelocity') && (
        <div className="w-full md:w-1/2 aspect-square relative border border-gray-300 rounded-lg shadow-md bg-white">
          <svg className="w-full h-full">
            {/* ガイドライン */}
            <line
              x1="0"
              y1={`calc(50% + ${(points1[0].y / svgSize) * 100}%)`}
              x2="100%"
              y2={`calc(50% + ${(points1[0].y / svgSize) * 100}%)`}
              stroke="#FF4136"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
          </svg>
          <div className="absolute bottom-0 left-0 w-full h-6 flex justify-between px-2 text-gray-600">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="text-xs">{i * (numPoints / 4)}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RightGraph;
