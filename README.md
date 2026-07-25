# ImmuniCare 💉
 
A digital immunization tracker built for families to manage vaccination records — reimagined from a college mini-project into a full-stack, deployed web app for a 24-hour hackathon.
 
🎥 **Demo video:** https://youtu.be/Vx4QNKTqGfQ
🌐 **Live app:** https://immunicare-844de.web.app
🔧 **Backend API:** https://immunicare-b0bc.onrender.com
 
---
 
## What it does
 
ImmuniCare lets a user manage vaccination records for their entire family from one account — multiple profiles, multi-dose tracking, automatic status detection (Completed / Upcoming / Overdue), and one-click PDF vaccination reports sent straight to their inbox.
 
Originally a JavaFX + MySQL desktop mini-project, rebuilt as a MERN stack web app with email automation and full cloud deployment.
 
## Features
 
- 🔐 Secure authentication (JWT-based login/register)
- 👨‍👩‍👧‍👦 Multi-profile support per account (add family members with gender + relationship)
- 💉 Full vaccine record CRUD with multi-dose tracking (doseNumber) across a 25-vaccine reference dataset, including gender-specific filtering and minimum dose-gap logic
- 📊 Auto-calculated status — Completed / Upcoming (due within 6 months) / Overdue
- 📈 Dashboard with a Recharts pie chart summarizing profile vaccination status
- 📄 One-click "Email Report" — generates a full PDF vaccination report and emails it as an attachment via Brevo
- 🎨 Custom "immunization passport" design language — rotated ink-stamp status badges, paper/ink color palette, Fraunces + IBM Plex typography
## Tech stack
 
| Layer | Tech |
|---|---|
| Frontend | React (Vite), plain CSS |
| Backend | Node.js, Express |
| Database | MongoDB Atlas |
| Auth | JWT |
| Email | Brevo API |
| PDF generation | PDFKit |
| Charts | Recharts |
| Scheduling | node-cron (daily reminder job) |
| Hosting | Render (backend) + Firebase Hosting (frontend) |
 
 
## Running locally
 
**Backend**
```bash
cd server
npm install
# add a .env file with: MONGO_URI, JWT_SECRET, BREVO_API_KEY, EMAIL_FROM, CLIENT_URL
npm start
```
 
**Frontend**
```bash
cd client
npm install
# add a .env file with: VITE_API_URL=http://localhost:5000/api
npm run dev
```
 
## Team
 
Built by a team of 2 in 24 hours for Innovo Hack Chapter 1.
Prranjal Sankhe 
Shlok Ranpise
 
## Roadmap 
 
- Fix mobile login edge case
- Build out the landing page as a full component
- Finish remaining UI passes (vaccine rows, status badges, chart, modals)
- Flatten repo folder structure