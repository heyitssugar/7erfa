# 7erfa Platform

A modern platform connecting customers with local craftsmen. Built with Next.js 14 and NestJS.

## Features

- Discovery and booking of local craftsmen
- Real-time scheduling and availability management
- Secure payments via wallet + Paymob integration
- Reviews and ratings system
- Real-time chat and notifications
- Comprehensive admin console
- Multi-language support (English/Arabic)
- PWA support for mobile usage

## Tech Stack

### Frontend
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Query
- Zustand
- Socket.IO Client
- MapLibre GL

### Backend
- NestJS
- TypeScript
- MongoDB + Mongoose
- Redis
- Socket.IO
- Bull Queue
- JWT Authentication

## Development Setup

1. Prerequisites:
   - Docker and Docker Compose
   - Node.js 20.x
   - npm

2. Clone the repository:
   ```bash
   git clone <repository-url>
   cd 7erfa
   ```

3. Environment Setup:
   - Copy `.env.example` to `.env` in both frontend and backend directories
   - Update environment variables as needed

4. Start Development Environment:
   ```bash
   docker-compose up
   ```

   This will start:
   - Frontend at http://localhost:3000
   - Backend at http://localhost:4000
   - MongoDB at localhost:27017
   - Redis at localhost:6379

## Project Structure

```
7erfa/
├── frontend/          # Next.js frontend
│   ├── src/
│   │   ├── app/      # App router pages
│   │   ├── components/
│   │   └── lib/      # Utilities and helpers
│   └── public/
├── backend/          # NestJS backend
│   └── src/
│       ├── auth/     # Authentication
│       ├── users/    # User management
│       └── ...       # Other modules
└── docker-compose.yml
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

[License Type] - See LICENSE file for details
