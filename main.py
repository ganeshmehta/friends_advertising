from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("home.html")

@app.route("/about")
def about():
    return render_template("home.html")

@app.route("/testimonials")
def testimonials():
    return render_template("testimonials.html")

@app.route("/portfolio")
def portfolio():
    return render_template("home.html")

@app.route("/contact")
def contact():
    return render_template("home.html")
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)