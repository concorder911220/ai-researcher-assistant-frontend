# AI Research Assistant - Frontend

A modern, ChatGPT-style interface for the AI Research Assistant backend.

## 🎨 Features

- **GPT-Style UI** with sidebar navigation
- **Individual Chat URLs** (`/chat/{id}`) for easy sharing
- **Real-time Message Updates** with polling
- **Document Upload** inline within chat
- **Personality Selection** for customized responses
- **Source Citations** displayed with answers
- **Responsive Design** with Tailwind CSS

## 🚀 Getting Started

### Prerequisites

- **Option 1 (Local Development):** Node.js 20+ and npm
- **Option 2 (Docker):** Docker and Docker Compose
- Backend running on `http://localhost:8000`

### Option 1: Local Development

```bash
# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Option 2: Docker Deployment 🐳

**Quick Start:**

```bash

# 1. Build and run with Docker Compose
docker-compose up -d --build

# 2. Access at http://localhost:3000
```

**Using Docker commands:**


**View logs:**
```bash
docker-compose logs -f frontend
```

**Stop:**
```bash
docker-compose down
```

## 📁 Project Structure

```
frontend/
├── app/
│   ├── page.tsx              # Home/landing page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   └── chat/
│       └── [id]/
│           └── page.tsx      # Individual chat page (dynamic route)
├── components/
│   ├── ChatSidebar.tsx       # Left sidebar with chat list
│   ├── ChatMessages.tsx      # Message display area
│   ├── ChatInput.tsx         # Input + upload controls
│   └── NewChatModal.tsx      # Modal for creating new chats
└── .env.local                # Environment variables
```

## 🔗 Routes

- `/` - Home page with welcome message
- `/chat/{id}` - Individual chat conversation

## 🎯 Key Components

### ChatSidebar
- Lists all chats with personalities
- Shows creation timestamps
- Navigation to individual chats
- "New Chat" button

### ChatMessages
- Displays full message history
- Auto-scrolls to latest message
- Shows source citations
- Polls for updates every 3 seconds

### ChatInput
- Message input with Enter-to-send
- Document upload button
- Shows uploaded file chips
- Loading states

### NewChatModal
- 5 personality presets (Helpful, Professional, Creative, Analytical, Casual)
- 5 role templates (Research Assistant, Document Analyzer, Tutor, Consultant, Writer)
- Custom system prompt support

## 🌐 Environment Variables

### For Local Development

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### For Docker Deployment

Create `.env` file (see `env.example`):

| Backend Location | URL to Use |
|-----------------|------------|
| On host machine | `http://host.docker.internal:8000` |
| In Docker network | `http://backend:8000` |
| Remote server | `https://api.yourbackend.com` |

**Important:** The backend URL is embedded at BUILD time in Docker. If you change it, rebuild:
```bash
docker-compose up -d --build
```

## 🎨 UI/UX

### Design Philosophy
- Clean, modern interface inspired by ChatGPT
- Dark sidebar for focus
- Light main area for readability
- Smooth transitions and hover states

### Color Scheme
- Sidebar: Dark gray (`bg-gray-900`)
- Main area: Light gray (`bg-gray-50`)
- Primary: Blue (`bg-blue-500`)
- Success: Green (document uploads)

### Typography
- Font: Inter (Google Fonts)
- Headings: Bold, larger sizes
- Body: Regular weight, comfortable line-height

## 🚀 Workflow

1. **Start** → Land on home page
2. **Create Chat** → Click "New Chat", select personality
3. **Navigate** → URL changes to `/chat/{id}`
4. **Upload** → Click upload button, select document
5. **Chat** → Type message, get AI response with citations
6. **Switch** → Click different chat in sidebar, URL updates
7. **Share** → Copy URL to share specific conversation

## 📦 Build & Deploy

### Local Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Docker Deployment

The Dockerfile uses a multi-stage build optimized for production:
- **Node.js:** 20.19.2-alpine
- **Build stages:** deps → builder → runner
- **Features:** Standalone output, non-root user, optimized image size (~200-300 MB)

**Production deployment with backend in Docker network:**

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    image: your-backend-image
    container_name: backend
    ports:
      - "8000:8000"
    networks:
      - app-network

  frontend:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_API_URL: http://backend:8000
    container_name: nextjs-frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

## 🔧 Development

```bash
# Run linter
npm run lint

# Format code
npm run format
```

## 🎯 Backend Integration

The frontend expects these backend endpoints:

- `GET /chat/` - List all chats
- `POST /chat/` - Create new chat
- `GET /chat/{id}` - Get chat details
- `GET /chat/{id}/messages` - Get chat messages
- `POST /chat/message` - Send message
- `POST /upload/` - Upload document

## 📱 Responsive Design

- Mobile: Hamburger menu for sidebar (future)
- Tablet: Collapsible sidebar
- Desktop: Full sidebar always visible

## 🎨 Customization

### Change Colors

Edit `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#your-color',
      },
    },
  },
}
```

### Change Personalities

Edit `components/NewChatModal.tsx`:

```typescript
const personalities = [
  { value: 'custom', label: 'Custom', description: 'Your description' },
  // ...
];
```

## 🐛 Troubleshooting

### Backend Connection Issues (Local)
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure backend is running on correct port
- Verify CORS is enabled on backend

### Backend Connection Issues (Docker)
- **Problem:** Frontend can't connect to backend
- **Solutions:**
  1. Check `.env` has correct URL: `cat .env`
  2. Verify backend listens on `0.0.0.0` (not `127.0.0.1`)
  3. Rebuild after changing URL: `docker-compose up -d --build`
  4. Test from container: `docker exec -it nextjs-frontend sh -c "apk add curl && curl http://host.docker.internal:8000"`

### Docker Build Fails
- **TypeScript errors:** Check for invalid backup files (`.dockerignore` excludes `*_BACKUP.*`)
- **Dependency errors:** Clear Docker cache: `docker-compose build --no-cache`
- **Network errors:** Check internet connection during build

### Messages Not Updating
- Check browser console for errors
- Verify polling is working (3s interval)
- Check backend `/chat/{id}/messages` endpoint

### Upload Not Working
- Check file size limits
- Verify backend upload directory exists
- Check backend CORS headers

## 📚 Tech Stack

- **Next.js 16** - React framework with App Router
- **React 19.2** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Styling
- **Lucide React** - Icons
- **Docker** - Containerization
- **Node.js 20.19.2** - Runtime

## 🐳 Docker Files

- **Dockerfile** - Multi-stage build (deps → builder → runner)
- **docker-compose.yml** - Container orchestration
- **.dockerignore** - Build optimization
- **env.example** - Environment variable template


