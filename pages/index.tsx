import React, { useState, useRef, useEffect } from 'react'
import Head from 'next/head'
import { Upload, Download, TrendingUp, Zap, Loader } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
export default function Home() {
  
  
  const [activeTab, setActiveTab] = useState('log')
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([])
  const [currentDay, setCurrentDay] = useState('Monday')
  const [logInput, setLogInput] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)

useEffect(() => {
  loadWorkouts()
}, [])

const loadWorkouts = async () => {
  const { data } = await supabase
    .from('workout_logs')
    .select('*')
    .order('created_at', { ascending: false })
  if (data) setWorkoutHistory(data)
  setLoadingHistory(false)
}
  const [feedback, setFeedback] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const weekSchedule: Record<string, string[]> = {
    Monday: ['45-60 min Zone 2', '50 Yoga Ball Crunches', '50 Push ups'],
    Tuesday: ['Warm-up 5 min', '5x5 Deadlift (190lbs)', '5x5 Bench Press (135lbs)', '2 sets Pullups', '2 sets Dips'],
    Wednesday: ['45-60 min Zone 2', '3 sets Plank', '25 Scoops Push ups', '25 V ups'],
    Thursday: ['Warm up 5 min', '5x5 Back Squat (155lbs)', '5x5 OHP (65lbs)', '2 sets GHD', '2 sets KB Swings (25)'],
    Friday: ['45-60 min Zone 2', '15-20 min Stretching'],
    Saturday: ['Optional Fitness 1-1.5 hrs'],
    Sunday: ['Rest']
  }

  const isCardioDay = ['Monday', 'Wednesday', 'Friday'].includes(currentDay)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const callClaudeAPI = async (prompt: string, imageData: string | null = null) => {
    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, imageData }),
      });
      const data = await res.json();
      return data.text || 'No feedback received.';
    } catch (error) {
      console.error('API Error:', error);
      return 'Unable to get feedback. Please try again.';
    }
  };

  const handleLogSubmit = async () => {
    if (!logInput.trim()) return

    setLoading(true)
    setShowFeedback(false)

    let prompt = ''
    let imageData = imagePreview

    if (isCardioDay) {
      prompt = `You are Inigo San Millán, a world-class Zone 2 cardio coach. A client just logged a Zone 2 cardio session:

Day: ${currentDay}
Notes: ${logInput}
${imageData ? '(Screenshot attached showing their Polar/Apple Watch data)' : ''}

Analyze their workout. Check:
1. Are they in the right heart rate zone (Zone 2 typically 120-150 bpm depending on fitness)?
2. Duration - is it 45-60 minutes as prescribed?
3. Consistency - how does this compare to their training?

Give SHORT, encouraging feedback (2-3 sentences max). Use your coaching style - focus on aerobic base building and consistency. Be positive!`
    } else {
      prompt = `You are Mike Rippetoe, legendary strength coach. A client just logged their 5x5 workout:

Day: ${currentDay}
Logged: ${logInput}

Review their lift:
1. Is the weight appropriate for progression?
2. Did they complete the prescribed sets/reps?
3. Any form concerns based on their notes?
4. What should they shoot for NEXT ${currentDay}? (Deadlift +10lbs, Bench +5lbs, Squat +5lbs, OHP +2.5lbs)

Give SHORT coaching feedback (2-3 sentences). Be direct but encouraging. Include what weight to target next week.`
    }

    const coachFeedback = await callClaudeAPI(prompt, imageData)

    const newEntry = {
  date: new Date().toLocaleDateString(),
  day: currentDay,
  notes: logInput,
  feedback: coachFeedback,
  is_cardio: isCardioDay
}

await supabase.from('workout_logs').insert([newEntry])
await loadWorkouts()
setFeedback(coachFeedback)
setShowFeedback(true)
setLogInput('')
setImagePreview(null)
setLoading(false)
  }

  const handleExportCSV = () => {
    let csvContent = 'Date,Day,Type,Notes,Feedback\n'

    workoutHistory.forEach((entry) => {
      const type = entry.is_cardio ? 'Cardio' : 'Strength'
      const notes = entry.notes.replace(/,/g, ';').replace(/\n/g, ' ')
      const feedbackText = entry.feedback.replace(/,/g, ';').replace(/\n/g, ' ')
      csvContent += `"${entry.date}","${entry.day}","${type}","${notes}","${feedbackText}"\n`
    })

    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'Workout_Log_2026.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <Head>
        <title>Workout Logger</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Track your workouts with AI coaching" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 font-sans pb-20">
        {/* Header */}
        <div className="mb-8 mt-4">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Workout Log
          </h1>
         <p className="text-slate-400">Workout Logger 2026</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('log')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'log'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Log Workout
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'schedule'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Schedule
          </button>
        </div>

        {/* Log Tab */}
        {activeTab === 'log' && (
          <div className="space-y-6">
            {/* Day Selector */}
            <div className="bg-slate-800 rounded-lg p-4">
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Select Day
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(weekSchedule).map((day) => (
                  <button
                    key={day}
                    onClick={() => setCurrentDay(day)}
                    className={`py-2 px-3 rounded-lg font-semibold transition-all text-sm ${
                      currentDay === day
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Today's Plan */}
            <div className="bg-slate-800 rounded-lg p-4 border-l-4 border-blue-500">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Zap size={20} className="text-blue-400" />
                {currentDay}'s Plan
              </h3>
              <ul className="space-y-2">
                {weekSchedule[currentDay].map((exercise, idx) => (
                  <li key={idx} className="text-slate-300 flex items-start gap-2 text-sm">
                    <span className="text-blue-400 font-bold mt-1">•</span>
                    {exercise}
                  </li>
                ))}
              </ul>
            </div>

            {/* Log Input */}
            <div className="bg-slate-800 rounded-lg p-4">
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                {isCardioDay ? 'Log Cardio Session' : 'Log Lifts'}
              </label>

            
                <div className="mb-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all text-sm"
                  >
                    <Upload size={18} />
                    Upload Screenshot
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {imagePreview && (
                    <div className="mt-3">
                      <img src={imagePreview} alt="Cardio data" className="w-full rounded-lg max-h-48 object-cover" />
                    </div>
                  )}
                </div>
            

              <textarea
                value={logInput}
                onChange={(e) => setLogInput(e.target.value)}
                placeholder={
                  isCardioDay
                    ? 'e.g., 45 min Zone 2 walk, 18-20 mph, 15% incline, HR avg 119'
                    : 'e.g., Deadlift 5x5 @ 190lbs, felt strong, form clean'
                }
                className="w-full bg-slate-700 text-white rounded-lg p-3 border border-slate-600 focus:border-blue-500 focus:outline-none mb-3 h-24 text-sm"
              />

              <button
                onClick={handleLogSubmit}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-bold py-3 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Getting Feedback...
                  </>
                ) : (
                  `Log ${isCardioDay ? 'Cardio' : 'Strength'}`
                )}
              </button>
            </div>

            {/* Coach Feedback */}
            {showFeedback && (
              <div className="bg-gradient-to-r from-green-900 to-green-800 rounded-lg p-4 border-l-4 border-green-400 animate-slide-in">
                <h3 className="font-bold text-lg mb-2 text-green-300">
                  {isCardioDay ? '🏃 Inigo Says:' : '💪 Coach Rippetoe Says:'}
                </h3>
                <p className="text-green-100 text-sm leading-relaxed">{feedback}</p>
              </div>
            )}

            {/* Recent Logs */}
            {workoutHistory.length > 0 && (
              <div className="bg-slate-800 rounded-lg p-4">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <TrendingUp size={20} className="text-green-400" />
                  Recent Logs ({workoutHistory.length})
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {[...workoutHistory].map((entry, idx) => (
                    <div key={idx} className="bg-slate-700 p-3 rounded border-l-2 border-blue-400">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-blue-400 text-sm">{entry.day} ({entry.date})</span>
                        <span className="text-xs text-slate-400">{entry.isCardio ? 'Cardio' : 'Strength'}</span>
                      </div>
                      <p className="text-slate-300 text-xs mb-1">{entry.notes}</p>
                      <p className="text-green-300 text-xs italic">{entry.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Export Button */}
            {workoutHistory.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Download size={20} />
                Export to CSV
              </button>
            )}
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            {Object.entries(weekSchedule).map(([day, exercises]) => (
              <div
                key={day}
                className={`rounded-lg p-4 border-l-4 ${
                  ['Monday', 'Wednesday', 'Friday'].includes(day)
                    ? 'bg-slate-800 border-green-500'
                    : day === 'Sunday'
                    ? 'bg-slate-800 border-slate-600'
                    : 'bg-slate-800 border-blue-500'
                }`}
              >
                <h3 className="font-bold text-lg mb-2">{day}</h3>
                <ul className="space-y-1">
                  {exercises.map((exercise, idx) => (
                    <li key={idx} className="text-slate-300 text-sm flex items-start gap-2">
                      <span className="text-slate-500">•</span>
                      {exercise}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
