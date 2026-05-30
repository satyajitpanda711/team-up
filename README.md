<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb" />
  <img src="https://img.shields.io/badge/Socket.IO-Realtime-010101?style=for-the-badge&logo=socket.io" />
  <img src="https://img.shields.io/badge/Groq-LLaMA_3.3-FF6B35?style=for-the-badge" />
</p>

# 🚀 RepoIntel — AI-Powered Repository Intelligence

**RepoIntel** is a collaborative developer platform that connects to your GitHub repositories and provides AI-powered code understanding, real-time team chat, and full project management — all in one place.

> _Your codebase, finally understood._

---

## ✨ Features

### 🔗 GitHub Integration
- **One-click OAuth** — Sign in with GitHub and start instantly
- **Repository Ingestion** — Sync your repo's file tree, commits, PRs, and issues with a single click
- **File Content Storage** — Automatically fetches and stores source code for `.ts`, `.tsx`, `.js`, `.jsx`, `.md`, and `.json` files for AI context

### 🤖 AskRepo AI (RAG-Powered)
- **Ask anything about your codebase** in plain English
- Uses **Retrieval-Augmented Generation (RAG)** with keyword-based chunking and retrieval to ground answers in actual source code
- Powered by **Groq + LLaMA 3.3 70B** for fast, high-quality responses
- Maintains conversation history for contextual follow-ups

### 💬 Real-Time Team Chat
- **Socket.IO-powered** live messaging scoped per project
- Instant message delivery with sender avatars and timestamps
- Persistent message history stored in MongoDB

### 📊 Project Dashboard
- Aggregated stats: total projects, commits, issues, and pull requests
- Recent commit activity feed
- Quick-access project cards with member counts and last-updated timestamps

### 📁 Repository Explorer
- **File tree browser** — Navigate your repo's structure directly in the app
- **Commits tab** — Browse commit history with author, message, and timestamp
- **Pull Requests tab** — View all PRs with status, title, and merge state
- **Issues tab** — Track open/closed issues with labels
- **Questions tab** — Team Q&A board with answer workflows and status badges

### 👥 Team Collaboration
- **Invite teammates** by email with role-based access (`owner`, `developer`)
- Collaborator sidebar with profile avatars
- Per-project member management

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Frontend** | React 19, Tailwind CSS 4, ShadCN UI, Lucide Icons |
| **State** | Zustand |
| **Auth** | NextAuth.js (GitHub OAuth, JWT sessions) |
| **Database** | MongoDB via Mongoose 9 |
| **Realtime** | Socket.IO (Express + custom HTTP server) |
| **AI / LLM** | Groq SDK → LLaMA 3.3 70B Versatile |
| **RAG Pipeline** | Custom chunking (`lib/chunking.ts`) + keyword retrieval (`lib/retrieve.ts`) |
| **Notifications** | Sonner toast library |
| **Deployment** | Docker-ready (`Dockerfile` included) |

---

## 📐 Architecture

