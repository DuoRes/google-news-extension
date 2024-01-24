import bson

from flask import current_app, g
from werkzeug.local import LocalProxy
from flask_pymongo import PyMongo

from pymongo.errors import DuplicateKeyError, OperationFailure
from bson.objectid import ObjectId
from bson.errors import InvalidId

import os

MONGODB_URI = os.getenv("MONGODB_URI")

def get_db():
    """
    Configuration method to return db instance
    """
    if "db" not in g:
        g.db = PyMongo(current_app, uri=MONGODB_URI)
    return g.db

# Use LocalProxy to read the global db instance with just `db`
db = LocalProxy(get_db)