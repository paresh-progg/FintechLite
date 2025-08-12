# FinTrack Lite - A Firebase Studio Project

This is a Next.js starter project created in Firebase Studio. It's a personal and group finance tracker designed to be simple, smart, and easy to use.

## Features

-   **Personal Finance Tracking**: Log income and expenses with categories.
-   **Visual Dashboard**: See summaries of your financial health, including an expense breakdown chart and budget tracking.
-   **AI-Powered Insights**: Get personalized financial advice based on your spending habits, powered by Google's Gemini model through Genkit.
-   **Group Expense Splitting**: Create groups, add members, log shared expenses, and easily see who owes whom. The app simplifies debts to the minimum number of transactions required.
-   **Secure Authentication**: User accounts are managed securely with Firebase Authentication.
-   **Real-time Database**: All data is stored in Firestore and updates in the UI in real-time.

## Tech Stack

-   **Framework**: Next.js (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS & ShadCN/UI
-   **Backend**: Firebase (Authentication, Firestore)
-   **Generative AI**: Genkit & Google Gemini

---

## Getting Started Locally

To get the project running on your local machine, follow these steps.

### Prerequisites

-   Node.js (v18 or newer)
-   npm or yarn
-   A Google account for Firebase and Gemini

### Setup

1.  **Clone and Install Dependencies**:
    ```bash
    git clone <repository_url>
    cd fintrack-lite
    npm install
    ```

2.  **Set up Firebase**:
    -   This project is pre-configured with a Firebase project's details. You can find this in `src/lib/firebase.ts`.
    -   Ensure you have a Firebase project with **Authentication** (Email/Password and Google providers enabled) and **Firestore** enabled.

3.  **Set up Environment Variables**:
    -   The AI features require a Gemini API Key.
    -   Create a file named `.env` in the root of the project.
    -   Add your API key to the file:
        ```
        GEMINI_API_KEY=your_api_key_here
        ```
    -   You can get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

4.  **Run the Development Servers**:
    -   This project requires two servers running at the same time. Open two terminal tabs in the project root.
    -   **Terminal 1 (Next.js App)**:
        ```bash
        npm run dev
        ```
    -   **Terminal 2 (Genkit AI)**:
        ```bash
        npm run genkit:watch
        ```

5.  **Open the App**:
    -   Navigate to `http://localhost:9002` in your browser.

---

## Deployment Instructions

This application is configured for easy deployment using **Firebase App Hosting**.

### Prerequisites

-   You must have the [Firebase CLI](https://firebase.google.com/docs/cli) installed: `npm install -g firebase-tools`.
-   You must be logged into your Firebase account: `firebase login`.

### One-Time Setup (If Needed)

If you haven't used Firebase App Hosting with the CLI before, you may need to enable an experimental feature. You only need to run this command once per machine.
```bash
firebase experiments:enable webframeworks
```

### Deploying the App

1.  **Navigate to the project's root directory** in your terminal. This is the directory that contains the `firebase.json` file.

2.  **Run the deploy command**:
    ```bash
    firebase deploy
    ```

That's it! The Firebase CLI will build your Next.js application, deploy it, and provide you with the live URL where you can access it.
