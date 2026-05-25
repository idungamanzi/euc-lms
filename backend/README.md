# EUC Assessment Platform — Backend

Flask + SQLAlchemy REST API for the EUC mini-LMS.

---

## Quick Start

### 1. Create and activate a virtual environment

```bash
# macOS / Linux
python -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Create the `.env` file

Copy the `.env` block from this README into a file called `.env` in the
`backend/` folder. The defaults work out of the box for local development.

### 4. Run the server

```bash
python app.py
```

The API starts at **http://localhost:5000**.  
The SQLite database file (`euc_assessment.db`) and all tables are created
automatically on first run. The seed function populates:

- 1 admin account  (`admin` / `admin123`)
- 5 tests with 10 questions each (50 questions total)

---

## API Endpoints

### Student (no auth)

| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/student/register` | Register or retrieve a student by student_id |
| GET  | `/api/tests/all` | List all tests with open/closed status |
| GET  | `/api/tests/<id>/questions` | Get shuffled questions for an open test |
| POST | `/api/attempt/start` | Start or resume an attempt |
| POST | `/api/attempt/answer/save` | Save a single answer (call on every selection) |
| POST | `/api/attempt/submit` | Submit the attempt and calculate score |
| GET  | `/api/attempt/<id>/progress` | Get saved answers for a resume |

### Admin (JWT required — pass token as `Authorization: Bearer <token>`)

| Method | URL | Description |
|--------|-----|-------------|
| POST   | `/api/admin/login` | Login — returns JWT token |
| GET    | `/api/admin/stats` | Dashboard stats |
| GET    | `/api/admin/monitor` | Live in-progress sessions |
| GET    | `/api/admin/tests` | All tests |
| PATCH  | `/api/admin/tests/<id>/toggle` | Open or close a test |
| GET    | `/api/admin/results` | All submitted attempts |
| GET    | `/api/admin/results/<id>/detail` | Full answer review for one attempt |
| GET    | `/api/admin/export/<test_id>` | Download Excel results (test must be closed) |
| GET    | `/api/admin/tests/<id>/questions` | All questions for a test (with correct answers) |
| POST   | `/api/admin/tests/<id>/questions` | Add a new question |
| DELETE | `/api/admin/questions/<id>` | Delete a question |

---

## Key Rules (enforced server-side)

| Rule | How it is enforced |
|------|-------------------|
| Scores hidden while test is open | `reveal_score=False` passed to `to_dict()` until `test.is_open == False` |
| Correct answers never sent to students | `reveal_correct=False` in `/api/tests/<id>/questions` |
| One submission per student per test | `Attempt` lookup before creating a new one |
| Auto-score on submit | `score_attempt()` called in `/api/attempt/submit` |
| Export only after close | Guard in `export_results_excel()` |

---

## Resetting the Database

To wipe all data and re-seed:

```bash
# while the venv is active and you are in the backend/ folder
python -c "
from app import app
from database.db import db
with app.app_context():
    db.drop_all()
    db.create_all()
    from database.seed import seed_database
    seed_database()
print('Reset complete.')
"
```

---

## Folder Reference

```
backend/
├── app.py                  Entry point — factory, extensions, blueprints
├── .env                    Secrets and config (never commit to git)
├── requirements.txt        Python dependencies
├── database/
│   ├── db.py               Shared SQLAlchemy instance
│   └── seed.py             Admin + 5-test seed data
├── models/
│   ├── admin.py            Admin user model
│   ├── student.py          Student model
│   ├── test.py             Test model
│   ├── question.py         Question model
│   ├── option.py           Answer option model
│   ├── attempt.py          Student attempt model
│   └── answer.py           Student answer model (stores selected option IDs as JSON)
├── routes/
│   ├── student_routes.py   /api/student/*
│   ├── admin_routes.py     /api/admin/*  (JWT protected)
│   ├── test_routes.py      /api/tests/*
│   └── attempt_routes.py   /api/attempt/*
├── services/
│   └── scoring.py          Score calculation logic
└── exports/
    └── excel_export.py     Two-sheet Excel workbook generator
```