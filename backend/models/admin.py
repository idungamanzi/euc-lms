from database.db import db


class Admin(db.Model):
    __tablename__ = "admins"

    id            = db.Column(db.Integer, primary_key=True)
    username      = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)

    def to_dict(self):
        return {"id": self.id, "username": self.username}