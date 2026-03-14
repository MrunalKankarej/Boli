# English Together — Flask App

A mobile-friendly English learning app for immigrant refugees.
Minimal text, picture-based, audio-enhanced.

## Project Structure

```
english_app/
├── app.py                  # Flask application & routes
├── data.py                 # All lesson data (categories, modules, scenarios)
├── requirements.txt
├── templates/
│   └── index.html          # Jinja2 template (single page)
└── static/
    ├── css/
    │   └── main.css        # All styling
    └── js/
        ├── audio.js        # Web Audio API sound effects + TTS
        ├── ui.js           # Reusable DOM component builders
        ├── screens.js      # One render function per screen
        └── app.js          # State machine + screen routing
```

## Setup & Run

```bash
# 1. Create a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the development server
python app.py
```

Then open **http://localhost:5000** in your browser (or on mobile via your local IP).

## App Flow

```
Start Screen
  └─▶ Category Selection  (Caregiver / Basic Education / Graduate)
        └─▶ Module Type    (Study English / Work Skills)
              └─▶ Scenario Grid  (Traffic, School, Grocery, Retail, Hospital, Transport)
                    └─▶ Learning Screen  (word quiz + TTS + mic practice)
                          └─▶ Completion Screen  ──▶ back to Scenario Grid
```

## API Endpoints

| Method | Path             | Returns            |
|--------|------------------|--------------------|
| GET    | /                | Rendered HTML page |
| GET    | /api/categories  | JSON array         |
| GET    | /api/modules     | JSON array         |
| GET    | /api/scenarios   | JSON array         |

## Adding New Scenarios

Edit `data.py` — add a new dict to the `SCENARIOS` list with:
- `id`, `img` (Unsplash URL), `title`, `emoji`, `color`, `bg`
- `lessons`: list of `{word, phrase, choices[4]}`

The UI picks it up automatically — no other files need to change.
