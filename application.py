import os
import sys

from flask import Flask, redirect, render_template, url_for, request, g, session, jsonify
from flask_socketio import SocketIO, emit
from functools import wraps
from flask_session import Session
from models import *

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config.from_envvar('APP_SETTINGS')
socketio = SocketIO(app)

app.config["SESSION_PERMANENT"] = True
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

global channels
channels = []

def display_name_required(f):
	@wraps(f)
	def decorated_function(*args, **kwargs):
		if not session.get("user"):
			return redirect(url_for("login"))
		#g.user = session.get("user")
		return f(*args, **kwargs)
	return decorated_function

@app.route("/")
@display_name_required
def index():
	print(channels, file=sys.stderr)
	return render_template("flack.html", channels = channels)

@app.route("/login", methods = ['POST', 'GET'])
def login():
	if session.get("user"):
		return redirect(url_for("index"))

	if request.method == "POST":
		if request.form.get("display-name") == None:
			error = "Display Name is required my friend!"
			return render_template("name.html", error)

		session["user"] = request.form.get("display-name")
		return redirect(url_for("index"))

	return render_template("name.html")

@app.route('/clear-name', methods= ['POST', 'GET'])
def clear_name():
	session.clear()
	return redirect(url_for('login'))


@app.route('/add-channel', methods=['POST'])
def add_channel():
	error = ""
	#TODO form error handling- empty value, lenght up to 60characters??, escape special characters
	channelName = request.form.get("name")

	#ensure channel name doesn't exist
	for channel in channels:
		if channelName == channel['name']:
			error = f"Channel with name \'{channelName}\' already exists!"
			return jsonify({'status': 400,'error': error,})

	newChannel = Channel(channelName)
	channels.append(newChannel.serialize())
	print(channels, file=sys.stderr)
	#TODO preparing the response
	return jsonify({'status': 200,'channels': channels,})


@socketio.on("submit channel")
def submit_channel(data):
	print("Sucessful emit for submitted channel!", file=sys.stderr)
	aNewChannel = data["aNewChannel"]
	print(aNewChannel, file=sys.stderr)
	emit("announce new channel", aNewChannel, broadcast=True)
