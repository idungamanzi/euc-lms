from datetime import datetime
from database.db import db


class Attempt(db.Model):
    __tablename__ = "attempts"

    id           = db.Column(db.Integer, primary_key=True)
    student_id   = db.Column(db.Integer, db.ForeignKey("students.id"), nullable=False)
    test_id      = db.Column(db.Integer, db.ForeignKey("tests.id"),    nullable=False)
    status       = db.Column(db.String(20), default="in_progress")  # in_progress | submitted
    started_at   = db.Column(db.DateTime, default=datetime.utcnow)
    submitted_at = db.Column(db.DateTime, nullable=True)
    score        = db.Column(db.Float, nullable=True)

    student = db.relationship("Student", back_populates="attempts")
    test    = db.relationship("Test",    back_populates="attempts")
    answers = db.relationship("Answer",  back_populates="attempt", cascade="all, delete-orphan")

    def to_dict(self, reveal_score=False):
        data = {
            "id":           self.id,
            "student_id":   self.student_id,
            "test_id":      self.test_id,
            "status":       self.status,
            "started_at":   self.started_at.isoformat()   if self.started_at   else None,
            "submitted_at": self.submitted_at.isoformat() if self.submitted_at else None,
        }
        if reveal_score:
            data["score"] = self.score
        return data