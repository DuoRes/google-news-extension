from flask import Flask

from db import db
from api import api

def create_app():
    """
    Create Flask application
    """
    app = Flask(__name__)

    app.config.from_object("backend_py.config.Config")

    app.register_blueprint(api)

    db.init_app(app)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run()
