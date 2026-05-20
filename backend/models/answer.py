import json
from database.db import db


class Answer(db.Model):
    __tablename__ = "answers"

    id                  = db.Column(db.Integer, primary_key=True)
    attempt_id          = db.Column(db.Integer, db.ForeignKey("attempts.id"),  nullable=False)
    question_id         = db.Column(db.Integer, db.ForeignKey("questions.id"), nullable=False)
    selected_option_ids = db.Column(db.Text, default="[]")   # JSON list of option IDs

    attempt  = db.relationship("Attempt",  back_populates="answers")
    question = db.relationship("Question", back_populates="answers")

    @property
    def selected_ids(self):
        try:
            return json.loads(self.selected_option_ids)
        except Exception:
            return []

    @selected_ids.setter
    def selected_ids(self, value):
        self.selected_option_ids = json.dumps(value)

    def to_dict(self):
        return {
            "id":                  self.id,
            "attempt_id":          self.attempt_id,
            "question_id":         self.question_id,
            "selected_option_ids": self.selected_ids,
        }