import React, { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function GridWave({ waveSourceCount, sourceDistance, frequency, speed, dot }) {
  const meshRef = useRef()
  const timeRef = useRef(0)

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(60, 60, dot, dot)
    geo.rotateX(-Math.PI / 2)

    // Add vertex colors
    const colors = new Float32Array(geo.attributes.position.count * 3)
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    return geo
  }, [dot]) // Added 'dot' as a dependency to recreate geometry when 'dot' changes

  useFrame((state, delta) => {
    timeRef.current += delta

    const positions = meshRef.current.geometry.attributes.position.array
    const colors = meshRef.current.geometry.attributes.color.array
    const count = positions.length / 3

    // Define wave source positions
    const source1 = [sourceDistance / 2, 0, 0] // First source
    const source2 = waveSourceCount === 2 ? [-sourceDistance / 2, 0, 0] : null // Second source

    for (let i = 0; i < count; i++) {
      const x = positions[i * 3]
      const z = positions[i * 3 + 2]

      // Distance from first source
      const distance1 = Math.sqrt(Math.pow(x - source1[0], 2) + Math.pow(z - source1[2], 2))

      // Distance from second source (if it exists)
      const distance2 = source2
        ? Math.sqrt(Math.pow(x - source2[0], 2) + Math.pow(z - source2[2], 2))
        : 0

      const amplitude1 = 2 * Math.exp(-distance1 * 0.1)

      let y = amplitude1 * Math.sin(distance1 * frequency - timeRef.current * speed)

      // If there are two sources, sum their effects
      if (waveSourceCount === 2) {
        const amplitude2 = 2 * Math.exp(-distance2 * 0.1)
        y += amplitude2 * Math.sin(distance2 * frequency - timeRef.current * speed)
      }

      positions[i * 3 + 1] = y

      // Map the y position to a color (for example, blue to red)
      const colorValue = (y + 2) / 4 // Normalize height to range [0, 1]
      colors[i * 3] = colorValue // Red channel
      colors[i * 3 + 1] = 0.5 // Green channel (constant)
      colors[i * 3 + 2] = 1 - colorValue // Blue channel (inverted)
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true
    meshRef.current.geometry.attributes.color.needsUpdate = true
    meshRef.current.geometry.computeVertexNormals()
  })

  return (
    <mesh ref={meshRef}>
      <primitive object={geometry} />
      <meshPhongMaterial 
        vertexColors={true} 
        wireframe={true} 
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export default function WaveSimulation() {
  const [waveSourceCount, setWaveSourceCount] = useState(2)
  const [sourceDistance, setSourceDistance] = useState(5)
  const [frequency, setFrequency] = useState(1)
  const [speed, setSpeed] = useState(2)
  const [dot, setDot] = useState(300)

  const handleSourceCountChange = (event) => {
    setWaveSourceCount(parseInt(event.target.value))
  }

  const handleDistanceChange = (event) => {
    setSourceDistance(parseFloat(event.target.value))
  }

  const handleFrequencyChange = (event) => {
    setFrequency(parseFloat(event.target.value))
  }

  const handleSpeedChange = (event) => {
    setSpeed(parseFloat(event.target.value))
  }

  const handleDotChange = (event) => {
    setDot(parseFloat(event.target.value))
  }

  return (
    <div className="p-4 max-w-full mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center text-black">波動のシミュレーション</h1>
      <div className="flex flex-wrap m-6 p-4 bg-white shadow rounded items-center space-x-4 space-y-2 mb-6">
        <label className="block mb-2 text-black">
          波源:
          <select value={waveSourceCount} onChange={handleSourceCountChange} className="block w-full bg-gray-700 text-white rounded mt-1 p-1">
            <option value={1}>1つの波源</option>
            <option value={2}>2つの波源</option>
          </select>
        </label>
        <label className="block mb-2 text-black">
          波源の距離: {sourceDistance.toFixed(1)}
          <input
            type="range"
            min="0"
            max="50"
            step="0.1"
            value={sourceDistance}
            onChange={handleDistanceChange}
            className="w-full bg-gray-700 rounded"
          />
        </label>
        <label className="block mb-2 text-black">
          周波数: {frequency.toFixed(1)}
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={frequency}
            onChange={handleFrequencyChange}
            className="w-full bg-gray-700 rounded"
          />
        </label>
        <label className="block mb-2 text-black">
          速度: {speed.toFixed(1)}
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={speed}
            onChange={handleSpeedChange}
            className="w-full bg-gray-700 rounded"
          />
        </label>
        <label className="block mb-2 text-black">
          ドット数: {dot.toFixed(0)}
          <input
            type="range"
            min="50"
            max="300"
            step="10"
            value={dot}
            onChange={handleDotChange}
            className="w-full bg-gray-700 rounded"
          />
        </label>
      </div>

      <div className="w-full h-screen bg-gray-900">
        <Canvas className="mx-auto w-full h-3/4" camera={{ position: [0, 15, 30], fov: 60 }}>
          <OrbitControls />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <GridWave waveSourceCount={waveSourceCount} sourceDistance={sourceDistance} frequency={frequency} speed={speed} dot={dot} />
        </Canvas>
      </div>
    </div>
  )
}
