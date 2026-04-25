import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LivenessDetectionProps {
  onComplete: (passed: boolean, confidence: number) => void;
  onCancel: () => void;
}

const challenges = [
  { id: "blink", instruction: "Please blink your eyes", icon: "👁️" },
  { id: "smile", instruction: "Now give a smile", icon: "😊" },
  { id: "turn", instruction: "Turn your head slightly left", icon: "↩️" },
];

const LivenessDetection = ({ onComplete, onCancel }: LivenessDetectionProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevFrameRef = useRef<ImageData | null>(null);
  const [step, setStep] = useState(0);
  const [detecting, setDetecting] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const ms = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      setStream(ms);
      if (videoRef.current) videoRef.current.srcObject = ms;
    } catch {
      // Camera error handled silently
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [startCamera]);

  const detectMovement = useCallback((): number => {
    if (!videoRef.current || !canvasRef.current) return 0;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;

    canvas.width = 160;
    canvas.height = 120;
    ctx.drawImage(videoRef.current, 0, 0, 160, 120);
    const currentFrame = ctx.getImageData(0, 0, 160, 120);

    if (!prevFrameRef.current) {
      prevFrameRef.current = currentFrame;
      return 0;
    }

    let diff = 0;
    const prev = prevFrameRef.current.data;
    const curr = currentFrame.data;
    for (let i = 0; i < curr.length; i += 4) {
      diff += Math.abs(curr[i] - prev[i]);
      diff += Math.abs(curr[i + 1] - prev[i + 1]);
      diff += Math.abs(curr[i + 2] - prev[i + 2]);
    }
    const pixels = curr.length / 4;
    const avgDiff = diff / (pixels * 3);

    prevFrameRef.current = currentFrame;
    return avgDiff;
  }, []);

  const runChallenge = useCallback(() => {
    setDetecting(true);
    prevFrameRef.current = null;

    let maxMovement = 0;
    let checks = 0;
    const interval = setInterval(() => {
      const movement = detectMovement();
      maxMovement = Math.max(maxMovement, movement);
      checks++;
      if (checks >= 15) {
        clearInterval(interval);
        const passed = maxMovement > 3;
        setResults((prev) => [...prev, passed]);
        setDetecting(false);

        if (step < challenges.length - 1) {
          timerRef.current = window.setTimeout(() => setStep((s) => s + 1), 800);
        } else {
          const allResults = [...results, passed];
          const passedCount = allResults.filter(Boolean).length;
          const confidence = (passedCount / allResults.length) * 100;
          timerRef.current = window.setTimeout(() => {
            stream?.getTracks().forEach((t) => t.stop());
            onComplete(passedCount >= 2, confidence);
          }, 1000);
        }
      }
    }, 200);

    return () => clearInterval(interval);
  }, [step, results, detectMovement, onComplete, stream]);

  useEffect(() => {
    if (stream && !detecting && results.length === step) {
      const t = setTimeout(runChallenge, 1500);
      return () => clearTimeout(t);
    }
  }, [step, stream, detecting, results.length, runChallenge]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-full max-w-sm aspect-square rounded-full overflow-hidden border-4 border-secondary/30">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1]"
        />
        {detecting && (
          <div className="absolute inset-0 border-4 border-secondary rounded-full animate-pulse" />
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Progress */}
      <div className="flex gap-3">
        {challenges.map((c, i) => (
          <div
            key={c.id}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-colors ${
              i < results.length
                ? results[i]
                  ? "border-success bg-success/10"
                  : "border-destructive bg-destructive/10"
                : i === step
                ? "border-secondary bg-secondary/10"
                : "border-border bg-muted"
            }`}
          >
            {i < results.length ? (
              results[i] ? (
                <CheckCircle2 className="w-5 h-5 text-success" />
              ) : (
                <XCircle className="w-5 h-5 text-destructive" />
              )
            ) : (
              <span>{c.icon}</span>
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-center"
        >
          {step < challenges.length && (
            <>
              <p className="text-lg font-semibold text-foreground">
                {challenges[step].instruction}
              </p>
              {detecting && (
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2 mt-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
                </p>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <Button variant="outline" onClick={onCancel}>
        Cancel Verification
      </Button>
    </div>
  );
};

export default LivenessDetection;
