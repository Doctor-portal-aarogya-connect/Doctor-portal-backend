# Doctor App Portal

This project consists of a React Native (Expo) mobile application for doctors and a Node.js/Express backend.

## 🚀 Quick Start (For Developers/Users)

Since the backend is already deployed to the cloud, you only need to run the mobile app locally.

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed on your computer.
- **Expo Go** app installed on your phone (Android/iOS).

### 2. Setup & Run
1. Open this folder in your terminal:
   ```bash
   cd doctor-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the app:
   ```bash
   npx expo start
   ```
4. A QR code will appear. Scan it with the **Expo Go** app on your phone.

---

## 🔐 Test Credentials
- **Username:** `testdoctor`
- **Password:** `password123`

---

## 🛠 Project Structure
- **`doctor-app/`**: Frontend mobile application (React Native / Expo).
  - Already configured to connect to the live backend: `https://doctor-portal-backend-five.vercel.app`
- **`backend/`**: Node.js & Express server.
  - Deployed on Vercel.
  - Connected to MongoDB Atlas.

## 📦 Sharing this Project
To share this with others:
1. Zip the entire `doctor` folder (excluding `node_modules` if you want a smaller file, but `npm install` brings them back).
2. Tell them to follow the **Setup & Run** steps above.
