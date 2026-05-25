"""
Seeds the database with:
  - One admin account  (from .env)
  - Five EUC tests with 10 questions each
Runs only once — skips silently if data already exists.
"""
import os
import bcrypt
from database.db import db
from models.admin    import Admin
from models.test     import Test
from models.question import Question
from models.option   import Option


# ── Question bank ──────────────────────────────────────────────────────────────
TESTS_DATA = [
    {
        "title": "Test 1: Computer Basics",
        "duration_minutes": 45,
        "questions": [
            {
                "text": "Which of the following is an example of SOFTWARE?",
                "type": "single", "marks": 2,
                "options": [
                    {"text": "Keyboard",        "correct": False},
                    {"text": "Monitor",         "correct": False},
                    {"text": "Microsoft Word",  "correct": True},
                    {"text": "Printer",         "correct": False},
                ],
            },
            {
                "text": "What does the abbreviation CPU stand for?",
                "type": "single", "marks": 2,
                "options": [
                    {"text": "Central Processing Unit", "correct": True},
                    {"text": "Computer Processing Unit","correct": False},
                    {"text": "Central Power Unit",      "correct": False},
                    {"text": "Control Processing Unit", "correct": False},
                ],
            },
            {
                "text": "Select ALL input devices from the list below.",
                "type": "multi", "marks": 3,
                "options": [
                    {"text": "Monitor",  "correct": False},
                    {"text": "Keyboard", "correct": True},
                    {"text": "Mouse",    "correct": True},
                    {"text": "Printer",  "correct": False},
                    {"text": "Webcam",   "correct": True},
                ],
            },
            {
                "text": "Hardware refers to the physical components of a computer that you can touch.",
                "type": "truefalse", "marks": 1,
                "options": [
                    {"text": "True",  "correct": True},
                    {"text": "False", "correct": False},
                ],
            },
            {
                "text": "Which type of computer has a separate monitor, keyboard and mouse and sits on a desk?",
                "type": "single", "marks": 2,
                "options": [
                    {"text": "Laptop",     "correct": False},
                    {"text": "Desktop",    "correct": True},
                    {"text": "Tablet",     "correct": False},
                    {"text": "Smartphone", "correct": False},
                ],
            },
            {
                "text": "What does IoT stand for?",
                "type": "single", "marks": 2,
                "options": [
                    {"text": "Internet of Things",       "correct": True},
                    {"text": "Internet of Technology",   "correct": False},
                    {"text": "Internal Operating Technology", "correct": False},
                    {"text": "Input Output Terminal",    "correct": False},
                ],
            },
            {
                "text": "RAM is used for the long-term storage of files and data.",
                "type": "truefalse", "marks": 1,
                "options": [
                    {"text": "True",  "correct": False},
                    {"text": "False", "correct": True},
                ],
            },
            {
                "text": "Which keyboard shortcut is used to COPY selected text?",
                "type": "single", "marks": 2,
                "options": [
                    {"text": "Ctrl + X", "correct": False},
                    {"text": "Ctrl + V", "correct": False},
                    {"text": "Ctrl + C", "correct": True},
                    {"text": "Ctrl + Z", "correct": False},
                ],
            },
            {
                "text": "Select ALL devices that are classified as OUTPUT devices.",
                "type": "multi", "marks": 3,
                "options": [
                    {"text": "Monitor", "correct": True},
                    {"text": "Printer", "correct": True},
                    {"text": "Speakers","correct": True},
                    {"text": "Mouse",   "correct": False},
                    {"text": "Scanner", "correct": False},
                ],
            },
            {
                "text": "AI stands for Artificial Intelligence.",
                "type": "truefalse", "marks": 1,
                "options": [
                    {"text": "True",  "correct": True},
                    {"text": "False", "correct": False},
                ],
            },
        ],
    },
    {
        "title": "Test 2: Windows & File Management",
        "duration_minutes": 45,
        "questions": [
            {
                "text": "Which shortcut key opens File Explorer?",
                "type": "single", "marks": 2,
                "options": [
                    {"text": "Win + E", "correct": True},
                    {"text": "Win + F", "correct": False},
                    {"text": "Ctrl + E","correct": False},
                    {"text": "Alt + E", "correct": False},
                ],
            },
            {
                "text": "The Recycle Bin permanently deletes files immediately when you press Delete.",
                "type": "truefalse", "marks": 1,
                "options": [
                    {"text": "True",  "correct": False},
                    {"text": "False", "correct": True},
                ],
            },
            {
                "text": "Which shortcut key renames a selected file or folder?",
                "type": "single", "marks": 2,
                "options": [
                    {"text": "F1",  "correct": False},
                    {"text": "F2",  "correct": True},
                    {"text": "F5",  "correct": False},
                    {"text": "F10", "correct": False},
                ],
            },
            {
                "text": "What does Ctrl + Shift + N do in File Explorer?",
                "type": "single", "marks": 2,
                "options": [
                    {"text": "Opens a new window",   "correct": False},
                    {"text": "Creates a new folder", "correct": True},
                    {"text": "Searches for files",   "correct": False},
                    {"text": "Copies selected items","correct": False},
                ],
            },
            {
                "text": "Select ALL actions you can perform on a file inside the Recycle Bin.",
                "type": "multi", "marks": 3,
                "options": [
                    {"text": "Restore",           "correct": True},
                    {"text": "Permanently Delete","correct": True},
                    {"text": "Edit the file",     "correct": False},
                    {"text": "Empty Recycle Bin", "correct": True},
                ],
            },
            {
                "text": "Shift + Delete sends a file to the Recycle Bin.",
                "type": "truefalse", "marks": 1,
                "options": [
                    {"text": "True",  "correct": False},
                    {"text": "False", "correct": True},
                ],
            },
            {
                "text": "What shortcut minimises all open windows and shows the Desktop?",
                "type": "single", "marks": 2,
                "options": [
                    {"text": "Win + M", "correct": False},
                    {"text": "Win + D", "correct": True},
                    {"text": "Alt + F4","correct": False},
                    {"text": "Ctrl + D","correct": False},
                ],
            },
            {
                "text": "Which of the following is the correct file extension for a Microsoft Word document?",
                "type": "single", "marks": 2,
                "options": [
                    {"text": ".xlsx", "correct": False},
                    {"text": ".pptx", "correct": False},
                    {"text": ".docx", "correct": True},
                    {"text": ".txt",  "correct": False},
                ],
            },
            {
                "text": "What is the purpose of the Address Bar in File Explorer?",
                "type": "single", "marks": 2,
                "options": [
                    {"text": "Shows the file size",                              "correct": False},
                    {"text": "Shows the current folder location as a file path", "correct": True},
                    {"text": "Displays the date the file was modified",          "correct": False},
                    {"text": "Shows the number of files in the folder",          "correct": False},
                ],
            },
            {
                "text": "To cut and move a file to a new location you use Ctrl+X then Ctrl+V.",
                "type": "truefalse", "marks": 1,
                "options": [
                    {"text": "True",  "correct": True},
                    {"text": "False", "correct": False},
                ],
            },
        ],
    },
    {
        "title": "Test 3: Internet & Email",
        "duration_minutes": 45,
        "questions": [
            {
                "text": "Which of the following is a WEB BROWSER?",
                "type": "single", "marks": 2,
                "options": [
                    {"text": "Google",        "correct": False},
                    {"text": "Microsoft Edge","correct": True},
                    {"text": "Yahoo",         "correct": False},
                    {"text": "Bing",          "correct": False},
                ],
            },
            {
                "text": "HTTPS means the website connection is secure and encrypted.",
                "type": "truefalse", "marks": 1,
                "options": [
                    {"text": "True",  "correct": True},
                    {"text": "False", "correct": False},
                ],
            },
            {
                "text": "What does URL stand for?",
                "type": "single", "marks": 2,
                "options": [
                    {"text": "Universal Resource Link",  "correct": False},
                    {"text": "Uniform Resource Locator", "correct": True},
                    {"text": "Unique Resource Location", "correct": False},
                    {"text": "Unified Remote Login",     "correct": False},
                ],
            },
            {
                "text": "Which shortcut opens a new browser tab?",
                "type": "single", "marks": 2,
                "options": [
                    {"text": "Ctrl + N", "correct": False},
                    {"text": "Ctrl + T", "correct": True},
                    {"text": "Ctrl + W", "correct": False},
                    {"text": "Ctrl + P", "correct": False},
                ],
            },
            {
                "text": "Select ALL examples of e-commerce platforms.",
                "type": "multi", "marks": 3,
                "options": [
                    {"text": "Takealot",        "correct": True},
                    {"text": "Google Scholar",  "correct": False},
                    {"text": "Checkers Sixty60","correct": True},
                    {"text": "Wikipedia",       "correct": False},
                    {"text": "Amazon",          "correct": True},
                ],
            },
            {
                "text": "In Microsoft Outlook, CC stands for Carbon Copy.",
                "type": "truefalse", "marks": 1,
                "options": [
                    {"text": "True",  "correct": True},
                    {"text": "False", "correct": False},
                ],
            },
            {
                "text": "Which email action sends your reply ONLY to the original sender?",
                "type": "single", "marks": 2,
                "options": [
                    {"text": "Reply All", "correct": False},
                    {"text": "Forward",   "correct": False},
                    {"text": "Reply",     "correct": True},
                    {"text": "CC",        "correct": False},
                ],
            },
            {
                "text": "Information literacy means the ability to find, evaluate and use information effectively.",
                "type": "truefalse", "marks": 1,
                "options": [
                    {"text": "True",  "correct": True},
                    {"text": "False", "correct": False},
                ],
            },
            {
                "text": "What does the padlock icon in a browser address bar indicate?",
                "type": "single", "marks": 2,
                "options": [
                    {"text": "The page is loading",              "correct": False},
                    {"text": "The connection is secure (HTTPS)", "correct": True},
                    {"text": "The site requires a password",     "correct": False},
                    {"text": "The download is complete",         "correct": False},
                ],
            },
            {
                "text": "BCC recipients can be seen by everyone else on the email.",
                "type": "truefalse", "marks": 1,
                "options": [
                    {"text": "True",  "correct": False},
                    {"text": "False", "correct": True},
                ],
            },
        ],
    },
    {
        "title": "Test 4: Cybersecurity",
        "duration_minutes": 45,
        "questions": [
            {
                "text": "Which of the following is the STRONGEST password?",
                "type": "single", "marks": 2,
                "options": [
                    {"text": "password123",  "correct": False},
                    {"text": "John1990",     "correct": False},
                    {"text": "kT7#mQp2!vL9","correct": True},
                    {"text": "12345678",     "correct": False},
                ],
            },
            {
                "text": "Phishing is a type of cyberattack that uses fake emails to steal personal information.",
                "type": "truefalse", "marks": 1,
                "options": [
                    {"text": "True",  "correct": True},
                    {"text": "False", "correct": False},
                ],
            },
            {
                "text": "Select ALL warning signs that an email might be a phishing attempt.",
                "type": "multi", "marks": 3,
                "options": [
                    {"text": "Creates urgency or threats",   "correct": True},
                    {"text": "Has a verified sender address","correct": False},
                    {"text": "Contains spelling errors",     "correct": True},
                    {"text": "Asks for your password",       "correct": True},
                    {"text": "Has a suspicious link",        "correct": True},
                ],
            },
            {
                "text": "Two-Factor Authentication adds a second layer of security to your account.",
                "type": "truefalse", "marks": 1,
                "options": [
                    {"text": "True",  "correct": True},
                    {"text": "False", "correct": False},
                ],
            },
            {
                "text": "What should you do when you receive an unexpected email with an attachment from an unknown sender?",
                "type": "single", "marks": 2,
                "options": [
                    {"text": "Open it immediately",                 "correct": False},
                    {"text": "Do not open it — delete the email",   "correct": True},
                    {"text": "Forward it to friends",               "correct": False},
                    {"text": "Reply asking for more information",    "correct": False},
                ],
            },
            {
                "text": "It is safe to use the same password for all your online accounts.",
                "type": "truefalse", "marks": 1,
                "options": [
                    {"text": "True",  "correct": False},
                    {"text": "False", "correct": True},
                ],
            },
            {
                "text": "What shortcut locks your computer screen instantly?",
                "type": "single", "marks": 2,
                "options": [
                    {"text": "Ctrl + L", "correct": False},
                    {"text": "Win + L",  "correct": True},
                    {"text": "Alt + L",  "correct": False},
                    {"text": "Shift + L","correct": False},
                ],
            },
            {
                "text": "Smishing is phishing carried out through SMS text messages.",
                "type": "truefalse", "marks": 1,
                "options": [
                    {"text": "True",  "correct": True},
                    {"text": "False", "correct": False},
                ],
            },
            {
                "text": "Select ALL good cybersecurity habits.",
                "type": "multi", "marks": 3,
                "options": [
                    {"text": "Use a different password for every account","correct": True},
                    {"text": "Share your password with trusted friends",  "correct": False},
                    {"text": "Enable Two-Factor Authentication",          "correct": True},
                    {"text": "Keep software updated",                     "correct": True},
                    {"text": "Click all links in emails to check them",   "correct": False},
                ],
            },
            {
                "text": "A password manager securely stores all your passwords in one encrypted location.",
                "type": "truefalse", "marks": 1,
                "options": [
                    {"text": "True",  "correct": True},
                    {"text": "False", "correct": False},
                ],
            },
        ],
    },
    {
        "title": "Final Exam: All Topics",
        "duration_minutes": 90,
        "questions": [
            {
                "text": "Which of the following best describes HARDWARE?",
                "type": "single", "marks": 2,
                "options": [
                    {"text": "Programs and applications",         "correct": False},
                    {"text": "Physical components you can touch", "correct": True},
                    {"text": "Internet connections",              "correct": False},
                    {"text": "Files saved on your computer",      "correct": False},
                ],
            },
            {
                "text": "What does RAM stand for?",
                "type": "single", "marks": 2,
                "options": [
                    {"text": "Read Access Memory",    "correct": False},
                    {"text": "Random Access Memory",  "correct": True},
                    {"text": "Random Application Module","correct": False},
                    {"text": "Read Application Memory","correct": False},
                ],
            },
            {
                "text": "Ctrl + Z performs the Undo function.",
                "type": "truefalse", "marks": 1,
                "options": [
                    {"text": "True",  "correct": True},
                    {"text": "False", "correct": False},
                ],
            },
            {
                "text": "Select ALL items that are classified as SOFTWARE.",
                "type": "multi", "marks": 3,
                "options": [
                    {"text": "Microsoft Excel", "correct": True},
                    {"text": "Hard Drive",       "correct": False},
                    {"text": "Windows OS",       "correct": True},
                    {"text": "Google Chrome",    "correct": True},
                    {"text": "Monitor",          "correct": False},
                ],
            },
            {
                "text": "Which key combination creates a new folder in File Explorer?",
                "type": "single", "marks": 2,
                "options": [
                    {"text": "Ctrl + N",         "correct": False},
                    {"text": "Ctrl + Shift + N", "correct": True},
                    {"text": "F3",               "correct": False},
                    {"text": "Win + N",          "correct": False},
                ],
            },
            {
                "text": "A search engine and a web browser are the same thing.",
                "type": "truefalse", "marks": 1,
                "options": [
                    {"text": "True",  "correct": False},
                    {"text": "False", "correct": True},
                ],
            },
            {
                "text": "Which of the following is an example of e-commerce?",
                "type": "single", "marks": 2,
                "options": [
                    {"text": "Reading a Wikipedia article",          "correct": False},
                    {"text": "Buying groceries on Checkers Sixty60", "correct": True},
                    {"text": "Searching on Google",                  "correct": False},
                    {"text": "Watching YouTube",                     "correct": False},
                ],
            },
            {
                "text": "Win + D minimises all open windows and shows the Desktop.",
                "type": "truefalse", "marks": 1,
                "options": [
                    {"text": "True",  "correct": True},
                    {"text": "False", "correct": False},
                ],
            },
            {
                "text": "Select ALL characteristics of a strong password.",
                "type": "multi", "marks": 3,
                "options": [
                    {"text": "At least 12 characters long",           "correct": True},
                    {"text": "Uses your date of birth",               "correct": False},
                    {"text": "Contains uppercase and lowercase letters","correct": True},
                    {"text": "Includes numbers and symbols",          "correct": True},
                    {"text": "Is the same as your username",          "correct": False},
                ],
            },
            {
                "text": "Phishing emails often create a sense of urgency to make you act without thinking.",
                "type": "truefalse", "marks": 1,
                "options": [
                    {"text": "True",  "correct": True},
                    {"text": "False", "correct": False},
                ],
            },
        ],
    },
]


