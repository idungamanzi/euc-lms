"""Attempt lifecycle: start → save answers → submit."""
from datetime import datetime
from flask import Blueprint, request, jsonify

from database.db    import db
from models.attempt import Attempt
from models.answer  import Answer
from models.test    import Test
from models.student import Student
from services.scoring import score_attempt

attempt_bp = Blueprint("attempt", __name__)


@attempt_bp.post("/start")
def start():
    data       = request.get_json()
    student_id = data.get("student_id")
    test_id    = data.get("test_id")

    student = Student.query.get_or_404(student_id)
    test    = Test.query.get_or_404(test_id)

    # Use is_currently_open() so the schedule is respected
    if not test.is_currently_open():
        return jsonify({"error": "This test is not currently open"}), 403

    # One attempt per student per test
    existing = Attempt.query.filter_by(
        student_id=student.id, test_id=test.id
    ).first()

    if existing:
        if existing.status == "submitted":
            return jsonify({"error": "You have already submitted this test"}), 409
        return jsonify({"attempt": existing.to_dict()}), 200    # resume

    attempt = Attempt(student_id=student.id, test_id=test.id)
    db.session.add(attempt)
    db.session.commit()
    return jsonify({"attempt": attempt.to_dict()}), 201


@attempt_bp.post("/answer/save")
def save_answer():
    data        = request.get_json()
    attempt_id  = data.get("attempt_id")
    question_id = data.get("question_id")
    option_ids  = data.get("selected_option_ids", [])

    attempt = Attempt.query.get_or_404(attempt_id)
    if not attempt.test.is_currently_open():
        return jsonify({"error": "Test has expired"}), 403
    if attempt.status == "submitted":
        return jsonify({"error": "Attempt already submitted"}), 409

    answer = Answer.query.filter_by(
        attempt_id=attempt_id, question_id=question_id
    ).first()

    if answer:
        answer.selected_ids = option_ids
    else:
        answer = Answer(attempt_id=attempt_id, question_id=question_id)
        answer.selected_ids = option_ids
        db.session.add(answer)

    db.session.commit()
    return jsonify({"saved": True}), 200


@attempt_bp.post("/submit")
def submit():
    data       = request.get_json()
    attempt_id = data.get("attempt_id")

    attempt = Attempt.query.get_or_404(attempt_id)
    if attempt.status == "submitted":
        return jsonify({"error": "Already submitted"}), 409

    score                = score_attempt(attempt_id)
    attempt.status       = "submitted"
    attempt.submitted_at = datetime.utcnow()
    attempt.score        = score
    db.session.commit()

    return jsonify({
        "submitted": True,
        "message":   "Your answers have been saved. Results will be available once the test closes.",
    }), 200


@attempt_bp.get("/<int:attempt_id>/progress")
def progress(attempt_id):
    """Return saved answers for an in-progress attempt — used to resume a test."""
    attempt = Attempt.query.get_or_404(attempt_id)
    return jsonify({
        "attempt": attempt.to_dict(),
        "answers": [a.to_dict() for a in attempt.answers],
    }), 200