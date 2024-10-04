// CircularMotionWaveSimulationComponent.tsx
import React, { useState, useEffect } from 'react';
import { Controls } from './Controls';
import { SimulationCanvas } from './SimulationCanvas';
import { EquationsDisplay } from './EquationsDisplay';
import { ModeState } from './types';

export const CircularMotionWaveSimulationComponent2: React.FC = () => {
  const [period, setPeriod] = useState(4); // 周期（秒）
  const [radius, setRadius] = useState(80);
  const [numPoints, setNumPoints] = useState(24);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [modeState, setModeState] = useState<ModeState>('compare');
  const [rotationAngle, setRotationAngle] = useState(90);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning) {
      timer = setInterval(() => {
        setTime((t) => (t + 0.02) % (4 * period));
      }, 50);
    }
    return () => clearInterval(timer);
  }, [isRunning, period]);

  return (
    <div className="p-4 max-w-4xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">
        単振動と波動のシミュレーション
      </h1>

      <Controls
        period={period}
        setPeriod={setPeriod}
        radius={radius}
        setRadius={setRadius}
        numPoints={numPoints}
        setNumPoints={setNumPoints}
        rotationAngle={rotationAngle}
        setRotationAngle={setRotationAngle}
        isRunning={isRunning}
        setIsRunning={setIsRunning}
        time={time}
        setTime={setTime}
        modeState={modeState}
        setModeState={setModeState}
      />

      <div className="flex flex-col md:flex-row mb-8 space-y-6 md:space-y-0 md:space-x-6">
        <SimulationCanvas
          numPoints={numPoints}
          time={time}
          period={period}
          radius={radius}
          rotationAngle={rotationAngle}
          modeState={modeState}
          selectedPoint={selectedPoint}
          setSelectedPoint={setSelectedPoint}
        />
      </div>

      <EquationsDisplay
        time={time}
        period={period}
        radius={radius}
        modeState={modeState}
        selectedPoint={selectedPoint}
        numPoints={numPoints}
      />
    </div>
  );
};
