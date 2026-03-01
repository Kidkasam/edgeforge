# ⚒️ EdgeForge: Sovereign Performance Engine

![Stack](https://img.shields.io/badge/Stack-Django_|_React-6366f1?style=for-the-badge)
![Deployment](https://img.shields.io/badge/Status-Fully_Deployed-22c55e?style=for-the-badge)

**EdgeForge** is an institutional-grade performance engine for traders. Originally developed as a backend project for the **ALX Software Engineering Program**, it has been meticulously expanded into a high-performance **Full-Stack Application** with a proprietary "Sovereign" design system.

---

## 🌐 Live Sovereign Nodes

| Environment | URL |
| :--- | :--- |
| **Frontend (Interface)** | [edgeforge-nu.vercel.app](https://edgeforge-nu.vercel.app) |
| **Backend (Engine)** | [edgeforge-ct0r.onrender.com](https://edgeforge-ct0r.onrender.com) |

---

## 🚀 The Full-Stack Evolution

What began as a server-side architecture task has been forged into a complete ecosystem:
- **Phase 1 (The Core)**: Django REST Framework API handling complex PnL, pip calculations, and auth.
- **Phase 2 (The Interface)**: Engineered a premium React + Vite frontend with customized glassmorphism.
- **Phase 3 (Optimization)**: Implemented `prefetch_related` database strategies to solve N+1 query overhead and integrated **Cloudinary** for image analysis storage.

---

## 🦾 Core Capabilities

### 📈 Sovereign Trade Log
- **Automated PnL**: Real-time calculation of pips, risk-reward (RR), and win/loss outcomes.
- **Strategy Fingerprinting**: Tag executions with specific setups to identify high-edge behaviors.
- **Surgical Metadata**: Track sessions (NY, London, Asia) and capture reflections.

### 🧠 Performance Analytics
- **Win Rate Analytics**: High-definition records of profitable vs. losing archetypes.
- **Session Breakdown**: Identify your highest-performing hours through automated grouping.
- **Visual Intelligence**: Charting engine powered by `recharts` for monthly trend analysis.

---

## 🛠️ Technical Stack

- **Backend**: Django 6.1 (REST Framework)
- **Frontend**: React 18 + Vite (Sovereign Vanilla CSS System)
- **Media**: Cloudinary (Institutional Image Persistence)
- **Analytics**: Recharts (Dynamic Performance Visuals)
- **Icons**: Lucide React (Surgical Standards)

---

## 🔩 Setup & Initialization

### 1. The Engine (Backend)
```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 2. The Interface (Frontend)
```bash
cd frontend
npm install
npm run dev
```

---

**EdgeForge** – *Evolved from a backend foundation. Forged for full-stack sovereign control.*