@echo off
setlocal

for /d %%d in (*) do (
    if exist %%d\package.json (
        echo Building %%d...
        cd %%d
        call npm install
        if %errorlevel% neq 0 (
            echo npm install failed in %%d
            exit /b 1
        )
        call npm run build
        if %errorlevel% neq 0 (
            echo npm run build failed in %%d
            exit /b 1
        )
        cd ..
    )
)

echo All builds completed successfully.
endlocal
