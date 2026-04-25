# 🚀 TrustCheck Live  
### AI-Powered Fraud Detection & Smart KYC Verification System Live Demo: https://trustsphere-digital-kyc.vercel.app/

---

## 🧠 Overview

**TrustCheck Live** is an AI-driven identity verification system that goes beyond traditional KYC by integrating fraud detection, behavioral analysis, and risk scoring.

This is a hackathon-ready prototype focused on demonstrating real-world impact using lightweight and scalable components.

---

## 🎯 Problem Statement

Traditional KYC systems are vulnerable to:
- Fake IDs
- Deepfakes
- Bot-based registrations
- Identity fraud

Most existing solutions only perform OCR and face matching, which is insufficient.

---

## 💡 Solution

TrustCheck Live uses a multi-layer verification approach:

- Document OCR Verification  
- Face Matching using AI  
- Liveness Detection  
- Behavioral Biometrics  
- Risk Scoring Engine  
- Blockchain-inspired Tamper Detection  

---

## 🏗️ System Architecture

### 🔹 Frontend
- React / Flutter  
- Upload ID  
- Capture Selfie  
- Display Risk Score  


#### Responsibilities:
- Process images
- Run AI models
- Compute risk score
- Return verification result

---

## 🤖 AI Components

### 📄 Document OCR
- Tool: Tesseract OCR  
- Extracts text from ID  
- Validates fields (Name, DOB, ID Number)

---

### 🧑 Face Matching
- Model: FaceNet  
- Convert images to embeddings  
- Compare using cosine similarity  

---

### 👁️ Liveness Detection
- User actions:
  - Blink  
  - Turn head  

- Detection:
  - Frame difference using OpenCV  
  - Prevents spoofing via static images  

---

### ⌨️ Behavioral Biometrics

Captured:
- Typing intervals  
- Mouse movement patterns  

Logic:
- Highly uniform behavior → flagged as bot  

---

## 📊 Risk Scoring

Weighted scoring based on:
- Face similarity  
- OCR confidence  
- Liveness result  
- Behavioral patterns  

### Example:
```json
{
  "risk_score": 27,
  "status": "Approved"
}
