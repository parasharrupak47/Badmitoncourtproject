# BadmintonHub - Architecture & Technical Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT TIER (React)                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Pages: Home, Login, Register, Dashboard, Slots, etc.    │   │
│  │ Components: Navbar, SlotCard, UserCard, Forms           │   │
│  │ State mgmt: AuthContext for user & auth data            │   │
│  │ Services: API.js for backend communication              │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
                                ↓
                      ┌──────────────────┐
                      │ HTTP / REST API  │
                      │ JSON format      │
                      │ JWT Auth headers │
                      └──────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────────┐
│                      SERVER TIER (Express)                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Routes: /api/auth, /api/slots, /api/bookings, etc.      │   │
│  │ Middleware: JWT validation, role checks                 │   │
│  │ Controllers: Business logic for CRUD operations         │   │
│  │ Models: Mongoose schemas for validation                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
                                ↓
                      ┌──────────────────┐
                      │ Database Driver  │
                      │ Mongoose ODM     │
                      └──────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────────┐
│                    DATABASE TIER (MongoDB)                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Collections: users, slots, bookings, courts             │   │
│  │ Indexes: For fast queries                               │   │
│  │ Validation: Schema-level constraints                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Authentication Flow

```
User Registration
    ↓
Client POST /api/auth/register {name, email, password, ...}
    ↓
Server validates input
    ↓
Hash password with bcryptjs
    ↓
Save user to MongoDB
    ↓
Generate JWT token
    ↓
Return token + user info
    ↓
Client stores token in localStorage
    ↓
Token auto-attached to future requests via axios interceptor
```

### Booking Flow

```
User clicks "Book Now"
    ↓
Show modal for partner selection (if doubles)
    ↓
User confirms
    ↓
Client POST /api/bookings {slotId, gameType, partners}
    ↓
Server validates slot availability
    ↓
Create booking record
    ↓
Update slot's bookedPlayers array
    ↓
Check if slot is full
    ↓
Return booking confirmation
    ↓
Client updates UI
    ↓
User sees booking in "My Bookings"
```

### Staff Operations Flow

```
Staff logs in
    ↓
Server checks role = 'staff'
    ↓
Staff navigates to "Manage Slots"
    ↓
Fetch all slots via GET /api/slots
    ↓
Display in table format
    ↓
Staff fills out slot creation form
    ↓
POST /api/slots with details
    ↓
Server validates and saves
    ↓
New slot available for bookings
```

## Component Communication

### React Component Hierarchy

```
App (Router setup)
├── Navbar (Navigation, user menu)
├── Home (Public landing)
├── Login/Register (Auth pages)
├── Protected Routes
│   ├── Dashboard (Main hub)
│   ├── BookSlots (Slot listing)
│   │   └── SlotCard (Individual slot)
│   ├── FindPartner
│   │   └── UserCard (Player profile)
│   ├── MyBookings (User's bookings)
│   ├── UserProfile (Player profile)
│   └── ManageSlots (Staff only)
│       └── Slot form
└── Context Providers
    └── AuthContext (Auth state)
```

### State Management

```
AuthContext
├── user (logged-in user data)
├── token (JWT token)
├── loading (auth loading state)
└── Methods (login, register, logout)

Local Component State
├── Form inputs
├── Modal visibility
├── Page data (slots, bookings, etc.)
└── UI state (loading, errors)
```

## API Endpoints Architecture

### Auth Endpoints

```
POST   /api/auth/register
  Input: { name, email, password, phone, gender, level }
  Output: { token, user }

POST   /api/auth/login
  Input: { email, password }
  Output: { token, user }

GET    /api/auth/me
  Auth: Required
  Output: { user details }
```

### Slots Endpoints

```
GET    /api/slots/available
  Query: ?date=2024-01-01&gameType=doubles&duration=60
  Output: [{ slot objects }]

GET    /api/slots
  Auth: Staff required
  Output: [{ all slots }]

POST   /api/slots
  Auth: Staff required
  Input: { court, date, startTime, endTime, duration, gameType, price }
  Output: { new slot }

PUT    /api/slots/:id
  Auth: Staff required
  Output: { updated slot }

DELETE /api/slots/:id
  Auth: Staff required
  Output: { success message }
```

### Bookings Endpoints

```
GET    /api/bookings/user/my-bookings
  Auth: Required
  Output: [{ user's bookings }]

GET    /api/bookings
  Auth: Staff required
  Output: [{ all bookings }]

POST   /api/bookings
  Auth: Required
  Input: { slotId, gameType, partners }
  Output: { booking confirmation }

PUT    /api/bookings/:id/cancel
  Auth: Required
  Output: { cancelled booking }
```

### Users Endpoints

```
GET    /api/users
  Auth: Staff required
  Output: [{ all players }]

GET    /api/users/:id
  Output: { player profile }

PUT    /api/users/:id
  Auth: Required
  Input: { name, phone, level, bio, etc. }
  Output: { updated profile }

GET    /api/users/:id/stats
  Output: { matches, wins, rate, etc. }

GET    /api/users/search/nearby
  Auth: Required
  Query: ?level=intermediate&gender=female
  Output: [{ matching players }]
```

### Stats Endpoints

```
GET    /api/stats/dashboard
  Auth: Staff required
  Output: { totalBookings, users, revenue, topPlayers, trends }

GET    /api/stats/user/:id
  Output: { userStats, performance, monthlyActivity }
```

