# RepoIntel — AI-Powered Repository Intelligence

**RepoIntel** is a collaborative developer platform that connects with GitHub repositories and provides AI-powered code understanding, real-time team communication, and project management in a single workspace. 

The platform helps developers understand complex codebases faster through repository analysis, contextual AI assistance, and collaborative tools.

---

## Features

### Intelligence Reports

* Generate detailed architectural overviews of repositories
* Save and access previous reports without regenerating them
* Extract insights such as:

  * Tech stack
  * Architecture style
  * Development timeline
  * Risks and onboarding notes

### GitHub Integration

* GitHub OAuth authentication
* Repository ingestion with a single click
* Sync:

  * Repository structure
  * Commits
  * Pull requests
  * Issues
* Store source files for AI context

### AskRepo AI

* Ask questions about the codebase in natural language
* Uses Retrieval-Augmented Generation (RAG)
* Retrieves relevant code chunks before generating answers
* Powered by Groq and LLaMA 3.3 70B
* Maintains conversation history for follow-up queries

### Real-Time Team Chat

* Live messaging using Socket.IO
* Project-specific chat rooms
* Persistent message history stored in MongoDB

### Project Dashboard

* Overview of projects, commits, issues, and pull requests
* Recent activity feed
* Quick-access project cards
* Responsive and modern interface

### Repository Explorer

* Browse repository file structure
* View:

  * Commits
  * Pull requests
  * Issues
* Access repository details directly inside the app

### Team Collaboration

* Invite collaborators by email
* Role-based access:

  * Owner
  * Developer
* Team member management per project

---

## Tech Stack

| Layer                  | Technology                          |
| ---------------------- | ----------------------------------- |
| Framework              | Next.js 16                          |
| Language               | TypeScript 5                        |
| Frontend               | React 19, Tailwind CSS 4, ShadCN UI |
| State Management       | Zustand                             |
| Authentication         | NextAuth.js                         |
| Database               | MongoDB with Mongoose               |
| Realtime Communication | Socket.IO                           |
| AI Model               | Groq LLaMA 3.3 70B                  |
| Deployment             | Docker                              |

---

## Architecture Overview

### Frontend

Built with Next.js App Router and React 19 for a modern and responsive user experience.

### Backend

Uses a custom Express server integrated with Socket.IO for API handling and real-time communication.

### Database

MongoDB stores:

* Users
* Projects
* Repository data
* Messages
* AI reports
* Questions and responses

### External Services

* GitHub API for repository data
* Groq API for AI processing
* NextAuth for authentication

---

## Main Workflows

### Intelligence Report Generation

1. User requests a repository analysis
2. Repository metadata and commits are collected
3. Context is sent to Groq LLaMA 3.3 70B
4. Structured analysis is generated
5. Report is saved and displayed in the UI

### AskRepo RAG Workflow

1. User asks a repository-related question
2. Relevant file chunks are retrieved
3. Context is assembled with commits and README data
4. AI generates a grounded response
5. Response is stored and shown in chat

### Real-Time Chat Workflow

1. Users connect through Socket.IO
2. Messages are broadcast inside project rooms
3. Messages are stored in MongoDB for persistence

---

## Project Structure

```bash
app/
├── api/
├── dashboard/
├── page.tsx

lib/
├── auth.ts
├── db.ts
├── chunking.ts
├── retrieve.ts

models/
store/
server.ts
Dockerfile
```

---

## Setup Instructions

### Prerequisites

* Node.js 20+
* MongoDB
* GitHub OAuth App
* Groq API Key

### Installation

```bash
git clone https://github.com/satyajitpanda711/team-up.git
cd team-up
npm install
```

### Environment Variables

```env
MONGODB_URI=
NEXTAUTH_URL=
NEXTAUTH_SECRET=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

GROQ_API=
```

### Run Development Server

```bash
npm run dev
```

---

## Conclusion

RepoIntel combines repository analysis, AI-assisted development, and team collaboration into a unified platform. It helps developers understand large codebases, communicate efficiently, and manage projects with contextual AI support.
