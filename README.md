# Oxygen Gym – Gym Management System

College field project based on the supplied synopsis.

## Features
- Responsive public gym website
- Member registration
- Member login
- Member dashboard
- Attendance marking/history
- Membership plans and renewal
- Fee/payment tracking
- Admin dashboard
- Member search, payment recording and deletion
- Contact form placeholder for EmailJS
- LocalStorage database for a zero-backend demo
- Vercel/GitHub-ready static project

## Demo login
### Admin
Email: `admin@oxygengym.com`
Password: `admin123`

### Member
Register a new member from `register.html`, then log in with that email.

## How to run
1. Extract the ZIP.
2. Open the folder in VS Code.
3. Open `index.html` with Live Server, or use any static web server.
4. Register a member.
5. Login and test dashboard, attendance, membership and payments.
6. Admin login lets you see all registered members.

## EmailJS
The current contact form works as a demo and displays a success message.
For actual emails:
1. Create an EmailJS account.
2. Create a service and email template.
3. Put your public key/service ID/template ID in `js/emailjs-config.js`.
4. Add the EmailJS browser SDK to `contact.html`.
5. Replace `sendContact()` in `js/app.js` with `emailjs.send(...)`.

Do not put private EmailJS credentials in frontend code. The public browser key is intended to be exposed; keep any private/server secrets out of the repository.

## Vercel
This is a static site. Push the project to GitHub, import the repository into Vercel, and deploy with no build command required.

## Important college-project note
This version uses browser LocalStorage instead of a real server/database. It is ideal for demonstrating the required workflows. For a production system, use authentication plus a real database/backend.
