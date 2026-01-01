# Contributing to React State Warp

Thank you for your interest in contributing! We welcome contributions from everyone.

## 🛠 Project Structure

This project is a **Monorepo** managed by `pnpm`.

- `packages/lib`: The core library source code.
- `examples/playground`: A React app to test the library locally.

## 🚀 Getting Started

1. **Fork and Clone** the repository.
2. **Install pnpm** (if you don't have it):

   ```bash
   npm install -g pnpm
   ```

3. **Install Dependencies:**
   ```bash
   pnpm install
   ```

## 💻 Development Workflow

To work on the library and test it simultaneously:

1. Open a terminal and run the dev script:
   `bash
    pnpm run dev
    `
   This will:

- Watch `packages/lib` for changes and rebuild using tsup.

- Start the `examples/playground` Vite server.

2. Open `http://localhost:5173` (or the port shown) to see your changes in real-time.

## 📏 Code Standards

- TypeScript: We use Strict Mode. Ensure no type errors exist.

- Commits: Please write clear, concise commit messages.

## 📥 Submitting a Pull Request (PR)

1. Create a new branch: `git checkout -b feature/my-new-feature`.

2. Make your changes.

3. Run `pnpm run build` to ensure everything compiles correctly.

4. Push to your fork and submit a PR!

**Thank you for helping us build the future of cross-device state! 🚀**
