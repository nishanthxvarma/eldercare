# ElderCare Connect

ElderCare Connect is a modern, comprehensive healthcare management application tailored for elder care facilities. It provides a centralized dashboard for facility administrators, a task-oriented interface for caretakers, and a transparent portal for family members to stay updated on their loved ones' well-being.

## Features

- **Role-based Dashboards**: Dedicated views for Admins, Caretakers, and Family members.
- **Resident Management**: Complete profiles including medical history and room assignments.
- **Task Tracking**: Streamlined logging for daily vitals, meals, and care notes.
- **Medication Management**: Scheduling and tracking of medication administration.
- **Real-time Messaging**: Socket.io powered communication between caretakers and families.
- **Notification Center**: Alerts for missed medications and unread messages.
- **Data Analytics**: Overview metrics on resident health and facility operations.

## Architecture

ElderCare Connect uses a Monorepo architecture managed by Turborepo.
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, ShadCN UI, React Query.
- **Backend**: Node.js, Express, TypeScript, Socket.io.
- **Database**: MongoDB (Mongoose ORM).
- **Authentication**: JWT (JSON Web Tokens) with secure HttpOnly cookies.

## Tech Stack

- **Client**: React (Vite), React Router, TanStack Query, React Hook Form, Zod, Recharts, Lucide Icons.
- **Server**: Express.js, Mongoose, Socket.io, JSONWebToken, bcryptjs, cors, helmet.
- **Testing**: Vitest (Frontend), Jest + Supertest (Backend).
- **Tools**: TypeScript, Turborepo, ESLint, Prettier.

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local instance or Atlas cluster)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/eldercare.git
   cd eldercare
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   - Copy `apps/api/.env.example` to `apps/api/.env` and fill in the details.
   - Copy `apps/web/.env.example` to `apps/web/.env` and fill in the details.

4. Seed the Database:
   ```bash
   cd apps/api
   npm run seed
   ```

5. Start the Development Servers:
   ```bash
   npm run dev
   ```

## Development Commands

- `npm run dev`: Starts both frontend and backend development servers.
- `npm run build`: Builds both applications for production.
- `npm test`: Runs test suites across the monorepo.

## Deployment

Refer to the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions on deploying ElderCare Connect using Docker, Vercel, Render, or MongoDB Atlas.
