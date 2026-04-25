import { useRef, useState, useCallback, useEffect } from "react";
import { Camera, RotateCcw, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface CameraCaptureProps {
  mode: "selfie" | "document";
  onCapture: (imageData: string) => void;
  onCancel: () => void;
}

const CameraCapture = ({ mode, onCapture, onCancel }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode === "selfie" ? "user" : "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch {
      setError("Camera access denied. Please allow camera permissions.");
    }
  }, [mode]);

  useEffect(() => {
    startCamera();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [startCamera]);

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (mode === "selfie") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    setCaptured(canvas.toDataURL("image/jpeg", 0.9));
  };

  const retake = () => {
    setCaptured(null);
    startCamera();
  };

  const confirm = () => {
    if (captured) onCapture(captured);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <X className="w-8 h-8 text-destructive" />
        </div>
        <p className="text-sm text-muted-foreground text-center">{error}</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={startCamera}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-md aspect-[4/3] rounded-xl overflow-hidden bg-foreground/5">
        {!captured ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${mode === "selfie" ? "scale-x-[-1]" : ""}`}
            />
            {/* Alignment guide overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {mode === "selfie" ? (
                <div className="w-48 h-60 border-2 border-secondary rounded-[50%] shadow-glow opacity-80" />
              ) : (
                <div className="w-72 h-44 border-2 border-secondary rounded-lg shadow-glow opacity-80">
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-secondary" />
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-secondary" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-secondary" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-secondary" />
                </div>
              )}
            </div>
            {/* Scan line animation */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="w-full h-0.5 bg-secondary/50 animate-scan" />
            </div>
          </>
        ) : (
          <motion.img
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={captured}
            alt="Captured"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <p className="text-sm text-muted-foreground text-center">
        {mode === "selfie"
          ? "Position your face within the oval guide"
          : "Align your ID card within the frame"}
      </p>

      <div className="flex gap-3">
        {!captured ? (
          <>
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button onClick={capture} className="gap-2">
              <Camera className="w-4 h-4" /> Capture
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={retake} className="gap-2">
              <RotateCcw className="w-4 h-4" /> Retake
            </Button>
            <Button onClick={confirm} className="gap-2 bg-success hover:bg-success/90 text-success-foreground">
              <Check className="w-4 h-4" /> Use Photo
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;
