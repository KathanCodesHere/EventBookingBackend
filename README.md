🟦Event Booking Backend (MERN)

A clean and scalable backend setup for an Event Booking System using Node.js, Express, MongoDB, JWT Auth, Cloudinary, Multer, Razorpay, Twilio, and more.
This project uses Modular Architecture and environment-based configuration (.env.development, .env.production).

⭐ Features

Express.js backend
Auth Ready Setup (JWT, cookies — routes to be added)
Cloudinary + Multer media upload integration
Razorpay Payment Setup
QR code integration
Environment-Based Config (.env.development, .env.production)
Global error handling
/health endpoint for server monitoring
MongoDB (Mongoose) connected

📁 Project Structure
src/
├── config/ # Database and configuration files
├── controllers/ # Route handlers and business logic controllers
├── middlewares/ # Custom middleware (auth, error handling, security)
├── models/ # Database models and schemas
├── routes/ # API route definitions
├── hook/ # webhook
├── services/ # Business logic and data access layer
├── utils/ # Utility functions and constants
├── validations/ # Input validation schemas
├── app.js # Express app configuration
└── server.js # Server entry point

🚀 Getting Started

1️⃣ Clone the Repository
git clone https://github.com/KathanCodesHere/EventBookingBackend.git

cd EventBookingBackend

2️⃣ Install Dependencies
npm install

3️⃣ Environment Variables Setup
# Copy and configure environment files

cp .env.development.example .env.development
cp .env.production.example .env.production

🏁 Running the Project

Development Server:
npm run dev

Production Server:
npm start

Server starts at:
http://localhost:5000

🧪 Health Check API
GET /health
Response:
{
"success": true,
"message": "Server is running",
"timestamp": "2025-11-19T08:20:51.848Z",
"environment": "development"
}

⚙️ Scripts
| Command | Description |
| ------------- | ------------------------ |
| `npm run dev` | Runs server with nodemon |
| `npm start` | Runs server normally |

📦 Major Dependencies

| Package                   | Purpose                      |
| ------------------------- | ---------------------------- |
| express                   | API framework                |
| mongoose                  | MongoDB ORM                  |
| cors                      | CORS handling                |
| cloudinary                | Cloud media storage          |
| multer                    | File uploads                 |
| multer-storage-cloudinary | Connects Multer + Cloudinary |
| jsonwebtoken              | JWT authentication           |
| bcryptjs                  | Password hashing             |
| razorpay                  | Online payments              |
| http-status-codes         | Clean status codes           |
| cookie-parser             | Parse cookies                |

🔥 Future Enhancements (Recommended)

Complete auth module (register/login/OTP login)
Event CRUD APIs
Booking API → checkout + Razorpay payment callback
Role-based access (Admin, Organizer, User)
Push notifications
Email integration

🤝 Contributing
Pull requests are welcome.
Raise an issue for any bug or enhancement.

📄 License
This project is licensed under ISC.
