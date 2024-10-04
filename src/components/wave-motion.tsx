import React, { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

interface GridWaveProps {
  sourceDistance: number
  period: number
  speed: number
  dot: number
  attenuation: number
  blackThreshold: number
  phaseShift: number
  isRunning: boolean
}

function GridWave({
  sourceDistance,
  period,
  speed,
  dot,
  attenuation,
  blackThreshold,
  phaseShift,
  isRunning
}: GridWaveProps) {
  const meshRef = useRef<THREE.Mesh | null>(null)
  const timeRef = useRef(0)

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(70, 70, dot, dot)
    geo.rotateX(-Math.PI / 2)

    const colors = new Float32Array(geo.attributes.position.count * 3)
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    return geo
  }, [dot])

  useFrame((state, delta) => {
    if (!meshRef.current || !isRunning) return

    const maxTime = 3 * period // 3 cycles of the wave
    timeRef.current += delta
    if (timeRef.current > maxTime) {
      timeRef.current = 0 // Reset the time after 3 cycles
    }

    const positions = meshRef.current.geometry.attributes.position.array
    const colors = meshRef.current.geometry.attributes.color.array
    const count = positions.length / 3

    const frequency = 1 / period
    const source1 = [sourceDistance / 2, 0, 0]
    const source2 = [-sourceDistance / 2, 0, 0]

    for (let i = 0; i < count; i++) {
      const x = positions[i * 3]
      const z = positions[i * 3 + 2]

      const distance1 = Math.sqrt(Math.pow(x - source1[0], 2) + Math.pow(z - source1[2], 2))
      const distance2 = Math.sqrt(Math.pow(x - source2[0], 2) + Math.pow(z - source2[2], 2))

      const amplitude1 = 2 * Math.exp(-distance1 * attenuation / 300)
      let y = amplitude1 * Math.sin(distance1 * frequency - timeRef.current * speed)

      const amplitude2 = 2 * Math.exp(-distance2 * attenuation / 300)
      y += amplitude2 * Math.sin(distance2 * frequency - timeRef.current * speed + phaseShift)

      positions[i * 3 + 1] = y

      if (Math.abs(y) < blackThreshold) {
        colors[i * 3] = 0
        colors[i * 3 + 1] = 0
        colors[i * 3 + 2] = 0
      } else {
        const colorValue = (y + 2) / 4
        colors[i * 3] = colorValue
        colors[i * 3 + 1] = 0.5
        colors[i * 3 + 2] = 1 - colorValue
      }
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true
    meshRef.current.geometry.attributes.color.needsUpdate = true
    meshRef.current.geometry.computeVertexNormals()
  })

  return (
    <>
      <mesh ref={meshRef}>
        <primitive object={geometry} />
        <meshPhongMaterial vertexColors={true} wireframe={true} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[sourceDistance / 2, 0, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="red" />
      </mesh>
      <mesh position={[-sourceDistance / 2, 0, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="blue" />
      </mesh>
    </>
  )
}

export default function WaveSimulation() {
  const [sourceDistance, setSourceDistance] = useState<number>(20)
  const [period, setPeriod] = useState<number>(1)
  const [speed, setSpeed] = useState<number>(2)
  const [dot, setDot] = useState<number>(300)
  const [attenuation, setAttenuation] = useState<number>(20)
  const [blackThreshold, setBlackThreshold] = useState<number>(0)
  const [phaseShift, setPhaseShift] = useState<number>(0)
  const [isRunning, setIsRunning] = useState<boolean>(true)

  const wavelength = speed * period

  const handlePhaseShiftChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const degreeValue = parseFloat(event.target.value)
    const radianValue = degreeValue * Math.PI / 180
    setPhaseShift(radianValue)
  }

  const toggleRunning = () => {
    setIsRunning(!isRunning)
  }

  return (
    <div className="p-4 max-w-full mx-auto">
      {/* Section 1: Wave Settings */}
      <div className="flex flex-wrap space-x-4 mb-4">
        <label className="block text-black">
          波源の距離: {sourceDistance.toFixed(1)} (λ = {wavelength.toFixed(2)})
          <input
            type="range"
            min="0"
            max="30"
            step="0.1"
            value={sourceDistance}
            onChange={(e) => setSourceDistance(parseFloat(e.target.value))}
            className="w-full bg-gray-700 rounded"
          />
        </label>

        <label className="block text-black">
          周期: {period.toFixed(2)}
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={period}
            onChange={(e) => setPeriod(parseFloat(e.target.value))}
            className="w-full bg-gray-700 rounded"
          />
        </label>

        <label className="block text-black">
          速さ: {speed.toFixed(2)}
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-full bg-gray-700 rounded"
          />
        </label>
      </div>

      {/* Section 2: Display Settings */}
      <div className="flex flex-wrap space-x-4 mb-4">
        <label className="block text-black">
          減衰度: {attenuation.toFixed(0)}
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={attenuation}
            onChange={(e) => setAttenuation(parseFloat(e.target.value))}
            className="w-full bg-gray-700 rounded"
          />
        </label>

        <label className="block text-black">
          ドット数: {dot.toFixed(0)}
          <input
            type="range"
            min="50"
            max="300"
            step="10"
            value={dot}
            onChange={(e) => setDot(parseFloat(e.target.value))}
            className="w-full bg-gray-700 rounded"
          />
        </label>

        <label className="block text-black">
        以下の振幅を黒色表示: {blackThreshold.toFixed(2)}
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={blackThreshold}
            onChange={(e) => setBlackThreshold(parseFloat(e.target.value))}
            className="w-full bg-gray-700 rounded"
          />
        </label>
      </div>

      {/* Section 3: Source Settings */}
      <div className="flex flex-wrap space-x-4 mb-4">
        <label className="block text-black">
          青色の位相の遅れ: {(phaseShift * 180 / Math.PI).toFixed(0)}°
          （<InlineMath math={`${(phaseShift / Math.PI).toFixed(1)}\\pi`} />）
          <input
            type="range"
            min="0"
            max="360"
            step="30"
            value={(phaseShift * 180 / Math.PI).toFixed(0)}
            onChange={handlePhaseShiftChange}
            className="w-full bg-gray-700 rounded"
          />
        </label>
      </div>

      {/* Section 4: Time Settings */}
      <div className="flex flex-wrap space-x-4 mb-4">
        <button
          onClick={toggleRunning}
          className="px-4 py-2 text-white bg-blue-500 rounded"
        >
          {isRunning ? 'Stop' : 'Start'}
        </button>
      </div>

      {/* Canvas 部分 */}
      <div className="w-full h-screen bg-gray-900">
        <Canvas className="mx-auto w-full h-3/4" camera={{ position: [0, 30, 30], fov: 60 }}>
          <OrbitControls />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <GridWave
            sourceDistance={sourceDistance}
            period={period}
            speed={speed}
            dot={dot}
            attenuation={attenuation}
            blackThreshold={blackThreshold}
            phaseShift={phaseShift}
            isRunning={isRunning}
          />
        </Canvas>
      </div>
    </div>
  )
}
