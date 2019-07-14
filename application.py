import os

from flask import Flask
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config.from_envvar('APP_SETTINGS')
socketio = SocketIO(app)


@app.route("/")
def index():
    return "Project 2: TODO"
