// EquationsDisplay.tsx
import React from 'react';
import { InlineMath } from 'react-katex';
import { ModeState } from './types';

interface EquationsDisplayProps {
  time: number;
  period: number;
  radius: number;
  modeState: ModeState;
  selectedPoint: number | null;
  numPoints: number;
}

export const EquationsDisplay: React.FC<EquationsDisplayProps> = ({
  time,
  period,
  radius,
  modeState,
  selectedPoint,
  numPoints,
}) => {
  const timeInPeriodFraction = () => {
    const fraction_1 = Math.floor(time / period);
    const fraction_2 = Math.floor(((time / period) * 8) % 8);

    return `\\left(=${fraction_1} T+ \\frac{${fraction_2}}{8} T\\right)`;
  };

  const thetaInRadAndDeg = () => {
    const thetaRad = (2 * ((time % period) / period)).toFixed(1);
    return `${thetaRad} \\pi`;
  };

  const thetaEquation = () => {
    return `\\theta = 2\\pi \\times \\frac{t}{T} \\quad ⇔\\quad \\theta =2\\pi \\times \\frac{${(
      time % period
    ).toFixed(1)}}{${period.toFixed(1)}} = ${thetaInRadAndDeg()}[rad]`;
  };

  const displacementEquation = (isBlue = false) => {
    const omega = `2\\pi\\frac{t}{T}`;
    const phaseDiff = isBlue ? `2\\pi\\frac{x}{\\lambda}` : '';
    const numericOmega = `${((time / period) * 2).toFixed(1)}π`;
    const numericPhaseDiff = isBlue
      ? (((selectedPoint ?? 0) / numPoints) * 2).toFixed(1)
      : '0';
    return `y = A \\sin(${omega} ${
      isBlue ? `-${phaseDiff}` : ''
    }) \\quad ⇔\\quad y=${radius.toFixed(
      0
    )} \\sin(${numericOmega} ${isBlue ? `-${numericPhaseDiff}π` : ''}) `;
  };

  const getPhaseDifference = () => {
    if (selectedPoint === null) return 0;
    return ((selectedPoint / numPoints) * 2 * Math.PI) % (2 * Math.PI);
  };

  return (
    <div className="space-y-4 bg-white p-4 rounded-lg shadow">
      <div className="text-gray-800">
        赤色の位相： <InlineMath math={thetaEquation()} />
      </div>
      <div>
        <div className="text-red-600">
          赤色の変位： <InlineMath math={displacementEquation()} />
        </div>
        {modeState === 'compare' && selectedPoint !== null && (
          <div className="text-blue-600 mt-2">
            青色の変位： <InlineMath math={displacementEquation(true)} />
            <div className="mt-2 text-gray-700">
              位相の遅れ：
              <InlineMath
                math={`\\Delta \\theta = ${(
                  getPhaseDifference() / Math.PI
                ).toFixed(2)}\\pi \\text{ [rad]}= ${(
                  (getPhaseDifference() * 180) /
                  Math.PI
                ).toFixed(0)}° `}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
