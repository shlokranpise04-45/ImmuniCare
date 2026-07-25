# Vaccine Tracker — MERN

A family vaccination tracker: multi-profile accounts, vaccine schedule status (Upcoming/Overdue/Completed), email reminders, dashboard chart, and PDF export.

## Stack
React (Vite) · Express · MongoDB (Atlas) · JWT auth · Resend (email) · node-cron · Recharts · jsPDF

## Local setup

### 1. Server
```bash
cd server
npm install
cp .env.example .env
# fill in MONGO_URI, JWT_SECRET, RESEND_API_KEY, EMAIL_FROM, CLIENT_URL
npm run dev
```
Runs on http://localhost:5000

### 2. Client
```bash
cd client
npm install
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api
npm run dev
```
Runs on http://localhost:5173

## Getting the required keys
- **MONGO_URI**: MongoDB Atlas → create free M0 cluster → Connect → Drivers → copy connection string (whitelist `0.0.0.0/0` for hackathon convenience)
- **JWT_SECRET**: any long random string
- **RESEND_API_KEY**: resend.com → free tier → API Keys. `EMAIL_FROM` can stay `onboarding@resend.dev` for testing without domain verification.

## Deployment (after it works locally)
- **Backend** → Render (free web service), root directory `server`, build `npm install`, start `npm start`, add env vars in dashboard
- **Frontend** → Vercel, root directory `client`, framework preset Vite, add `VITE_API_URL` env var pointing at the deployed Render URL
- Update `CLIENT_URL` on the backend to the deployed Vercel URL once it exists (needed for CORS)

## Demo flow
1. Register → Login
2. Add a profile (with a DOB that makes some vaccines overdue, for a good demo)
3. Open profile → Add Vaccination records
4. Show the chart + status columns
5. Click "Send Reminder Now" → show the email land in the inbox
6. Click "Export PDF" → show the downloaded vaccination card

## Notes
- Vaccine reference data is hardcoded in `server/data/vaccineReference.js` (and mirrored in `client/src/components/VaccineInfoModal.jsx`) — no DB seeding needed.
- The daily cron in `server/jobs/reminderCron.js` is the "real" automation; the manual `/api/notify/:profileId` endpoint is what you click live during judging.
