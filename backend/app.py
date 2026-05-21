from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

from database.db import db
from database.seed import seed_database

load_dotenv()

def create_app():
    app = Flask(__name__)

    # ── Config ────────────────────────────────────────────────────────────────
    app.config["SECRET_KEY"]                     = os.getenv("SECRET_KEY", "dev-secret")
    app.config["JWT_SECRET_KEY"]                 = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")
    app.config["SQLALCHEMY_DATABASE_URI"]        = os.getenv("DATABASE_URL", "sqlite:///euc_assessment.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_ACCESS_TOKEN_EXPIRES"]       = False

    # ── Extensions ────────────────────────────────────────────────────────────
    db.init_app(app)
    JWTManager(app)

    # Allow ALL origins — safe for a classroom LMS with no sensitive public data
    # Restrict this later by replacing "*" with your exact frontend URL
    CORS(app, resources={r"/api/*": {"origins": "*"}},
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"])

    # ── Blueprints ────────────────────────────────────────────────────────────
    from routes.student_routes import student_bp
    from routes.admin_routes   import admin_bp
    from routes.test_routes    import test_bp
    from routes.attempt_routes import attempt_bp

    app.register_blueprint(student_bp, url_prefix="/api/student")
    app.register_blueprint(admin_bp,   url_prefix="/api/admin")
    app.register_blueprint(test_bp,    url_prefix="/api/tests")
    app.register_blueprint(attempt_bp, url_prefix="/api/attempt")

    # ── DB init + seed ────────────────────────────────────────────────────────
    with app.app_context():
        db.create_all()
        seed_database()

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
