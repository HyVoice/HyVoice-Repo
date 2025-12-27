# 🏆 HyVoice - Hyderabad Civic Grievance Portal

HyVoice is a civic grievance tracking web application designed to allow Hyderabad citizens to report and track community issues such as potholes, street lights, garbage problems, and more. The application includes a public-facing frontend for reporting and viewing issues and an admin panel for managing reports with role-based access control.

<img width="530" height="480" alt="image" src="https://github.com/user-attachments/assets/afd5d14b-4628-44a0-9873-0ae7a3d964fa" />

## Live Preview Link :- https://hyvoice-d2cba.web.app/
## Table of Contents

    Libraries Used
    Features
    Setup
      Frontend Setup
      Backend Setup
    API Integration
    Environment Variables
      Frontend Environment Variables
      Backend Environment Variables
    Code Explanation
    Admin Features
    Role-Based Access Control
    Deployment

## Libraries Used
  ### Frontend
    React 18: A JavaScript library for building user interfaces
    Material-UI (MUI): React component library implementing Material Design
    Mapbox GL JS: Interactive mapping library
    Firebase SDK: Authentication and Firestore database
    Supabase: File storage for photos
    React Router DOM: Routing in React applications
    React Firebase Hooks: Firebase integration hooks
    Axios: HTTP requests
    React Map GL: React wrapper for Mapbox
   ### Backend
    Firebase Authentication: User authentication (Email/Password & Google)
    Firebase Firestore: Real-time NoSQL database
    Supabase Storage: File storage service

## Features
  ### 🗺️ Interactive Mapping
    Real-time Mapbox integration with Hyderabad focus
    Click-to-pin location selection
    Address search with autocomplete
    Quick location buttons for Hyderabad hotspots
    Drag-and-drop marker adjustment
  ### 👥 Role-Based Access Control
    Citizens: Report issues, track status, view dashboard
    Municipal Staff: Manage grievances, update status, assign tasks
    Administrators: Full system control, analytics, user management
  ### 📱 Grievance Management
    Multi-step issue reporting with photo upload
    Real-time status tracking (Submitted → Acknowledged → In Progress → Resolved)
    Status history with audit trail
    Priority-based categorization (Low/Medium/High)
    Photo evidence storage via Supabase
  ### 📊 Admin Dashboard
    Bulk operations (update status, delete multiple)
    Advanced filtering & search
    CSV export functionality
    Real-time statistics & analytics
    User management interface
  ### 🔔 Real-time Updates
    Live grievance feed updates
    Instant status change notifications
    Real-time dashboard statistics
    Firebase Firestore real-time database
## Setup
  ### Frontend Setup
    Clone the repository:
      git clone https://github.com/HyVoice/HyVoice-Repo
      cd hyvoice
    Install dependencies:
      npm install
    Create a .env.local file in the root directory and add the following environment variables:
      // Your Firebase config (no storage!)
        const firebaseConfig = {
          apiKey: "AIzaSyA9VwJDwfTSw8NaVK4jRuCf_i6gBzXZlKg",
          authDomain: "hyvoice-d2cba.firebaseapp.com",
          projectId: "hyvoice-d2cba",
          storageBucket: "hyvoice-d2cba.firebasestorage.app",
          messagingSenderId: "1069007313860",
          appId: "1:1069007313860:web:a823e214436c6161522291",
          measurementId: "G-NJDGC0J8HS"
        };

        const supabaseUrl = 'https://khjbajqtgzihpyzatjsc.supabase.co'
          const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoamJhanF0Z3ppaHB5emF0anNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NTAxNDEsImV4cCI6MjA4MjMyNjE0MX0.elXDgPI8Mb5JfM8tV5DIYpcil6krHHLbPzxomVMQu6Y'
          Start the development server:
            npm start

### Backend Setup (Firebase & Supabase)
  ### Firebase Setup:
      Go to Firebase Console
      Create a new project "HyVoice"  
      Enable Authentication (Email/Password & Google) 
      Enable Firestore Database
      Get your Firebase configuration
  ### Supabase Setup:
    Go to Supabase
    Create a new project
    Create storage bucket "grievance-photos"   
    Set storage policies to public read  
    Get your Supabase URL and anon key
  ### Mapbox Setup:
    Go to Mapbox    
    Create a free account  
    Get your access token
## API Integration
The HyVoice application uses Firebase services directly from the frontend with the following structure:
  ### Authentication Endpoints (Firebase)
    signInWithEmailAndPassword() - User login    
    createUserWithEmailAndPassword() - User registration    
    signInWithPopup(GoogleAuthProvider) - Google OAuth login    
    signOut() - User logout   
    sendPasswordResetEmail() - Password reset
  ### Firestore Collections
  ### Grievances Collection
    {
      title: "String",
      description: "String",
      category: "pothole|streetlight|garbage|water|drainage|other",
      urgency: "low|medium|high",
      status: "submitted|acknowledged|in-progress|resolved|rejected|duplicate",
      location: {
        latitude: Number,
        longitude: Number,
        address: String
      },
      photoURL: "String",
      statusHistory: [{
        status: "String",
        timestamp: Date,
        by: "String",
        note: "String"
      }],
      userId: "String",
      userName: "String",
      userEmail: "String",
      createdAt: Timestamp,
      updatedAt: Timestamp
    }
  ### Users Collection (Managed by Firebase Auth)
    User profiles with role-based permissions
    Email verification status
    Last login timestamp
  ### Supabase Storage
    Photo uploads to grievance-photos bucket
    Public URL generation for images
    File size validation (max 5MB)
