@echo off
setlocal
cd /d "%~dp0"
echo KhetSathi AI setup
if not exist backend\.venv (
  py -3.11 -m venv backend\.venv
)
call backend\.venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r backend\requirements.txt --pre
if not exist backend\.env copy backend\.env.example backend\.env
start "KhetSathi Backend" cmd /k "cd /d "%~dp0backend" && .venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"
cd frontend
if not exist .env copy .env.example .env
call npm install
npm run dev
