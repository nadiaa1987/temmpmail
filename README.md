# TempMail SaaS (100% Serverless)

A professional, scalable temporary email SaaS application built with Next.js 15, Firebase, and Cloudflare.

## 🚀 Features

- **Instant Temp Email**: Generate random or custom email addresses.
- **Real-time Inbox**: Emails appear instantly as they are received.
- **Admin Panel**: Manage multiple domains, view analytics, and track users.
- **Scalable Backend**: 100% serverless using Firebase Functions and Firestore.
- **Premium Design**: Modern aesthetic using Tailwind CSS and Framer Motion.
- **Auto-Cleanup**: Emails automatically expire and are deleted after 24 hours.

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Lucide icons.
- **Auth**: Firebase Auth (Google/Email).
- **Database**: Firestore (NoSQL).
- **Backend/API**: Firebase Functions v2 (Node.js).
- **Deployment**: 
  - Frontend: Cloudflare Pages (Static Export).
  - Backend: Firebase Hosting/Functions.

## 📦 Setup Instructions

### 1. Firebase Setup
1. Create a new project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (Google & Email/Password).
3. Create a **Firestore Database** in production mode.
4. Enable **Cloud Functions** (requires Blaze plan).
5. Add a Web App to your project and copy the configuration to `.env.local`.

### 2. DNS & Custom Domains
To receive emails, you need an MX handler. You can use:
- **Cloudflare Email Workers**: Forward emails to your `incomingEmail` Firebase Function webhook.
- **Mailgun Inbound**: Use the "Route" feature to POST to your function.

**MX Records example:**
| Type | Host | Points to | Priority |
|------|------|-----------|----------|
| MX | @ | your-mx-handler.com | 10 |
| TXT | @ | v=spf1 include:_spf.google.com ~all | - |

### 3. Deployment

**Deploy Backend:**
```bash
# Register an admin (Manually add your UID to 'admins' collection in Firestore)
firebase deploy --only functions,firestore
```

**Deploy Frontend (Cloudflare Pages):**
1. Run `npm run build`.
2. Upload the `out` directory to Cloudflare Pages.
3. Build Command: `npm run build`
4. Output Directory: `out`

## 🧩 Environment Variables
Copy `.env.example` to `.env.local` and fill in your Firebase credentials.

## 📝 License
MIT
