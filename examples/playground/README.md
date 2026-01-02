# 🆔 Identity Verification Demo

This project is a **real-world demonstration** of the `react-state-warp` library.
It simulates an **Identity Verification Flow** where a user starts filling out a profile on a Desktop and switches to Mobile to upload a selfie/ID card instantly.

## 🌟 Features Showcased

* **Cross-Device Handoff:** Transfer form state (Name, Bio) from Desktop to Mobile via QR Code.
* **Binary File Sync:** Upload an image on Mobile and see it appear instantly on Desktop.
* **Verification Workflow:** A "Verify" button on Mobile that locks and confirms the state on Desktop.
* **Glassmorphism UI:** A modern, responsive interface.

## 🛠 How to Run

Since this is part of a Monorepo, please run the command from the **root directory**:

```bash
# From the project root:
pnpm run dev
```

**This will start the Vite server exposed to your local network (e.g., http://192.168.1.X:5173).**

## 📱 Testing the Flow

1. Open the URL on your **Desktop**.

2. Fill in the "First Name" and "Last Name".

3. Scan the **QR Code** with your **Phone**.

4. On your phone, tap **"Upload Image"** and select a photo.

5. Watch it appear on your Desktop instantly!

6. Tap **"Verify & Sync Data"** on your phone to complete the session.

---
Powered by [react-state-warp](https://github.com/Reza-kh80/react-state-warp)