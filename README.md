# Smart Campus ERP (Multi-Tenant SaaS)

A production-grade Smart Campus Management System designed to simulate real-world educational institutions with a strong focus on **multi-tenancy, security, and role-based access control (RBAC)**.

The system ensures that every college operates as an independent organization with completely isolated data, secure onboarding, and structured user management.

---

## Purpose of the Project

The main goal of this system is to digitize and simulate a real college environment where:
- Each college has its own isolated system
- Data is not shared between organizations
- Access is strictly controlled through roles
- Administration is centralized under one owner (Admin)

This mimics real-world SaaS platforms used in enterprise systems.

---

## Why Registration is Required

Registration is the first and most important step because:

- It creates a new organization (college/school) in the system  
- The registering user becomes the Admin (Organization Owner)  
- It ensures multi-tenancy by separating each college’s data  
- It establishes a secure identity boundary for all future users  

Without registration, the system cannot determine which organization a user belongs to.

---

## Authentication & Onboarding Flow

1. A college/school registers on the platform  
2. The registrant automatically becomes the Admin  
3. Admin gets access to the Admin Dashboard  
4. Admin generates secure invite links for Teachers and Students  
5. Teachers/Students register using the invite link  
6. System assigns roles automatically based on invitation  
7. Users access dashboards based on their role and organization  

---

## How Admin Adds Teachers and Students

The Admin does not directly “manually create users”.

Instead, the flow is:

- Admin generates a secure invitation link  
- Link is shared with intended Teachers/Students  
- User opens link and fills registration form  
- System verifies invitation and assigns role automatically  
- User is added to the same organization under correct role  

This ensures:
- No unauthorized access  
- Controlled onboarding  
- Proper role assignment  
- Clean organization structure  

---

## Roles in the System

### Admin
- Full control of organization  
- Manages users (Teachers & Students)  
- Creates notices, timetables, and system configurations  
- Generates invite links  

### Teacher
- Manages attendance  
- Creates assignments  
- Uploads study material  
- Publishes notices  

### Student
- Views attendance  
- Accesses notices and timetable  
- Submits assignments  
- Accesses notes and materials  

---

## Security System (Core Focus)

- Role-Based Access Control (RBAC)
- JWT Authentication (Auth.js)
- Password hashing using Argon2
- Email verification system
- Rate limiting for APIs
- Input validation using Zod
- IDOR protection
- Secure route handling
- Audit logging
- Security headers (CSP)
- Complete tenant isolation

---

## Modules Built

- Authentication Module
- Organization (Tenant) Module
- Admin Management Module
- Teacher Module
- Student Module
- Notice Module
- Assignment Module
- Notes Module
- Timetable Module
- File Upload Module
- Security Module

---

## Tech Stack

Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS v4, Shadcn UI  
Backend: Next.js Route Handlers, Auth.js  
Database: PostgreSQL (Neon), Prisma ORM  
Security: JWT, Argon2, Zod, RBAC, Rate Limiting  
Services: Brevo (Email), Upstash Redis  

---

## Folder Structure

> Note: This is a high-level representation of the project structure.
> smart-campus-erp/
├── prisma/
│   └── schema.prisma                 # DB models: User, Organization, Role, Attendance, Assignment, Notes, Notices, Timetable, FileUpload

├── src/
│   ├── app/                          # Next.js App Router (pages + API routes)
│   │   ├── layout.tsx                # Root layout (theme, providers, global config)
│   │   ├── page.tsx                 # Landing page
│   │   ├── globals.css              # Global styles + theme system
│   │   │
│   │   ├── auth/
│   │   │   ├── login/               # Login page
│   │   │   ├── register/           # College registration (creates Admin)
│   │   │   ├── verify-email/        # Email verification
│   │   │   
│   │   │   
│   │   │
│   │   ├── dashboard/               # Protected role-based area
│   │   │   ├── layout.tsx           # Dashboard layout (sidebar + navbar)
│   │   │   ├── page.tsx             # Dashboard home (overview)
│   │   │   │
│   │   │   ├── admin/               # Admin dashboard
│   │   │   │   ├── users/           # Manage Teachers & Students
│   │   │   │   ├── invites/         # Generate invite links
│   │   │   │   ├── notices/         # Publish notices
│   │   │   │   ├── timetable/       # Manage timetable
│   │   │   │
│   │   │   ├── teacher/             # Teacher dashboard
│   │   │   │   ├── attendance/      # Mark attendance
│   │   │   │   ├── assignments/     # Create assignments
│   │   │   │   ├── notes/           # Upload notes
│   │   │   │   ├── notices/         # Publish notices
│   │   │   │
│   │   │   ├── student/             # Student dashboard
│   │   │   │   ├── attendance/      # View attendance
│   │   │   │   ├── assignments/     # Submit assignments
│   │   │   │   ├── notes/           # Access notes
│   │   │   │   ├── timetable/       # View timetable
│   │   │   │
│   │   │   └── notifications/       # System notifications
│   │   │
│   │   ├── api/                     # Backend API routes
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   ├── logout/
│   │   │   │   ├── verify-email/
│   │   │   │   
│   │   │   │   
│   │   │   │
│   │   │   ├── organization/        # Tenant system
│   │   │   │   ├── create/
│   │   │   │   ├── invites/
│   │   │   │   └── join/
│   │   │   │
│   │   │   ├── users/               # User management (RBAC)
│   │   │   ├── attendance/          # Attendance system
│   │   │   ├── assignments/         # Assignments module
│   │   │   ├── notes/              # Notes module
│   │   │   ├── notices/            # Notice module
│   │   │   ├── timetable/          # Timetable module
│   │   │   ├── files/              # File upload system
│   │   │   └── audit/              # Logs & tracking
│   │
│   ├── components/
│   │   ├── ui/                      # Reusable UI components (buttons, inputs, cards)
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── DashboardLayout.tsx
│   │   │
│   │   ├── admin/
│   │   ├── teacher/
│   │   ├── student/
│   │   │
│   │   ├── attendance/
│   │   ├── assignments/
│   │   ├── notes/
│   │   ├── notices/
│   │   ├── timetable/
│   │   └── files/
│   │
│   ├── lib/
│   │   ├── prisma.ts                # Prisma client
│   │   ├── auth.ts                  # Auth.js config + JWT helpers
│   │   ├── rbac.ts                  # Role-based access logic
│   │   ├── validators.ts            # Zod schemas
│   │   ├── email.ts                 # Brevo email service
│   │   ├── rateLimiter.ts          # Rate limiting logic
│   │   ├── auditLogger.ts          # Activity logging
│   │   └── utils.ts                # Helper functions
│
├── middleware.ts                    # Route protection + RBAC guard
├── .env                             # Environment variables
├── next.config.ts
└── package.json

---

## Key Highlights

- Multi-tenant SaaS architecture  
- Secure onboarding with invite-based system  
- Strict role-based access control  
- Production-level backend security practices  
- Fully responsive UI for all devices  
- Scalable and modular architecture  

---

## Future Improvements

- Real-time notifications system  
- Chat system between users  
- AI-based attendance insights  
- Advanced analytics dashboard  

---

## Author

Built during internship at ReadyNest
