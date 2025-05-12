@echo off
echo Starting the Supply Line Insight Application with Enhanced AI Analytics...
echo.

echo Checking dependencies...
python -c "import pandas, numpy, sklearn" 2>NUL
if %ERRORLEVEL% NEQ 0 (
    echo Installing required Python dependencies...
    pip install pandas numpy scikit-learn
)

echo Creating necessary directories...
mkdir api\uploads\sample_data 2>NUL
mkdir api\uploads\processed_files 2>NUL

echo Starting Python Backend with Enhanced Analytics...
start cmd /k "cd api && python app.py"

echo Starting React Frontend...
start cmd /k "npm run dev"

echo.
echo Both servers started successfully!
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:5173
echo.
echo Your enhanced Sales AI Assistant is now ready to provide comprehensive business analytics!
echo.
echo Press any key to stop all servers...
pause > nul

echo Stopping servers...
taskkill /f /im python.exe > nul 2>&1
taskkill /f /im node.exe > nul 2>&1
echo All servers stopped.
exit 