<div align="center">

# 🥗 AI-Cal-Scan
**Snap a photo. Know your calories instantly.**  
AI-powered calorie tracker built with React Native & computer vision

[![Expo](https://img.shields.io/badge/Expo-46-orange.svg)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.75-blue.svg)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-green.svg)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-20-purple.svg)](https://nodejs.org)

</div>

## ✨ Features

- **AI Photo Analysis** — Snap a meal → instant food recognition, calorie estimate & confidence score using **OpenAI GPT-4o-mini**
- **Smart Dashboard** — Daily calorie progress ring, remaining calories, meal history
- **Manual Logging** — Full control with meal type selection
- **Auto-Refresh** — Dashboard updates instantly after logging (pull-to-refresh + focus effect)
- **Dark/Light Theme** — Smooth toggle
- **Secure & Scalable** — Supabase auth/database, Express backend


## 📱 Screenshots

<div align="center">

**Dashboard with Progress Ring** | **Camera Scan** | **AI Results & Log Form** | **More UI Concepts**

</div>

## 🏗️ Tech Stack

**Frontend**  
React Native • Expo • TypeScript • Expo Router • Custom Hooks (useMeals, useTheme)

**Backend**  
Express.js • TypeScript • Axios

**Database & Auth**  
Supabase (PostgreSQL + Auth)

**Dev Tools**  
tsx watch • dotenv

**AI**  
OpenRouter → **OpenAI GPT-4o-mini** (fast, cost-effective vision model with enforced JSON output)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Expo Go app (iOS/Android)
- Supabase project

### Installation

```bash
git clone https://github.com/EDe-Graft/AI-Cal-Scan.git
cd AI-Cal-Scan

# Client
cd client
npx expo start

# Server
cd ../server
npm install