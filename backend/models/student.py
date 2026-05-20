from datetime import datetime
from database.db import db


class Student(db.Model):
    __tablename__ = "students"

    id         = db.Column(db.Integer, primary_key=True)
    full_name  = db.Column(db.String(120), nullable=False)
    student_id = db.Column(db.String(50),  unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    attempts = db.relationship(
        "Attempt", back_populates="student", cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id":         self.id,
            "full_name":  self.full_name,
            "student_id": self.student_id,
            "created_at": self.created_at.isoformat(),
        }