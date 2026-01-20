import { useState, useEffect, useRef } from 'react'
import { Battery, Heart, BookOpen, Coffee, Moon, MessageCircle, Timer, Play, Pause, RotateCcw } from 'lucide-react'
import { CloudSync } from './components/CloudSync'
import { syncSession, SessionRecord } from './lib/supabase'
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
  
  // Timer states
  const [showTimer, setShowTimer] = useState(false)
  const [timerDuration, setTimerDuration] = useState(25) // minutes
  const [timeRemaining, setTimeRemaining] = useState(0) // seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [pomodoroEnabled, setPomodoroEnabled] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const timerRef = useRef<number | null>(null)

  // Cloud sync state - tracks if user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(false)

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

  // Timer logic
  useEffect(() => {
    if (isTimerRunning && timeRemaining > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false)
            setSessionComplete(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (!isTimerRunning && timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isTimerRunning])

  const handleEnergySelect = (level: EnergyLevel) => {
    setEnergyLevel(level)
    setCurrentActivity(null)
  }

  const handleActivitySelect = (activity: Activity) => {
    setCurrentActivity(activity)
    setShowTimer(false)
    setSessionComplete(false)
    setShowFeedback(false)
    if (activity === 'reflect') {
      setShowReflection(true)
    }
  }

  const handleReset = () => {
    setEnergyLevel(null)
    setCurrentActivity(null)
    setShowReflection(false)
    setShowTimer(false)
    setIsTimerRunning(false)
    setTimeRemaining(0)
    setSessionComplete(false)
    setShowFeedback(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    localStorage.removeItem('studyByEnergySession')
  }

  const handleStartTimer = () => {
    setShowTimer(true)
    setTimeRemaining(timerDuration * 60)
    setSessionComplete(false)
  }

  const handlePlayPause = () => {
    setIsTimerRunning(!isTimerRunning)
  }

  const handleResetTimer = () => {
    setIsTimerRunning(false)
    setTimeRemaining(timerDuration * 60)
    setSessionComplete(false)
  }

  const handleCompleteFeedback = async (feedback?: string) => {
    // Conditionally sync to cloud when authenticated
    // Design Decision: Never block UI for cloud sync
    if (isAuthenticated && energyLevel && currentActivity) {
      const sessionRecord: SessionRecord = {
        energy_level: energyLevel,
        activity: currentActivity,
        duration_minutes: timerDuration,
        feedback: feedback,
      }
      
      // Fire and forget - don't await
      syncSession(sessionRecord).catch(err => 
        console.warn('Background sync failed:', err)
      )
    }
    
    setShowFeedback(false)
    handleReset()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getTimerProgress = () => {
    const total = timerDuration * 60
    return timeRemaining > 0 ? ((total - timeRemaining) / total) * 100 : 0
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
              {sessionComplete && !showFeedback ? (
                <div className="space-y-6">
                  <div className="mb-6">
                    {currentActivity === 'study' && <BookOpen className="w-16 h-16 mx-auto text-calm-600 mb-4 animate-pulse" />}
                    {currentActivity === 'rest' && <Moon className="w-16 h-16 mx-auto text-calm-600 mb-4 animate-pulse" />}
                    
                    <h2 className="text-2xl font-light text-calm-800 mb-2">
                      Session complete!
                    </h2>
                    
                    <p className="text-calm-600 mb-6">
                      {currentActivity === 'study' && "Great work! You gave it your focused attention."}
                      {currentActivity === 'rest' && "Well rested! You honored your energy needs."}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => setShowFeedback(true)}
                      className="w-full px-6 py-3 bg-calm-800 text-white rounded-lg hover:bg-calm-700 transition-colors"
                    >
                      Share how it went (optional)
                    </button>
                    <button
                      onClick={handleReset}
                      className="w-full px-6 py-3 border-2 border-calm-300 text-calm-700 rounded-lg hover:bg-calm-50 transition-colors"
                    >
                      New check-in
                    </button>
                  </div>
                </div>
              ) : showFeedback ? (
                <div className="space-y-6">
                  <h2 className="text-2xl font-light text-calm-800 mb-4">
                    How did it feel?
                  </h2>
                  <p className="text-calm-600 mb-6">
                    Your reflection helps you understand your energy patterns better.
                  </p>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => handleCompleteFeedback('good')}
                      className="w-full p-4 rounded-xl border-2 border-calm-200 hover:border-calm-400 hover:bg-calm-50 transition-all text-left"
                    >
                      <p className="font-medium text-calm-800">😊 Felt good</p>
                      <p className="text-sm text-calm-500">This worked well for my energy</p>
                    </button>
                    <button
                      onClick={() => handleCompleteFeedback('okay')}
                      className="w-full p-4 rounded-xl border-2 border-calm-200 hover:border-calm-400 hover:bg-calm-50 transition-all text-left"
                    >
                      <p className="font-medium text-calm-800">😌 Okay</p>
                      <p className="text-sm text-calm-500">It was alright</p>
                    </button>
                    <button
                      onClick={() => handleCompleteFeedback('could_be_better')}
                      className="w-full p-4 rounded-xl border-2 border-calm-200 hover:border-calm-400 hover:bg-calm-50 transition-all text-left"
                    >
                      <p className="font-medium text-calm-800">😔 Could be better</p>
                      <p className="text-sm text-calm-500">Maybe try different timing next time</p>
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleCompleteFeedback()}
                    className="mt-4 text-calm-500 hover:text-calm-700 transition-colors"
                  >
                    Skip
                  </button>
                </div>
              ) : !showTimer ? (
                <div className="space-y-6">
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

                  {currentActivity !== 'reflect' && (
                    <div className="bg-calm-50 rounded-xl p-6 space-y-4">
                      <div className="flex items-center justify-center mb-4">
                        <Timer className="w-6 h-6 text-calm-600 mr-2" />
                        <h3 className="text-lg font-medium text-calm-800">Set a timer (optional)</h3>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <button
                          onClick={() => setTimerDuration(10)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            timerDuration === 10 
                              ? 'border-calm-600 bg-calm-600 text-white' 
                              : 'border-calm-200 hover:border-calm-400'
                          }`}
                        >
                          10 min
                        </button>
                        <button
                          onClick={() => setTimerDuration(25)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            timerDuration === 25 
                              ? 'border-calm-600 bg-calm-600 text-white' 
                              : 'border-calm-200 hover:border-calm-400'
                          }`}
                        >
                          25 min
                        </button>
                        <button
                          onClick={() => setTimerDuration(45)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            timerDuration === 45 
                              ? 'border-calm-600 bg-calm-600 text-white' 
                              : 'border-calm-200 hover:border-calm-400'
                          }`}
                        >
                          45 min
                        </button>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-calm-600 flex justify-between">
                          <span>Custom: {timerDuration} minutes</span>
                        </label>
                        <input
                          type="range"
                          min="5"
                          max="90"
                          step="5"
                          value={timerDuration}
                          onChange={(e) => setTimerDuration(Number(e.target.value))}
                          className="w-full h-2 bg-calm-200 rounded-lg appearance-none cursor-pointer accent-calm-600"
                        />
                      </div>

                      <div className="flex items-center justify-center pt-2">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pomodoroEnabled}
                            onChange={(e) => setPomodoroEnabled(e.target.checked)}
                            className="w-4 h-4 text-calm-600 rounded focus:ring-calm-500 cursor-pointer"
                          />
                          <span className="ml-2 text-sm text-calm-600">Enable Pomodoro (5 min breaks)</span>
                        </label>
                      </div>

                      <button
                        onClick={handleStartTimer}
                        className="w-full mt-4 px-6 py-3 bg-calm-800 text-white rounded-lg hover:bg-calm-700 transition-colors"
                      >
                        Start Timer
                      </button>
                    </div>
                  )}

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
              ) : (
                <div className="space-y-6">
                  {/* Ambient visual background */}
                  <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <div 
                        className="w-64 h-64 rounded-full animate-pulse"
                        style={{
                          background: currentActivity === 'study' 
                            ? 'radial-gradient(circle, rgba(59,130,246,0.5) 0%, rgba(59,130,246,0) 70%)'
                            : 'radial-gradient(circle, rgba(147,197,253,0.5) 0%, rgba(147,197,253,0) 70%)',
                          animationDuration: '4s'
                        }}
                      ></div>
                    </div>
                    
                    <div className="relative">
                      {currentActivity === 'study' && <BookOpen className="w-16 h-16 mx-auto text-calm-600 mb-4" />}
                      {currentActivity === 'rest' && <Moon className="w-16 h-16 mx-auto text-calm-600 mb-4" />}
                      
                      <h2 className="text-2xl font-light text-calm-800 mb-2">
                        {currentActivity === 'study' ? 'Focus time' : 'Rest time'}
                      </h2>
                      
                      <div className="text-6xl font-light text-calm-800 my-8">
                        {formatTime(timeRemaining)}
                      </div>

                      {/* Progress circle */}
                      <div className="relative w-32 h-32 mx-auto mb-6">
                        <svg className="transform -rotate-90 w-32 h-32">
                          <circle
                            cx="64"
                            cy="64"
                            r="60"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-calm-200"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="60"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 60}`}
                            strokeDashoffset={`${2 * Math.PI * 60 * (1 - getTimerProgress() / 100)}`}
                            className="text-calm-600 transition-all duration-1000"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>

                      <p className="text-calm-600 mb-6">
                        {pomodoroEnabled && 'Pomodoro mode: Take a 5-min break after this session'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handlePlayPause}
                      className="px-8 py-3 bg-calm-800 text-white rounded-lg hover:bg-calm-700 transition-colors flex items-center gap-2"
                    >
                      {isTimerRunning ? (
                        <><Pause className="w-5 h-5" /> Pause</>
                      ) : (
                        <><Play className="w-5 h-5" /> {timeRemaining === timerDuration * 60 ? 'Start' : 'Resume'}</>
                      )}
                    </button>
                    <button
                      onClick={handleResetTimer}
                      className="px-6 py-3 border-2 border-calm-300 text-calm-700 rounded-lg hover:bg-calm-50 transition-colors flex items-center gap-2"
                    >
                      <RotateCcw className="w-5 h-5" /> Reset
                    </button>
                  </div>

                  <button
                    onClick={handleReset}
                    className="mt-4 text-calm-500 hover:text-calm-700 transition-colors"
                  >
                    End session
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        <footer className="text-center mt-8 text-calm-500 text-sm">
          <p>Made with care for students who deserve rest.</p>
        </footer>
      </div>

      {/* Optional cloud sync - never blocks core usage */}
      <CloudSync onAuthChange={setIsAuthenticated} />
    </div>
  )
}

export default App
