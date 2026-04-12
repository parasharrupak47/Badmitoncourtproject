# BadmintonHub - Quick Start Guide

Get up and running in minutes! 🚀

## Prerequisites

- Node.js installed
- MongoDB running locally or MongoDB Atlas account
- Command line/terminal access

## 30-Second Setup

### Step 1: Backend (Terminal 1)

```bash
cd server
npm install
npm start
```

✅ **Server running on** `http://localhost:5000`

### Step 2: Frontend (Terminal 2)

```bash
cd client
npm install
npm start
```

✅ **App opens at** `http://localhost:3000`

## That's it! 🎉

### First Login Test

1. Click "Register"
2. Enter details:
   - **Name**: John Doe
   - **Email**: john@test.com
   - **Phone**: 9999999999
   - **Password**: test123456
3. Click Register
4. Welcome to Dashboard!

## What You Can Do Now

### Player Features

- 📅 **Book Slots** - Reserve badminton court slots
- 👥 **Find Partners** - Search for players at your level
- 📊 **View Bookings** - See your reservations
- 👤 **Update Profile** - Manage your player profile

### Staff Features (After login as staff)

- 🎯 **Create Slots** - Add available court slots
- 📈 **DashBoard** - View bookings and revenue
- 👨‍💼 **Manage Users** - Track player stats

## Quick Navigation

### Player Dashboard

```
Home → Register → Dashboard
       ↓
       ├─ Book Slots
       ├─ Find Partner
       ├─ My Bookings
       └─ Profile
```

### Staff Panel

```
Dashboard → Manage Slots → Create/Edit Slots
          → View Users → Update Stats
```

## Key Features to Try

### 1. Book Your First Slot (2 min)

1. Go to "Book Slots"
2. Pick a date
3. Click "Book Now"
4. Confirm booking

### 2. Find a Partner (2 min)

1. Go to "Find Partner"
2. Filter by skill level
3. Click "Book with Player"

### 3. Update Your Profile (1 min)

1. Click profile dropdown
2. Click "Edit Profile"
3. Update your info
4. Save

### 4. Manage Slots (Staff Only)

1. Go to "Manage Slots"
2. Click "Create New Slot"
3. Fill details
4. Submit

## File Locations

Important files you might want to customize:

**Styling**: `client/src/styles/main.css`
**Colors**: Look for `--primary-color`, `--secondary-color`, etc.
**API Config**: `client/src/services/api.js`
**Backend Config**: `server/.env`

## Common First-Time Issues

### "Cannot connect to MongoDB"

- [ ] Is MongoDB running?
- [ ] Check connection string in `.env`

### "Cannot reach backend"

- [ ] Is backend terminal showing "Server running on port 5000"?
- [ ] Is port 5000 available?

### "Frontend not loading"

- [ ] Is frontend terminal showing "compiled successfully"?
- [ ] Try `Ctrl+C` and `npm start` again

## Add Some Demo Data

### Create a Staff Account

Contact admin or use MongoDB Compass to directly insert a user with role: "staff"

### Create Sample Slots

As staff, go to "Manage Slots" → "Create New Slot"

Example:

- Court: Court 1
- Date: Tomorrow
- Time: 6:00 PM - 7:00 PM
- Type: Doubles
- Price: ₹300
- Duration: 60

## Customization Ideas

1. **Change Colors**
   - Edit `client/src/styles/main.css`
   - Update CSS variables at the top

2. **Add Your Court Name**
   - Edit `client/src/components/Navbar.js`
   - Change "BadmintonHub" text

3. **Adjust Pricing**
   - Edit slot creation form in `client/src/pages/ManageSlots.js`
   - Change default prices

4. **Modify UI Text**
   - Edit page titles in respective files
   - Update button labels

## Next Steps

Once you're comfortable with basics:

1. Read `README.md` for full documentation
2. Check `PROJECT_SUMMARY.md` for architecture
3. Explore API endpoints in `server` folder
4. Customize styling in `client/src/styles/`
5. Add database seeds for demo data

## Terminal Commands Reference

```bash
# Backend
npm install          # Install dependencies
npm start           # Start server (port 5000)
npm run dev         # Auto-reload (needs nodemon)

# Frontend
npm install         # Install dependencies
npm start           # Start dev server (port 3000)
npm run build       # Production build
npm test            # Run tests
```

## File Structure Quick Reference

```
server/
├── models/          ← Database schemas
├── routes/          ← API endpoints
├── middleware/      ← Auth checks
├── index.js        ← Start here
└── .env            ← Configuration

client/
├── src/
│   ├── pages/      ← Page components
│   ├── components/ ← Reusable widgets
│   ├── services/   ← API calls
│   ├── styles/     ← CSS
│   └── App.js      ← Start here
└── package.json
```

## Database Quick Commands

Access MongoDB directly (if using Compass):

- Database: `badminton`
- Collections: `users`, `slots`, `bookings`
- Collections auto-created on first use

## Testing Checklist

- [ ] Can register new account
- [ ] Can login with credentials
- [ ] Can see dashboard after login
- [ ] Can view available slots
- [ ] Can book a slot
- [ ] Can view my bookings
- [ ] Can update profile
- [ ] Can logout

## Get Help

1. **Check console** (F12 in browser)
2. **Check terminal output**
3. **Read error messages carefully**
4. **Check README.md** for more details
5. **Review code comments**

## Pro Tips

🔧 **For Development**:

- Use VS Code
- Install "Thunder Client" or "Postman" for API testing
- Keep terminal windows organized
- Use `npm install -g nodemon` for auto-reload

🚀 **For Production**:

- Change JWT_SECRET
- Set NODE_ENV=production
- Use MongoDB Atlas (cloud)
- Deploy backend to Heroku/Railway
- Deploy frontend to Vercel/Netlify

## You're Ready! 🎉

```
✓ Backend running
✓ Frontend running
✓ Database connected
✓ Ready to book!
```

**Happy Badminton Playing!** 🏸

---

Need more details? Check:

- `README.md` - Full documentation
- `SETUP.md` - Detailed setup guide
- `PROJECT_SUMMARY.md` - Architecture overview
