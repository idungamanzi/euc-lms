"""
Excel export utility.
Generates a two-sheet workbook for a closed test:
  Sheet 1 — Summary   : one row per student (Name, ID, Score, Pass/Fail)
  Sheet 2 — Review    : one row per question per student (answer + correct answer)
Only callable after a test is closed (enforced in the route).
"""
import io
from datetime import datetime

import pandas as pd
from flask import send_file, jsonify

from models.test    import Test
from models.attempt import Attempt
from models.answer  import Answer


def export_results_excel(test_id: int):
    test = Test.query.get(test_id)
    if not test:
        return jsonify({"error": "Test not found"}), 404
    if test.is_open:
        return jsonify({"error": "Close the test before exporting results"}), 403

    attempts = (
        Attempt.query
        .filter_by(test_id=test_id, status="submitted")
        .all()
    )
    if not attempts:
        return jsonify({"error": "No submissions found for this test"}), 404

    # ── Sheet 1: Summary ───────────────────────────────────────────────────────
    summary_rows = []
    for att in attempts:
        summary_rows.append({
            "Student Name": att.student.full_name,
            "Student ID":   att.student.student_id,
            "Test":         test.title,
            "Score (%)":    att.score if att.score is not None else 0,
            "Result":       "PASS" if (att.score or 0) >= 50 else "FAIL",
            "Submitted At": (
                att.submitted_at.strftime("%Y-%m-%d %H:%M")
                if att.submitted_at else ""
            ),
        })
    df_summary = pd.DataFrame(summary_rows)

    # ── Sheet 2: Answer Review ─────────────────────────────────────────────────
    review_rows = []
    for att in attempts:
        for q in test.questions:
            correct_ids   = sorted(o.id for o in q.options if o.is_correct)
            correct_text  = "; ".join(o.option_text for o in q.options if o.is_correct)
            answer        = Answer.query.filter_by(
                attempt_id=att.id, question_id=q.id
            ).first()
            selected_ids  = sorted(answer.selected_ids) if answer else []
            selected_text = (
                "; ".join(o.option_text for o in q.options if o.id in selected_ids)
                if answer else "No answer"
            )
            is_correct = selected_ids == correct_ids

            review_rows.append({
                "Student Name":   att.student.full_name,
                "Student ID":     att.student.student_id,
                "Question":       q.question_text,
                "Type":           q.question_type,
                "Marks":          q.marks,
                "Student Answer": selected_text,
                "Correct Answer": correct_text,
                "Correct?":       "YES" if is_correct else "NO",
            })
    df_review = pd.DataFrame(review_rows)

    # ── Write workbook to memory buffer ───────────────────────────────────────
    buf = io.BytesIO()
    with pd.ExcelWriter(buf, engine="openpyxl") as writer:
        df_summary.to_excel(writer, sheet_name="Results",       index=False)
        df_review.to_excel(writer,  sheet_name="Answer Review", index=False)
    buf.seek(0)

    filename = (
        f"{test.title.replace(' ', '_')}_Results_"
        f"{datetime.now().strftime('%Y%m%d_%H%M')}.xlsx"
    )
    return send_file(
        buf,
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        as_attachment=True,
        download_name=filename,
    )