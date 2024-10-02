"use client"

import { useState, Suspense, lazy } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const CircularMotionWaveSimulationComponent = lazy(() => import('@/components/circular-motion-wave-simulation'))
const WaveInterferenceCircularMotion = lazy(() => import('@/components/wave-interference-circular-motion'))

export default function Page() {
  const [selectedPage, setSelectedPage] = useState<'circular' | 'interference'>('circular')

  return (
    <div className="p-4">
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex justify-center space-x-4">
            <Button 
              onClick={() => setSelectedPage('circular')}
              variant={selectedPage === 'circular' ? 'outline' : 'default'}
            >
              単振動と等速円運動
            </Button>
            <Button 
              onClick={() => setSelectedPage('interference')}
              variant={selectedPage === 'interference' ? 'outline' : 'default'}
            >
              波の干渉と円運動
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Suspense fallback={<div>Loading...</div>}>
        {selectedPage === 'circular' && <CircularMotionWaveSimulationComponent />}
        {selectedPage === 'interference' && <WaveInterferenceCircularMotion />}
      </Suspense>
    </div>
  )
}
