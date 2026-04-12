# BadmintonHub - Badminton Court Booking System

BadmintonHub is a full-stack web application for booking badminton courts, finding playing partners, and managing player statistics. It features a modern React frontend and an Express/MongoDB backend.

## Features

### Player Features

- **Slot Booking**: Browse and book available court slots
  - Singles, Doubles, and Mixed Doubles games
  - Flexible durations (30, 45, 60, 90+ minutes)
  - Different price ranges
- **Find Partners**: Discover nearby players at your skill level
- **Booking Management**: View, manage, and cancel bookings
- **User Profiles**: Create and maintain your player profile with statistics
- **Performance Tracking**: Monitor wins, matches played, and win rate
- **Search Filters**: Filter slots by date, game type, and duration

### Staff Features

- **Slot Management**: Create, edit, and delete court slots
- **User Management**: View all players and their profiles
- **Player Statistics**: Track wins, matches, and performance metrics
- **Dashboard**: View bookings, revenue, and player rankings
- **Analytics**: Track booking trends and revenue

### Admin Features

- All staff features plus additional administrative controls

## Project Structure

```
badminton/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React Context for state management
│   │   ├── services/      # API service calls
│   │   ├── styles/        # CSS styling
│   │   └── App.js         # Main App component
│   └── package.json
│
└── server/                # Express Backend
    ├── models/           # MongoDB schemas
    ├── routes/           # API routes
    ├── middleware/       # Authentication & authorization
    ├── controllers/      # Business logic
    ├── index.js          # Server entry point
    └── package.json
```

## Tech Stack

### Frontend

- **React 18**: UI library
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **React Icons**: Icon library
- **CSS3**: Modern styling with CSS variables

### Backend

- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB ODM
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **CORS**: Cross-origin requests

## Installation & Setup

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to server directory:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file with your configuration:

```bash
cp .env.example .env
```

4. Update `.env` with your MongoDB connection string:

```
MONGODB_URI=mongodb://localhost:27017/badminton
JWT_SECRET=your_secret_key_here
```

5. Start the server:

```bash
npm start
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to client directory:

```bash
cd client
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file (optional, defaults to localhost:5000):

```bash
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:

```bash
npm start
```

Application will open at `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Slots

- `GET /api/slots/available` - Get available slots
- `GET /api/slots` - Get all slots (staff only)
- `POST /api/slots` - Create slot (staff only)
- `PUT /api/slots/:id` - Update slot (staff only)
- `DELETE /api/slots/:id` - Delete slot (staff only)

### Bookings

- `GET /api/bookings/user/my-bookings` - Get user's bookings (protected)
- `GET /api/bookings` - Get all bookings (staff only)
- `POST /api/bookings` - Create booking (protected)
- `PUT /api/bookings/:id/cancel` - Cancel booking (protected)

### Users

- `GET /api/users` - Get all users (staff only)
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile (protected)
- `GET /api/users/:id/stats` - Get user statistics
- `GET /api/users/search/nearby` - Find nearby players (protected)

### Statistics

- `GET /api/stats/dashboard` - Dashboard statistics (staff only)
- `GET /api/stats/user/:id` - User statistics

## User Roles

1. **Player**: Default role for registered users
   - Can book slots
   - Can find partners
   - Can view own profile and statistics

2. **Staff**: Court staff members
   - Can manage slots
   - Can view all users
   - Can update player statistics
   - Can view dashboard

3. **Admin**: System administrators
   - All staff privileges plus administrative controls

## Database Models

### User

- Basic info (name, email, phone, gender)
- Authentication (password hash)
- Role-based access
- Gaming info (level, wins, matches played)
- Preferences (duration, time slots)

### Slot

- Court reference
- Date and time
- Duration and game type
- Pricing
- Availability status
- Booked players list

### Booking

- User and partners
- Slot information
- Game details
- Payment status
- Match outcome

### Court

- Location and address
- Surface type
- Amenities
- Pricing
- Images and description

## Authentication

The application uses JWT (JSON Web Tokens) for authentication:

- Tokens are stored in localStorage
- Automatically attached to API requests
- Tokens expire after 7 days
- Protected routes check user authentication

## Styling

The application uses a modern, responsive CSS design with:

- CSS Variables for theming
- Flexbox and CSS Grid for layouts
- Mobile-first responsive design
- Smooth transitions and animations
- Accessible color contrast

## Features Highlight

### Interactive UI

- Real-time slot availability
- Smooth animations and transitions
- Responsive design for all devices
- Intuitive navigation

### Smart Booking

- Filter slots by date, type, duration
- Select partners for doubles games
- Flexible cancellation
- Booking history

### Player Matching

- Find players at your skill level
- View player statistics
- Connect with nearby players
- Build your gaming community

### Performance Tracking

- Win/loss statistics
- Leaderboards
- Performance graphs
- Activity history

## Future Enhancements

- Payment gateway integration
- Real-time notifications
- Video tutorials
- Advanced analytics
- Mobile app
- Rating and reviews system
- Tournament management
- Chat feature for players

## Error Handling

The application includes comprehensive error handling:

- API error responses
- Validation messages
- User-friendly error displays
- Console logging for debugging

## Security Features

- Password hashing with bcryptjs
- JWT authentication
- Protected routes
- Role-based access control
- Input validation
- CORS protection

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running
- Check connection string in `.env`
- Verify firewall settings

### API Connection Error

- Check if backend server is running
- Verify API URL in frontend `.env`
- Check CORS settings in server

### Port Already in Use

- Change PORT in `.env` for backend
- Change development port for frontend

## Contributing

1. Create a feature branch
2. Commit changes
3. Push to branch
4. Create Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please contact:

- Email: support@badmintonhub.com
- GitHub: [repository-link]

## Acknowledgments

- React documentation
- Express.js community
- MongoDB guides
- Icons from React Icons

---

**Happy Badminton Playing! 🏸**
