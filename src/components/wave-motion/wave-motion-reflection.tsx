// WaveSimulation.tsx
import React, { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import 'katex/dist/katex.min.css'
import { InlineMath } from 'react-katex'

interface GridWaveProps {
  period: number
  speed: number
  dot: number
  attenuation: number
  blackThreshold: number
  isRunning: boolean
  sourceDistance: number
  waveMode: 'incident' | 'reflected' | 'composite'
}

function GridWave({
  period,
  speed,
  dot,
  attenuation,
  blackThreshold,
  isRunning,
  sourceDistance,
  waveMode,
}: GridWaveProps) {
  const meshRef = useRef<THREE.Mesh | null>(null)
  const timeRef = useRef(0)
  const sourceRef = useRef<THREE.Mesh | null>(null)

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(70, 70, dot, dot)
    geo.rotateX(-Math.PI / 2)

    const colors = new Float32Array(geo.attributes.position.count * 3)
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    return geo
  }, [dot])

  const wallPosition = 0 // 壁を x = 0 に配置

  // 実際の波源の位置（左側）
  const sourcePos = useMemo(() => {
    return new THREE.Vector3(-sourceDistance, 0, 0)
  }, [sourceDistance])

  // 仮想波源の位置（反射波用、右側）
  const mirrorSourcePos = useMemo(() => {
    return new THREE.Vector3(sourceDistance, 0, 0)
  }, [sourceDistance])

  useFrame((state, delta) => {
    if (!isRunning) return

    timeRef.current += delta

    const omega = (2 * Math.PI) / period
    const k = omega / speed

    if (!meshRef.current) return

    const positions = meshRef.current.geometry.attributes.position.array as Float32Array
    const colors = meshRef.current.geometry.attributes.color.array as Float32Array
    const count = positions.length / 3

    for (let i = 0; i < count; i++) {
      const x = positions[i * 3]
      const z = positions[i * 3 + 2]
      const yPosIndex = i * 3 + 1

      let y = 0

      // x > 0（壁の向こう側）の場合、変位と色をゼロに設定
      if (x > wallPosition) {
        positions[yPosIndex] = 0
        colors[i * 3] = 0
        colors[i * 3 + 1] = 0
        colors[i * 3 + 2] = 0
        continue
      }

      // 入射波の計算
      if (waveMode === 'incident' || waveMode === 'composite') {
        const distanceToSource = Math.sqrt(
          Math.pow(x - sourcePos.x, 2) + Math.pow(z - sourcePos.z, 2)
        )
        const amplitude = 2 * Math.exp(-attenuation * distanceToSource)
        y += amplitude * Math.sin(k * distanceToSource - omega * timeRef.current)
      }

      // 反射波の計算
      if (waveMode === 'reflected' || waveMode === 'composite') {
        const distanceToMirrorSource = Math.sqrt(
          Math.pow(x - mirrorSourcePos.x, 2) + Math.pow(z - mirrorSourcePos.z, 2)
        )
        const amplitude = 2 * Math.exp(-attenuation * distanceToMirrorSource)
        y += amplitude * Math.sin(k * distanceToMirrorSource - omega * timeRef.current)
      }

      positions[yPosIndex] = y

      // カラー設定
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
        <meshPhongMaterial
          vertexColors={true}
          wireframe={true}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* 壁の描画 */}
      <mesh position={[wallPosition, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[70, 70]} />
        <meshBasicMaterial color="gray" side={THREE.DoubleSide} />
      </mesh>
      {/* 波源の描画 */}
      <mesh ref={sourceRef} position={sourcePos}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="red" />
      </mesh>
    </>
  )
}

export default function WaveSimulation() {
  const [period, setPeriod] = useState<number>(1)
  const [speed, setSpeed] = useState<number>(2)
  const [dot, setDot] = useState<number>(200)
  const [attenuation, setAttenuation] = useState<number>(0)
  const [blackThreshold, setBlackThreshold] = useState<number>(0)
  const [isRunning, setIsRunning] = useState<boolean>(true)
  const [sourceDistance, setSourceDistance] = useState<number>(20)
  const [waveMode, setWaveMode] = useState<'incident' | 'reflected' | 'composite'>('composite')

  const toggleRunning = () => {
    setIsRunning(!isRunning)
  }

  return (
    <div className="p-4 max-w-full mx-auto">
      {/* Section 1: Wave Settings */}
      <div className="flex flex-wrap space-x-4">
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
      <div className="flex flex-wrap space-x-4">
        <label className="block text-black">
          減衰度: {attenuation.toFixed(2)}
          <input
            type="range"
            min="0"
            max="0.1"
            step="0.001"
            value={attenuation}
            onChange={(e) => setAttenuation(parseFloat(e.target.value))}
            className="w-full bg-gray-700 rounded"
          />
        </label>

        <label className="block text-black">
          この変位以下を黒色表示: {blackThreshold.toFixed(2)}
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
          波源と壁の距離: {sourceDistance.toFixed(1)}
          <input
            type="range"
            min="5"
            max="30"
            step="0.1"
            value={sourceDistance}
            onChange={(e) => setSourceDistance(parseFloat(e.target.value))}
            className="w-full bg-gray-700 rounded"
          />
        </label>
      </div>

      {/* Section 4: Wave Mode */}
      <div className="flex flex-wrap space-x-4 mb-4">
        <label className="block text-black">
          波のモード:
          <select
            value={waveMode}
            onChange={(e) => setWaveMode(e.target.value as 'incident' | 'reflected' | 'composite')}
            className="w-full bg-gray-700 rounded"
          >
            <option value="incident">入射波</option>
            <option value="reflected">反射波</option>
            <option value="composite">合成波</option>
          </select>
        </label>

        <button
          onClick={toggleRunning}
          className="px-4 py-2 text-white bg-blue-500 rounded"
        >
          {isRunning ? 'Stop' : 'Start'}
        </button>
      </div>

      {/* Canvas 部分 */}
      <div className="w-full h-screen bg-gray-900 relative">
        <Canvas
          className="mx-auto w-full h-3/4"
          camera={{ position: [-50, 50, 100], fov: 60 }}
        >
          <OrbitControls />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <GridWave
            period={period}
            speed={speed}
            dot={dot}
            attenuation={attenuation}
            blackThreshold={blackThreshold}
            isRunning={isRunning}
            sourceDistance={sourceDistance}
            waveMode={waveMode}
          />
        </Canvas>
      </div>
    </div>
  )
}
