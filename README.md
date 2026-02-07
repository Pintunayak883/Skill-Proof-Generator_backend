# Skill Proof Generator — Server

The backend API for the Skill Proof Generator platform, handling AI orchestration, database management, and authentication.

## 🚀 Tech Stack

-   **Runtime:** Node.js
-   **Framework:** Express.js
-   **Database:** MongoDB + Mongoose
-   **AI Engine:** Google Gemini (via `@google/generative-ai`)
-   **Authentication:** JWT (JSON Web Tokens)
-   **Validation:** Zod

## ✨ Key Features

-   **AI Orchestration:**
    -   **Resume Analysis:** Extracts skills and experience levels.
    -   **Task Generation:** creates unique, structured assessments (Conceptual, Coding, Scenario).
    -   **Evaluation:** Grades code quality, correctness, and provides a confidence score.
-   **Secure Assessment:**
    -   **One-Time Links:** Unique, token-based access for candidates.
    -   **Integrity Logging:** Records violations and snapshots.
-   **HR Management:** Secure endpoints for job creation and report viewing.

## 🛠️ Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Configure Environment:**
    Create a `.env` file (copy from `.env.example`):
    ```env
    PORT=4000
    MONGODB_URI=mongodb://localhost:27017/skill-proof
    JWT_SECRET=your_jwt_secret_key
    GEMINI_API_KEY=your_gemini_api_key
    CORS_ORIGIN=http://localhost:3000
    ```

3.  **Start Server:**
    ```bash
    npm run dev
    ```
    API runs at [http://localhost:4000](http://localhost:4000).

## 🗄️ API Overview

-   **Auth:** `/api/auth/register`, `/api/auth/login`
-   **HR:** `/api/hr/positions`, `/api/hr/test-links`, `/api/hr/dashboard`
-   **Candidate:**
    -   `/api/candidate/:token/personal-info`
    -   `/api/candidate/:token/resume`
    -   `/api/candidate/:token/task` (Generates AI task)
    -   `/api/candidate/skill-session/:id/submit` (Evaluates answer)
