@echo off
setlocal enabledelayedexpansion

REM UTF-8로 설정
chcp 65001 > nul

REM 임시 파일 초기화 (UTF-8 인코딩으로 생성)
@REM echo. > success_dirs.txt

REM 실행할 디렉토리명을 설정
REM example) "run_dirs=dir1 dir2 dir3" or "run_dirs=all"
set "run_dirs="

REM 현재 실행 경로를 가져온다
set "current_dir=%~dp0"

if "%run_dirs%"=="" (
		REM run_dirs가 설정되지 않았을 경우 에러 메세지와 함께 종료
		echo run_dirs is not set in %current_dir%/build.bat
		exit /b 1
)

REM run_dirs가 비어있을 경우 전체 디렉토리를 처리
if "%run_dirs%"=="all" (
		REM 현재 디렉토리의 하위 디렉토리를 run_dirs에 추가
		for /d %%d in (*) do (
				set "run_dirs=!run_dirs! %%d"
		)
)

for %%d in (%run_dirs%) do (
		REM run_dirs에 포함된 디렉토리만 처리
		call :process_directory "%%d"
)

echo All builds and copies completed successfully

REM Python 스크립트를 호출하여 README.md 업데이트
call python update_readme.py

endlocal
exit /b

:process_directory
if exist "%~1\package.json" (
    echo Building %~1...
    @REM cd "%~1"
    @REM call npm install
    @REM if !errorlevel! neq 0 (
    @REM     echo npm install failed in %~1
    @REM     exit /b 1
    @REM )
    @REM call npm run build
    @REM if !errorlevel! neq 0 (
    @REM     echo npm run build failed in %~1
    @REM     exit /b 1
    @REM )
    @REM echo Copying build to ..\..\docs\%~1...
    @REM xcopy build\* "..\..\docs\%~1\" /s /e /y
    @REM if !errorlevel! neq 0 (
    @REM     echo Copy failed in %~1
    @REM     exit /b 1
    @REM )
    @REM cd ..
    REM 성공한 디렉토리를 UTF-8 인코딩으로 success_dirs.txt에 추가
    echo %~1 >> success_dirs.txt
)
exit /b 0
