# Social-Circle
# Social Media Application

A full-stack social media platform built with **React, Node.js, Express, MongoDB, and Socket.io** with real-time messaging capabilities.

---
##Live:https://social-circle-5.onrender.com

## 🚀 Features

### 🔐 Authentication
- User registration and login
- JWT token-based authentication
- Protected routes
- Auto-login with token persistence

### 👥 User Management
- User profiles with bio, location, and profile/cover images
- Follow/unfollow system
- Connection requests and management
- User discovery and search
- Profile editing with image upload

### 📱 Social Features
- **Posts:** Create text and image posts (up to 4 images)
- **Stories:** Create text, image, and video stories with custom backgrounds
- **Global Feed:** View posts from connections and followed users
- **Likes:** Like/unlike posts with real-time updates
- **Connections:** Send/accept connection requests

### 💬 Real-time Messaging
- One-on-one chat with real-time messaging
- Image sharing in messages
- Message seen status
- Typing indicators
- Recent conversations list
- Unread message counts

### 🎨 UI/UX
- Responsive design for all screen sizes
- Modern glass-morphism design
- Real-time notifications
- Loading states and error handling
- Smooth animations and transitions

---

## 🛠 Tech Stack

### Frontend
- React with TypeScript
- Redux Toolkit for state management
- React Router for navigation
- Axios for API calls
- Socket.io-client for real-time features
- Tailwind CSS for styling
- React Hot Toast for notifications
- Lucide React for icons

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Socket.io for real-time communication
- ImageKit for image storage
- bcrypt for password hashing
- Multer for file uploads

---


---

## 🔌 API Endpoints

### **Authentication Routes (`/api/user`)**
| Method | Endpoint          | Description           | Protected |
|--------|-----------------|-------------------|-----------|
| POST   | /register        | User registration    | No        |
| POST   | /login           | User login           | No        |
| GET    | /data            | Get current user data | Yes       |
| POST   | /update          | Update user profile  | Yes       |
| POST   | /discover        | Search users         | Yes       |
| POST   | /follow          | Follow a user        | Yes       |
| POST   | /unfollow        | Unfollow a user      | Yes       |
| POST   | /connect         | Send connection request | Yes    |
| POST   | /accept          | Accept connection request | Yes |
| GET    | /connections     | Get user connections | Yes       |
| POST   | /profiles        | Get user profiles    | No        |
| GET    | /recent-messages | Get recent conversations | Yes  |

### **Post Routes (`/api/post`)**
| Method | Endpoint       | Description          | Protected |
|--------|----------------|-------------------|-----------|
| POST   | /add            | Create a new post   | Yes       |
| GET    | /feed           | Get feed posts      | Yes       |
| POST   | /like           | Like/unlike a post  | Yes       |
| GET    | /user/:userId   | Get user's posts    | Yes       |

### **Story Routes (`/api/story`)**
| Method | Endpoint       | Description        | Protected |
|--------|----------------|------------------|-----------|
| POST   | /create        | Create a story    | Yes       |
| GET    | /get           | Get stories       | Yes       |

### **Message Routes (`/api/message`)**
| Method | Endpoint             | Description           | Protected |
|--------|--------------------|--------------------|-----------|
| POST   | /send               | Send a message      | Yes       |
| POST   | /chat               | Get chat messages   | Yes       |
| GET    | /recent-messages    | Get recent conversations | Yes  |
| GET    | /sse/:userId        | SSE endpoint        | Yes       |

---

## 🔄 Real-time Events (Socket.io)

### Client → Server
- `join_user` - Join user's personal room
- `send_message` - Send a new message
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator
- `mark_messages_seen` - Mark messages as seen

### Server → Client
- `receive_message` - Receive new message
- `user_typing` - User typing status
- `messages_seen` - Messages seen status
- `message_error` - Message sending error

---
🚀 Installation & Setup
Prerequisites

Node.js (v14 or higher)

MongoDB

ImageKit account (for image storage)

Backend Setup


cd server
npm install

# Create .env file
cp .env.example .env

# Add your environment variables
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
CLIENT_URL=http://localhost:5173

# Start server
npm run dev

cd client
npm install

# Create .env file
VITE_BASEURL=http://localhost:3000/api

# Start development server
npm run dev



