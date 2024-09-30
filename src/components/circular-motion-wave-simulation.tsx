import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { InlineMath, BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'

export function CircularMotionWaveSimulationComponent() {
  const [period, setPeriod] = useState(4) // 周期（秒）
  const [radius, setRadius] = useState(80)
  const [numPoints, setNumPoints] = useState(24)
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(true)
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null)
  const [modeState, setModeState] = useState<"" | "compare" | "rainbow" | "simplePosition" | "simpleVelocity" | "simpleAcceleration">('compare') // 'compare', 'rainbow', 'simpleVelosity" , "simplePosition , simpleAcceleration'
  const [svgSize, setSvgSize] = useState(0)
  const [thetaDeg, setThetaDeg] = useState("0")
  const [rotationAngle, setRotationAngle] = useState(90)
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
        setTime(t => (t + 0.02) % (4 * period))
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

  const getAngleCoordinates = (angle: number, radius: number) => {
    const x = radius * Math.cos(angle)
    const y = radius * Math.sin(angle)
    return { x, y }
  }

  const getPhaseDifference = () => {
    if (selectedPoint === null) return 0;
    return ((selectedPoint / numPoints) * 2 * Math.PI ) % ( 2* Math.PI);
  }

  const getColor = (index: number) => {
    if (modeState === 'compare') {
      if (index === 0) return '#FF4136' // より鮮やかな赤
      if (index === selectedPoint) return '#0074D9' // より鮮やかな青
      return '#AAAAAA' // より明るいグレー
    } else if (modeState === 'rainbow') {
      const hue = (index / numPoints) * 360
      return `hsl(${hue}, 100%, 45%)` // 彩度を下げて少し暗く
    } else if (modeState === "simpleAcceleration" || modeState ==="simplePosition" || modeState==="simpleVelocity") {
      if (index === 0) return '#FF4136' // より鮮やかな赤
      return '#AAAAAA' // より明るいグレー // 単振動モードでは赤色
    }
  }

  const getPointSize = (index: number , start : boolean) => {
    if (modeState === 'compare') {
      if (index === 0 && start === true) return 9 // 赤色の点を1.5倍に
      if (index === selectedPoint && start === true) return 9 // 選択された点も大きく
      return 1.5 // その他の点は小さく
    } else if (modeState === 'rainbow') {
      const size = 9 - (index / numPoints) * 6 // 9から3の間で変化
      return Math.max(size, 3) // 最小サイズを3に設定
    } else if (modeState === "simpleAcceleration" || modeState ==="simplePosition" || modeState==="simpleVelocity"){
      if (index === 0 && start === true) return 9 
      return 1.5 // 単振動モードでは固定サイズ
    }
  }

  const getEquation = (index: number) => {
    const phase = ((index / numPoints) * 2 * Math.PI) % ( 2* Math.PI)
    return `y = ${radius.toFixed(0)} \\sin(\\frac{2\\pi t}{${period}} - ${phase.toFixed(2)})`
  }

  const togglePoint = (index: number) => {
    if (modeState !== 'compare' || index === 0) return
    setSelectedPoint(prev => prev === index ? null : index)
  }

  const timeInPeriodFraction = () => {
    const fraction_1 = Math.floor((time / period))
    const fraction_2 = Math.floor(((time / period)  * 8) % 8)

    return `\\left(=${fraction_1} T+ \\frac{${fraction_2}}{8} T\\right)`
  }

  useEffect(() => {
    const thetaRad = 2 * (time / period)
    const newThetaDeg = (thetaRad * 180 % 360).toFixed(0)
    setThetaDeg(newThetaDeg)
  }, [time, period])

  const thetaInRadAndDeg = () => {
    const thetaRad = 2 * ((time % period) / period) 
    return `${thetaRad.toFixed(1)} \\pi`
  }

  const thetaEquation = () => {
    return `\\theta = 2\\pi \\times \\frac{t}{T} \\quad ⇔\\quad \\theta =2\\pi \\times \\frac{${(time % period).toFixed(1)}}{${period.toFixed(1)}} = ${thetaInRadAndDeg()}[rad](${thetaDeg}°)`
  }
  
  const displacementEquation = (isBlue = false) => {
    const omega = `2\\pi\\frac{t}{T}`
    const phaseDiff = isBlue ? `2\\pi\\frac{x}{\\lambda}` : ''
    const numericOmega = `${((time / period * 2) % period).toFixed(1)}π`
    const numericPhaseDiff = isBlue ? ((selectedPoint ?? 0) / numPoints * 2).toFixed(1) : '0';
    return `y = A \\sin(${omega} ${isBlue ? `-${phaseDiff}` : ''}) 
    \\quad ⇔\\quad y=${radius.toFixed(0)} \\sin(${numericOmega} ${isBlue ? `-${numericPhaseDiff}π` : ''}) `
  }

  const calculatePoints = (numPoints: number, time: number, period: number, radius: number, rotationAngle: number, offsetPeriod: number) => {
    return Array.from({ length: numPoints }, (_, i) => {
      const delay = (i / numPoints) * period;
      const effectiveTime = time > delay + offsetPeriod ? time - delay : 0;

      const angle = effectiveTime > 0
        ? -(effectiveTime / period) * 2 * Math.PI
        : 0;

      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      const rotated = getRotatedCoordinates(x, y, rotationAngle);

      return { x: rotated.x, y: rotated.y, angle };
    });
  };

  // points1 と points2 を計算
  const points1 = calculatePoints(numPoints, time, period, radius, rotationAngle, 0);
  const points2 = calculatePoints(numPoints, time, period, radius, rotationAngle, period);

  // 単振動モードのための速度と加速度の計算
  const calculateVelocityAndAcceleration = () => {
    const omega = (2 * Math.PI) / period;
    const angle = -(time / period) * 2 * Math.PI;
    const v_x =  omega * radius * Math.sin(angle);
    const v_y =  omega * radius * Math.cos(angle);
    const a_x = -omega * omega * radius * Math.cos(angle);
    const a_y = -omega * omega * radius * Math.sin(angle);

    // 回転角度の考慮
    const rotatedVelocity = getRotatedCoordinates(v_x, v_y, rotationAngle);
    const rotatedAcceleration = getRotatedCoordinates(a_x, a_y, rotationAngle);

    return {
      velocity: rotatedVelocity,
      acceleration: rotatedAcceleration,
    };
  };

  // 速度と加速度のベクトルを取得
  const { velocity, acceleration } = calculateVelocityAndAcceleration();

  return (
    <div className="p-4 max-w-4xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">単振動と波動のシミュレーション</h1>





      <div className="flex items-center space-x-2 mt-6 bg-white p-4 rounded-lg shadow">
        <label className="flex items-center ml-4">
          <input
            type="radio"
            name="mode"
            value="simpleVibration"
            checked={modeState === "simplePosition"}
            onChange={() => {
              setModeState("simplePosition");
              setSelectedPoint(null);
            }}
            className="mr-2 accent-indigo-600"
          />
          <span className="text-gray-700">単振動モード　</span>
        </label>

        <label className="flex items-center">
          <input
            type="radio"
            name="mode"
            value="compare"
            checked={modeState === 'compare'}
            onChange={() => {
              setModeState('compare');
              setSelectedPoint(null);
            }}
            className="mr-2 accent-indigo-600"
          />
          <span className="text-gray-700">位相比較モード　</span>
        </label>

        <label className="flex items-center ml-4">
          <input
            type="radio"
            name="mode"
            value="rainbow"
            checked={modeState === 'rainbow'}
            onChange={() => {
              setModeState('rainbow');
              setSelectedPoint(null);
            }}
            className="mr-2 accent-indigo-600"
          />
          <span className="text-gray-700">虹色モード　</span>
        </label>
      </div>
      <br />



      {/* 単振動モードのときにのみ表示されるチェックボックス */}
      {(modeState === "simpleAcceleration" || modeState ==="simplePosition" || modeState==="simpleVelocity") && (
        <div className="flex items-center space-x-4 mb-4 bg-white p-4 rounded-lg shadow">

        <label className="flex items-center">
            <input
              type="radio"
              checked={modeState==="simplePosition"}
              onChange={() => setModeState("simplePosition")}
              className="mr-2 accent-indigo-600"
            />
            <span className="text-gray-700">変位を表示</span>
          </label>        
          <label className="flex items-center">
            <input
              type="radio"
              checked={modeState==="simpleVelocity"}
              onChange={() => setModeState("simpleVelocity")}
              className="mr-2 accent-indigo-600"
            />
            <span className="text-gray-700">速度ベクトルを表示</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={modeState==="simpleAcceleration"}
              onChange={() => setModeState("simpleAcceleration")}
              className="mr-2 accent-indigo-600"
            />
            <span className="text-gray-700">加速度ベクトルを表示</span>
          </label>

        </div>
      )}


      <div className="flex flex-col md:flex-row mb-8 space-y-6 md:space-y-0 md:space-x-6">
        <div ref={circularMotionRef} className="w-full md:w-1/2 aspect-square relative border border-gray-300 rounded-lg shadow-md bg-white">
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
            
            {/* 赤色の水平線 */}
            { !(modeState === "simpleAcceleration" || modeState ==="simpleVelocity") && (
            <line 
              x1="0" 
              y1={`calc(50% + ${(points1[0].y / svgSize * 100)}%)`} 
              x2="100%" 
              y2={`calc(50% + ${(points1[0].y / svgSize * 100)}%)`} 
              stroke="#FF4136" 
              strokeWidth="1" 
              strokeDasharray="2 4" 
            />
          )}
            {modeState === 'compare' && selectedPoint !== null && (
              <line 
                x1="0" 
                y1={`calc(50% + ${(points1[selectedPoint].y / svgSize * 100)}%)`} 
                x2="100%" 
                y2={`calc(50% + ${(points1[selectedPoint].y / svgSize * 100)}%)`} 
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
                  ${((time / period) * 2 * Math.PI) % ( 2 * Math.PI) > Math.PI ? 1 : 0}  
                  0 
                  ${svgSize / 2 + getAngleCoordinates(2 * Math.PI - ((time / period) * 2 * Math.PI) % (2 * Math.PI) , radius/10).x} 
                  ${svgSize / 2 + getAngleCoordinates(2 * Math.PI - ((time / period) * 2 * Math.PI) % (2 * Math.PI), radius/10).y}
                `}
                fill="rgba(255, 65, 54, 0.2)"
                stroke="#FF4136"
                strokeWidth="2"
              />
            )}

            {/* 赤色のθ表示 */}
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

            {/* 青い点と赤い点を結ぶ扇形の円弧（位相差） */}
            {rotationAngle === 0 && modeState === 'compare' && selectedPoint !== null && (
              <>
                <path
                  d={`
                    M ${svgSize / 2} ${svgSize / 2} 
                    L ${svgSize / 2 + getAngleCoordinates(-(time / period) * 2 * Math.PI, radius).x} 
                      ${svgSize / 2 + getAngleCoordinates(-(time / period) * 2 * Math.PI, radius).y} 
                    A ${radius} ${radius} 0 
                    ${(getPhaseDifference()) > Math.PI ? 1 : 0} 
                    1 
                    ${svgSize / 2 + getAngleCoordinates((-(time / period) + (selectedPoint / numPoints)) * 2 * Math.PI, radius).x} 
                    ${svgSize / 2 + getAngleCoordinates((-(time / period) + (selectedPoint / numPoints)) * 2 * Math.PI, radius).y}
                    Z 
                  `}
                  fill="rgba(0, 116, 217, 0.1)"  // 薄い青色で扇形を塗る
                  stroke="#0074D9"
                  strokeWidth="2"
                />
                
                {/* 青色の位相差表示 */}
                <text
                  x={svgSize / 2 + getAngleCoordinates(-(time / period - selectedPoint / numPoints / 2) * 2 * Math.PI, radius * 2 / 3).x}
                  y={svgSize / 2 + getAngleCoordinates(-(time / period - selectedPoint / numPoints / 2) * 2 * Math.PI, radius *2 / 3).y}
                  fontSize="16"
                  fill="#0074D9"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  Δθ = {(getPhaseDifference() * 180 / Math.PI).toFixed(0)}°
                </text>
              </>
            )}

            {points1.map((point, i) => (
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
                  r={getPointSize(i ,true)}
                  fill={getColor(i)}
                  onClick={() => togglePoint(i)}
                  style={{ cursor: 'pointer' }}
                />
              </g>
            ))}

            {/* 単振動モードで速度と加速度のベクトルを表示 */}
            {(modeState === "simpleAcceleration" || modeState ==="simplePosition" || modeState==="simpleVelocity") && (
              <>
                {/* 速度ベクトル */}
                {modeState==="simpleVelocity" && (
                  <line
                    x1={`${50 + (points1[0].x / svgSize * 100)}%`}
                    y1={`${50 + (points1[0].y / svgSize * 100)}%`}
                    x2={`${50 + ((points1[0].x + velocity.x * 0.3) / svgSize * 100)}%`}
                    y2={`${50 + ((points1[0].y - velocity.y * 0.3) / svgSize * 100)}%`}
                    stroke="green"
                    strokeWidth="1.5"
                    markerEnd="url(#arrowhead)"
                  />
                )}
                {/* 加速度ベクトル */}
                {modeState==="simpleAcceleration" && (
                  <line
                    x1={`${50 + (points1[0].x / svgSize * 100)}%`}
                    y1={`${50 + (points1[0].y / svgSize * 100)}%`}
                    x2={`${50 + ((points1[0].x + acceleration.x * 0.3) / svgSize * 100)}%`}
                    y2={`${50 + ((points1[0].y + acceleration.y * 0.3) / svgSize * 100)}%`}
                    stroke="blue"
                    strokeWidth="1.5"
                    markerEnd="url(#arrowhead)"
                  />
                )}
                {/* 矢印の定義 */}
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="0"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
                  </marker>
                </defs>
              </>
            )}
          </svg>          
        </div> 


        {(modeState === "compare" || modeState ==="rainbow") && (
        <div className="w-full md:w-1/2 aspect-square relative border border-gray-300 rounded-lg shadow-md bg-white">
          <svg className="w-full h-full">
            {/* Add horizontal guide line */}
            
            <line 
              x1="0" 
              y1={`calc(50% + ${(points1[0].y / svgSize * 100)}%)`} 
              x2="100%" 
              y2={`calc(50% + ${(points1[0].y / svgSize * 100)}%)`} 
              stroke="#FF4136" 
              strokeWidth="1" 
              strokeDasharray="2 4" 
            />
            {modeState === 'compare' && selectedPoint !== null && (
              <line 
                x1="0" 
                y1={`calc(50% + ${(points1[selectedPoint].y / svgSize * 100)}%)`} 
                x2="100%" 
                y2={`calc(50% + ${(points1[selectedPoint].y / svgSize * 100)}%)`} 
                stroke="#0074D9" 
                strokeWidth="1" 
                strokeDasharray="2 4" 
              />
            )}

            {points1.map((point, i) => (
              <circle
                key={`1-${i}`}
                cx={`${3 +(i / numPoints) * 50}%`}
                cy={`${50 + (point.y / svgSize * 100)}%`}
                r={getPointSize(i , true)}
                fill={getColor(i)}
              />
            ))}
            {points2.map((point, i) => (
              <circle
                key={`2-${i}`}
                cx={`${53 +(i / numPoints) * 50}%`}
                cy={`${50 + (point.y / svgSize * 100)}%`}
                r={getPointSize(i , false)}
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
        
        {(modeState === "simpleAcceleration" || modeState ==="simplePosition" || modeState==="simpleVelocity") && (
        <div className="w-full md:w-1/2 aspect-square relative border border-gray-300 rounded-lg shadow-md bg-white">
          <svg className="w-full h-full">
            {/* Add horizontal guide line */}
            <line 
              x1="0" 
              y1={`calc(50% + ${(points1[0].y / svgSize * 100)}%)`} 
              x2="100%" 
              y2={`calc(50% + ${(points1[0].y / svgSize * 100)}%)`} 
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

      {modeState === 'compare' && (
        <div className="mt-6 bg-white p-4 rounded-lg shadow">

          <label className="text-xl font-bold mb-1 text-gray-800 flex items-center">
          <input
            type="checkbox"
            name="mode"
            value="compare"
            checked={modeState === 'compare'}
            onChange={() => {
              setModeState('compare');
              setSelectedPoint(null);
            }}
            className="mr-2 accent-indigo-600"
          />
          <span className="text-gray-700">位相比較モード　</span>
        </label>

          <div className="grid sm:grid-cols-3 md:grid-cols-6 gap-4">
            {Array.from({ length: numPoints }).map((_, i) => (
              i !== 0 &&  i % 4 === 0 && (
                <div key={i} className="flex items-center">
                  <input
                    type="radio"
                    id={`point-${i}`}
                    checked={selectedPoint === i}
                    onChange={() => togglePoint(i)}
                    className="mr-2 accent-indigo-600"
                  />
                  <label htmlFor={`point-${i}`} className={`${i === selectedPoint ? 'text-blue-600' : 'text-gray-600'} cursor-pointer`}>
                    {(i/numPoints * 360).toFixed(0)}°
                  </label>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center space-x-4 space-y-2 mb-6">
        <div className="flex items-center space-x-2">
          <label className="text-gray-700">周期 : T= {period.toFixed(1)} 秒 </label>
          <button onClick={() => setPeriod(p => Math.min(p + 0.5, 10))} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-150">+</button>
          <button onClick={() => setPeriod(p => Math.max(p - 0.5, 1))} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-150">-</button>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-gray-700">半径 : A= {radius.toFixed(0)}</label>
          <button onClick={() => setRadius(r => Math.min(r + 5, svgSize * 0.45))} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition duration-150">+</button>
          <button onClick={() => setRadius(r => Math.max(r - 5, 20))} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition duration-150">-</button>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-gray-700">点の数: {numPoints}</label>
          <button onClick={() => setNumPoints(n => Math.min(n + 8, 48))} className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition duration-150">+</button>
          <button onClick={() => setNumPoints(n => Math.max(n - 8, 8))} className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition duration-150">-</button>
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

      <div className="space-y-4 bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <button
            onClick={()=>setTime(0)}
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
              setTime(Number(e.target.value))
              setIsRunning(false)
            }}
            className="w-64 accent-indigo-600"
          />
          <span className="text-gray-700">
            Time: {time.toFixed(1)}s <InlineMath math={timeInPeriodFraction()} />
          </span>
        </div>

        <div className="text-gray-800">
          赤色の位相：  <InlineMath math={thetaEquation()} />
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
                <InlineMath math={`\\Delta \\theta = ${(getPhaseDifference() / Math.PI).toFixed(2)}\\pi \\text{ [rad]}= ${(getPhaseDifference() * 180 / Math.PI).toFixed(0)}° `} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
