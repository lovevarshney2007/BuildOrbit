"use client"

import { useState, useRef } from "react"
import { markDailyAttendance } from "@/lib/actions/attendance"
import { AnimatedCard } from "@/components/ui/PageAnimator"

export function MarkAttendanceForm() {
  const [photoData, setPhotoData] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  
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
        const { latitude, longitude } = position.coords
        setLocation({ lat: latitude, lng: longitude })
        setIsLocating(false)
        setIsSubmitting(true)

        try {
          const formData = new FormData()
          formData.append("latitude", latitude.toString())
          formData.append("longitude", longitude.toString())
          formData.append("photo", photoData)
          
          await markDailyAttendance(formData)
          alert("Attendance marked successfully!")
        } catch (error: any) {
          alert(error.message || "Failed to mark attendance.")
        } finally {
          setIsSubmitting(false)
        }
      },
      (error) => {
        setIsLocating(false)
        alert("Failed to get location. Please enable location services.")
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  return (
    <div className="w-full">
      <AnimatedCard className="p-6 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Mark Attendance</h2>
          <p className="text-secondary text-sm mt-1">Take a photo of yourself at the office to mark today's attendance. Your location will be captured automatically and must be within 100m of the office.</p>
        </div>

        <div className={`border rounded-xl flex flex-col items-center justify-center overflow-hidden relative transition-all duration-300 w-full ${photoData || (isCameraOpen && !useFallback) ? 'border-solid border-slate-200 bg-black aspect-[4/3] md:aspect-video' : 'border-dashed border-outline-variant bg-slate-50 min-h-[240px] p-4'}`}>
          
          {/* Captured Photo Preview */}
          {photoData && (
            <div className="absolute inset-0 w-full h-full animate-in fade-in zoom-in-95 duration-300">
              <img src={photoData} alt="Captured" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent pointer-events-none"></div>
              <button onClick={resetPhoto} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white w-10 h-10 rounded-full backdrop-blur-md transition-all flex items-center justify-center shadow-sm border border-white/10 hover:scale-105">
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
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <button onClick={capturePhoto} className="w-16 h-16 rounded-full border-[3px] border-white/50 bg-white/90 hover:bg-white hover:scale-105 hover:border-white transition-all shadow-xl flex items-center justify-center group backdrop-blur-sm">
                <div className="w-12 h-12 rounded-full border border-slate-300/50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200">camera</span>
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
                  <span className="font-semibold text-lg">Tap to verify presence</span>
                  <span className="text-secondary text-sm font-medium mt-1">Uses device camera & GPS</span>
                </div>
              </button>
            </div>
          )}
        </div>

        <button 
          onClick={handleMarkAttendance} 
          disabled={!photoData || isSubmitting || isLocating}
          className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-sm
            ${!photoData || isSubmitting || isLocating ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark text-white hover:shadow'}`}
        >
          {isLocating ? (
            <><span className="material-symbols-outlined animate-spin text-sm">my_location</span> Locating...</>
          ) : isSubmitting ? (
            <><span className="material-symbols-outlined animate-spin text-sm">sync</span> Verifying...</>
          ) : (
            <><span className="material-symbols-outlined text-sm">how_to_reg</span> Mark Attendance</>
          )}
        </button>
      </AnimatedCard>
    </div>
  )
}
