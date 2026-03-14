from flask import Flask, render_template, jsonify
from data import CATEGORIES, MODULES, SCENARIOS

app = Flask(__name__)


@app.route("/")
def index():
    return render_template(
        "index.html",
        categories=CATEGORIES,
        modules=MODULES,
        scenarios=SCENARIOS,
    )


@app.route("/api/categories")
def get_categories():
    return jsonify(CATEGORIES)


@app.route("/api/modules")
def get_modules():
    return jsonify(MODULES)


@app.route("/api/scenarios")
def get_scenarios():
    return jsonify(SCENARIOS)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
