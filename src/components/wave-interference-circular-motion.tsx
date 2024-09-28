"use client"

import { useState , useMemo } from 'react'
import { motion, useAnimationFrame } from 'framer-motion'
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function WaveInterferenceCircularMotion() {
  const [frequency1, setFrequency1] = useState(100)
  const [frequency2, setFrequency2] = useState(100)
  const [phase1, setPhase1] = useState(0)
  const [phase2, setPhase2] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [scale, setScale] = useState(1)
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(true)

  const numPoints = 500
  const circleWidth = 400
  const circleHeight = 400
  const waveWidth = 900
  const waveHeight = 300
  const circleRadius = 60
  const amplitude = 40

  useAnimationFrame(() => {
    if (isRunning) {
      setTime((prevTime) => prevTime + 0.00004 * speed) // Approximately 60 FPS
    }
  })

  const getWavePoints = (freq: number, phase: number) => {
    return Array.from({ length: numPoints }, (_, i) => {
      const x = (i / (numPoints - 1) - 0.5) * waveWidth
      const y = circleRadius * Math.sin(2 * Math.PI * freq * (x / waveWidth / scale / 10 - time) + phase * Math.PI / 180)
      return { x, y }
    })
  }

  const getCirclePoint = (freq: number, phase: number) => {
    const angle = -2 * Math.PI * freq  * time + phase * Math.PI / 180 + Math.PI *1.98
    return {
      x: circleRadius * Math.cos(angle),
      y: circleRadius * Math.sin(angle)
    }
  }


  const [wave1Points, wave2Points, combinedWavePoints, circle1Point, circle2Point, combinedCirclePoint] = useMemo(() => {
    const w1 = getWavePoints(frequency1, phase1)
    const w2 = getWavePoints(frequency2, phase2)
    const cw = w1.map((p, i) => ({ x: p.x, y: p.y + w2[i].y }))
    const c1 = getCirclePoint(frequency1, phase1)
    const c2 = getCirclePoint(frequency2, phase2)
    const cc = { x: c1.x + c2.x, y: c1.y + c2.y }
    return [w1, w2, cw, c1, c2, cc]
  }, [frequency1, frequency2, phase1, phase2, time, scale])

  const getColor = (index: number) => {
    const colors = ["#FF0000", "#0000FF", "#00FF00"]
    return colors[index]
  }

  const renderCircle = (point: { x: number, y: number }, color: string, radius: number) => (
    <motion.circle
      cx={circleWidth / 2}
      cy={circleHeight / 2}
      r={radius} // 引数として受け取った太さ（半径）を設定
      fill={color}
      animate={{ x: point.x, y: point.y }}
      transition={{ duration: 0, ease: "linear" }}
    />
  )
  
  const renderWave = (points: { x: number, y: number }[], color: string, radius:number) => (
    <path
      d={`M ${points.map(p => `${p.x + waveWidth *0.5},${p.y + waveHeight / 2}`).join(' L ')}`}
      fill="none"
      stroke={color}
      strokeWidth={radius}
    />
  )
  
  
  const renderWavePoint = (point: { x: number, y: number }, color: string, radius: number) => (
    <motion.circle
      cx={waveWidth / 2}
      cy={waveHeight / 2}
      r={radius} // 引数として受け取った太さ（半径）を設定
      fill={color}
      animate={{ x: point.x, y: point.y }}
      transition={{ duration: 0, ease: "linear" }}
    />
  )

  return (
    <div className="p-4 max-w-full mx-auto">
    <h1 className="text-2xl font-bold mb-4">波の干渉のシミュレーション（波の干渉、うなりの原理）</h1>
    <div className="flex flex-col lg:flex-row mb-8 space-y-4 lg:space-y-0 lg:space-x-4">
      {/* 左の円の表示 */}
      <div className="w-full lg:w-1/4 h-[300px] relative border border-gray-300 rounded">
        <svg width={circleWidth} height={circleHeight} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <circle cx={circleWidth / 2} cy={circleHeight / 2} r={circleRadius} stroke="rgba(0,0,0,0.1)" strokeWidth="1" fill="none" />
          <circle cx={circleWidth / 2} cy={circleHeight / 2} r={circleRadius * 2} stroke="rgba(0,0,0,0.1)" strokeWidth="1" fill="none" />
          <circle cx={circleWidth / 2} cy={circleHeight / 2} r="2" fill="black" />
          {renderCircle(circle1Point, getColor(0),4)} {/* 赤色 */}
          {renderCircle(circle2Point, getColor(1),3)} {/* 青色 */}
          {renderCircle(combinedCirclePoint, getColor(2),6)} {/* 緑色 */}
          <line x1={0} y1={circleWidth / 2 + combinedCirclePoint.y} x2={waveWidth} y2={circleWidth / 2 + combinedCirclePoint.y} stroke="rgba(0,0,0,0.3)" strokeWidth="1" strokeDasharray="5,5" />
          <line x1={circleWidth / 2} y1={circleHeight / 2} x2={circleWidth / 2 + combinedCirclePoint.x} y2={circleHeight / 2 + combinedCirclePoint.y} stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
        </svg>
      </div>


        <div className="w-full lg:w-3/4 h-[300px] relative border border-gray-300 rounded">
          <svg width={waveWidth} height={waveHeight} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <line x1={0} y1={waveHeight/2} x2={waveWidth} y2={waveHeight/2} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
            <line x1={waveWidth/2} y1={0} x2={waveWidth/2} y2={waveHeight} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
            {renderWave(wave1Points, getColor(0),1)}
            {renderWave(wave2Points, getColor(1),0.7)}
            {renderWave(combinedWavePoints, getColor(2),2)}
            {renderWavePoint({ x: wave1Points[249].x, y: wave1Points[249].y }, getColor(0),4)}
            {renderWavePoint({ x: wave2Points[249].x, y: wave2Points[249].y}, getColor(1),3)}
            {renderWavePoint({ x: combinedWavePoints[249].x, y: combinedWavePoints[249].y  }, getColor(2),6)}
            <line x1={0} y1={combinedWavePoints[249].y +waveHeight/2} x2={waveWidth} y2={combinedWavePoints[249].y +waveHeight/2} stroke="rgba(0,0,0,0.3)" strokeWidth="1" strokeDasharray="5,5" />
          </svg>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">波1のパラメータ</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="frequency1">周波数: {frequency1} Hz</Label>
                <Slider
                  id="frequency1"
                  min={90}
                  max={110}
                  step={1}
                  value={[frequency1]}
                  onValueChange={([value]) => setFrequency1(value)}
                />
              </div>
              <div>
                <Label htmlFor="phase1">位相: {phase1.toFixed(0)}°</Label>
                <Slider
                  id="phase1"
                  min={0}
                  max={360}
                  step={1}
                  value={[phase1]}
                  onValueChange={([value]) => setPhase1(value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">波2のパラメータ</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="frequency2">周波数: {frequency2} Hz</Label>
                <Slider
                  id="frequency2"
                  min={90}
                  max={110}
                  step={1}
                  value={[frequency2]}
                  onValueChange={([value]) => setFrequency2(value)}
                />
              </div>
              <div>
                <Label htmlFor="phase2">位相: {phase2.toFixed(0)}°</Label>
                <Slider
                  id="phase2"
                  min={0}
                  max={360}
                  step={1}
                  value={[phase2]}
                  onValueChange={([value]) => setPhase2(value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">全体のパラメータ</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="speed">速さ: {speed.toFixed(2)}</Label>
                <Slider
                  id="speed"
                  min={0.5}
                  max={20}
                  step={0.1}
                  value={[speed]}
                  onValueChange={([value]) => setSpeed(value)}
                />
              </div>
              <div>
                <Label htmlFor="scale">縮尺: {scale.toFixed(2)}x</Label>
                <Slider
                  id="scale"
                  min={0.1}
                  max={2}
                  step={0.01}
                  value={[scale]}
                  onValueChange={([value]) => setScale(value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={() => setIsRunning(!isRunning)}>
                  {isRunning ? 'ストップ' : 'スタート'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}