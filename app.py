from flask import Flask, render_template, session, redirect, url_for, g, request
from database import get_db, close_db
from flask_session import Session
from werkzeug.security import generate_password_hash, check_password_hash
from form import LoginForm, RegistrationForm
from functools import wraps

app = Flask(__name__)
app.config["SECRET_KEY"] = "1"
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

@app.route("/")
def index():
    if session.get("username") is not None:
        nav = 2
    else:
        nav = 1
    return render_template("index.html", session = nav)

@app.route("/game")
def game():
    if session.get("username") is not None:
        nav = 2
    else:
        nav = 1
    return render_template("game.html", session = nav)

@app.route("/login", methods=["POST","GET"])
def login():
    nav = 1
    form = LoginForm()
    if form.validate_on_submit():
        username = form.username.data
        password = form.password.data
        db = get_db()
        clashing_user = db.execute("""SELECT * FROM users WHERE username = ?;""", ([username])).fetchone()
        if clashing_user is None:
            form.username.errors.append("Username does not exist!")
        elif not check_password_hash(clashing_user["password"], password):
            form.password.errors.append("Incorrect password!")
        else:
            session.clear()
            session["username"] = username
            next_page = request.args.get("next")
            if not next_page:
                next_page = url_for("game")
            return redirect(next_page)
    return render_template("login.html", form=form, session = nav)

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("index"))

@app.route("/register", methods=["POST","GET"])
def register():
    nav = 1
    form = RegistrationForm()
    if form.validate_on_submit():
        username = form.username.data
        password = form.password.data
        db = get_db()
        if len(username) > 8:
            form.username.errors.append("Username is too long (Maximum 8 Characters)")
            return render_template("register.html", form=form, session = nav)
        clashing_user = db.execute("""SELECT * FROM users WHERE username = ?;""", ([username])).fetchone()
        if clashing_user is not None:
            form.username.errors.append("Username is already in use")
        else:
            db.execute("""INSERT INTO users (username, password) VALUES (?, ?);""", (username, generate_password_hash(password)))
            db.commit()
            return redirect(url_for("login"))
    return render_template("register.html", form=form, session = nav)

@app.route("/store_score", methods=["POST"])
def store_score():
    score = int(request.form["score"])
    if session.get("username") is not None:
        db = get_db()
        username = session["username"]
        db.execute("""INSERT INTO scoreboard (username, score) VALUES (?, ?);""", (username, score))
        db.commit()
        return "success"
    else: 
        return "fail"

@app.route("/scoreboard")
def scoreboard():
    if session.get("username") is not None:
        nav = 2
    else:
        nav = 1
    db = get_db()
    scores = db.execute("""SELECT * FROM scoreboard ORDER BY score DESC;""").fetchmany(10)
    return render_template("scoreboard.html", scores = scores, session = nav)
 