# CampusPlace — Feature Overview

## About this project

**CampusPlace** is a full-stack **Campus Placement & Recruitment Portal** (MERN) that
connects **students**, **companies / placement staff** and **admins** in one place.
Students build profiles, apply to placement drives and track their application status;
placement staff manage drives and shortlist candidates; admins oversee users, analytics
and system health. The codebase is split into a React + Vite frontend
(`Frontend-Campus-Placement-Portal-`) and an Express + MongoDB backend
(`Backend-Campus-Placement-Portal`).

This document is a high-level inventory of the features that exist in the codebase today.
It is meant as a map for onboarding and planning — not an exhaustive API reference.

---

## Table of contents

- [Roles](#roles)
- [Authentication & account](#authentication--account)
- [Student features](#student-features)
- [Placement / job features](#placement--job-features)
- [Application management](#application-management)
- [Interview & collaborative coding](#interview--collaborative-coding)
- [Chat & messaging](#chat--messaging)
- [Admin & user management](#admin--user-management)
- [Analytics & monitoring](#analytics--monitoring)
- [Live logs (Server-Sent Events)](#live-logs-server-sent-events)
- [Landing page & public UI](#landing-page--public-ui)
- [Backend API versions](#backend-api-versions)
- [Security, logging & infrastructure](#security-logging--infrastructure)
- [Tech stack](#tech-stack)

---

## Roles

| Role | Scope |
| --- | --- |
| `student` | Browse/apply to drives, manage profile & resume, track applications, chat, interviews. |
| `placement_staff` | Manage placements, review/shortlist applications, view students, run interviews. |
| `admin` | Everything placement staff can do plus user management, analytics and system logs. |
| `super_admin` | Full system control, including privileged user and approval actions. |

Route protection is enforced on the client by `functionality/ProtectedRoutes.jsx` and on the
server by JWT verification middleware (`verifyUser`, `verifyUserWithRole`).

## Authentication & account

- Email + password registration and login (bcrypt-hashed passwords, JWT access + refresh tokens).
- Social / OAuth login via **Google** and **GitHub** (Passport.js strategies).
- Session bootstrap through `GET /api/v1/users/current-user`, which rehydrates role, tokens and user info into `AuthContext`.
- Logout flow with a confirmation dialog.
- Token refresh and cookie-based sessions (`httpOnly` cookies via `cookie-parser`).
- Protected client routes redirect unauthenticated users to `/login`.

## Student features

- Rich student profile (department, location, professional skill, about, contact, avatar).
- Resume **upload / replace / delete** and avatar upload (Cloudinary-backed, via `multer`).
- Resume upload statistics surfaced in the admin analytics cards.
- "Missing details" form that nudges students to complete their profile before applying.
- Personal dashboard with applied / shortlisted / selected / rejected application buckets.
- Browse available placements with infinite scroll and search.

## Placement / job features

- **Available Placements** page (`/home`, `/home/placements`) with infinite-scroll pagination.
- Create placement posts (company, job title, description, eligibility, location, last date).
- Update existing posts inline from the placement details dialog.
- Delete placement posts with an animated confirmation dialog.
- Placement search overlay with live suggestions by company name or job title.
- Animated placement cards with apply / update / delete actions by role.

## Application management

- One-click apply to a placement drive (`POST /api/v1/applications/:placementId`).
- Duplicate-application and eligibility guards on the server.
- Manage Applications area with status tabs:
  - Applied candidates
  - Shortlisted candidates
  - Selected candidates
  - Rejected candidates
- Status transitions (shortlist / select / reject) with confirmation dialogs.
- Per-application deletion for both students and staff.
- Application status distribution shown as a chart in System Overview.

## Interview & collaborative coding

- Interview room creation and join via socket.io rooms.
- Live collaborative **Monaco code editor** with shared code updates and language switching.
- Interviewer / interviewee panels for question delivery and answer submission.
- Predefined + manual interview questions with shared code snapshots.
- Shared interview chat with typing indicators, delivery/seen receipts and emoji reactions.
- Shared countdown timer that starts for all participants.
- **In-browser code execution** endpoint (`/api/v1/code-execution`) for running submissions.
- Interview invites and participant join/leave notifications.

## Chat & messaging

- Personal (1:1) chat between users with persisted message history.
- Friend-request flow with a dedicated button/card UI and live `friend:request` notifications.
- Real-time new-message delivery over socket.io (`personalChat:newMessage`).
- Conversation list, message composer and message search in the message page.

## Admin & user management

- **Manage Users** page with role tabs (All / Students / Placement Staff / Admins).
- Create new users (including students) from a form dialog.
- Paginated role listings with previous/next navigation.
- Student approval / approval-revocation workflow.
- User search across name and email with a results card.
- View full user details and delete users (with confirmation).
- Delete-student-application and delete-placement dialogs.
- Client-role awareness: placement staff see a slimmer "Manage Students" view.

## Analytics & monitoring

- **System Overview** dashboard with:
  - Placements created per month (bar chart).
  - Application status distribution (pie chart).
- System Analysis cards: total users, active students, student approval stats, resumes uploaded,
  selected students, students per department and students by location.
- System status widget (uptime, memory, CPU load) from `/api/v1/system/status`.
- Analytics endpoints under `/api/v1/analytics` backed by MongoDB aggregation pipelines.

## Live logs (Server-Sent Events)

- Admins get a live terminal-style log viewer in **System Overview → Recent Activities**.
- Logs are streamed from the server to the browser using **Server-Sent Events** —
  `GET /api/v1/system/logs/stream` (`text/event-stream`), not socket.io.
- The stream opens with a snapshot of the last log lines and then pushes only newly
  appended lines (incremental byte-offset tailing, rotation-aware).
- Heartbeat comment frames keep proxies from closing the idle connection.
- The viewer supports level filters (All / Info / Error), clear, and auto-scroll.
- Socket.io is still used for chat and interviews — only log streaming moved to SSE.

## Landing page & public UI

- Marketing landing page with animated hero, network visualization, platform overview,
  "how it works" flow, placement stats, companies section, testimonials and footer.
- Sticky glass navbar with smooth scrolling to sections and role-aware CTAs.
- Logged-in visitors see a **Go to dashboard** CTA instead of the registration CTA.
- Footer with project branding, quick links and developer contact/social links.

## Backend API versions

| Version | Prefix | Purpose |
| --- | --- | --- |
| v1 | `/api/v1` | Core resources: auth, placements, applications, users, admin, student, analytics, system, interview, code execution. |
| v2 | `/api/v2` | Paginated variants: placements, students, users, applications, friend requests, messages. |
| v3 | `/api/v3` | Newer application endpoints. |

## Security, logging & infrastructure

- Security headers via **helmet** and NoSQL-injection protection via `express-mongo-sanitize`.
- Rate limiting on all `/api` routes, with a stricter limiter for auth endpoints.
- Request-body sanitization that strips privileged fields (`role`, `isAdmin`, …).
- Centralised error handling (`notFound` + `errorHandler`) and `asyncHandler` wrappers.
- Structured logging with **Winston** (daily-rotate files + console JSON), optionally forwarded to **Logtail**.
- Redis client for caching / presence helpers.
- Mongo/Mongoose models: user, student, placement, application, interview, placement result.

### Real-time transport

- **socket.io** — chat, friend requests, interview collaboration (auth via JWT in the handshake).
- **Server-Sent Events (SSE)** — one-way live application logs for admins.

## Tech stack

- **Frontend:** React 19, Vite, React Router 7, Tailwind CSS 4, Framer Motion, shadcn/Radix UI,
  Axios, Recharts, Monaco Editor, react-toastify, react-intersection-observer.
- **Backend:** Node.js, Express 4, MongoDB + Mongoose, socket.io, Winston, Passport.js, Redis, Cloudinary.
- **Auth:** JWT (access + refresh), httpOnly cookies, Google & GitHub OAuth.
- **Deployment:** Frontend on Vercel/Netlify, backend on Render/Railway, Docker + nginx configs included.