```
┌──────────────────────────────────────────────────┐
│                    Client                        │
│  Next.js App Router + React 19 + Tailwind CSS    │
│  ┌────────┐ ┌────────┐ ┌─────────┐ ┌──────────┐ │
│  │ Landing│ │Dashboard│ │ Project │ │ AskRepo  │ │
│  │  Page  │ │  Page   │ │Workspace│ │   Chat   │ │
│  └────────┘ └────────┘ └─────────┘ └──────────┘ │
└──────────────┬───────────────────────┬───────────┘
               │ HTTP / API Routes     │ WebSocket
┌──────────────▼───────────────────────▼───────────┐
│              Custom Express Server               │
│  ┌──────────────────┐  ┌───────────────────────┐ │
│  │  Next.js Handler  │  │   Socket.IO Server    │ │
│  │  (API Routes)     │  │   (Real-time Chat)    │ │
│  └────────┬─────────┘  └───────────┬───────────┘ │
└───────────┼─────────────────────────┼────────────┘
            │                         │
┌───────────▼─────────────────────────▼────────────┐
│                   MongoDB                         │
│  Users · Projects · Repositories · RepoFiles     │
│  Commits · PRs · Issues · Messages · Questions   │
│  AskRepoMessages                                 │
└──────────────────────┬───────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────┐
│               External Services                   │
│  ┌─────────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ GitHub API   │  │ Groq API │  │ NextAuth     │ │
│  │ (repos,tree, │  │ (LLaMA   │  │ (OAuth,JWT)  │ │
│  │  commits,PRs)│  │  3.3 70B)│  │              │ │
│  └─────────────┘  └──────────┘  └──────────────┘ │
└──────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **MongoDB** instance (local or Atlas)
- **GitHub OAuth App** ([create one here](https://github.com/settings/developers))
- **Groq API Key** ([get one here](https://console.groq.com))

### 1. Clone the repository

```bash
git clone https://github.com/satyajitpanda711/team-up.git
cd team-up
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-string

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Groq (for AskRepo AI)
GROQ_API=your-groq-api-key
```

### 4. Run the development server

```bash
npm run dev
```

The app starts at **http://localhost:3000** with Turbopack for fast HMR.

### 5. (Optional) Docker

```bash
docker build -t repointel .
docker run -p 3000:3000 --env-file .env repointel
```

---

## 📁 Project Structure

```
team-up/
├── app/
│   ├── api/                    # Next.js API routes
│   │   ├── auth/               # NextAuth endpoints
│   │   ├── projects/           # CRUD, questions, commits, PRs, issues
│   │   │   └── [projectId]/
│   │   │       ├── askRepo/    # RAG-powered AI Q&A
│   │   │       ├── commits/    # Commit history
│   │   │       ├── files/      # File tree
│   │   │       ├── issues/     # GitHub issues
│   │   │       ├── prs/        # Pull requests
│   │   │       ├── questions/  # Team Q&A
│   │   │       └── messages/   # Chat messages
│   │   └── repos/
│   │       └── ingest/         # GitHub repo sync engine
│   ├── dashboard/              # Dashboard pages & components
│   │   ├── components/         # Dashboard UI
│   │   └── projects/
│   │       └── [projectId]/    # Project workspace
│   │           └── components/
│   │               └── tabs/   # Repo, Commits, PRs, Issues, Chat, Q&A, AskRepo
│   └── page.tsx                # Landing page
├── components/ui/              # shadcn/ui components
├── lib/
│   ├── auth.ts                 # NextAuth configuration
│   ├── db.ts                   # MongoDB connection
│   ├── chunking.ts             # Text chunking for RAG
│   ├── retrieve.ts             # Keyword-based file retrieval
│   └── services/
│       └── github.ts           # GitHub API client
├── models/                     # Mongoose schemas
│   ├── User.ts
│   ├── Project.ts
│   ├── Repository.ts
│   ├── RepoFile.ts
│   ├── Commit.ts
│   ├── PullRequest.ts
│   ├── Issue.ts
│   ├── Message.ts
│   ├── Question.ts
│   └── AskRepoMessages.ts
├── store/
│   └── useChatStore.ts         # Zustand store for Socket.IO chat
├── server.ts                   # Custom Express + Socket.IO server
├── Dockerfile                  # Docker deployment
└── package.json
```

---

## 🔑 Key Workflows

### Repository Ingestion Flow
1. User clicks **"Ingest GitHub Repo"** on the project page
2. Client-side `fetch` hits `/api/repos/ingest` with `projectId` + `repoUrl`
3. Server fetches repo metadata, file tree, README, commits, PRs, and issues from the GitHub API
4. Source code is fetched for key file types (`.ts`, `.tsx`, `.js`, `.jsx`, `.md`, `.json`) and stored in MongoDB
5. UI auto-refreshes to display the newly synced data across all tabs

### AskRepo RAG Pipeline
1. User asks a question in the **AskRepo** chat interface
2. The question is tokenized into keywords
3. `retrieveRelevantFiles()` scores stored file chunks by keyword overlap and path relevance
4. Top 6 chunks + README + recent commits are assembled into a context prompt
5. Prompt is sent to **Groq LLaMA 3.3 70B** for generation
6. Answer is saved to `AskRepoMessages` and streamed back to the UI

### Real-Time Chat
1. Client connects via **Socket.IO** with `projectId` + `userEmail` auth
2. Messages are broadcast to all users in the same project room
3. Messages are persisted in MongoDB and loaded on reconnect

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ☕ and <code>Next.js</code> by <a href="https://github.com/satyajitpanda711">@satyajitpanda711</a>
</p>