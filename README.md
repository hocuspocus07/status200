# Certi-fi
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/hocuspocus07/status200)

Certi-fi is a full-stack platform for aggregating, validating, and showcasing micro-credentials. It provides learners with a unified portfolio and offers a trusted, NCVET-compliant verification system for employers and institutions.

## ✨ Features

-   **Unified Credential Aggregation**: Collect and integrate micro-credentials from multiple training providers, universities, and online platforms in one place.
-   **Trusted Validation**: Verify credentials through NCVET-recognized bodies and other trusted verification systems.
-   **NSQF Alignment**: Map your credentials with National Skills Qualifications Framework (NSQF) levels for stackable qualifications.
-   **Comprehensive Digital Portfolio**: Showcase your skills and achievements with a modern, shareable digital profile.
-   **Employer & Institution Portal**: A dedicated interface for employers to easily access and verify a learner's complete skill profile.
-   **Authentication & User Management**: Secure user registration and login system using JWT for session management.
-   **Responsive Dashboard**: A feature-rich user dashboard to manage credentials, track learning paths, and edit profile information.

## 🛠️ Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (with Turbopack)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
-   **Authentication**: [JWT](https://jwt.io/), [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
-   **Analytics**: [Vercel Analytics](https://vercel.com/analytics)

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   Node.js (v20.x or later)
-   npm, yarn, or pnpm
-   A MongoDB database instance (local or cloud-based like MongoDB Atlas)

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/hocuspocus07/status200.git
    cd status200
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project and add the following variables. Replace the placeholder values with your own.
    ```env
    # Example for MongoDB Atlas
    NEXT_PUBLIC_MONGODB_URI=mongodb+srv://<user>:<password>@<cluster-url>
    NEXT_PUBLIC_CLUSTER_NAME=your_db_name

    # Your secret key for signing JSON Web Tokens
    JWT_SECRET=your_super_secret_jwt_key
    ```

4.  **Run the development server:**
    ```sh
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📂 Project Structure

The project follows the Next.js App Router structure:

```
src/
├── app/
│   ├── (pages)         # Routes for landing, login, register, dashboard
│   └── api/            # API endpoints for authentication and user data
├── components/
│   ├── dashboard/      # Components for the user dashboard
│   ├── landing/        # Components for the marketing/landing page
│   └── ui/             # Reusable UI components (powered by shadcn/ui)
├── lib/
│   ├── dbConnect.ts    # MongoDB connection utility
│   └── utils.ts        # General utility functions
└── models/
    ├── user.ts         # Mongoose schema for Users
    ├── certificate.ts  # Mongoose schema for Certificates
    └── education.ts    # Mongoose schema for Education
```

## 🔐 API Endpoints

The application provides the following REST API endpoints for user management:

| Method | Endpoint               | Description                               |
| :----- | :--------------------- | :---------------------------------------- |
| `POST` | `/api/users/register`  | Creates a new user account.               |
| `POST` | `/api/users/login`     | Logs in a user and returns a JWT.         |
| `GET`  | `/api/users/me`        | Retrieves the current user's profile data.|
| `GET`  | `/api/auth/verify`     | Verifies the validity of a JWT.           |