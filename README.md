# 7erfa Platform

7erfa is a modern platform connecting customers with local craftsmen (Electricians, Mechanics, Decorators, Movers, etc.). Built with Next.js 14 and NestJS, it supports real-time scheduling, secure payments, and comprehensive service management.

## 🌟 Features

- **User Management**
  - Customer and craftsman registration
  - Role-based access control
  - Profile management
  - KYC verification for craftsmen

- **Service Discovery**
  - Location-based search
  - Category filtering
  - Rating and review system
  - Real-time availability checking

- **Booking System**
  - Real-time scheduling
  - Automated reminders
  - Service tracking
  - Payment processing

- **Communication**
  - Real-time chat
  - Push notifications
  - Email notifications
  - Multi-language support (English/Arabic)

- **Payment Integration**
  - Secure wallet system
  - Paymob integration
  - Transaction history
  - Automated settlements

## 🚀 Tech Stack

### Frontend
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Query
- Zustand
- Socket.IO Client
- MapLibre GL
- RTL Support

### Backend
- NestJS
- TypeScript
- MongoDB + Mongoose
- Redis
- Socket.IO
- Bull Queue
- JWT Authentication

### DevOps
- Docker & Docker Compose
- GitHub Actions CI/CD
- Prometheus & Grafana
- Nginx
- SSL/TLS

## 📦 Prerequisites

- Node.js 20.x
- Docker & Docker Compose
- MongoDB
- Redis

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/heyitssugar/7erfa.git
   cd 7erfa
   ```

2. Install dependencies:
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd ../backend
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Copy example env files
   cp .env.example .env
   ```

4. Start development environment:
   ```bash
   docker-compose up
   ```

5. Initialize database:
   ```bash
   cd backend
   npm run seed
   ```

## 🌐 Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test
```

## 📚 Documentation

- [API Documentation](docs/API.md)
- [Database Schema](docs/DATABASE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Contributing Guide](docs/CONTRIBUTING.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **@heyitssugar** - *Initial work*

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape 7erfa
- Special thanks to the open-source community for the amazing tools that made this possible