# 📊 Customizable Survey & Polling System

A full-stack web application for creating, managing, and participating in surveys and polls with real-time analytics.

## ✨ Features

- 🔐 **User Authentication** - Secure registration and login with JWT
- 📝 **Survey Management** - Create customizable surveys with multiple question types
- 📊 **Poll Creation** - Quick single-question polls with instant results
- 👤 **User Dashboard** - Time-based greetings (Good Morning/Afternoon/Evening) and statistics overview
- 📈 **Analytics** - Real-time charts and response visualization
- 🎨 **Modern UI** - Responsive design with Bootstrap and Material-UI

## 🛠️ Tech Stack

**Frontend:** React, Axios, Chart.js, Bootstrap, Material-UI  
**Backend:** Node.js, Express.js, MongoDB, JWT, Bcrypt

## 📋 Prerequisites

- Node.js (v14+)
- MongoDB (v4.4+)
- npm/yarn

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/ghostgit26/Customizable-Survey-And-Poling-System.git
cd Customizable-Survey-And-Poling-System
```

### 2. Backend Setup

```bash
cd backend/src
npm install
```

Create `.env` file in `backend/src/`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/surveyPortal
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:3000
```

Start backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

### 4. Start MongoDB

```bash
# Windows
net start MongoDB
```

Access the app at `http://localhost:3000`

## 📁 Project Structure

```
├── backend/src/
│   ├── middleware/    # Auth & error handling
│   ├── model/        # MongoDB schemas
│   ├── routes/       # API endpoints
│   ├── service/      # Business logic
│   └── server.js     # Entry point
│
└── frontend/src/
    ├── components/   # React components
    ├── App.js
    └── index.js
```

## 🖼️ Screenshots

<!-- Add your screenshots below -->

### Homepage

![Homepage](./screenshots/homepage.png)

### Dashboard

![Dashboard](./screenshots/dashboard.png)

### Create Survey

![Create Survey](./screenshots/create-survey.png)

### Create Poll

![Create Poll](./screenshots/create-poll.png)

### Results

![Results](./screenshots/results.png)

## 🌐 API Endpoints

**Auth:** `/api/auth/register`, `/api/auth/login`  
**Surveys:** `/api/surveys/mine`, `/api/surveys` (POST/PUT/DELETE)  
**Polls:** `/api/polls/my-polls`, `/api/polls` (POST/PUT/DELETE)  
**Responses:** `/api/survey-responses`, `/api/poll-responses`

## 🐛 Troubleshooting

**MongoDB not connecting?**

```bash
mongosh  # Check if running
net start MongoDB  # Start service
```

**Port in use?**

```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

## 👨‍💻 Author

**ghostgit26** - [GitHub](https://github.com/ghostgit26)

## 📝 License

MIT License

---

⭐ Star this repo if you find it helpful!
