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

SYSTEM_USER = "FlackBot"
global systemUser
systemUser = User(SYSTEM_USER)

global channels
channels = []


def display_name_required(f):
	@wraps(f)
	def decorated_function(*args, **kwargs):
		if not session.get("user"):
			return redirect(url_for("login")) 
		return f(*args, **kwargs)
	return decorated_function

@app.route("/")
@display_name_required
def index():
	return render_template("flack.html", channels = channels)

@app.route("/login", methods = ['POST', 'GET'])
def login():
	if session.get("user"):
		return redirect(url_for("index"))

	if request.method == "POST":
		if request.form.get("display-name") == None:
			error = "Display Name is required my friend!"
			return render_template("name.html", error = error)
		
		for user in User._registry:
			if user == request.form.get("display-name"):
				error = f"Display name already exists!"
				return render_template("name.html", error = error)

		newUser = User(request.form.get("display-name"))
		session["user"] = newUser
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
			return jsonify ({'status': 400,'error': error,})

	#create channel
	newChannel = Channel(channelName)
	newChannel.created_by(session.get("user"))
	newChannel.add_user(session.get("user"))
	print(session.get("user"), file=sys.stderr)
	newChannel.add_message(f"{session.get('user').user} created \"{channelName}\"!", systemUser)
	newChannel.add_message(f"{session.get('user').user} joined \"{channelName}\"!", systemUser)
	channels.append(newChannel.serialize())
	print(channels, file=sys.stderr)

	return jsonify({'status': 200,'channels': channels,})


@socketio.on("submit channel")
def submit_channel(data):
	aNewChannel = data["aNewChannel"]
	emit("announce new channel", {'aNewChannel': aNewChannel,}, broadcast=True, include_self=False)


@app.route('/get-channel', methods=['POST'])
def get_channel():
	for channel in channels:
		if request.form.get("channelName") == channel['name']:
			return jsonify({'status':200, 'channel': channel})
	return jsonify({'status': 404, 'error': "Channel doesn't exist!"})

@app.route('/add-message', methods=['POST'])
def add_message():
	return jsonify({'status': 200,'message': "Yohohoohoohohoo! Your message is added!"})

@socketio.on("submit message")
def submit_message(data):
	messageText = data["text"]
	messageUser = session.get("user")
	channel = data["channel"]
	aNewMessage = Channel.add_message(messageText, messageUser)
	emit("announce new message", aNewMessage.serialize, broadcast=True, include_self=False)
