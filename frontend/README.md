# EUC Assessment Platform — Frontend

React + Vite + TypeScript + Tailwind CSS

---

## Quick Start

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Start the development server

```bash
npm run dev
```

The app runs at **http://localhost:5173**
API calls to `/api/*` are proxied automatically to `http://localhost:5000`
so the backend must also be running.

### 3. Build for production

```bash
npm run build
```

Output goes to `frontend/dist/`. Serve it with any static host or Nginx.

---

## Default Credentials

| Role    | Username | Password  |
|---------|----------|-----------|
| Admin   | admin    | admin123  |
| Student | —        | Name + Student ID (self-register) |

---

## Page Routes

| Path | Page | Who sees it |
|------|------|-------------|
| `/` | Landing — enter name + student ID | Students |
| `/tests` | Test list with open/closed status | Students |
| `/tests/:id/instructions` | Pre-test rules page | Students |
| `/quiz/:attemptId` | Live quiz with timer | Students |
| `/submitted` | Confirmation after submit | Students |
| `/admin/login` | Admin login | Facilitator |
| `/admin` | Dashboard — stats + live monitor | Admin |
| `/admin/tests` | Open / close tests | Admin |
| `/admin/results` | View scores + answer review | Admin |
| `/admin/questions` | Browse, add, delete questions | Admin |

---

## Key Behaviours

| Behaviour | Where it happens |
|-----------|-----------------|
| Student scores hidden until test closes | `AdminResults.tsx` — shows "Pending" badge when `test_open === true` |
| Answers auto-saved on every selection | `QuizPage.tsx` → `saveAnswer()` fired on each option toggle |
| Timer calculated server-side | `QuizPage.tsx` uses `attempt.started_at` from the API to avoid client-clock manipulation |
| Questions + options shuffled on load | `QuizPage.tsx` → `shuffle()` from `utils/helpers.ts` |
| One submission per student per test | Enforced by backend — frontend redirects to `/submitted` on 409 |
| JWT token persisted across refresh | `authStore.ts` uses Zustand `persist` middleware |
| Excel export only for closed tests | Backend returns 403 if test is open; frontend shows alert |

---

## Folder Reference

```
src/
├── main.tsx              React entry point
├── App.tsx               Route definitions + admin guard
├── index.css             Tailwind imports + global body style
│
├── api/                  All HTTP calls (Axios)
│   ├── client.ts         Axios instance + JWT interceptor
│   ├── studentApi.ts     register, getAllTests, getTestQuestions
│   ├── attemptApi.ts     start, saveAnswer, submit, getProgress
│   └── adminApi.ts       login, stats, monitor, toggle, results, export, questions
│
├── store/                Global state (Zustand)
│   ├── authStore.ts      student object + admin flag + JWT token
│   └── quizStore.ts      questions, answers, current index, timer seed
│
├── utils/
│   └── helpers.ts        shuffle(), fmtTime(), downloadBlob()
│
├── components/           Reusable UI primitives
│   ├── Button.tsx        5 variants × 3 sizes, loading state
│   ├── Card.tsx          White rounded shadow container
│   ├── Badge.tsx         6 colour pill labels
│   ├── Input.tsx         Labelled input with error state
│   ├── Modal.tsx         Overlay dialog, normal + wide
│   └── Spinner.tsx       Teal spinning loader
│
└── pages/
    ├── student/
    │   ├── LandingPage.tsx       Name + ID entry
    │   ├── TestListPage.tsx      Test cards with open/closed state
    │   ├── InstructionsPage.tsx  Rules + Begin button
    │   ├── QuizPage.tsx          Timer, options, navigator, auto-save
    │   └── SubmittedPage.tsx     Success screen with lock message
    └── admin/
        ├── AdminLoginPage.tsx    JWT login form
        ├── AdminLayout.tsx       Top nav bar + Outlet
        ├── AdminDashboard.tsx    Stat cards + live monitor + recent
        ├── AdminTests.tsx        Open/Close toggle per test
        ├── AdminResults.tsx      Table + answer review modal + Excel export
        └── AdminQuestions.tsx    Browse + add + delete questions
```