from flask import Flask, render_template, jsonify, request
import os
import json

# optional .env support for local development keys
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

try:
    import requests
except ImportError:
    requests = None

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


def _local_feedback(user_text, target_text):
    user = user_text.strip().lower()
    target = target_text.strip().lower()
    if not user:
        return {"correct": False, "feedback": "I didn’t hear you clearly. Please try again."}

    fw = "";
    if user == target:
        fw = "Great! You said it correctly."
    elif target in user:
        fw = "Good try — you got it mostly right. Focus on clarity and exact words."
    else:
        fw = "Close. Try speaking more slowly and clearly to match the phrase."

    # simple character similarity
    from difflib import SequenceMatcher
    score = int(SequenceMatcher(None, user, target).ratio() * 100)
    return {"correct": score >= 80, "feedback": f"{fw} (confidence: {score}%)", "score": score}


def _parse_etsy_response_text(text, fallback_title, fallback_price):
    import re
    title = fallback_title
    description = ""
    tags = ""

    # Sometimes the model returns plain blocks with key labels.
    title_match = re.search(r"(?mi)^\s*title\s*[:\-]\s*(.+)$", text)
    desc_match = re.search(r"(?mi)^\s*description\s*[:\-]\s*(.+)$", text)
    tags_match = re.search(r"(?mi)^\s*tags\s*[:\-]\s*(.+)$", text)

    if title_match:
        title = title_match.group(1).strip().strip('"')
    if desc_match:
        description = desc_match.group(1).strip().strip('"')
    if tags_match:
        tags = tags_match.group(1).strip().strip('"')

    if not description:
        # one final attempt: take text after the title line
        lines = text.splitlines()
        if len(lines) > 1:
            description = ' '.join(lines[1:]).strip()

    return {
        "title": title,
        "description": description or f"{fallback_title} for {fallback_price}. Good quality.",
        "tags": tags or "handmade,etsy,small-business",
    }


def _extract_json_block(text):
    start = text.find('{')
    end = text.rfind('}')
    if start >= 0 and end > start:
        try:
            return json.loads(text[start:end+1])
        except Exception:
            pass
    return None


@app.route("/api/feedback", methods=["POST"])
def get_pronunciation_feedback():
    data = request.get_json(silent=True) or {}
    user_text = (data.get("userText") or "").strip()
    target_text = (data.get("targetText") or "").strip()

    if not target_text:
        return jsonify({"correct": False, "feedback": "Missing target phrase."}), 400

    api_key = os.environ.get("GEMINI_API_KEY", "").strip()

    if not api_key or not requests:
        return jsonify(_local_feedback(user_text, target_text))

    prompt = (
        f"You are an English pronunciation tutor.\n"
        f"Expected phrase: \"{target_text}\"\n"
        f"Learner said: \"{user_text or '<empty>'}\"\n"
        "Give concise feedback as JSON with fields: feedback, score, correct (true/false)."
    )

    # Public Gemini/Bison text-generation endpoint with API key
    model = os.environ.get("GEMINI_MODEL", "text-bison-001")
    url = f"https://generativelanguage.googleapis.com/v1beta2/models/{model}:generate?key={api_key}"

    payload = {
        "prompt": {"text": prompt},
        "temperature": 0.3,
        "maxOutputTokens": 160,
    }

    try:
        r = requests.post(url, json=payload, timeout=12)
        r.raise_for_status()
        reply = r.json()
        text = ""
        if "candidates" in reply and reply["candidates"]:
            text = reply["candidates"][0].get("output", "").strip()
        elif "output" in reply and "text" in reply["output"]:
            text = reply["output"]["text"].strip()

        # Try to parse JSON from model answer; fallback to local heuristic
        try:
            parsed = json.loads(text)
            return jsonify(parsed)
        except Exception:
            pass

        # fallback: map non-JSON response into simple object
        score = _local_feedback(user_text, target_text)["score"]
        correct = score >= 80
        return jsonify({"correct": correct, "score": score, "feedback": text or "Great effort!"})

    except Exception as exc:
        print("Gemini feedback error:", exc)
        return jsonify(_local_feedback(user_text, target_text))


@app.route("/api/etsy-description", methods=["POST"])
def create_etsy_description():
    data = request.get_json(silent=True) or {}
    product_name = (data.get("productName") or "").strip()
    price = (data.get("price") or "").strip()
    has_image = bool(data.get("hasImage", False))

    if not product_name or not price:
        return jsonify({"error": "Missing product name or price."}), 400

    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    model = os.environ.get("GEMINI_MODEL", "text-bison-001")

    price_label = f"CAD ${price}" if price else ""
    prompt = (
        "You are a friendly tutor for a learner with minimal English.\n"
        "Create an Etsy product listing text for a small shop seller.\n"
        f"Product name: {product_name}\n"
        f"Price: {price_label}\n"
        f"Image included: {'yes' if has_image else 'no'}\n"
        "Write output as JSON with keys: title, description, tags (comma-separated).\n"
        "Keep sentences short, easy to read, no complex words.\n"
        "Return only JSON, no extra text."
    )

    if not api_key or not requests:
        # fallback if no Gemini available
        return jsonify({
            "title": product_name,
            "description": f"{product_name} for ${price}. Good quality and value.",
            "tags": "handmade,small business,etsy",
        })

    url = f"https://generativelanguage.googleapis.com/v1beta2/models/{model}:generate?key={api_key}"
    payload = {
        "prompt": {"text": prompt},
        "temperature": 0.3,
        "maxOutputTokens": 220,
    }

    try:
        r = requests.post(url, json=payload, timeout=20)
        r.raise_for_status()
        reply = r.json()
        text = ""
        if "candidates" in reply and reply["candidates"]:
            text = reply["candidates"][0].get("output", "").strip()
        elif "output" in reply and "text" in reply["output"]:
            text = reply["output"]["text"].strip()

        # try parse JSON directly
        parsed = None
        try:
            parsed = json.loads(text)
        except Exception:
            parsed = _extract_json_block(text)

        if parsed and isinstance(parsed, dict):
            return jsonify({
                "title": parsed.get("title", product_name),
                "description": parsed.get("description", ""),
                "tags": parsed.get("tags", ""),
                "modelText": text,
            })

        # fallback to heuristics for loose text
        parsed = _parse_etsy_response_text(text, product_name, price_label)
        parsed["modelText"] = text
        parsed["notice"] = "Used fallback parsing from Gemini output."
        return jsonify(parsed)

    except Exception as exc:
        print("Gemini etsy error:", exc)
        return jsonify({
            "title": product_name,
            "description": f"{product_name} for {price_label}. Good quality and value.",
            "tags": "handmade,etsy,small-business",
        })


if __name__ == "__main__":
    app.run(debug=False, port=5000)
