# 터널 라이닝 모델 생성
라이닝 중심선을 추출한 dxf 파일을 import 한 뒤, 해당 정보를 이용하여 터널 라이닝 해석을 위한 구조해석 모델을 생성합니다.

## 세부 사항 
- “콘크리트 라이닝 세부 설계기준(한국도로공사, 2016)” 에 제시된 라이닝 설계 기준을 바탕으로 모델을 생성합니다.

- 지반반력계수를 산정하기 위한 지반 탄성계수와 포아송비를 입력합니다.

- 단부 경계조건을 ‘힌지’ 또는 ‘스프링’으로 선택합니다.

[사용법 영상 다운로드](https://api.media.atlassian.com/file/07b93b0f-1f98-418a-b8b4-6a388ed8fcd4/artifact/video_1280.mp4/binary?client=01baa4cf-df4f-479a-a1c0-ee6fac240204&collection=contentId-3351216336&max-age=2592000&token=eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIwMWJhYTRjZi1kZjRmLTQ3OWEtYTFjMC1lZTZmYWMyNDAyMDQiLCJhY2Nlc3MiOnsidXJuOmZpbGVzdG9yZTpjb2xsZWN0aW9uOmNvbnRlbnRJZC0zMzUxMjE2MzM2IjpbInJlYWQiXX0sImV4cCI6MTcxOTMxMTE2OSwibmJmIjoxNzE5MzA4Mjg5fQ.G1XFz_JYK2WomszjmFavyb39DLhFKnWsjLlG5tFhJcs)