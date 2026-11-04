# GeoAttend — Frontend

Cloud-Based Attendance Management System Using Geo-Fencing — React frontend (Vite).

## Run in VS Code

1. Unzip this folder and open it in VS Code (`File → Open Folder`).
2. Open the built-in terminal (`` Ctrl + ` ``) and install dependencies:
   ```
   npm install
   ```
3. Start the dev server:
   ```
   npm run dev
   ```
4. Open the printed URL (usually `http://localhost:5173`) in your browser.

## What's inside

```
src/
  main.jsx              entry point, router setup
  App.jsx                routes: /  (landing)  /login  /contact  and  /app/:role/*
  pages/
    LandingPage.jsx        marketing page — navbar, hero w/ floating icons, features grid, why-GeoAttend
    ContactPage.jsx        standalone contact page (email card + message form)
    Login.jsx             role-picker login screen (Dropbox-style split hero)
    StudentDashboard.jsx   geo-fence check-in widget + weekly check-ins
    AdminDashboard.jsx     live roster, stat cards
    HistoryPage.jsx        filterable attendance history table
    Analytics.jsx          trend line, method donut, per-subject bar chart
    SettingsPage.jsx       placeholder for geo-fence/notification config
  components/
    AppLayout.jsx          sidebar + topbar shell wrapping the pages
    Sidebar.jsx / Topbar.jsx
    Bits.jsx               shared StatusBadge / MethodPill
  data/mock.js             mock data — swap for real API calls
  styles/global.css        design tokens (Dropbox-blue theme), all component styles
```

## Flow

- `/` — landing page: navbar (Home / Contact), hero with floating student/admin/QR/face icons and a single Get Started CTA, features grid, "Why GeoAttend" section.
- `/contact` — standalone contact page (separate from the landing page), reached via the Contact nav link. Has an email card and a message form.
- `/login` — login screen, pick **Student** or **Admin**, submit → routes to `/app/student` or `/app/admin`.
- `/app/:role` — dashboard (student or admin view, same layout).
- `/app/:role/history` — attendance history.
- `/app/:role/analytics` — charts.
- Role toggle in the top bar switches between student/admin views without logging out.

## Next steps (for the rest of the team)

- Replace `src/data/mock.js` reads with real API calls once Member 2's REST endpoints are live.
- Wire `Login.jsx`'s `handleSubmit` to the JWT/OAuth auth endpoint instead of navigating directly.
- Plug the real geo-fence radius/status into the `StudentDashboard` pulse widget.
