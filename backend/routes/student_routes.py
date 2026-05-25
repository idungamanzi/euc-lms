"""Student registration and profile routes — no authentication required."""
from flask import Blueprint, request, jsonify
from database.db import db
from models.student import Student

student_bp = Blueprint("student", __name__)


@student_bp.post("/register")
def register():
    data       = request.get_json()
    full_name  = (data.get("full_name")  or "").strip()
    student_id = (data.get("student_id") or "").strip()

    if not full_name or not student_id:
        return jsonify({"error": "full_name and student_id are required"}), 400

    student = Student.query.filter_by(student_id=student_id).first()
    if not student:
        student = Student(full_name=full_name, student_id=student_id)
        db.session.add(student)
        db.session.commit()

    return jsonify({"student": student.to_dict()}), 200


@student_bp.get("/all")
def all_students():
    students = Student.query.order_by(Student.created_at.desc()).all()
    return jsonify({"students": [s.to_dict() for s in students]}), 200