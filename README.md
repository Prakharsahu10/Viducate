# Viducate 🎓✨

## Interactive AI-Powered Educational Video Platform 🚀

Viducate transforms the way we learn by converting educational content into engaging AI-generated videos with virtual avatars. Our platform combines cutting-edge technology with gamification to create a dynamic and motivating learning experience.

## ✨ Features

### 🤖 AI Video Generation
- Convert text lessons into engaging video presentations
- Customizable virtual avatars
- Multi-language support for global education

### 🏆 Gamification System
- Points and levels 📈
- Achievement badges 🏅
- Daily streaks 🔥
- Leaderboards for healthy competition 🥇

### 👩‍🎓 Learning Tools
- Interactive quizzes to test knowledge
- Progress tracking across multiple courses
- Video bookmarking and resume functionality

### 🔐 User Management
- Secure authentication via Clerk
- Student and teacher roles
- Personalized dashboards

## 🛠️ Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **Video Generation**: D-ID API
- **Deployment**: Vercel/any hosting platform

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- PostgreSQL database
- D-ID API key
- Clerk account for authentication

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/viducate.git
cd viducate
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL="postgresql://username:password@localhost:5432/viducate"
DIRECT_URL="postgresql://username:password@localhost:5432/viducate"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
DID_API_KEY=your_did_api_key
```

4. Set up the database
```bash
npx prisma migrate dev
```

5. Start the development server
```bash
npm run dev
```

Visit `http://localhost:3000` to start using Viducate!

## 📱 Usage

1. **Sign Up/Login**: Create an account or login using email/password or social auth
2. **Explore Content**: Browse available courses and learning materials
3. **Generate Videos**: Convert text lessons into engaging videos with customizable avatars
4. **Test Knowledge**: Take quizzes to earn points and track your progress
5. **Track Progress**: View your learning journey on your personalized dashboard

## 🌟 Roadmap

- 📱 Mobile application
- 🧠 AI-generated quizzes based on video content
- 👥 Collaborative learning spaces
- 🌐 API for third-party integrations
- 🎮 Advanced gamification mechanics

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- D-ID for the avatar generation API
- Clerk for authentication services
- All contributors who have helped shape Viducate 