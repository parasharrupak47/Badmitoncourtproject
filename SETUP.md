# BadmintonHub - Setup Guide

## Quick Start

This guide will help you set up the BadmintonHub application on your local machine.

## Prerequisites Checklist

Before you start, ensure you have:

- [ ] Node.js (v14 or higher) - Download from [nodejs.org](https://nodejs.org/)
- [ ] MongoDB installed locally OR MongoDB Atlas account for cloud database
- [ ] Git (optional, for version control)
- [ ] A text editor (VS Code recommended)

## Step 1: MongoDB Setup

### Option A: Local MongoDB

1. Download and install MongoDB from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Follow installation instructions for your OS
3. Start MongoDB service
4. Default connection: `mongodb://localhost:27017/badminton`

### Option B: MongoDB Atlas (Cloud)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create a new cluster
4. Get connection string (URI)
5. Update `.env` file with your connection string

## Step 2: Backend Setup

### 2.1 Navigate to Server Directory

```bash
cd server
```

### 2.2 Install Dependencies

```bash
npm install
```

This will install:

- express (web framework)
- mongoose (database)
- jwt & bcryptjs (authentication)
- cors (cross-origin support)
- dotenv (environment variables)

### 2.3 Configure Environment Variables

Create a `.env` file in the server directory:

```bash
# Copy example file
cp .env.example .env
```

Edit `.env` with your settings:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/badminton
JWT_SECRET=your_super_secret_key_12345
NODE_ENV=development
```

**Important**: Change `JWT_SECRET` to a random string for production!

### 2.4 Start the Server

```bash
npm start
```

Expected output:

```
Server running on port 5000
MongoDB connected
```

**Note**: The server will run on `http://localhost:5000`

## Step 3: Frontend Setup

### 3.1 Open New Terminal

Keep the backend running and open a new terminal window.

### 3.2 Navigate to Client Directory

```bash
cd client
```

### 3.3 Install Dependencies

```bash
npm install
```

This will install React and dependencies. This may take a few minutes.

### 3.4 Configure API URL (Optional)

Create a `.env` file in the client directory:

```
REACT_APP_API_URL=http://localhost:5000/api
```

If you skip this, it will default to `http://localhost:5000/api`

### 3.5 Start the Development Server

```bash
npm start
```

Expected output:

```
Compiled successfully!
You can now view the app in your browser.
Local: http://localhost:3000
```

The browser should automatically open. If not, visit `http://localhost:3000`

## Step 4: Create Test Account

1. Click "Register" button
2. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Phone: 9999999999
   - Gender: Select one
   - Password: test123456
3. Click "Register"
4. You'll be redirected to the dashboard

## Step 5: Create Staff Account (Optional)

To test staff features, you need to create a staff account directly in MongoDB:

### Using MongoDB Compass (GUI):

1. Open MongoDB Compass
2. Connect to your database
3. Go to `badminton` database → `users` collection
4. Insert document:

```json
{
  "name": "Staff Member",
  "email": "staff@example.com",
  "password": "$2a$10$...",  // bcrypt hash of "staff123"
  "phone": "9999999998",
  "role": "staff",
  "gender": "male",
  "level": "advanced",
  "matchesWon": 0,
  "matchesPlayed": 0,
  "joinedAt": new Date(),
  "createdAt": new Date(),
  "updatedAt": new Date()
}
```

Or use MongoDB CLI to hash password and insert.

## Folder Structure Overview

```
badminton/
├── server/
│   ├── models/          # Database schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth checks
│   ├── index.js         # Server entry
│   ├── package.json
│   └── .env            # Config (don't commit!)
│
├── client/
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── components/ # Reusable components
│   │   ├── context/    # State management
│   │   ├── services/   # API calls
│   │   ├── styles/     # CSS files
│   │   ├── App.js      # Main component
│   │   └── index.js    # Entry point
│   ├── public/         # Static files
│   ├── package.json
│   └── .env           # Config (optional)
│
└── README.md          # Project documentation
```

## Terminal Commands Reference

### Backend Terminal

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run with auto-reload (if nodemon installed)
npm run dev
```

### Frontend Terminal

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Testing the Application

### 1. Test User Registration

- Go to `http://localhost:3000/register`
- Fill in all fields
- Click Register
- Should redirect to Dashboard

### 2. Test Login

- Go to `http://localhost:3000/login`
- Use your registered credentials
- Should redirect to Dashboard

### 3. Test Booking

- Click "Book Slots" in navigation
- Set date and filters
- Should see available slots
- Click "Book Now" on a slot
- Complete booking

### 4. Test Staff Functions

- Login as staff user
- Go to "Manage Slots"
- Create a new slot
- Fill in all required fields
- Slots should appear in booking page

## Common Issues & Solutions

### Issue: Cannot connect to MongoDB

**Solution:**

- Check MongoDB is running
- Verify connection string in `.env`
- For Atlas, ensure IP is whitelisted
- Check firewall settings

### Issue: Port 5000 already in use

**Solution:**

```bash
# Change in .env
PORT=5001
```

### Issue: Port 3000 already in use

**Solution:**

```bash
# Set different port
set PORT=3001 && npm start  # Windows
PORT=3001 npm start         # Mac/Linux
```

### Issue: CORS error when calling API

**Solution:**

- Ensure backend is running
- Check API URL in frontend `.env`
- Verify CORS is enabled in backend

### Issue: Cannot save API changes

**Solution:**

- Stop frontend dev server (Ctrl+C)
- Clear node_modules cache
- Reinstall: `npm install`
- Restart: `npm start`

### Issue: Username already exists

**Solution:**

- Use a different email address
- Clear browser localStorage if issues persist

## Deployment Preparation

### Backend Deployment (Heroku/Railway/Render):

1. Set up MongoDB Atlas cloud database
2. Create production `.env` with:
   - Different JWT_SECRET
   - MongoDB Atlas URI
   - NODE_ENV=production
3. Add `npm start` as start command
4. Deploy via platform's CLI or Git

### Frontend Deployment (Vercel/Netlify):

1. Build the frontend: `npm run build`
2. Deploy the `build` folder
3. Set environment variable: `REACT_APP_API_URL=your_backend_url`

## Next Steps

1. **Explore the UI**: Navigate through all pages
2. **Test Features**: Try booking, finding partners, updating profile
3. **Review Code**: Check implementation in `client/src` and `server`
4. **Customize**: Modify colors, add features, adjust pricing
5. **Learn**: Study React hooks, Express middleware, MongoDB queries

## Useful Resources

- React Documentation: https://react.dev
- Express.js Guide: https://expressjs.com/
- MongoDB Manual: https://docs.mongodb.com/manual/
- JWT: https://jwt.io/
- React Router: https://reactrouter.com/

## Need Help?

- Check browser console for errors (F12)
- Check terminal output for backend errors
- Review README.md in root directory
- Check network tab in DevTools for API calls

## Security Reminders

⚠️ **Before Production:**

1. Change JWT_SECRET to a strong random string
2. Enable MongoDB authentication
3. Set production node environment
4. Use HTTPS for API
5. Add input validation
6. Implement rate limiting
7. Add API key authentication
8. Turn off debug mode
9. Add GDPR compliance
10. Implement payment security

## Success Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] MongoDB connected
- [ ] Can register new user
- [ ] Can login
- [ ] Can see dashboard
- [ ] Can view available slots
- [ ] Can book a slot
- [ ] Can view bookings
- [ ] Can update profile

---

**You're all set! Happy coding! 🎉**
