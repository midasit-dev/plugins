<!-- markdownlint-disable-next-line -->
<br />
<p align="center">
  <a href="https://midasit.com/" rel="noopener" target="_blank"><img width="150" src="https://raw.githubusercontent.com/midasit-dev/moaui-fixed-repo/main/svg/logo_circle_30p.svg" alt="moaui logo"></a>
</p>

# 터널 라이닝 모델 생성
라이닝 중심선을 추출한 dxf 파일을 import 한 뒤, 해당 정보를 이용하여 터널 라이닝 해석을 위한 구조해석 모델을 생성합니다.
<br />

## Details
### version 1.0.0
- “콘크리트 라이닝 세부 설계기준(한국도로공사, 2016)” 에 제시된 라이닝 설계 기준을 바탕으로 모델을 생성합니다.

- 지반반력계수를 산정하기 위한 지반 탄성계수와 포아송비를 입력합니다.

- 단부 경계조건을 ‘힌지’ 또는 ‘스프링’으로 선택합니다.
