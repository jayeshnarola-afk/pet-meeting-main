# 🐾 PetMeeter Dating App - Backend API

A dating app for pet lovers! Connect with other pet owners and find playdates for your furry friends.

## ✨ Features

- ✅ User Registration with Multiple Pets
- ✅ Each Pet can have up to 3 Photos
- ✅ Profile Photo Upload
- ✅ Pet Photos Upload
- ✅ JWT Authentication
- ✅ Forgot Password with Email OTP
- ✅ Password Reset
- ✅ Beautiful HTML Email Templates
- ✅ File Upload with Validation
- ✅ PostgreSQL Database with TypeORM

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- PostgreSQL
- Gmail account (for email service)

### Installation

1. **Clone the repository**
   ```bash
   cd petmeeter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup PostgreSQL Database**
   ```bash
   # Login to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE petmeeter;
   ```

4. **Configure Environment**
   
   Create `.env` file:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_DATABASE=petmeeter
   
   JWT_SECRET=your-secret-key-here
   
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-gmail-app-password
   
   PORT=4000
   ```

5. **Run the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm run build
   npm start
   ```

Server will start at: `http://localhost:4000`

## 📖 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

### Quick API Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signup` | POST | Register new user with pets |
| `/api/auth/login` | POST | User login |
| `/api/auth/forgot-password` | POST | Request OTP for password reset |
| `/api/auth/reset-password` | POST | Reset password with OTP |
| `/api/upload/profile` | POST | Upload profile photo |
| `/api/upload/pet` | POST | Upload pet photos (max 3) |
| `/uploads/*` | GET | Access uploaded images |

## 🧪 Testing

### Test Signup
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "age": 28,
    "email": "john@example.com",
    "password": "password123",
    "location": "Mumbai",
    "pets": [{
      "name": "Tommy",
      "type": "dog",
      "breed": "Golden Retriever",
      "age": 3,
      "gender": "male",
      "size": "large",
      "color": "golden",
      "personality": "friendly",
      "bio": "Loves to play"
    }]
  }'
```

### Test Forgot Password
```bash
curl -X POST http://localhost:4000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com"}'
```

## 📁 Project Structure

```
petmeeter/
├── src/
│   ├── controllers/     # Request handlers
│   ├── entities/        # Database models
│   ├── middleware/      # Auth & Upload middleware
│   ├── routes/          # API routes
│   ├── services/        # Email service
│   └── index.ts         # Entry point
├── config/
│   └── database.ts      # Database configuration
├── uploads/
│   ├── profiles/        # User profile photos
│   └── pets/            # Pet photos
└── package.json
```

## 🔐 Email Setup (Gmail)

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Security → 2-Step Verification → Enable
3. App Passwords → Generate new password
4. Copy the password to `.env` as `EMAIL_PASS`

## 🛠️ Tech Stack

- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL + TypeORM
- **Authentication:** JWT + bcrypt
- **File Upload:** Multer
- **Email:** Nodemailer
- **Validation:** Custom validators

## 📝 Database Schema

### User Entity
- id, fullName, age, email, password, location
- profilePhoto, otp, otpExpires
- pets (one-to-many relationship)

### Pet Entity
- id, name, type, breed, age, gender
- size, color, personality, bio
- vaccinationNotes, specialNeeds
- photos (array), ownerId

## ⚡ Features in Detail

### Multiple Pet Support
- Users can add unlimited pets during signup
- Each pet has full profile with details
- Pet photos stored separately

### Photo Upload
- Profile: 1 photo, max 5MB
- Pet: up to 3 photos per pet, max 5MB each
- Supported formats: JPEG, PNG, GIF, WebP
- Files stored locally in `uploads/` folder

### Email System
- Beautiful HTML templates
- OTP expires in 10 minutes
- Secure password reset flow
- Gmail SMTP integration

### Security
- Passwords hashed with bcrypt
- JWT for stateless authentication
- File type validation
- File size limits

## 🐛 Troubleshooting

### Port already in use
```bash
# Kill existing process
pkill -9 -f "ts-node"
# Or
lsof -ti:4000 | xargs kill -9
```

### Database connection error
- Check PostgreSQL is running
- Verify credentials in `.env`
- Ensure database exists

### Email not sending
- Check Gmail credentials
- Use App Password, not regular password
- Enable 2-Step Verification in Google Account

## 📄 License

MIT

## 👨‍💻 Developer

PetMeeter Team

---

**Happy Coding! 🚀**



