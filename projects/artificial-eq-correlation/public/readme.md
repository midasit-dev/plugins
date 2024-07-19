<!-- markdownlint-disable-next-line -->
<br />
<p align="center">
  <a href="https://midasit.com/" rel="noopener" target="_blank"><img width="150" src="https://raw.githubusercontent.com/midasit-dev/moaui-fixed-repo/main/svg/logo_circle_30p.svg" alt="moaui logo"></a>
</p>

# 인공지진파 상관계수 검토
- 입력된 인공지진파(Time History Functions)에 대한 상관계수 검토를 실시합니다.
- midas Civil 에 입력 된 Time History Functions 중 상관계수 검토를 실시할 함수들을 선택합니다.
- 상관계수 검토의 기본 값은 0.16이며, 사용자가 변경 할 수 있습니다.
<br />

## Details
### version 1.0.0
- 플러그인 실행 시, 입력된 Time History Function 들이 불러와집니다. (Refresh 가능)
- **Calculate** 버튼을 누르면 상관계수 검토를 실시 할 수 있습니다.
- 입력한 상한값보다 상관계수가 작을 경우 파란색으로, 클 경우 빨간색으로 값을 확인 할 수 있습니다.
- 결과 중 **"NG"** 는 상관계수를 검토할 수 없음을 의미합니다. 
- 상관계수를 검토할 두 Time History Function 의 데이터 개수가 일치하는지 확인하시기 바랍니다. 