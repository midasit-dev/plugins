# Policy

## 1. 원본 코드 업로드 정책

플러그인 프로젝트는 기본적으로 오픈 소스를 지향합니다.  
따라서 마이다스에서 자체적으로 개발한 아이템에 대해서는 [public-plugins](https://github.com/midasit-dev/plugins)에 업로드 합니다.  
다만, 내부 사정 상 코드 공개가 어려운 경우에는 [private-plugins](https://github.com/MIDASIT-Co-Ltd/plugins)에 업로드 할 수 있습니다.

- 공개용 플러그인 저장소: [public-plugins](https://github.com/midasit-dev/plugins)
- 비공개용 플러그인 저장소: [private-plugins](https://github.com/MIDASIT-Co-Ltd/plugins)

기본적으로 플러그인 아이템 사용법에 대한 README.md(메뉴얼) 파일을 필수로 작성해야 합니다.

### 🧪 Code Sample
- [원본 코드](./projects/seismic-hazard-map)
- [메뉴얼 파일](./projects/seismic-hazard-map/public/README.md)
- [아이콘 파일](./projects/seismic-hazard-map/public/favicon.ico)

## 2. 마켓 플레이스 업로드 정책

제품 내부에 탑재된 플러그인 플랫폼에 개발한 아이템을 등록하기 위해서는 몇 가지 준비가 필요합니다. 아래 파일들을 하나로 압축하여 .zip 형태로 업로드를 할 수 있습니다.

- 대표 아이콘 파일: `favicon.ico`
- 요약 설명 파일: `README.md`
- 기본 웹 베이스 파일: `index.html`, `*.css`, `*.js` 등

대표 아이콘 파일의 경우, 마켓 플레이스 상에 노출되는 대표 이미지가 됩니다. 요약 설명 파일의 경우, 마켓 플레이스에서 업로드 된 아이템을 클릭 하였을 때 보이는 상세 페이지에서 markdown 형태로 출력됩니다. 기본 웹 베이스 파일(빌드된 형태)은 실제 사용자들이 사용할 웹페이지의 기반 파일입니다.

추가로 현재 관리 목적으로 사용자가 임의로 마켓 플레이스에 아이템을 출판할 수 없도록 제한하고 있습니다. 따라서 위 정책에 따라 자료가 준비되면, 본사 개발팀에게 아이콘 및 설명 파일이 포함된 빌드 파일을 .zip 형태로 보내주시면, 기본 검수 후 마켓 플레이스에 업로드가 진행됩니다.

### 🧪 Build Sample
- [대표 아이콘 파일](./docs/seismic-hazard-map/favicon.ico)
- [요약 설명 파일](./docs/seismic-hazard-map/README.md)
- [기본 웹 베이스 파일](./docs/seismic-hazard-map/)

## 3. 아이템 개발 및 업로드 과정

코드를 개발 한 후, 마켓 플레이스에 업로드 하기 위한 시나리오는 다음과 같습니다.

### 개발 및 업로드

1. **코드 개발**
	- 원본 코드 개발

2. **빌드 파일 검증 및 피드백**
	- 개발 완성품에 대해 검증 및 피드백 진행

3. **대표 아이콘 파일 (`favicon.ico`) 제작**:
   - 마켓 플레이스 상에 노출되는 대표 이미지
   - 적절한 해상도와 파일 형식 준수

4. **요약 설명 파일 (`README.md`) 작성**:
   - 아이템에 대한 간략한 설명
   - Markdown 형식으로 작성

5. **원본 코드 및 아이콘, 설명 파일 업로드**:
	- 이전까지 작업했던 내용을 저장소에 업로드

### 빌드파일 제출 및 업로드

6. **기본 웹 베이스 파일(빌드 후 결과물)**:
   - `index.html`, 필요한 `*.css`, `*.js` 파일 등
   - 빌드된 형태의 웹페이지 파일

7. **압축 파일 생성 (`.zip`)**:
   - 위의 모든 파일을 하나의 `.zip` 파일로 압축

8. **본사 개발팀 제출**:
   - 준비된 `.zip` 파일을 본사 개발팀(developers@midasit.com)에게 전송
   - 기본 검수 후 본사에서 관리자 계정으로 마켓 플레이스에 업로드 진행

요약하자면,
원본 코드 업로드 후 빌드 된 파일을 본사 개발팀에게 보내주시면 검수 후에 업로드가 진행 됩니다.