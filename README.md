<div align="center">
  <!-- You can add a logo image here if you have one -->
  <!-- <img src="client/public/logo.png" alt="SocialSphere Logo" width="120" /> -->
  <h1>🌐 SocialSphere</h1>
  <p><strong>A Modern, Full-Stack Social Networking Application</strong></p>

  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#api-reference">API Reference</a> •
    <a href="#architecture--folder-structure">Architecture</a>
  </p>

  <div>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/Material%20UI-007FFF?style=for-the-badge&logo=mui&logoColor=white" alt="Material UI" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" alt="JWT" />
  </div>
</div>

---

## 📖 Overview

**SocialSphere** is a feature-rich, responsive social media platform built using the MERN stack. Designed with user experience in mind, it provides a seamless interface for users to connect, share their thoughts, upload images, and interact with others in real-time. This project serves as a comprehensive internship assignment, showcasing expertise in modern web development, secure authentication, and robust RESTful API design.

## ✨ Features

- 🔐 **Robust Authentication & Security**
  - Secure sign-up and login workflows.
  - JWT-based authentication for secure session management.
  - Password hashing using `bcryptjs`.
- ✍️ **Post & Content Management**
  - Create posts with rich text and emojis.
  - Seamless image uploads managed via `multer`.
  - Edit and delete your own posts easily.
- 💬 **Interactive User Engagement**
  - Real-time like and unlike functionality.
  - Nested commenting system on posts.
  - Dynamic user feeds displaying the latest content.
- 🔔 **Activity Notifications**
  - Receive alerts for likes, comments, and interactions to stay connected.
- 📱 **Modern & Responsive UI**
  - Sleek Material UI (MUI) component design.
  - Fully responsive layout ensuring a great experience on desktop, tablet, and mobile.
  - Interactive toast notifications via `react-toastify`.

## 🛠️ Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend Core** | React 19, Vite, React Router DOM v7 |
| **Styling & UI** | Material UI (MUI), Emotion |
| **Backend Core** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs |
| **Utilities** | Axios, Multer (File Uploads), Moment.js, Emoji Picker React |

## 🚀 Getting Started

Follow these steps to set up the project locally for development and testing.

### Prerequisites

Ensure your system meets the following requirements:
- **Node.js**: `v16.0.0` or higher recommended.
- **MongoDB**: Local MongoDB instance running or an Atlas connection string.
- **Git**: For version control.

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ayush2112004/SocialSphere.git
   cd SocialSphere
   ```

2. **Install Dependencies:**
   Install dependencies for both the backend and frontend:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

### ⚙️ Environment Variables

Secure your application by creating `.env` files in both the `server` and `client` directories based on the required configurations.

#### Server (`server/.env`)
```env
# Application Port
PORT=5000

# MongoDB Connection String
MONGODB_URI=mongodb://127.0.0.1:27017/socialsphere_db

# JWT Secret for Authentication
JWT_SECRET=your_super_secret_jwt_key_here
```

#### Client (`client/.env`)
```env
# Backend API Base URL
VITE_API_URL=http://localhost:5000
```

### 🏃‍♂️ Running the Application

To run the application, you will need two separate terminal windows.

**Terminal 1: Start the Backend Server**
```bash
cd server
npm run dev
```
*The Express server will start on `http://localhost:5000`.*

**Terminal 2: Start the Frontend Client**
```bash
cd client
npm run dev
```
*The React app will launch on `http://localhost:5173`.*

---

## 🔌 API Reference

Here are some of the core API endpoints available in the backend:

### Authentication (`/api/auth`)
- `POST /register` - Register a new user.
- `POST /login` - Authenticate a user and return a token.

### Users (`/api/users`)
- `GET /:id` - Get user profile.
- `PUT /:id` - Update user profile.
- `GET /suggested` - Get suggested users to follow.

### Posts (`/api/posts`)
- `GET /` - Fetch feed posts.
- `POST /` - Create a new post.
- `PUT /:id` - Update a post.
- `DELETE /:id` - Delete a post.
- `POST /:id/like` - Like/Unlike a post.

### Comments (`/api/comments`)
- `GET /:postId` - Get comments for a post.
- `POST /:postId` - Add a comment to a post.

---

## 📂 Architecture & Folder Structure

```text
SocialSphere/
├── client/                     # React Frontend Application
│   ├── public/                 # Static public assets (icons, logos)
│   ├── src/                    
│   │   ├── assets/             # Images and visual assets
│   │   ├── components/         # Reusable UI components (Navbar, PostCard, etc.)
│   │   ├── context/            # Global state management (Auth, Theme)
│   │   ├── pages/              # Primary route views (Feed, Profile, Auth)
│   │   ├── utils/              # Helper functions and Axios configuration
│   │   ├── App.jsx             # Root component and Routing logic
│   │   ├── index.css           # Global CSS variables and resets
│   │   └── theme.js            # MUI custom theme configuration
│   └── vite.config.js          # Vite bundler settings
│
├── server/                     # Node.js / Express Backend API
│   ├── controllers/            # Business logic for route handling
│   ├── middleware/             # Custom middleware (Auth validation, Multer)
│   ├── models/                 # Mongoose database schemas
│   ├── routes/                 # Express API endpoint definitions
│   ├── uploads/                # Directory for local image storage
│   └── index.js                # Server entry point and configuration
│
└── README.md                   # Project documentation
```

---

## 💡 Design Decisions & Best Practices

- **Separation of Concerns**: The backend strictly follows the MVC (Model-View-Controller) architecture, ensuring clean, modular, and maintainable code.
- **Component-Driven UI**: The frontend utilizes a highly modular component architecture, maximizing code reuse and simplifying testing.
- **Scalable State Management**: Uses React Context API combined with custom hooks for lightweight, efficient state management.
- **Error Handling**: Comprehensive error handling on both client (React Toastify alerts) and server (centralized error middleware).

---

<div align="center">
  <b>Developed by <a href="https://github.com/Ayush2112004">Ayush2112004</a></b>
  <br />
  <i>Built as a comprehensive Internship Assignment.</i>
</div>
