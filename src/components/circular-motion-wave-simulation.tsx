"use client"

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { InlineMath, BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'

export function CircularMotionWaveSimulationComponent() {
  const [period, setPeriod] = useState(4) // 周期（秒）
  const [radius, setRadius] = useState(80)
  const [numPoints, setNumPoints] = useState(20)
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(true)
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null)
  const [isCompareMode, setIsCompareMode] = useState(false)
  const [svgSize, setSvgSize] = useState(0)
  const [thetaDeg, setThetaDeg] = useState("0")
  const [rotationAngle, setRotationAngle] = useState(0)
  const circularMotionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateSize = () => {
      if (circularMotionRef.current) {
        const width = circularMotionRef.current.offsetWidth
        setSvgSize(width)
        setRadius(width * 0.4) // Set radius to 40% of the container width
      }
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isRunning) {
      timer = setInterval(() => {
        setTime(t => (t + 0.01) % period)
      }, 50)
    }
    return () => clearInterval(timer)
  }, [isRunning, period])

  const getRotatedCoordinates = (x: number, y: number, angle: number) => {
    const radians = angle * Math.PI / 180
    return {
      x: x * Math.cos(radians),
      y: y
    }
  }

  const points = Array.from({ length: numPoints }, (_, i) => {
    const angle = (i / numPoints) * 2 * Math.PI - (time / period) * 2 * Math.PI
    const x = radius * Math.cos(angle)
    const y = radius * Math.sin(angle)
    const rotated = getRotatedCoordinates(x, y, rotationAngle)
    return { x: rotated.x, y: rotated.y, angle }
  })

  const getAngleCoordinates = (angle: number, radius: number) => {
    const x = radius * Math.cos(angle)
    const y = radius * Math.sin(angle)
    return { x, y }
  }

  const getPhaseDifference = () => {
    if (selectedPoint === null) return 0;
    return (selectedPoint / numPoints) * 2 * Math.PI;
  }

  const getColor = (index: number) => {
    if (isCompareMode) {
      if (index === 0) return '#FF4136' // より鮮やかな赤
      if (index === selectedPoint) return '#0074D9' // より鮮やかな青
      return '#AAAAAA' // より明るいグレー
    }
    const hue = (index / numPoints) * 360
    return `hsl(${hue}, 100%, 45%)` // 彩度を下げて少し暗く
  }

  const getPointSize = (index: number) => {
    if (isCompareMode) {
      if (index === 0) return 9 // 赤色の点を1.5倍に
      if (index === selectedPoint) return 9 // 選択された点も大きく
      return 3 // その他の点は小さく
    }
    // 通常モード: インデックスに基づいて大きさを変える
    const size = 9 - (index / numPoints) * 6 // 9から3の間で変化
    return Math.max(size, 3) // 最小サイズを3に設定
  }

  const getEquation = (index: number) => {
    const phase = (index / numPoints) * 2 * Math.PI
    return `y = ${radius.toFixed(0)} \\sin(\\frac{2\\pi t}{${period}} - ${phase.toFixed(2)})`
  }

  const togglePoint = (index: number) => {
    if (!isCompareMode || index === 0) return
    setSelectedPoint(prev => prev === index ? null : index)
  }

  const timeInPeriodFraction = () => {
    const fraction = Math.floor((time / period) * 8)
    return `\\left(=\\frac{${fraction}}{8} T\\right)`
  }

  useEffect(() => {
    const thetaRad = 2 * (time / period)
    const newThetaDeg = (thetaRad * 180 / Math.PI).toFixed(0)
    setThetaDeg(newThetaDeg)
  }, [time, period])

  const thetaInRadAndDeg = () => {
    const thetaRad = 2 * (time / period)
    return `${thetaRad.toFixed(1)} \\pi`
  }

  const thetaEquation = () => {
    return `\\theta = 2\\pi \\times \\frac{t}{T} 　 ⇔　 \\theta =2\\pi \\times \\frac{${time.toFixed(1)}}{${period.toFixed(1)}} = ${thetaInRadAndDeg()}[rad](${thetaDeg}°)`
  }
  
  const displacementEquation = (isBlue = false) => {
    const omega = `2\\pi\\frac{t}{T}`
    const phaseDiff = isBlue ? `2\\pi\\frac{x}{\\lambda}` : ''
    const numericOmega = `${(time / period * 2).toFixed(1)}π`
    const numericPhaseDiff = isBlue ? ((selectedPoint ?? 0) / numPoints * 2).toFixed(1) : '0'; // null チェック後に計算を実行
    return `y = A \\sin(${omega} ${isBlue ? `-${phaseDiff}` : ''}) 
    　⇔　y=${radius.toFixed(0)} \\sin(${numericOmega} ${isBlue ? `-${numericPhaseDiff}π` : ''}) `
  }

  return (
    <div className="p-4 max-w-4xl mx-auto text-gray-800">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">単振動と等速円運動の関係: 3D視点</h1>
      <div className="flex flex-col md:flex-row mb-8 space-y-4 md:space-y-0 md:space-x-4">
        <div ref={circularMotionRef} className="w-full md:w-1/2 aspect-square relative border border-gray-400 rounded">
          <svg className="w-full h-full">
            <ellipse 
              cx="50%" 
              cy="50%" 
              rx={`${(radius * Math.cos(rotationAngle * Math.PI / 180)) / svgSize * 100}%`} 
              ry={`${radius / svgSize * 100}%`} 
              stroke="rgba(0,0,0,0.1)" 
              strokeWidth="1" 
              fill="none" 
            />
            
            {/* Add horizontal guide line */}
            <line 
              x1="0" 
              y1={`calc(50% + ${(points[0].y / svgSize * 100)}%)`} 
              x2="100%" 
              y2={`calc(50% + ${(points[0].y / svgSize * 100)}%)`} 
              stroke="#FF4136" 
              strokeWidth="1" 
              strokeDasharray="2 4" 
            />
            {isCompareMode && selectedPoint !== null && (
              <line 
                x1="0" 
                y1={`calc(50% + ${(points[selectedPoint].y / svgSize * 100)}%)`} 
                x2="100%" 
                y2={`calc(50% + ${(points[selectedPoint].y / svgSize * 100)}%)`} 
                stroke="#0074D9" 
                strokeWidth="1" 
                strokeDasharray="2 4" 
              />
            )}
            
            {/* 赤色の角度表示 (0度の時のみ) */}
            {rotationAngle === 0 && (
              <path
                d={`
                  M ${svgSize / 2} ${svgSize / 2} 
                  L ${svgSize / 2 + radius / 10} ${svgSize / 2} 
                  A ${radius/10} ${radius/10} 0 
                  ${(time / period) * 2 * Math.PI > Math.PI ? 1 : 0} 
                  0 
                  ${svgSize / 2 + getAngleCoordinates(2 * Math.PI - (time / period) * 2 * Math.PI, radius/10).x} 
                  ${svgSize / 2 + getAngleCoordinates(2 * Math.PI - (time / period) * 2 * Math.PI, radius/10).y}
                `}
                fill="rgba(255, 65, 54, 0.2)"
                stroke="#FF4136"
                strokeWidth="2"
              />
            )}

            {rotationAngle === 0 && (
              <text
                x={svgSize / 1.75}
                y={svgSize / 1.8}
                fontSize="16"
                fill="#FF4136"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                θ= {thetaDeg}°
              </text>
            )}

            {points.map((point, i) => (
              <g key={i}>
                {(i === 0 || i === selectedPoint) && (
                  <line
                    x1="50%"
                    y1="50%"
                    x2={`${50 + (point.x / svgSize * 100)}%`}
                    y2={`${50 + (point.y / svgSize * 100)}%`}
                    stroke={getColor(i)}
                    strokeWidth={i === 0 ? "1" : "0.5"}
                  />
                )}
                <circle
                  cx={`${50 + (point.x / svgSize * 100)}%`}
                  cy={`${50 + (point.y / svgSize * 100)}%`}
                  r={getPointSize(i)}
                  fill={getColor(i)}
                  onClick={() => togglePoint(i)}
                  style={{ cursor: 'pointer' }}
                />
              </g>
            ))}
          </svg>          
        </div> 
        <div className="w-full md:w-1/2 aspect-square relative border border-gray-400 rounded">
          <svg className="w-full h-full">
            {/* Add horizontal guide line */}
            <line 
              x1="0" 
              y1={`calc(50% + ${(points[0].y / svgSize * 100)}%)`} 
              x2="100%" 
              y2={`calc(50% + ${(points[0].y / svgSize * 100)}%)`} 
              stroke="#FF4136" 
              strokeWidth="1" 
              strokeDasharray="2 4" 
            />
            {isCompareMode && selectedPoint !== null && (
              <line 
                x1="0" 
                y1={`calc(50% + ${(points[selectedPoint].y / svgSize * 100)}%)`} 
                x2="100%" 
                y2={`calc(50% + ${(points[selectedPoint].y / svgSize * 100)}%)`} 
                stroke="#0074D9" 
                strokeWidth="1" 
                strokeDasharray="2 4" 
              />
            )}

            {points.map((point, i) => (
              <circle
                key={i}
                cx={`${3 +(i / numPoints) * 50}%`}
                cy={`${50 + (point.y / svgSize * 100)}%`}
                r={getPointSize(i)}
                fill={getColor(i)}
              />
            ))}
            {points.map((point, i) => (
              <circle
                key={i}
                cx={`${53 +(i / numPoints) * 50}%`}
                cy={`${50 + (point.y / svgSize * 100)}%`}
                r={getPointSize(i)}
                fill={getColor(i)}
              />
            ))}
          </svg>
          <div className="absolute bottom-0 left-0 w-full h-6 flex justify-between px-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="text-xs">{i * (numPoints / 4)}</div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center space-x-4 space-y-2">
        <div className="flex items-center space-x-2">
          <label>周期 : T= {period.toFixed(1)} 秒 </label>
          <button onClick={() => setPeriod(p => Math.min(p + 0.5, 10))} className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400">+</button>
          <button onClick={() => setPeriod(p => Math.max(p - 0.5, 1))} className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400">-</button>
        </div>
        <div className="flex items-center space-x-2">
          <label>, 半径 : A= {radius.toFixed(0)}</label>
          <button onClick={() => setRadius(r => Math.min(r + 5, svgSize * 0.45))} className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400">+</button>
          <button onClick={() => setRadius(r => Math.max(r - 5, 20))} className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400">-</button>
        </div>
        <div className="flex items-center space-x-2">
        <label> ,  点の数: {numPoints}</label>
          <button onClick={() => setNumPoints(n => Math.min(n + 8, 120))} className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400">+</button>
          <button onClick={() => setNumPoints(n => Math.max(n - 8, 8))} className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400">-</button>
        </div>
        <div className="flex items-center space-x-2">
          <label>回転角度: {rotationAngle}°</label>
          <input
            type="range"
            min="0"
            max="90"
            value={rotationAngle}
            onChange={(e) => setRotationAngle(Number(e.target.value))}
            className="w-64"
          />
        </div>
      </div>
      <br />      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setIsRunning(!isRunning)} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isRunning ? 'Stop' : 'Start'}
          </button>
          <input
            type="range"
            min={0}
            max={period}
            step={period / 80}
            value={time}
            onChange={(e) => {
              setTime(Number(e.target.value))
              setIsRunning(false)
            }}
            className="w-64"
          />
          <span>
            Time: {time.toFixed(1)}s <InlineMath math={timeInPeriodFraction()} />
          </span>
        </div>
        <div>
          赤色の位相：  <InlineMath math={thetaEquation()} />
        </div>
        <div>
          <div>
            <br />
            <span style={{ color: '#FF4136' }}>赤色の変位</span>： <InlineMath math={displacementEquation()} />
          </div>
          {isCompareMode && selectedPoint !== null && (
            <div>
              <br />
              <span style={{ color: '#0074D9' }}>青色の変位</span>： <InlineMath math={displacementEquation(true)} />
              <br />
              <br />
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isCompareMode}
              onChange={() => {
                setIsCompareMode(!isCompareMode)
                setSelectedPoint(null)
              }}
              className="mr-2"
            />
            <span>位相比較モード</span>
          </label>
        </div>
      </div>
      {isCompareMode && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2 text-gray-900">位相の比較</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {Array.from({ length: numPoints }).map((_, i) => (
              i !== 0 &&  i % 2 == 0 && (
                <div key={i} className="flex items-center">
                  <input
                    type="radio"
                    id={`point-${i}`}
                    checked={selectedPoint === i}
                    onChange={() => togglePoint(i)}
                    className="mr-2"
                  />
                  <label htmlFor={`point-${i}`} style={{ color: i === selectedPoint ? '#0074D9' : '#666666' }}>
                    {i}
                  </label>
                </div>
              )
            ))}
          </div>
        </div>
      )}
      {isCompareMode && selectedPoint !== null && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2 text-gray-900">選択された点とi=0の位相差</h2>
          <p>
            <InlineMath math={`\\Delta \\theta = ${(getPhaseDifference() * 180 / Math.PI).toFixed(0)}° = ${(getPhaseDifference() / Math.PI).toFixed(2)}\\pi \\text{ [rad]}`} />
          </p>
        </div>
      )}
      <div className="mt-4">
        <h2 className="text-xl font-bold mb-2 text-gray-900">数式</h2>
        {isCompareMode ? (
          <>
            <div style={{ color: '#FF4136' }}>
              <InlineMath math={getEquation(0)} />
            </div>
            {selectedPoint !== null && (
              <div style={{ color: '#0074D9' }}>
                <InlineMath math={getEquation(selectedPoint)} />
              </div>
            )}
          </>
        ) : (
          <div>
            <InlineMath math={getEquation(0)} />
          </div>
        )}
      </div>
    </div>
  )
}         