## Error Handling Strategy

```
Client Error (4xx)
├── 400 Bad Request (validation failed)
├── 401 Unauthorized (no token)
├── 403 Forbidden (role check failed)
└── 404 Not Found (resource missing)

Server Error (5xx)
├── 500 Internal Server Error
└── Logged for debugging

Frontend Error Handling
├── API error response → Display alert
├── Network error → Show alert with retry
├── Form validation → Show field errors
└── Loading state → Show spinner
```

## Security Layers

### 1. Input Validation

```
Client side: React form validation
Server side: Mongoose schema validation + manual checks
Database: Schema constraints
```

### 2. Authentication

```
Password: Hashed with bcryptjs (salt rounds: 10)
Token: JWT with secret key
Expiry: 7 days
Storage: localStorage (client)
```

### 3. Authorization

```
Check user credentials for sensitive operations
Role-based access (player, staff, admin)
Verify user owns resource before modification
```

### 4. Data Protection

```
HTTPS encryption (in production)
CORS enabled (only trusted origins)
Sensitive data not logged
Environment variables for secrets
```

## Performance Optimizations

### Frontend

- React Router for efficient navigation
- Context API for state (no unnecessary re-renders)
- Lazy loading of images
- CSS animations use `transform` and `opacity`
- Event delegation in event handlers

### Backend

- Database indexing on frequently queried fields
- Mongoose lean() for read-only queries
- Pagination ready (limit/skip implemented)
- Response compression
- Error handling prevents crashes

### Database

- MongoDB indexes on: email, date, gameType
- Collection validation schemas
- Auto-cleanup of old bookings possible
- TTL indexes for temporary data

## Scalability Considerations

### Horizontal Scaling

```
Multiple server instances → Load balancer
Shared MongoDB instance
Static assets → CDN
Sessions → Server store or Redis
```

### Vertical Scaling

```
More powerful server
Larger database machine
Caching layer (Redis)
Database clustering
```

### Future Optimizations

```
Implement pagination
Add caching (Redis)
Database sharding
Microservices architecture
Message queue for jobs
Search engine (Elasticsearch)
```

## Deployment Architecture

### Development Environment

```
Frontend: localhost:3000 (React dev server)
Backend: localhost:5000 (Express)
Database: localhost:27017 (MongoDB local)
```

### Production Environment

```
Frontend: CDN + Static hosting (Vercel/Netlify)
Backend: Cloud server (Heroku/Railway/Render)
Database: MongoDB Atlas (managed)
Storage: S3/Cloud storage for images
```

## Testing Strategy

### Unit Tests

```
Individual functions
API endpoints
Database operations
Utility functions
```

### Integration Tests

```
Auth flow (register → login → access protected)
Booking flow (create → view → cancel)
User update flow
```

### End-to-End Tests

```
Complete user journey
Multiple user interactions
Error scenarios
Edge cases
```

## Monitoring & Logging

### Backend Logging

```
API request/response
Database operations
Errors and exceptions
User actions
Performance metrics
```

### Frontend Logging

```
Error tracking
API call monitoring
User interactions
Performance metrics
```

### Alerts

```
High error rate
Database down
Server down
Low performance
```

## API Response Format

### Success Response (2xx)

```json
{
  "status": "success",
  "data": {
    /* actual data */
  }
}
```

### Error Response (4xx/5xx)

```json
{
  "status": "error",
  "message": "User-friendly error message"
}
```

## Database Indexes

```
users
├── email (unique)
├── role
└── level

slots
├── date
├── gameType
├── isAvailable
└── court

bookings
├── user
├── date
├── status
└── slot

courts
├── location
└── isActive
```

## Caching Strategy (Future)

```
Redis cache for:
- Available slots (5 min TTL)
- Player profiles (10 min TTL)
- Top players list (1 hour TTL)
- User auth (session TTL)
```

## Rate Limiting (Future)

```
Login attempts: 5 per minute
API requests: 100 per hour (per user)
Booking creation: 10 per hour
```

## Versioning

```
API v1: /api/v1/*
Maintains backward compatibility
Easy migration to v2
```

## Dependencies Overview

### Backend

```
express@4.21.1          - Web framework
mongoose@8.3.4          - Database ODM
jsonwebtoken@9.1.2      - JWT tokens
bcryptjs@2.4.3         - Password hashing
cors@2.8.5             - Cross-origin
dotenv@16.3.1          - Environment vars
```

### Frontend

```
react@18               - UI library
react-router-dom@6     - Routing
axios@1.5              - HTTP client
react-icons@4          - Icons
```

## Pipeline

```
Developer
    ↓ (git push)
GitHub Repo
    ↓ (webhook)
CI/CD Pipeline
    ↓ (tests, build)
Staging Environment
    ↓ (manual approval)
Production Environment
```

## Disaster Recovery

```
Database Backup: Daily
Code Versioning: Git
Environment Backup: Infrastructure as Code
Recovery Plan: Documented
RTO: < 1 hour
RPO: < 1 hour
```

## Conclusion

The BadmintonHub application is built on a modern, scalable architecture that:

- Separates concerns (client/server/database)
- Implements security best practices
- Provides good error handling
- Allows for easy scaling
- Maintains clean code structure
- Enables future enhancements

All components work together to create a seamless user experience while maintaining high standards for security and performance.
