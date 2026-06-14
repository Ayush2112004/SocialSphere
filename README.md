<div align="center">
  <h1>SocialSphere</h1>
  <p>A full-stack social media application built as part of an Internship Assignment.</p>

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

**SocialSphere** is a modern, responsive, and fully-featured social networking platform. It allows users to connect, share moments, comment on posts, and interact seamlessly. This project was developed as a comprehensive internship assignment, emphasizing best practices in full-stack web development, user authentication, and RESTful API architecture.

## ✨ Features

- **User Authentication**: Secure signup and login using JSON Web Tokens (JWT) and bcrypt password hashing.
- **Post Management**: Users can create, view, edit, and delete their own posts.
- **Interactive Feed**: A dynamic timeline where users can like and comment on posts.
- **Image Uploads**: Integrated local image upload capability using Multer.
- **Real-Time Notifications**: Stay updated with the latest interactions.
- **Responsive Design**: A sleek and modern UI built with React and Material UI, fully responsive across desktop and mobile devices.

## 🛠️ Technology Stack

### Frontend (Client)
- **Framework**: [React 19](https://react.dev/) via [Vite](https://vitejs.dev/)
- **Styling**: [Material UI (MUI)](https://mui.com/)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Other Tools**: Emoji Picker React, Moment.js, React Toastify

### Backend (Server)
- **Environment**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/)
- **Authentication**: [JWT](https://jwt.io/) & [Bcryptjs](https://www.npmjs.com/package/bcryptjs)
- **File Uploads**: [Multer](https://www.npmjs.com/package/multer)

---

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites

- **Node.js**: Ensure you have Node.js installed (v16+ recommended).
- **MongoDB**: Have a local MongoDB server running or a MongoDB Atlas connection string.

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd SocialSphere
   ```

2. **Install Server Dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install Client Dependencies:**
   ```bash
   cd ../client
   npm install
   ```

### ⚙️ Environment Variables Setup

You need to create `.env` files in both the `client` and `server` directories to run the application locally. We use `.env` files to keep sensitive information secure and configurable per environment.

#### Server-side Environment Variables

Create a `.env` file in the `server` directory (`server/.env`) and add the following keys:

```env
# The port on which the Express server will run
PORT=5000

# Your MongoDB connection string (local or Atlas)
MONGODB_URI=mongodb://127.0.0.1:27017/socialsphere_db

# A secret key used to sign and verify JSON Web Tokens (JWT)
JWT_SECRET=your_super_secret_jwt_key_here
```

*Note: Ensure `MONGODB_URI` points to a valid MongoDB instance. The `JWT_SECRET` can be any strong, random string.*

#### Client-side Environment Variables

Create a `.env` file in the `client` directory (`client/.env`) and add the following key:

```env
# The base URL for the backend API. Used by Axios to make requests.
VITE_API_URL=http://localhost:5000
```

### 🏃‍♂️ Running the Application

1. **Start the Server:**
   Open a terminal, navigate to the `server` directory, and run:
   ```bash
   npm run dev
   ```
   *The server should start on `http://localhost:5000`.*

2. **Start the Client:**
   Open a new terminal, navigate to the `client` directory, and run:
   ```bash
   npm run dev
   ```
   *The React app should start and be accessible at `http://localhost:5173`.*

---

## 📂 Folder Structure

```
SocialSphere/
├── client/                 # React Frontend
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page level components
│   │   ├── utils/          # Utility functions (e.g., Axios instance)
│   │   ├── App.jsx         # Main application component
│   │   └── main.jsx        # Entry point
│   ├── package.json
│   └── vite.config.js
├── server/                 # Express Backend
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Express middlewares (e.g., auth check)
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API route definitions
│   ├── uploads/            # Locally uploaded user files/images
│   ├── index.js            # Main server entry point
│   └── package.json
└── README.md
```

## 📝 Design Decisions & Best Practices

- **Security**: Passwords are hashed before saving to the database using `bcryptjs`. API endpoints are protected using a custom authentication middleware verifying JWTs.
- **Scalability**: The backend uses an MVC-inspired architecture, separating routes, controllers, and models to keep the codebase clean and maintainable.
- **UX/UI**: Utilized Material UI components for a polished, consistent, and accessible design system right out of the box, supplemented by React Toastify for intuitive user feedback.
- **CORS Handling**: Properly configured CORS to allow smooth communication between the distinct Vite frontend server and Express backend server.

---

<div align="center">
  <i>Developed with ❤️ for the Internship Assignment.</i>
</div>