def seed_database():
    """Seed admin + tests only if the database is empty."""
    if Admin.query.first():
        return  # already seeded — skip

    # ── Admin account ──────────────────────────────────────────────────────────
    raw_pw  = os.getenv("ADMIN_PASSWORD", "admin123")
    hashed  = bcrypt.hashpw(raw_pw.encode(), bcrypt.gensalt()).decode()
    admin   = Admin(
        username=os.getenv("ADMIN_USERNAME", "admin"),
        password_hash=hashed,
    )
    db.session.add(admin)

    # ── Tests → Questions → Options ───────────────────────────────────────────
    for t_data in TESTS_DATA:
        test = Test(
            title=t_data["title"],
            duration_minutes=t_data["duration_minutes"],
            is_open=False,
        )
        db.session.add(test)
        db.session.flush()          # get test.id before child inserts

        for q_data in t_data["questions"]:
            question = Question(
                test_id=test.id,
                question_text=q_data["text"],
                question_type=q_data["type"],
                marks=q_data["marks"],
            )
            db.session.add(question)
            db.session.flush()      # get question.id

            for o_data in q_data["options"]:
                option = Option(
                    question_id=question.id,
                    option_text=o_data["text"],
                    is_correct=o_data["correct"],
                )
                db.session.add(option)

    db.session.commit()
    print("✅  Database seeded successfully.")