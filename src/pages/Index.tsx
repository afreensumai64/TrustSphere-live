import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ScanFace, Fingerprint, Activity, FileCheck, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  { icon: ScanFace, title: "Live Face Verification", desc: "Real-time camera capture with alignment guides and AI-powered face matching." },
  { icon: Fingerprint, title: "Liveness Detection", desc: "Challenge-based detection to prevent spoofing attacks with frame analysis." },
  { icon: FileCheck, title: "Document Verification", desc: "OCR extraction, format validation, and tamper detection for ID documents." },
  { icon: Activity, title: "Risk Scoring Engine", desc: "Dynamic 0-100 risk scoring with multi-factor analysis and auto-decisioning." },
  { icon: Lock, title: "Bank-Grade Security", desc: "SHA-256 hashing, encrypted storage, and comprehensive audit logging." },
  { icon: Shield, title: "Continuous Monitoring", desc: "Ongoing risk assessment with device fingerprinting and anomaly detection." },
];

const stats = [
  { value: "99.7%", label: "Accuracy Rate" },
  { value: "<3s", label: "Verification Time" },
  { value: "50M+", label: "Identities Verified" },
  { value: "150+", label: "Countries Covered" },
];

const Index = () => {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero min-h-[85vh] flex items-center">
        <div className="absolute inset-0 opacity-20">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        <div className="container relative z-10 py-20">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-secondary/30 bg-secondary/10 text-secondary text-sm font-medium mb-6">
                <Shield className="w-4 h-4" />
                Real Time Digital KYC Platform
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-[1.1] mb-6">
                Identity Verification
                <br />
                <span className="text-gradient-accent">You Can Trust</span>
              </h1>
              <p className="text-lg text-primary-foreground/70 max-w-xl mb-8 leading-relaxed">
                TrustSphere delivers bank-grade digital KYC with live camera verification,
                AI-powered fraud detection, and dynamic risk scoring — all in seconds.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2 text-base px-8 h-12">
                  <Link to="/verify">
                    Start Verification <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" className="bg-primary-foreground text-primary border border-primary-foreground hover:bg-primary-foreground/90 h-12 px-8 text-base font-medium">
                  <Link to="/dashboard">View Dashboard</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-b border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl font-bold text-gradient-accent">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl font-bold text-foreground mb-3">Comprehensive Verification Suite</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Every tool you need to verify identities with confidence and comply with global KYC regulations.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group bg-card rounded-xl border border-border p-6 shadow-card hover:shadow-card-hover transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                  <f.icon className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-hero">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              Ready to Verify Identities?
            </h2>
            <p className="text-primary-foreground/70 mb-8 max-w-md mx-auto">
              Start your first verification in under 30 seconds with our real-time KYC platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {["Real Camera Capture", "AI Fraud Detection", "Instant Results"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-secondary text-sm">
                  <CheckCircle2 className="w-4 h-4" /> {item}
                </div>
              ))}
            </div>
            <Button asChild size="lg" className="mt-8 bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2 h-12 px-10">
              <Link to="/verify">
                Begin Verification <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
