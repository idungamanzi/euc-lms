from database.db import db


class Option(db.Model):
    __tablename__ = "options"

    id          = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey("questions.id"), nullable=False)
    option_text = db.Column(db.Text, nullable=False)
    is_correct  = db.Column(db.Boolean, default=False)

    question = db.relationship("Question", back_populates="options")

    def to_dict(self, reveal_correct=False):
        data = {"id": self.id, "option_text": self.option_text}
        if reveal_correct:
            data["is_correct"] = self.is_correct
        return data