import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface RiskGaugeProps {
  score: number; // 0-100
  size?: number;
}

const RiskGauge = ({ score, size = 200 }: RiskGaugeProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 300);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = (size - 20) / 2;
  const circumference = Math.PI * radius;
  const progress = (animatedScore / 100) * circumference;

  const getColor = (s: number) => {
    if (s <= 30) return "hsl(152, 69%, 38%)";
    if (s <= 70) return "hsl(38, 92%, 50%)";
    return "hsl(0, 84%, 60%)";
  };

  const getLabel = (s: number) => {
    if (s <= 30) return "Low Risk";
    if (s <= 70) return "Medium Risk";
    return "High Risk";
  };

  const getDecision = (s: number) => {
    if (s <= 30) return "Auto Approve";
    if (s <= 70) return "Manual Review";
    return "Reject";
  };

  const color = getColor(animatedScore);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
        <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
          {/* Background arc */}
          <path
            d={`M 10 ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2 + 10}`}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <motion.path
            d={`M 10 ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2 + 10}`}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <motion.span
            className="text-4xl font-bold"
            style={{ color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {animatedScore}
          </motion.span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold" style={{ color }}>
          {getLabel(score)}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{getDecision(score)}</p>
      </div>
    </div>
  );
};

export default RiskGauge;
