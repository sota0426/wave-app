// Controls.tsx
import React from 'react';
import { ModeState } from './types';

interface ControlsProps {
  period: number;
  setPeriod: React.Dispatch<React.SetStateAction<number>>;
  radius: number;
  setRadius: React.Dispatch<React.SetStateAction<number>>;
  numPoints: number;
  setNumPoints: React.Dispatch<React.SetStateAction<number>>;
  rotationAngle: number;
  setRotationAngle: React.Dispatch<React.SetStateAction<number>>;
  isRunning: boolean;
  setIsRunning: React.Dispatch<React.SetStateAction<boolean>>;
  time: number;
  setTime: React.Dispatch<React.SetStateAction<number>>;
  modeState: ModeState;
  setModeState: React.Dispatch<React.SetStateAction<ModeState>>;
}

export const Controls: React.FC<ControlsProps> = ({
  period,
  setPeriod,
  radius,
  setRadius,
  numPoints,
  setNumPoints,
  rotationAngle,
  setRotationAngle,
  isRunning,
  setIsRunning,
  time,
  setTime,
  modeState,
  setModeState,
}) => {
  return (
    <div>
      {/* モード選択 */}
      <div className="flex items-center space-x-2 mt-6 bg-white p-4 rounded-lg shadow">
        <label className="flex items-center ml-4">
          <input
            type="radio"
            name="mode"
            value="simplePosition"
            checked={modeState === 'simplePosition'}
            onChange={() => setModeState('simplePosition')}
            className="mr-2 accent-indigo-600"
          />
          <span className="text-gray-700">単振動モード</span>
        </label>

        <label className="flex items-center">
          <input
            type="radio"
            name="mode"
            value="compare"
            checked={modeState === 'compare'}
            onChange={() => setModeState('compare')}
            className="mr-2 accent-indigo-600"
          />
          <span className="text-gray-700">位相比較モード</span>
        </label>

        <label className="flex items-center ml-4">
          <input
            type="radio"
            name="mode"
            value="rainbow"
            checked={modeState === 'rainbow'}
            onChange={() => setModeState('rainbow')}
            className="mr-2 accent-indigo-600"
          />
          <span className="text-gray-700">虹色モード</span>
        </label>
      </div>

      {/* 単振動モードの追加オプション */}
      {(modeState === 'simpleAcceleration' ||
        modeState === 'simplePosition' ||
        modeState === 'simpleVelocity') && (
        <div className="flex items-center space-x-4 mb-4 bg-white p-4 rounded-lg shadow">
          <label className="flex items-center">
            <input
              type="radio"
              checked={modeState === 'simplePosition'}
              onChange={() => setModeState('simplePosition')}
              className="mr-2 accent-indigo-600"
            />
            <span className="text-gray-700">変位を表示</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={modeState === 'simpleVelocity'}
              onChange={() => setModeState('simpleVelocity')}
              className="mr-2 accent-indigo-600"
            />
            <span className="text-gray-700">速度ベクトルを表示</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={modeState === 'simpleAcceleration'}
              onChange={() => setModeState('simpleAcceleration')}
              className="mr-2 accent-indigo-600"
            />
            <span className="text-gray-700">加速度ベクトルを表示</span>
          </label>
        </div>
      )}

      {/* パラメータ調整 */}
      <div className="flex flex-wrap items-center space-x-4 space-y-2 mb-6">
        <div className="flex items-center space-x-2">
          <label className="text-gray-700">周期 : T= {period.toFixed(1)} 秒 </label>
          <button
            onClick={() => setPeriod((p) => Math.min(p + 0.5, 10))}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-150"
          >
            +
          </button>
          <button
            onClick={() => setPeriod((p) => Math.max(p - 0.5, 1))}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-150"
          >
            -
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-gray-700">半径 : A= {radius.toFixed(0)}</label>
          <button
            onClick={() => setRadius((r) => Math.min(r + 5, 200))}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition duration-150"
          >
            +
          </button>
          <button
            onClick={() => setRadius((r) => Math.max(r - 5, 20))}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition duration-150"
          >
            -
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-gray-700">点の数: {numPoints}</label>
          <button
            onClick={() => setNumPoints((n) => Math.min(n + 8, 48))}
            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition duration-150"
          >
            +
          </button>
          <button
            onClick={() => setNumPoints((n) => Math.max(n - 8, 8))}
            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition duration-150"
          >
            -
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-gray-700">回転角度: {rotationAngle}°</label>
          <input
            type="range"
            min="0"
            max="90"
            value={rotationAngle}
            onChange={(e) => setRotationAngle(Number(e.target.value))}
            className="w-64 accent-indigo-600"
          />
        </div>
      </div>

      {/* 再生・停止・時間調整 */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setTime(0)}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition duration-150"
        >
          Reset
        </button>
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition duration-150"
        >
          {isRunning ? 'Stop' : 'Start'}
        </button>
        <input
          type="range"
          min={0}
          max={period * 4}
          step={period / 80}
          value={time}
          onChange={(e) => {
            setTime(Number(e.target.value));
            setIsRunning(false);
          }}
          className="w-64 accent-indigo-600"
        />
        <span className="text-gray-700">Time: {time.toFixed(1)}s</span>
      </div>
    </div>
  );
};
