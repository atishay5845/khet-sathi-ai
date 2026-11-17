# KhetSathi AI — Agricultural Advisory Control Room

A full-stack, multi-agent agricultural information application for the CSE476 Agentic AI and Intelligent Automation project. KhetSathi AI brings together weather, mandi observations, crop-stage guidance and government scheme references through a shared blackboard workflow.

## What's included

- **React + Vite + Tailwind CSS** frontend with a responsive agricultural SaaS dashboard.
- **FastAPI + Python** backend with REST endpoints and Server-Sent Events for live agent progress.
- **Seven separate agent modules:** Intake, Weather, Market, Scheme, Crop, Risk Alert and Advisor Coordinator.
- **Shared blackboard:** every specialist reads the farmer profile and writes its own findings to the same run state.
- **Microsoft Agent Framework + Gemini connector:** each agent can use an Agent Framework `ChatAgent` when `GOOGLE_API_KEY` is configured. Deterministic Python tools still run first and remain auditable. Without a key, deterministic demo mode remains usable.
- **RAG:** local scheme references are chunked and retrieved through ChromaDB with Sentence Transformers embeddings, with a lexical fallback if the embedding model cannot be downloaded.
- **SQLite persistence:** advisory reports and append-only agent events.
- **Data integrations:** Open-Meteo weather/geocoding; optional data.gov.in / AGMARKNET market integration.
- **Tests and demo notebook:** at least three scenarios are included.

## Prerequisites

- Node.js 20+ and npm
- Python 3.11+
- Internet connection for package installation, Open-Meteo, model downloads, and optional Gemini/market APIs

## Quick start (Windows)

### 1. Backend

Open PowerShell in `khetsathi-ai/backend`:

```powershell
py -3.11 -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt --pre
Copy-Item .env.example .env
uvicorn app.main:app --reload --port 8000
```

The first ChromaDB / Sentence Transformers retrieval may download `all-MiniLM-L6-v2`. If that download is unavailable, the scheme retriever uses its lexical fallback.

### 2. Frontend

Open a second PowerShell window in `khetsathi-ai/frontend`:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Open `http://localhost:5173`.

## Quick start (macOS / Linux)

Backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt --pre
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Frontend in a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Environment configuration

Edit `backend/.env` after copying `.env.example`:

| Variable | Required? | Purpose |
|---|---|---|
| `GOOGLE_API_KEY` | Optional | Enables Microsoft Agent Framework + Gemini language reasoning |
| `GOOGLE_MODEL` | Optional | Gemini model; defaults to `gemini-2.5-flash-lite` |
| `DATA_GOV_API_KEY` | Optional | data.gov.in API key for live mandi observations |
| `AGMARKNET_RESOURCE_ID` | Optional | Resource ID for the relevant current daily mandi price dataset |
| `DEMO_MODE` | Optional | Defaults to `true`; clearly labels illustrative fallback data |
| `FRONTEND_ORIGIN` | Optional | CORS origin, defaults to the Vite development server |

The current Microsoft Agent Framework Gemini connector uses `GOOGLE_API_KEY` and `GOOGLE_MODEL`. The connector is a pre-release integration in the published package, so install with `pip install -r requirements.txt --pre`.

Open-Meteo does not require an API key for its free non-commercial API. If the weather service cannot be reached and `DEMO_MODE=true`, the application may display illustrative forecast data with a visible sample label. With `DEMO_MODE=false`, it reports that the source is unavailable instead.

For mandi data, the app calls the official data.gov.in resource only when both `DATA_GOV_API_KEY` and `AGMARKNET_RESOURCE_ID` are configured. Otherwise it uses a small, clearly marked illustrative dataset when demo mode is enabled. Do not present demo prices as live market prices.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Service and Agent Framework status |
| GET | `/api/weather?location=Ludhiana,%20Punjab` | Weather and five-day outlook |
| POST | `/api/advisories` | Run the full advisory workflow |
| POST | `/api/advisories/stream` | Stream agent activity and final result as SSE |
| GET | `/api/advisories/{run_id}` | Retrieve an advisory and saved agent events |
| GET | `/api/history` | Retrieve saved advisory history |
| GET | `/api/market/prices` | Mandi price observations |
| GET | `/api/market/trends` | Price trend series |
| GET | `/api/schemes?q=...` | Search the local scheme RAG library |

Interactive API docs are available at `http://localhost:8000/docs`.

## Architecture overview

1. Intake Agent validates and normalizes crop, location, crop stage and land area.
2. Weather, Market and Scheme agents run as independent workers and post their findings to the shared blackboard.
3. Crop and Risk Alert agents consume the forecast and farmer context, then post field guidance and risk signals.
4. Advisor Coordinator reads the entire blackboard, validates whether key sections are available, and generates the final advisory.
5. Reports and execution events are persisted in SQLite. The frontend receives live events over SSE.

Each agent module calls at least two Python tool functions. Tools live under `backend/app/tools` and are directly callable, independently testable functions.

## RAG knowledge base

The included `backend/data/schemes/*.md` files are starter orientation references with official portal links. For a stronger academic submission, add current official scheme PDFs from government portals to `backend/data/schemes` and extend the ingestion routine to extract PDF pages with PyMuPDF. The current retrieval function indexes local Markdown passages using ChromaDB + Sentence Transformers, and falls back to lexical retrieval if embeddings are unavailable.

Do not describe the included orientation summaries as complete official scheme rules. Eligibility is labelled as a potential match and must be checked against current official notifications and the relevant department.

## Tests

From `backend/` with the virtual environment active:

```bash
pip install pytest
pytest -q
```

The tests cover a normal crop guidance case, heavy-rain risk detection, and a rising mandi price series.

## Demo notebook

Open `backend/notebooks/demo.ipynb` from the `backend/` directory in Jupyter. It runs an example Wheat advisory and prints the full structured report. Install Jupyter with `pip install jupyter` if needed.

## Notes and limitations

- Initial crop coverage is Wheat and Paddy; stage rules are conservative starter guidance, not a replacement for current local package-of-practice recommendations.
- Market demo values are illustrative. Official live market integration needs the correct data.gov.in API key and resource ID.
- Scheme documents are local retrieval inputs; current eligibility and benefit details must be verified on official portals.
- The application is informational. It does not diagnose crop disease, guarantee yields, approve government benefits, or provide guaranteed sell/hold advice.
- No user login is included in this starter build.

## Project structure

```text
khetsathi-ai/
├── frontend/                 # React, Vite, Tailwind, Recharts
├── backend/
│   ├── app/agents/            # Seven specialist agent modules
│   ├── app/tools/             # Plain Python tools
│   ├── app/orchestration/     # Blackboard and workflow
│   ├── app/rag/               # RAG extension point
│   ├── app/api/               # FastAPI endpoints
│   ├── data/schemes/          # Local retrieval documents
│   ├── tests/                 # Scenario tests
│   └── notebooks/             # Runnable demo notebook
└── docs/                      # Architecture notes
```
