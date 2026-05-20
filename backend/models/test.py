from datetime import datetime
from database.db import db


class Test(db.Model):
    __tablename__ = "tests"

    id               = db.Column(db.Integer, primary_key=True)
    title            = db.Column(db.String(200), nullable=False)
    duration_minutes = db.Column(db.Integer, default=45)
    is_open          = db.Column(db.Boolean, default=False)
    open_time        = db.Column(db.DateTime, nullable=True)   # scheduled open datetime (UTC)
    close_time       = db.Column(db.DateTime, nullable=True)   # scheduled close datetime (UTC)
    created_at       = db.Column(db.DateTime, default=datetime.utcnow)

    questions = db.relationship(
        "Question", back_populates="test", cascade="all, delete-orphan"
    )
    attempts = db.relationship(
        "Attempt", back_populates="test", cascade="all, delete-orphan"
    )

    def is_currently_open(self):
        """
        A test is accessible to students when:
          - is_open is True  AND
          - current UTC time is between open_time and close_time (if those are set)
        If no schedule is set, is_open alone controls access.
        """
        if not self.is_open:
            return False
        now = datetime.utcnow()
        if self.open_time and now < self.open_time:
            return False        # not yet open
        if self.close_time and now > self.close_time:
            return False        # already expired
        return True

    def to_dict(self, include_questions=False):
        data = {
            "id":                self.id,
            "title":             self.title,
            "duration_minutes":  self.duration_minutes,
            "is_open":           self.is_open,
            "is_currently_open": self.is_currently_open(),
            "open_time":         self.open_time.isoformat()  if self.open_time  else None,
            "close_time":        self.close_time.isoformat() if self.close_time else None,
            "question_count":    len(self.questions),
        }
        if include_questions:
            data["questions"] = [
                q.to_dict(include_options=True) for q in self.questions
            ]
        return data