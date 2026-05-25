"""Admin authentication and management routes — JWT protected."""
import bcrypt
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required

from database.db import db
from models.admin    import Admin
from models.test     import Test
from models.student  import Student
from models.attempt  import Attempt
from models.question import Question
from models.option   import Option
from services.scoring     import score_attempt
from exports.excel_export import export_results_excel

admin_bp = Blueprint("admin", __name__)


# ── Auth ───────────────────────────────────────────────────────────────────────
@admin_bp.post("/login")
def login():
    data     = request.get_json()
    username = data.get("username", "")
    password = data.get("password", "")

    admin = Admin.query.filter_by(username=username).first()
    if not admin or not bcrypt.checkpw(password.encode(), admin.password_hash.encode()):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_access_token(identity=str(admin.id))
    return jsonify({"access_token": token, "admin": admin.to_dict()}), 200


# ── Dashboard stats ────────────────────────────────────────────────────────────
@admin_bp.get("/stats")
@jwt_required()
def stats():
    return jsonify({
        "total_students": Student.query.count(),
        "open_tests":     Test.query.filter_by(is_open=True).count(),
        "submitted":      Attempt.query.filter_by(status="submitted").count(),
        "in_progress":    Attempt.query.filter_by(status="in_progress").count(),
    }), 200


# ── Live monitor ───────────────────────────────────────────────────────────────
@admin_bp.get("/monitor")
@jwt_required()
def monitor():
    active = Attempt.query.filter_by(status="in_progress").all()
    return jsonify({
        "active": [
            {
                **a.to_dict(),
                "student":    a.student.to_dict(),
                "test_title": a.test.title,
            }
            for a in active
        ]
    }), 200


# ── Test management ────────────────────────────────────────────────────────────
@admin_bp.get("/tests")
@jwt_required()
def get_tests():
    tests = Test.query.all()
    return jsonify({"tests": [t.to_dict() for t in tests]}), 200


@admin_bp.patch("/tests/<int:test_id>/toggle")
@jwt_required()
def toggle_test(test_id):
    """
    Immediately open or close a test.
    Closing also clears any saved schedule so the test stays closed.
    """
    test         = Test.query.get_or_404(test_id)
    test.is_open = not test.is_open

    # When manually closing, wipe the schedule so it does not re-open automatically
    if not test.is_open:
        test.open_time  = None
        test.close_time = None

    db.session.commit()
    return jsonify({"test": test.to_dict()}), 200


@admin_bp.patch("/tests/<int:test_id>/schedule")
@jwt_required()
def schedule_test(test_id):
    """
    Set a scheduled open_time and close_time for a test.
    Sets is_open = True so the schedule takes effect immediately.

    Expected JSON body:
    {
        "open_time":  "2025-08-01T08:00:00",   // ISO 8601, UTC
        "close_time": "2025-08-01T10:00:00"    // ISO 8601, UTC
    }
    Pass null for either field to clear it.
    """
    test = Test.query.get_or_404(test_id)
    data = request.get_json()

    open_str  = data.get("open_time")
    close_str = data.get("close_time")

    try:
        test.open_time  = datetime.fromisoformat(open_str)  if open_str  else None
        test.close_time = datetime.fromisoformat(close_str) if close_str else None
    except ValueError:
        return jsonify({
            "error": "Invalid datetime format. Use ISO 8601: YYYY-MM-DDTHH:MM:SS"
        }), 400

    # Validate that close is after open when both are provided
    if test.open_time and test.close_time and test.close_time <= test.open_time:
        return jsonify({"error": "close_time must be after open_time"}), 400

    # Mark as open so the schedule becomes active
    test.is_open = True
    db.session.commit()

    return jsonify({"test": test.to_dict()}), 200


# ── Results ────────────────────────────────────────────────────────────────────
@admin_bp.get("/results")
@jwt_required()
def get_results():
    attempts = (
        Attempt.query
        .filter_by(status="submitted")
        .order_by(Attempt.submitted_at.desc())
        .all()
    )
    results = []
    for att in attempts:
        test_closed = not att.test.is_open
        results.append({
            **att.to_dict(reveal_score=test_closed),
            "student":    att.student.to_dict(),
            "test_title": att.test.title,
            "test_open":  att.test.is_open,
        })
    return jsonify({"results": results}), 200


@admin_bp.get("/results/<int:attempt_id>/detail")
@jwt_required()
def result_detail(attempt_id):
    att         = Attempt.query.get_or_404(attempt_id)
    test_closed = not att.test.is_open

    detail = []
    for q in att.test.questions:
        ans         = next((a for a in att.answers if a.question_id == q.id), None)
        sel         = ans.selected_ids if ans else []
        correct_ids = [o.id for o in q.options if o.is_correct]
        is_right    = sorted(sel) == sorted(correct_ids)

        detail.append({
            "question":   q.to_dict(include_options=True, reveal_correct=test_closed),
            "selected":   sel,
            "is_correct": is_right if test_closed else None,
        })

    return jsonify({
        "attempt":   att.to_dict(reveal_score=test_closed),
        "student":   att.student.to_dict(),
        "test":      att.test.to_dict(),
        "detail":    detail,
        "test_open": att.test.is_open,
    }), 200


# ── Excel export ───────────────────────────────────────────────────────────────
@admin_bp.get("/export/<int:test_id>")
@jwt_required()
def export_excel(test_id):
    return export_results_excel(test_id)


# ── Question management ────────────────────────────────────────────────────────
@admin_bp.get("/tests/<int:test_id>/questions")
@jwt_required()
def get_questions(test_id):
    test = Test.query.get_or_404(test_id)
    return jsonify({
        "questions": [
            q.to_dict(include_options=True, reveal_correct=True)
            for q in test.questions
        ]
    }), 200


@admin_bp.post("/tests/<int:test_id>/questions")
@jwt_required()
def add_question(test_id):
    Test.query.get_or_404(test_id)
    data = request.get_json()

    q = Question(
        test_id=test_id,
        question_text=data["question_text"],
        question_type=data.get("question_type", "single"),
        marks=int(data.get("marks", 2)),
    )
    db.session.add(q)
    db.session.flush()

    for o_data in data.get("options", []):
        if not o_data.get("option_text", "").strip():
            continue
        opt = Option(
            question_id=q.id,
            option_text=o_data["option_text"],
            is_correct=bool(o_data.get("is_correct", False)),
        )
        db.session.add(opt)

    db.session.commit()
    return jsonify({
        "question": q.to_dict(include_options=True, reveal_correct=True)
    }), 201


@admin_bp.delete("/questions/<int:question_id>")
@jwt_required()
def delete_question(question_id):
    q = Question.query.get_or_404(question_id)
    db.session.delete(q)
    db.session.commit()
    return jsonify({"message": "Question deleted"}), 200