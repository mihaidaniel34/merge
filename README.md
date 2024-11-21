# Merge - Task Management App

A minimalist task management application with a terminal-inspired interface. Simple, clean, and straight to the point.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Elysia.js + Bun
- **Database**: SQLite + Prisma

## Features

- 🎯 Clean, terminal-inspired interface
- 📝 Create and organize tasks

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed on your system

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/merge.git
   cd merge
   ```

2. Install dependencies
   ```bash
   bun run install:all
   ```

3. Set up environment variables
   ```bash
   # In server directory
   cp .env.example .env
   # In client directory
   cp .env.example .env
   ```

4. Start development servers
   ```bash
   bun run dev
   ```

The app will be running at `http://localhost:5173`

## Development

- `bun run dev`: Start both client and server
- `bun run client`: Start only the client
- `bun run server`: Start only the server
