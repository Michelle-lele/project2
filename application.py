import os
import sys

from flask import Flask, redirect, render_template, url_for, request, g, session
# from flask_socketio import SocketIO, emit
from functools import wraps
from flask_session import Session


app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config.from_envvar('APP_SETTINGS')
#socketio = SocketIO(app)

app.config["SESSION_PERMANENT"] = True
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

def display_name_required(f):
	@wraps(f)
	def decorated_function(*args, **kwargs):
		if not session.get("user"):
			print(session.get("user"), file=sys.stderr)
			return redirect(url_for("display_name"))
		#g.user = session.get("user")
		return f(*args, **kwargs)
	return decorated_function

@app.route("/")
@display_name_required
def index():
	return render_template("flack.html")

@app.route("/display-name", methods = ['POST', 'GET'])
def display_name():
	if session.get("user"):
		return redirect(url_for("index"))

	if request.method == "POST":
		if request.form.get("display-name") == None:
			error = "Display Name is required my friend!"
			return render_template("name.html", error)

		print(request.form.get("display-name"), file=sys.stderr)
		session["user"] = request.form.get("display-name")
		print(session["user"], file=sys.stderr)
		return redirect(url_for("index"))

	return render_template("name.html")

@app.route('/clear-name', methods= ['POST', 'GET'])
def clear_name():
	session.clear()
	return redirect(url_for('display_name'))