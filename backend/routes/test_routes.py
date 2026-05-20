"""Public test routes — no authentication required (used by students)."""
import random
from flask import Blueprint, jsonify
from models.test import Test

test_bp = Blueprint("tests", __name__)


@test_bp.get("/all")
def all_tests():
    """
    Return all tests with open/closed status.
    Used by the student test list page.
    is_currently_open reflects both the is_open flag and the schedule.
    """
    tests = Test.query.all()
    return jsonify({"tests": [t.to_dict() for t in tests]}), 200


@test_bp.get("/<int:test_id>/questions")
def get_questions(test_id):
    """
    Return shuffled questions + options for a test.
    Correct answers are NEVER sent to the student.
    Uses is_currently_open() which checks is_open AND the schedule window.
    Also returns close_time so the frontend timer can use it as the hard deadline.
    """
    test = Test.query.get_or_404(test_id)

    if not test.is_currently_open():
        return jsonify({"error": "This test is not currently open"}), 403

    questions = [
        q.to_dict(include_options=True, reveal_correct=False)
        for q in test.questions
    ]
    random.shuffle(questions)
    for q in questions:
        random.shuffle(q["options"])

    return jsonify({
        "test_id":          test.id,
        "title":            test.title,
        "duration_minutes": test.duration_minutes,
        "close_time":       test.close_time.isoformat() if test.close_time else None,
        "questions":        questions,
    }), 200