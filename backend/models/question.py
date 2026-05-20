from database.db import db


class Question(db.Model):
    __tablename__ = "questions"

    id            = db.Column(db.Integer, primary_key=True)
    test_id       = db.Column(db.Integer, db.ForeignKey("tests.id"), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    question_type = db.Column(db.String(20), default="single")  # single | multi | truefalse
    marks         = db.Column(db.Integer, default=2)

    test    = db.relationship("Test",    back_populates="questions")
    options = db.relationship("Option",  back_populates="question", cascade="all, delete-orphan")
    answers = db.relationship("Answer",  back_populates="question", cascade="all, delete-orphan")

    def to_dict(self, include_options=False, reveal_correct=False):
        data = {
            "id":            self.id,
            "question_text": self.question_text,
            "question_type": self.question_type,
            "marks":         self.marks,
        }
        if include_options:
            data["options"] = [
                o.to_dict(reveal_correct=reveal_correct) for o in self.options
            ]
        return data