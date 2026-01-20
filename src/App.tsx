import { useState, useEffect } from 'react'
import { Battery, Heart, BookOpen, Coffee, Moon, MessageCircle } from 'lucide-react'
import './App.css'

type EnergyLevel = 'low' | 'medium' | 'high' | null
type Activity = 'study' | 'rest' | 'reflect' | null

interface SessionData {
  energyLevel: EnergyLevel
  currentActivity: Activity
  timestamp: string
}

function App() {
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>(null)
  const [currentActivity, setCurrentActivity] = useState<Activity>(null)
  const [showReflection, setShowReflection] = useState(false)

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('studyByEnergySession')
    if (savedSession) {
      try {
        const session: SessionData = JSON.parse(savedSession)
        setEnergyLevel(session.energyLevel)
        setCurrentActivity(session.currentActivity)
      } catch (e) {
        console.error('Failed to load session', e)
      }
    }
  }, [])

  // Save session to localStorage whenever it changes
  useEffect(() => {
    if (energyLevel || currentActivity) {
      const session: SessionData = {
        energyLevel,
        currentActivity,
        timestamp: new Date().toISOString(),
      }
      localStorage.setItem('studyByEnergySession', JSON.stringify(session))
    }
  }, [energyLevel, currentActivity])

  const handleEnergySelect = (level: EnergyLevel) => {
    setEnergyLevel(level)
    setCurrentActivity(null)
  }

  const handleActivitySelect = (activity: Activity) => {
    setCurrentActivity(activity)
    if (activity === 'reflect') {
      setShowReflection(true)
    }
  }

  const handleReset = () => {
    setEnergyLevel(null)
    setCurrentActivity(null)
    setShowReflection(false)
    localStorage.removeItem('studyByEnergySession')
  }

  const getRecommendation = () => {
    if (!energyLevel) return null
    
    switch (energyLevel) {
      case 'low':
        return {
          primary: 'rest',
          message: 'Your energy is low. Rest is productive. Consider taking a break.',
          options: ['Rest', 'Light reading', 'Reflect']
        }
      case 'medium':
        return {
          primary: 'balanced',
          message: 'Your energy is moderate. Balance study with breaks.',
          options: ['Study session', 'Rest', 'Reflect']
        }
      case 'high':
        return {
          primary: 'study',
          message: 'Your energy is high. Great time for focused work.',
          options: ['Deep study', 'Rest (if needed)', 'Reflect']
        }
      default:
        return null
    }
  }

  const recommendation = getRecommendation()

  return (
    <div className="min-h-screen bg-calm-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Battery className="w-8 h-8 text-calm-600 mr-2" />
            <h1 className="text-4xl font-light text-calm-800">StudyByEnergy</h1>
          </div>
          <p className="text-calm-600 text-lg">Study with less guilt. Rest is valid.</p>
        </header>

        <main className="bg-white rounded-2xl shadow-sm p-8">
          {!energyLevel ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-light text-calm-800 text-center mb-8">
                How's your energy right now?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => handleEnergySelect('low')}
                  className="p-6 rounded-xl border-2 border-calm-200 hover:border-energy-low hover:bg-energy-low/5 transition-all duration-200 text-center group"
                >
                  <Moon className="w-12 h-12 mx-auto mb-3 text-energy-low" />
                  <h3 className="text-lg font-medium text-calm-800 mb-1">Low</h3>
                  <p className="text-sm text-calm-500">Feeling tired or drained</p>
                </button>
                <button
                  onClick={() => handleEnergySelect('medium')}
                  className="p-6 rounded-xl border-2 border-calm-200 hover:border-energy-medium hover:bg-energy-medium/5 transition-all duration-200 text-center group"
                >
                  <Coffee className="w-12 h-12 mx-auto mb-3 text-energy-medium" />
                  <h3 className="text-lg font-medium text-calm-800 mb-1">Medium</h3>
                  <p className="text-sm text-calm-500">Moderate, steady energy</p>
                </button>
                <button
                  onClick={() => handleEnergySelect('high')}
                  className="p-6 rounded-xl border-2 border-calm-200 hover:border-energy-high hover:bg-energy-high/5 transition-all duration-200 text-center group"
                >
                  <Heart className="w-12 h-12 mx-auto mb-3 text-energy-high" />
                  <h3 className="text-lg font-medium text-calm-800 mb-1">High</h3>
                  <p className="text-sm text-calm-500">Energized and ready</p>
                </button>
              </div>
            </div>
          ) : !currentActivity ? (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <p className="text-calm-600 mb-4">Energy level: {energyLevel}</p>
                <h2 className="text-2xl font-light text-calm-800 mb-2">
                  {recommendation?.message}
                </h2>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleActivitySelect('study')}
                  className="w-full p-5 rounded-xl border-2 border-calm-200 hover:border-calm-400 hover:bg-calm-50 transition-all duration-200 text-left flex items-center"
                >
                  <BookOpen className="w-6 h-6 mr-4 text-calm-600" />
                  <div>
                    <h3 className="text-lg font-medium text-calm-800">Study</h3>
                    <p className="text-sm text-calm-500">Engage with your material</p>
                  </div>
                </button>

                <button
                  onClick={() => handleActivitySelect('rest')}
                  className="w-full p-5 rounded-xl border-2 border-calm-200 hover:border-calm-400 hover:bg-calm-50 transition-all duration-200 text-left flex items-center"
                >
                  <Moon className="w-6 h-6 mr-4 text-calm-600" />
                  <div>
                    <h3 className="text-lg font-medium text-calm-800">Rest</h3>
                    <p className="text-sm text-calm-500">Take a break, no guilt</p>
                  </div>
                </button>

                <button
                  onClick={() => handleActivitySelect('reflect')}
                  className="w-full p-5 rounded-xl border-2 border-calm-200 hover:border-calm-400 hover:bg-calm-50 transition-all duration-200 text-left flex items-center"
                >
                  <MessageCircle className="w-6 h-6 mr-4 text-calm-600" />
                  <div>
                    <h3 className="text-lg font-medium text-calm-800">Reflect</h3>
                    <p className="text-sm text-calm-500">Check in with yourself</p>
                  </div>
                </button>
              </div>

              <button
                onClick={handleReset}
                className="w-full mt-6 p-3 text-calm-500 hover:text-calm-700 transition-colors"
              >
                Start over
              </button>
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <div className="mb-6">
                {currentActivity === 'study' && <BookOpen className="w-16 h-16 mx-auto text-calm-600 mb-4" />}
                {currentActivity === 'rest' && <Moon className="w-16 h-16 mx-auto text-calm-600 mb-4" />}
                {currentActivity === 'reflect' && <MessageCircle className="w-16 h-16 mx-auto text-calm-600 mb-4" />}
                
                <h2 className="text-2xl font-light text-calm-800 mb-2">
                  {currentActivity === 'study' && 'You chose to study'}
                  {currentActivity === 'rest' && 'You chose to rest'}
                  {currentActivity === 'reflect' && 'Reflection space'}
                </h2>
                
                <p className="text-calm-600">
                  {currentActivity === 'study' && 'Take your time. Focus on understanding, not perfection.'}
                  {currentActivity === 'rest' && "Rest is part of learning. You're doing great."}
                  {currentActivity === 'reflect' && 'This is a placeholder for future reflection features.'}
                </p>
              </div>

              {showReflection && (
                <div className="bg-calm-50 rounded-xl p-6 text-left">
                  <h3 className="text-lg font-medium text-calm-800 mb-3">Reflection Chat (Coming Soon)</h3>
                  <p className="text-calm-600 mb-4">
                    In the future, you'll be able to journal and reflect on your study sessions here.
                  </p>
                  <div className="space-y-2 text-sm text-calm-500">
                    <p>• How did this session feel?</p>
                    <p>• What did you learn about your energy?</p>
                    <p>• What would help you next time?</p>
                  </div>
                </div>
              )}

              <button
                onClick={handleReset}
                className="mt-8 px-6 py-3 bg-calm-800 text-white rounded-lg hover:bg-calm-700 transition-colors"
              >
                New check-in
              </button>
            </div>
          )}
        </main>

        <footer className="text-center mt-8 text-calm-500 text-sm">
          <p>Made with care for students who deserve rest.</p>
        </footer>
      </div>
    </div>
  )
}

export default App
