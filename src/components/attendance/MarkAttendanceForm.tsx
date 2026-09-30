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
  const [isCameraOpen, setIsCameraOpen] = useState(false)

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraOpen(true)
      }
    } catch (err) {
      alert("Could not access camera. Please allow permissions.")
    }
  }

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

  const resetPhoto = () => {
    setPhotoData(null)
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

        <div className="border border-dashed border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center min-h-[240px] bg-slate-50 relative overflow-hidden">
          {photoData ? (
            <div className="relative w-full h-full flex flex-col items-center">
              <img src={photoData} alt="Captured" className="max-h-[240px] rounded-lg shadow-sm" />
              <button onClick={resetPhoto} className="absolute top-2 right-2 bg-slate-900/50 hover:bg-slate-900 text-white p-2 rounded-full backdrop-blur transition-all">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          ) : isCameraOpen ? (
            <div className="relative w-full flex flex-col items-center">
              <video ref={videoRef} autoPlay playsInline className="max-h-[240px] rounded-lg shadow-sm bg-black"></video>
              <canvas ref={canvasRef} className="hidden"></canvas>
              <button onClick={capturePhoto} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-full font-semibold shadow-md transition-all flex items-center gap-2">
                <span className="material-symbols-outlined">camera</span>
                Capture
              </button>
            </div>
          ) : (
            <button onClick={openCamera} className="flex flex-col items-center gap-2 text-primary hover:text-primary-dark transition-colors p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">photo_camera</span>
              </div>
              <span className="font-semibold">Tap to take a photo</span>
            </button>
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
