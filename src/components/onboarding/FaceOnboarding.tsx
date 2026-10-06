"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getFaceDescriptor, loadFaceApiModels } from "@/lib/face-recognition"
import { registerFaceAction } from "@/lib/actions/attendance"
import { Loader2 } from "lucide-react"
import { AnimatedCard } from "@/components/ui/PageAnimator"

export function FaceOnboarding() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isModelsLoaded, setIsModelsLoaded] = useState(false)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [photoData, setPhotoData] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadFaceApiModels().then(() => setIsModelsLoaded(true))
  }, [])

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraOpen(true)
      }
    } catch (err) {
      console.error("Camera access failed:", err)
      alert("Camera access is required to register Face ID.")
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
      
      const stream = videoRef.current.srcObject as MediaStream
      stream?.getTracks().forEach(track => track.stop())
      setIsCameraOpen(false)
    }
  }

  const resetPhoto = () => {
    setPhotoData(null)
    openCamera()
  }

  const handleRegisterFace = async () => {
    if (!photoData) return

    setIsSubmitting(true)
    try {
      const img = new Image()
      img.src = photoData
      await new Promise((resolve) => { img.onload = resolve })
      
      const faceDescriptor = await getFaceDescriptor(img)
      
      if (!faceDescriptor) {
        setIsSubmitting(false)
        alert("No face detected in the photo. Please ensure your face is clearly visible and well lit.")
        resetPhoto()
        return
      }

      const formData = new FormData()
      formData.append("photo", photoData)
      formData.append("faceDescriptor", JSON.stringify(Array.from(faceDescriptor)))
      
      await registerFaceAction(formData)
      alert("Face registered successfully!")
      router.push("/dashboard")
      router.refresh()
    } catch (e) {
      setIsSubmitting(false)
      console.error(e)
      alert("Face registration failed. Please try again.")
    }
  }

  if (!isModelsLoaded) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-secondary">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Loading AI models...</p>
      </div>
    )
  }

  return (
    <AnimatedCard className="p-8 bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-2xl shadow-lg max-w-lg mx-auto flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-on-surface dark:text-white mb-2">Register Face ID</h2>
        <p className="text-secondary dark:text-slate-400">Please take a clear photo of your face. This will be used for attendance check-ins.</p>
      </div>

      <div className="relative w-full aspect-square bg-surface-container dark:bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border-2 border-dashed border-outline-variant dark:border-slate-800">
        {!isCameraOpen && !photoData && (
          <button
            onClick={openCamera}
            className="flex flex-col items-center justify-center gap-3 w-full h-full text-secondary hover:text-primary transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
          >
            <span className="material-symbols-outlined text-4xl">photo_camera</span>
            <span className="font-medium">Click to open camera</span>
          </button>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${!isCameraOpen && "hidden"}`}
        />
        
        {photoData && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoData} alt="Captured face" className="w-full h-full object-cover" />
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {isCameraOpen && (
        <button
          type="button"
          onClick={capturePhoto}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">camera</span>
          Capture Photo
        </button>
      )}

      {photoData && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={resetPhoto}
            disabled={isSubmitting}
            className="flex-1 h-12 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors"
          >
            Retake
          </button>
          <button
            type="button"
            onClick={handleRegisterFace}
            disabled={isSubmitting}
            className="flex-[2] h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">check_circle</span>
                Register Face ID
              </>
            )}
          </button>
        </div>
      )}
    </AnimatedCard>
  )
}
