"""
EUC Assessment Platform — Flask Application Entry Point
"""
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

    # ── Database URL ───────────────────────────────────────────────────────────
    raw_db_url = os.getenv("DATABASE_URL", "sqlite:///euc_assessment.db")

    # Neon gives postgresql:// but SQLAlchemy needs postgresql+psycopg2://
    if raw_db_url.startswith("postgresql://"):
        raw_db_url = raw_db_url.replace("postgresql://", "postgresql+psycopg2://", 1)

    # ── Config ────────────────────────────────────────────────────────────────
    app.config["SECRET_KEY"]                     = os.getenv("SECRET_KEY", "dev-secret")
    app.config["JWT_SECRET_KEY"]                 = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")
    app.config["SQLALCHEMY_DATABASE_URI"]        = raw_db_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_ACCESS_TOKEN_EXPIRES"]       = False

    # ── Neon connection pool settings ─────────────────────────────────────────
    # Neon is serverless and goes to sleep — these settings handle reconnection
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_pre_ping":   True,      # test connection before using it
        "pool_recycle":    300,       # recycle connections every 5 minutes
        "pool_timeout":    30,        # wait up to 30s for a connection
        "pool_size":       5,         # max 5 persistent connections
        "max_overflow":    2,         # allow 2 extra connections under load
        "connect_args": {
            "sslmode":           "require",
            "connect_timeout":   10,
            "keepalives":        1,
            "keepalives_idle":   30,
            "keepalives_interval": 10,
            "keepalives_count":  5,
        },
    }

    # ── Extensions ────────────────────────────────────────────────────────────
    db.init_app(app)
    JWTManager(app)
    CORS(app)

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
