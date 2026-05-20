"""
Shared SQLAlchemy instance.
Imported by models and the app factory to avoid circular imports.
"""
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()