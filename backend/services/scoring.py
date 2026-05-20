"""
Scoring service.
Returns a percentage score (0–100) for a submitted attempt.
Full marks only when selected options exactly match correct options.
No partial credit for multi-select questions.
"""
from models.attempt import Attempt
from models.answer  import Answer


def score_attempt(attempt_id: int) -> float:
    attempt = Attempt.query.get(attempt_id)
    if not attempt:
        return 0.0

    total_marks  = 0
    earned_marks = 0

    for q in attempt.test.questions:
        total_marks += q.marks

        correct_ids  = sorted(o.id for o in q.options if o.is_correct)
        answer       = Answer.query.filter_by(
            attempt_id=attempt_id, question_id=q.id
        ).first()
        selected_ids = sorted(answer.selected_ids) if answer else []

        if selected_ids == correct_ids:
            earned_marks += q.marks

    if total_marks == 0:
        return 0.0

    return round((earned_marks / total_marks) * 100, 1)