# About plugin development
우리 소프트웨어의 플러그인 개발에 대한 안내 문서입니다.  
이 문서에서는 플러그인 개발에 필요한 환경, 언어, 라이브러리, API에 대한 정보를 제공 합니다.

<br />

## 개발 환경

>기본적인 개발 환경은 웹 베이스로, 최신 웹 기술과의 통합을 위한 유연성을 제공하고 있습니다.  
주 구성 요소는 다음과 같습니다.

### 🧩 프로그래밍 언어

- **Node.js**: API 상호작용 및 백그라운드 프로세스를 처리하기 위해 Node.js를 사용합니다.
- **TypeScript**: 타입 안전성을 제공하며 확장 가능하고 유지 관리가 용이한 코드를 작성하기 위해 기본적으로 TypeScript를 활용합니다.
- **JavaScript**: 물론, Javascript를 사용해도 문제는 없습니다.

<br />

### ⚛️ 프레임워크 및 라이브러리

- **React**: React를 사용하여 사용자 인터페이스를 구축합니다. React는 상호작용적이고 반응적인 웹 구성 요소를 만드는 데 적합합니다.
- **Pyscript**: Pyscript를 사용하여 Python 코드를 플러그인에 통합할 수 있습니다. 이를 통해 JavaScript 및 TypeScript와 함께 Python 함수를 사용할 수 있습니다.

<br />

### 📡 API 통합

플러그인은 MIDAS API를 통해 MIDAS 제품군과 통신합니다.  
제공된 API 엔드포인트를 활용하여 데이터에 접근하고 작업을 수행하며,  
플러그인과 시스템 간의 원활한 상호작용을 보장합니다.

<br />

## 개발 워크플로우

![alt](/assets/workflow.png)

추천드리는 워크 플로우는 2가지 입니다.  

<br />

### 📦 Template을 이용한 방식

개발 편의를 위한 코드들이 포함된 템플릿을 설치하여 바로 코드 작성을 시작할 수 있습니다.  

1. **install template**: VSCode에서 터미널을 열고 아래 명령을 실행 합니다. (제작된 [템플릿](https://www.npmjs.com/package/@midasit-dev/cra-template-moaui)을 설치 합니다.)
```cli
$ npx create-react-app my-plugin-app --template @midasit-dev/cra-template-moaui
```
2. **start react / dev mode**: 추가로 터미널에 아래 명령을 실행하면 바로 시작할 수 있습니다.

```cli
$ npm run start
```
```cli
$ npm run dev
```

<br />

### ⚛️ CRA 설치를 통한 방식

React 혹은 웹 개발에 능숙하다면, 제공되는 UI 라이브러리만을 설치하고 자유롭게 개발을 시작할 수 있습니다.  

1. **install CRA**: VSCode에서 터미널을 열고 아래 명령을 실행 합니다. (React에서 제공하는 CRA 템플릿을 설치 합니다.)
```cli
$ npx create-react-app my-plugin-app --template typescript
```

2. **install lib**: UI 라이브러리인 [@midasit-dev/moaui](https://www.npmjs.com/package/@midasit-dev/moaui)를 설치 합니다. (추가적인 라이브러리 설치는 자유 입니다.)
```cli
$ npm install @midasit-dev/moaui
```

3. **start a react**: 아래 명령을 통해 개발을 시작할 수 있습니다.
```cli
$ npm run start
```

<br />

## 시작하기

플러그인 개발을 시작하려면, 위에 제시된 워크플로우 중에 하나를 선택하여 시작 하세요.  

### 레퍼런스
- 제품에서 사용 가능한 [API 문서](https://midas-support.atlassian.net/wiki/spaces/MAW/pages/163184737/JSON+Manual)를 참조하여 사용 가능한 엔드포인트 및 통합 지침에 대한 자세한 정보를 확인하세요.
- 사용 가능한 추가 컴포넌트에 대한 정보는 [moaui docs](https://midasit-dev.github.io/moaui)를 참고 하시면 됩니다.
- 기존에 작성되었던 [개발 코드](https://github.com/midasit-dev/plugins/tree/main/projects)들을 참고하는 것도 좋습니다.


질문이 있거나 추가 지원이 필요하시면 [📧 developers@midasit.com](mailto:developers@midasit.com)으로 개발팀에 문의해 주세요.
