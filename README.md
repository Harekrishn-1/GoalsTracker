# GoalsTracker

A clean, full-stack app for tracking daily goals. Use it without an account; sign up only when you want your progress saved.

**Live demo:** _add your deployed link here_

---

## Features

- Add goals with a category (Personal / Study / Work / Health) and an optional time range
- Track progress from 0–100% with an inline slider
- Edit any goal (title, category, times) until the day is submitted
- **Submit a day to lock it** — once submitted, nothing can be edited or deleted
- A motivational quote appears on submit; an encouraging nudge appears when a goal crosses 80% but isn't finished
- Copy selected goals to the next day
- Month calendar with an intensity grid showing completion per day
- **Guest mode** — the whole app works logged out (data in `localStorage`) and migrates to your account on sign-up
- **Admin overview** — aggregate usage stats only (no individual goal content)

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, Redux Toolkit, React Router 7 |
| Styling | Tailwind CSS 4 |
| Forms | React Hook Form |
| Backend | Node.js, Express 5 |
| Database | MongoDB (Mongoose) |
| Cache | Redis (token blocklist) |
| Auth | JWT in httpOnly cookies, bcrypt |

---

## Running locally

**Backend**
```bash
cd backend
npm install
cp .env.example .env      # fill in your credentials
npm run dev               # http://localhost:3000
```

**Frontend**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev               # http://localhost:5173
```

### Making yourself an admin
Sign up normally, then from the `backend` folder:
```bash
node src/makeAdmin.js your-email@example.com
```
Log out and back in; the Admin link appears in the navbar.

---

## API

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/user/register` | Create account |
| POST | `/user/login` | Log in |
| POST | `/user/logout` | Log out (blocklists token) |
| GET | `/user/check` | Validate session |
| GET | `/goal?date=` | Goals for a date |
| POST | `/goal` | Create goal |
| PATCH | `/goal/:id` | Update goal (blocked once submitted) |
| DELETE | `/goal/:id` | Delete goal (blocked once submitted) |
| POST | `/goal/submit` | Lock a day |
| POST | `/goal/copy` | Copy selected goals to another date |
| POST | `/goal/migrate` | Import guest goals |
| GET | `/admin/stats` | Aggregate stats (admin only) |

---

## Design decisions

**Guest-first, not login-first.** Most trackers put a signup wall before you can see anything. GoalsTracker lets you use the whole app immediately and only asks for an account when you submit a day — the point where saving actually matters. Guest data lives in `localStorage` and is migrated on sign-up, so nothing is lost.

**Auth gate is action-level, not route-level.** No public route is protected in the router. The submit action checks auth and opens a modal if needed, while every backend write is behind `userMiddleware`. This keeps the app browsable while securing the data.

**Submitted days are locked on the server, not just the UI.** Hiding the edit and delete buttons after submit is not real protection — a crafted request could still reach the API. So `updateGoal` and `deleteGoal` both re-check the `submitted` flag and reject with 403. The UI lock is convenience; the server lock is the actual guarantee.

**Dates as `YYYY-MM-DD` strings.** Storing `Date` objects invites timezone bugs where a goal lands on the wrong day. A "day" here is a local calendar concept, so a string makes that explicit, sorts lexicographically, and indexes cleanly.

**Admin sees counts, never content.** The admin endpoint uses `countDocuments` with date filters — it returns totals like active users and completion rate, and never reads the text of anyone's goals. Access is guarded by an `adminMiddleware` that checks the JWT role after the normal auth middleware runs.

**Two kinds of encouragement.** A finished goal (100%) and an almost-finished one (80–99%) trigger different messages: the first celebrates on submit, the second nudges you to close the gap. This is a small product decision aimed at the moment people are most likely to stop just short.

---

## Security notes

- Passwords hashed with bcrypt (10 rounds)
- JWT stored in an `httpOnly` cookie — not readable by JavaScript, mitigating XSS token theft
- `sameSite` and `secure` flags enabled in production
- Logout blocklists the token in Redis with a TTL matching its expiry
- Login returns an identical error for "no such user" and "wrong password", preventing user enumeration
- Registration returns specific, safe reasons (email already in use, weak password) so users can correct mistakes
- Every query filters on `userId`, so a valid session cannot read or modify another user's records
- Admin routes require both a valid session and an admin role

---

## Roadmap

- Reminders and notifications
- Weekly and monthly summaries
- CSV export
