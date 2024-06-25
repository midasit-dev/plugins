import os
from datetime import datetime

# 현재 경로에서 success_dirs.txt 파일 읽기
with open('success_dirs.txt', 'r') as f:
    success_dirs = f.read().splitlines()

# 현재 날짜 가져오기, 시.분.초 까지 포함
current_date = datetime.now().strftime('%Y.%m.%d %H:%M:%S')
# current_date = datetime.now().strftime('%Y.%m.%d')

# README.md 파일 경로
readme_path = '../README.md'

# README.md 파일 업데이트
with open(readme_path, 'r', encoding='utf-8') as f:
    readme_contents = f.readlines()

# '## Test Static Pages' 섹션을 찾아서 제목 업데이트 및 항목 추가
new_lines = []
for line in readme_contents:
    if line.strip().startswith('## Test Static Pages'):
        new_lines.append(f'## Test Static Pages (Updated at {current_date})\n')
    else:
        new_lines.append(line)

    if line.strip() == '## Test Static Pages' or line.strip().startswith('## Test Static Pages (Updated at'):
        for dir_name in success_dirs:
            if dir_name == ' ': continue # 공백이 있으면 continue
            page_name = dir_name.replace(' ', '').title()
            page_name_lower = page_name.lower()
            new_line = f"- [{page_name}](https://midasit-dev.github.io/plugins/{page_name_lower})\n"
            new_lines.append(new_line)

# README.md 파일에 새로운 내용 쓰기
with open(readme_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
