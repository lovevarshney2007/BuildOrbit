"use client"

import { useState, useRef, useEffect } from "react"
import { markDailyAttendance } from "@/lib/actions/attendance"
import { AnimatedCard } from "@/components/ui/PageAnimator"

interface Props {
  recentAttendances?: Array<{
    id: string
    date: Date
    checkIn: Date | null
    status: string
  }>
}

export function MarkAttendanceForm({ recentAttendances = [] }: Props) {
  const [photoData, setPhotoData] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [currentTime, setCurrentTime] = useState<Date | null>(null)

  useEffect(() => {
    // Only update on interval to avoid synchronous state update in effect body
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [useFallback, setUseFallback] = useState(false)

  // Start Camera Stream
  const openCamera = async () => {
    // If we're already in fallback mode, just trigger the file picker
    if (useFallback) {
      fileInputRef.current?.click()
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraOpen(true)
      }
    } catch (err) {
      console.error("Camera access failed:", err)
      // Fallback to file input if camera fails (e.g. on desktop without webcam or strict permissions)
      setUseFallback(true)
      fileInputRef.current?.click()
    }
  }

  // Capture from Video Stream
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d")
      canvasRef.current.width = videoRef.current.videoWidth
      canvasRef.current.height = videoRef.current.videoHeight
      context?.drawImage(videoRef.current, 0, 0)
      const dataUrl = canvasRef.current.toDataURL("image/jpeg")
      setPhotoData(dataUrl)
      
      // Stop stream
      const stream = videoRef.current.srcObject as MediaStream
      stream?.getTracks().forEach(track => track.stop())
      setIsCameraOpen(false)
    }
  }

  // Handle File Input Fallback
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoData(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const resetPhoto = () => {
    setPhotoData(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleMarkAttendance = async () => {
    if (!photoData) {
      alert("Please take a photo first.")
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords
        setIsLocating(false)
        setIsSubmitting(true)

        try {
          const formData = new FormData()
          formData.append("latitude", latitude.toString())
          formData.append("longitude", longitude.toString())
          formData.append("accuracy", accuracy.toString())
          formData.append("photo", photoData)
          
          await markDailyAttendance(formData)
          alert("Attendance marked successfully!")
        } catch (error: unknown) {
          alert((error as Error).message || "Failed to mark attendance.")
        } finally {
          setIsSubmitting(false)
        }
      },
      (geolocationError) => {
        setIsLocating(false)
        console.error("Geolocation error:", geolocationError)
        alert("Failed to get location. Please enable location services.")
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  return (
    <div className="w-full">
      <AnimatedCard className="p-6 bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-on-surface dark:text-white">Mark Attendance</h2>
            <p className="text-secondary dark:text-slate-400 text-sm mt-1">Take a photo of yourself at the office to mark today&apos;s attendance. Your location will be captured automatically.</p>
          </div>
          <div className="bg-surface-container dark:bg-slate-900 px-4 py-2 rounded-lg border border-outline-variant dark:border-slate-800 flex flex-col items-center justify-center shrink-0 min-w-[140px]">
            <span className="text-sm font-medium text-secondary dark:text-slate-400">
              {currentTime ? currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '---'}
            </span>
            <span className="text-xl font-bold text-on-surface dark:text-white font-tabular-nums tracking-tight">
              {currentTime ? currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
            </span>
          </div>
        </div>

        <div className={`border rounded-xl flex flex-col items-center justify-center overflow-hidden relative transition-all duration-300 w-full max-h-[320px] md:max-h-[400px] ${photoData || (isCameraOpen && !useFallback) ? 'border-solid border-slate-200 dark:border-slate-800 bg-black aspect-[4/3] md:aspect-video' : 'border-dashed border-outline-variant dark:border-slate-800 bg-slate-50 dark:bg-slate-900 min-h-[240px] p-4'}`}>
          
          {/* Captured Photo Preview */}
          {photoData && (
            <div className="absolute inset-0 w-full h-full animate-in fade-in zoom-in-95 duration-300">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoData} alt="Captured" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent pointer-events-none"></div>
              <button onClick={resetPhoto} className="absolute top-4 right-4 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white w-10 h-10 rounded-full transition-all flex items-center justify-center shadow-md border border-slate-200 dark:border-slate-700 hover:scale-105 z-20 pointer-events-auto">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          )}

          {/* Live Video Stream (Always mounted, conditionally visible) */}
          <div className={`absolute inset-0 w-full h-full animate-in fade-in duration-500 ${isCameraOpen && !useFallback && !photoData ? 'block' : 'hidden'}`}>
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
            <canvas ref={canvasRef} className="hidden"></canvas>
            
            {/* Camera Overlay Elements */}
            <div className="absolute inset-0 pointer-events-none border-[1px] border-white/20 m-4 rounded-lg">
              {/* Corner focus markers */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white/60 -m-[1px] rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white/60 -m-[1px] rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white/60 -m-[1px] rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white/60 -m-[1px] rounded-br-lg"></div>
            </div>

            {/* Camera Shutter Button */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20 pointer-events-auto">
              <button onClick={capturePhoto} className="w-16 h-16 rounded-full border-[3px] border-white/50 bg-white dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 hover:scale-105 hover:border-white transition-all shadow-xl flex items-center justify-center group">
                <div className="w-12 h-12 rounded-full border border-slate-300/50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-800 dark:text-white">camera</span>
                </div>
              </button>
            </div>
          </div>

          {/* Initial State / Fallback State */}
          {!photoData && !isCameraOpen && (
            <div className="flex flex-col items-center w-full animate-in fade-in">
              <input 
                type="file" 
                accept="image/*" 
                capture="user" 
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden" 
              />
              <button onClick={openCamera} className="flex flex-col items-center gap-3 text-primary hover:text-primary-dark transition-colors p-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">photo_camera</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-semibold text-lg">Tap to take a photo</span>
                  <span className="text-secondary dark:text-slate-400 text-sm font-medium mt-1">Uses device camera & GPS</span>
                </div>
              </button>
            </div>
          )}
        </div>

        <button 
          onClick={handleMarkAttendance} 
          disabled={!photoData || isSubmitting || isLocating}
          className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-sm
            ${!photoData || isSubmitting || isLocating ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark text-white hover:shadow'}`}
        >
          {isLocating ? (
            <><span className="material-symbols-outlined animate-spin text-sm">my_location</span> Locating...</>
          ) : isSubmitting ? (
            <><span className="material-symbols-outlined animate-spin text-sm">sync</span> Verifying...</>
          ) : (
            <><span className="material-symbols-outlined text-sm">how_to_reg</span> Mark Attendance</>
          )}
        </button>

        {recentAttendances.length > 0 && (
          <div className="mt-4 pt-4 border-t border-outline-variant dark:border-slate-800">
            <h3 className="text-sm font-semibold text-on-surface dark:text-white mb-3">Recent Attendance</h3>
            <div className="flex flex-col gap-2">
              {recentAttendances.map(record => (
                <div key={record.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-container dark:bg-slate-900 border border-outline-variant dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px]">
                        {record.status === 'PRESENT' ? 'check_circle' : 'event_available'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-on-surface dark:text-white">
                        {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-xs text-secondary dark:text-slate-400 capitalize">
                        {record.status.toLowerCase().replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-on-surface dark:text-white">
                      {record.checkIn ? new Date(record.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </p>
                    <p className="text-xs text-secondary dark:text-slate-400">Time-in</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </AnimatedCard>
    </div>
  )
}
