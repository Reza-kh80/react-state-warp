# ⚡ React State Warp

> **Teleport your React state between devices instantly.**  Move from Desktop to Mobile (and back) without losing your data. No backend required.

![Banner](https://img.shields.io/badge/Status-Active_Development-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🤔 What is this?
Have you ever started filling out a form on your laptop, only to realize you need to finish it on your phone (e.g., to upload a photo)? 
Usually, you'd lose all your data. 

**React State Warp** solves this. It creates a secure, peer-to-peer connection between devices using WebRTC. You generate a QR code, scan it, and your component's `state` is instantly teleported to the new device.

## ✨ Key Features
- **🌐 Universal:** Works between any devices (iOS, Android, Windows, Mac).
- **🔒 Privacy First:** Data is transferred directly via WebRTC (P2P). No database saves your sensitive form data.
- **⚡ Instant:** Zero latency sync once connected.
- **📦 Tiny:** Lightweight React Hook (~2kb gzipped).

## 🚀 Quick Start (Development)

This is a Monorepo containing the library and a demo playground.

### 1. Clone & Install
```bash
git clone https://github.com/Reza-kh80/react-state-warp.git
cd react-state-warp
pnpm install
```

### 2. Run the Demo
We have a built-in playground to test the teleportation feature.

```bash
pnpm run dev
```

This will:

1. Build the library in watch mode.

2. Launch the Vite example app at `http://localhost:5173`.

## 📦 Project Structure
- `packages/lib:` The source code of the `react-state-warp` NPM package.

- `examples/playground:` A demo React app that imports the library locally for testing.

## 🤝 Contributing
We love contributions! Please read [CONTRIBUTING.md](https://github.com/Reza-kh80/react-state-warp?tab=contributing-ov-file) to get started.

Made with ❤️ by [Reza Kheradmand](https://github.com/Reza-kh80/react-state-warp)