## Environment Variables
  ### Frontend Environment Variables (.env.local) 
    # Firebase Configuration
    REACT_APP_FIREBASE_API_KEY=AIzaSyBx4jV7q2pX9YJkLmNoPqRsTv...
    REACT_APP_FIREBASE_AUTH_DOMAIN=hyvoice-hackathon.firebaseapp.com
    REACT_APP_FIREBASE_PROJECT_ID=hyvoice-hackathon
    REACT_APP_FIREBASE_STORAGE_BUCKET=hyvoice-hackathon.appspot.com
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
    REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
    
    # Mapbox Configuration
    REACT_APP_MAPBOX_TOKEN=pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjb...
    
    # Supabase Configuration
    REACT_APP_SUPABASE_URL=https://your-project.supabase.co
    REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    
    # Application Settings
    REACT_APP_GOOGLE_ANALYTICS_ID=UA-XXXXX-Y
  ### Demo Accounts Configuration (Hardcoded in Login.jsx)
    // Demo accounts for testing
    const demoAccounts = {
      admin: { email: 'admin@hyvoice.com', password: 'admin123' },
      municipal: { email: 'staff@ghmc.gov.in', password: 'ghmc123' },
      citizen: { email: 'citizen@hyderabad.com', password: 'citizen123' }
    };
## Code Explanation
    src/
    ├── components/
    │   ├── Navbar.jsx            # Navigation with role-based UI
    │   ├── Map.jsx              # Interactive Mapbox component
    │   ├── ReportForm.jsx       # Multi-step grievance reporting
    │   ├── Dashboard.jsx        # Real-time grievance dashboard
    │   ├── ProtectedRoute.jsx   # Authentication guard
    │   └── AdminPanel.jsx       # Admin management interface
    ├── pages/
    │   ├── Home.jsx             # Main dashboard page
    │   ├── Report.jsx           # Issue reporting page
    │   ├── Login.jsx            # Authentication page
    │   ├── Admin.jsx            # Admin management dashboard
    │   └── ForgotPassword.jsx   # Password reset page
    ├── firebase/
    │   └── config.js            # Firebase SDK configuration
    ├── supabase/
    │   └── config.js            # Supabase client configuration
    ├── utils/
    │   └── uploadPhoto.js       # File upload helper
    ├── App.js                   # Main application router
    └── index.js                 # Application entry point

## Key Components
  ### Map Component (components/Map.jsx)
    Mapbox GL JS integration
    Click-to-pin functionality
    Location search with autocomplete
    Hyderabad-specific map styling
    Marker dragging for precise location
  ### ReportForm Component (components/ReportForm.jsx)
    Multi-step form with stepper
    Photo upload with preview    
    Location validation    
    Real-time form validation    
    Success/error feedback
  ### Dashboard Component (components/Dashboard.jsx)
    Real-time grievance feed
    Filter by category/status    
    Status update functionality    
    User-specific view (my issues vs all issues)    
    Statistics cards
  ### Admin Component (pages/Admin.jsx)
    Bulk grievance management
    Advanced filtering and search  
    CSV export functionality 
    Role-based permissions    
    User management interface
  ### Authentication Flow
    // Login process
      1. User enters credentials or uses Google OAuth
      2. Firebase Authentication validates credentials
      3. User role determined by email pattern
      4. Redirect to appropriate dashboard based on role
      5. Protected routes validate authentication state
  ### File Upload Flow
    // Photo upload process
      1. User selects image file (max 5MB)
      2. File converted to blob and uploaded to Supabase Storage
      3. Supabase returns public URL
      4. URL stored in Firestore with grievance data
      5. Image displayed in dashboard with proper caching
## Admin Features
  ### User Management
    User List: View all registered users with email, role, and activity
    Role Management: Change user roles (Citizen → Municipal → Admin)
    Account Control: Disable/enable user accounts
    Activity Tracking: View user login history and report count
  ### Grievance Management
    Bulk Operations: Update status or delete multiple grievances
    Advanced Filtering: Filter by category, status, urgency, date range
    Export Data: Download grievances as CSV for reporting
    Assignment System: Assign grievances to municipal staff
    Status Tracking: Monitor resolution progress with audit trail
### Analytics Dashboard
    Real-time Statistics: Total issues, resolved, in progress, pending
    Category Distribution: Visual breakdown of issue types
    Resolution Rate: Percentage of issues resolved over time
    Priority Analysis: High vs medium vs low priority issues
    User Activity: Most active reporters and responders
## Role-Based Access Control
  ### Citizen Role
    Permissions: Create grievances, view own issues, update personal info 
    Access: /, /report, /profile
    Restrictions: Cannot access admin panels or view other users' issues
### Municipal Staff Role
    Permissions: All citizen permissions + manage grievances, update status, assign tasks
    Access: /admin (limited), /analytics
    Restrictions: Cannot delete grievances or manage users
### Administrator Role
    Permissions: Full system access including user management, data export, system settings
    Access: All routes including /admin (full), /analytics, /settings
    Features: Can delete grievances, manage all users, export all data
## Deployment
  Done in Vercel
  
