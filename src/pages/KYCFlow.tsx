import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, CreditCard, FileSearch, ScanFace, Fingerprint, Shield, Check, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CameraCapture from "@/components/CameraCapture";
import LivenessDetection from "@/components/LivenessDetection";
import VerificationResult from "@/components/VerificationResult";
import DocumentUpload, { type UploadedDocuments, type FraudCheckResult } from "@/components/DocumentUpload";
import { useNavigate } from "react-router-dom";

const steps = [
  { icon: User, label: "Personal Info" },
  { icon: Upload, label: "Documents" },
  { icon: FileSearch, label: "Fraud Check" },
  { icon: ScanFace, label: "Selfie" },
  { icon: Fingerprint, label: "Liveness" },
  { icon: Shield, label: "Results" },
];

interface FormData {
  fullName: string;
  email: string;
  dateOfBirth: string;
  country: string;
  idType: string;
  idNumber: string;
}

const KYCFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    fullName: "", email: "", dateOfBirth: "", country: "", idType: "", idNumber: "",
  });
  const [documents, setDocuments] = useState<UploadedDocuments | null>(null);
  const [fraudResults, setFraudResults] = useState<FraudCheckResult[] | null>(null);
  const [selfiePhoto, setSelfiePhoto] = useState<string | null>(null);
  const [livenessResult, setLivenessResult] = useState<{ passed: boolean; confidence: number } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [verificationData, setVerificationData] = useState<any>(null);
  const navigate = useNavigate();

  const goTo = (step: number) => setCurrentStep(step);

  const handlePersonalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    goTo(1);
  };

  const handleDocumentComplete = (docs: UploadedDocuments, results: FraudCheckResult[]) => {
    setDocuments(docs);
    setFraudResults(results);
    goTo(2); // Go to fraud check review
  };

  const handleFraudReviewed = () => {
    goTo(3); // Continue to selfie
  };

  const handleSelfieCapture = (img: string) => {
    setSelfiePhoto(img);
    goTo(4); // Go to liveness
  };

  const handleLivenessComplete = (passed: boolean, confidence: number) => {
    setLivenessResult({ passed, confidence });
    runVerification(passed, confidence);
  };

  const runVerification = (livenessPassed: boolean, livenessConf: number) => {
    setProcessing(true);
    goTo(5);

    setTimeout(() => {
      // Factor in fraud results
      const fraudPenalty = fraudResults?.filter(r => !r.passed).reduce((sum, r) => {
        return sum + (r.severity === "high" ? 25 : r.severity === "medium" ? 12 : 5);
      }, 0) ?? 0;

      const docScore = fraudPenalty > 0 ? Math.min(80, fraudPenalty + Math.floor(Math.random() * 20)) : Math.floor(Math.random() * 20) + 5;
      const faceMatch = Math.floor(Math.random() * 20) + 78;
      const livenessScore = livenessPassed ? Math.floor(livenessConf) : Math.floor(livenessConf * 0.5);
      const deviceScore = Math.floor(Math.random() * 15) + 5;
      const geoScore = Math.floor(Math.random() * 20) + 5;
      const dupScore = fraudResults?.some(r => r.check === "Duplicate ID Detection" && !r.passed) ? 60 : Math.floor(Math.random() * 10) + 2;

      const weighted = docScore * 0.25 + (100 - faceMatch) * 0.25 + (100 - livenessScore) * 0.2 + deviceScore * 0.1 + geoScore * 0.1 + dupScore * 0.1;
      const riskScore = Math.min(100, Math.max(0, Math.round(weighted)));

      const hasHighFraud = fraudResults?.some(r => !r.passed && r.severity === "high");

      setVerificationData({
        documentStatus: hasHighFraud ? "review" : riskScore <= 30 ? "verified" : riskScore <= 70 ? "review" : "rejected",
        faceMatchScore: faceMatch,
        livenessConfidence: livenessScore,
        riskScore,
        fraudResults,
        riskBreakdown: [
          { label: "Document Authenticity", score: docScore, weight: 25 },
          { label: "Face Match", score: 100 - faceMatch, weight: 25 },
          { label: "Liveness Confidence", score: 100 - livenessScore, weight: 20 },
          { label: "Device Fingerprint", score: deviceScore, weight: 10 },
          { label: "Geolocation Risk", score: geoScore, weight: 10 },
          { label: "Duplicate Detection", score: dupScore, weight: 10 },
        ],
      });
      setProcessing(false);
    }, 3000);
  };

  const resetFlow = () => {
    setCurrentStep(0);
    setVerificationData(null);
    setDocuments(null);
    setFraudResults(null);
    setSelfiePhoto(null);
    setLivenessResult(null);
  };

  return (
    <div className="container py-8 max-w-3xl">
      {/* Stepper */}
      <div className="flex items-center justify-between mb-10 overflow-x-auto pb-2">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  i < currentStep
                    ? "bg-success text-success-foreground"
                    : i === currentStep
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i < currentStep ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
              </div>
              <span className="text-[10px] text-muted-foreground mt-1.5 hidden sm:block whitespace-nowrap">{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-6 sm:w-12 h-0.5 mx-1 sm:mx-2 ${i < currentStep ? "bg-success" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {/* Step 0: Personal Info */}
          {currentStep === 0 && (
            <div className="bg-card rounded-xl border border-border p-6 sm:p-8 shadow-card">
              <h2 className="text-xl font-bold text-foreground mb-1">Personal Information</h2>
              <p className="text-sm text-muted-foreground mb-6">Provide your basic details to begin verification.</p>
              <form onSubmit={handlePersonalSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="John Doe" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input id="dob" type="date" required value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Select value={formData.country} onValueChange={(v) => setFormData({ ...formData, country: v })}>
                      <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="in">India</SelectItem>
                        <SelectItem value="de">Germany</SelectItem>
                        <SelectItem value="jp">Japan</SelectItem>
                        <SelectItem value="br">Brazil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="idType">ID Type</Label>
                    <Select value={formData.idType} onValueChange={(v) => setFormData({ ...formData, idType: v })}>
                      <SelectTrigger><SelectValue placeholder="Select ID type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="passport">Passport</SelectItem>
                        <SelectItem value="drivers_license">Driver's License</SelectItem>
                        <SelectItem value="national_id">National ID</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="idNumber">ID Number</Label>
                    <Input id="idNumber" required value={formData.idNumber} onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })} placeholder="ABC123456" />
                  </div>
                </div>
                <Button type="submit" className="w-full h-11 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  Continue to Document Upload
                </Button>
              </form>
            </div>
          )}

          {/* Step 1: Document Upload */}
          {currentStep === 1 && (
            <div className="bg-card rounded-xl border border-border p-6 sm:p-8 shadow-card">
              <h2 className="text-xl font-bold text-foreground mb-1">Document Upload</h2>
              <p className="text-sm text-muted-foreground mb-6">Upload your ID document and address proof for verification.</p>
              <DocumentUpload
                onComplete={handleDocumentComplete}
                onCancel={() => goTo(0)}
                idNumber={formData.idNumber}
              />
            </div>
          )}

          {/* Step 2: Fraud Check Review */}
          {currentStep === 2 && fraudResults && (
            <div className="bg-card rounded-xl border border-border p-6 sm:p-8 shadow-card">
              <h2 className="text-xl font-bold text-foreground mb-1">Document Fraud Check</h2>
              <p className="text-sm text-muted-foreground mb-6">Review the automated fraud detection results below.</p>

              <div className="space-y-3 mb-6">
                {fraudResults.map((result, i) => (
                  <div key={i} className={`flex items-start gap-3 p-4 rounded-lg border ${
                    result.passed ? "border-success/20 bg-success/5" : "border-destructive/20 bg-destructive/5"
                  }`}>
                    {result.passed ? (
                      <Check className="w-5 h-5 text-success mt-0.5 shrink-0" />
                    ) : (
                      <Shield className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{result.check}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{result.detail}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      result.passed ? "bg-success/10 text-success" : result.severity === "high" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
                    }`}>
                      {result.passed ? "PASS" : result.severity.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>

              {fraudResults.some(r => !r.passed && r.severity === "high") && (
                <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                  <Shield className="w-4 h-4 shrink-0" />
                  Fraud indicators found. Your application will require manual review.
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => goTo(1)}>Back</Button>
                <Button onClick={handleFraudReviewed} className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  Continue to Selfie Capture
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Selfie */}
          {currentStep === 3 && (
            <div className="bg-card rounded-xl border border-border p-6 sm:p-8 shadow-card">
              <h2 className="text-xl font-bold text-foreground mb-1">Take a Selfie</h2>
              <p className="text-sm text-muted-foreground mb-6">Position your face in the oval guide for a clear selfie.</p>
              <CameraCapture mode="selfie" onCapture={handleSelfieCapture} onCancel={() => goTo(2)} />
            </div>
          )}

          {/* Step 4: Liveness */}
          {currentStep === 4 && (
            <div className="bg-card rounded-xl border border-border p-6 sm:p-8 shadow-card">
              <h2 className="text-xl font-bold text-foreground mb-1">Liveness Detection</h2>
              <p className="text-sm text-muted-foreground mb-6">Follow the on-screen instructions to prove you're a real person.</p>
              <LivenessDetection onComplete={handleLivenessComplete} onCancel={() => goTo(3)} />
            </div>
          )}

          {/* Step 5: Results */}
          {currentStep === 5 && (
            <div className="bg-card rounded-xl border border-border p-6 sm:p-8 shadow-card">
              {processing ? (
                <div className="flex flex-col items-center gap-4 py-16">
                  <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-secondary animate-spin" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-foreground mb-1">Processing Verification</h2>
                    <p className="text-sm text-muted-foreground">Analyzing documents, face match, and risk factors...</p>
                  </div>
                  <div className="w-64 h-1.5 bg-muted rounded-full overflow-hidden mt-4">
                    <div className="h-full bg-secondary rounded-full animate-shimmer" />
                  </div>
                </div>
              ) : verificationData ? (
                <>
                  <h2 className="text-xl font-bold text-foreground mb-6 text-center">Verification Complete</h2>
                  <VerificationResult data={verificationData} />
                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Button onClick={resetFlow} variant="outline">
                      Start New Verification
                    </Button>
                    <Button onClick={() => navigate("/dashboard")} className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                      View Dashboard
                    </Button>
                  </div>
                </>
              ) : null}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default KYCFlow;
