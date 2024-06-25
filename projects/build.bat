@echo off
setlocal enabledelayedexpansion

REM UTF-8로 설정
chcp 65001 > nul

REM 임시 파일 초기화 (UTF-8 인코딩으로 생성)
echo. > success_dirs.txt

for /d %%d in (*) do (
    if exist "%%d\package.json" (
        echo Building %%d...
        cd "%%d"
        call npm install
        if !errorlevel! neq 0 (
            echo npm install failed in %%d
            exit /b 1
        )
        call npm run build
        if !errorlevel! neq 0 (
            echo npm run build failed in %%d
            exit /b 1
        )
        echo Copying build to ..\..\docs\%%d...
        xcopy build\* "..\..\docs\%%d\" /s /e /y
        if !errorlevel! neq 0 (
            echo Copy failed in %%d
            exit /b 1
        )
				cd ..
        REM 성공한 디렉토리를 UTF-8 인코딩으로 success_dirs.txt에 추가
				echo Adding a %%d to success_dirs.txt ...
        echo %%d >> success_dirs.txt
    )
)

echo All builds and copies completed successfully.

REM Python 스크립트를 호출하여 README.md 업데이트
call python update_readme.py

endlocal
