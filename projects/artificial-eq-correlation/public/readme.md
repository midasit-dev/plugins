# 인공지진파 상관계수 검토
- 인공지진파 (Time History Functions) 간의 상관계수를 검토합니다.
<br />

## Details <br />
- Midas Civil 내 입력된 Time History Functions 를 가져옵니다. <br />
- 상관계수를 검토할 Time History Function 들을 체크합니다. <br />
- Target 은 상관계수 상한값으로, default로 0.16 입니다. <br />
- 검토 결과 중 "NG" 는 상관계수를 검토할 수 없음을 의미합니다. 이 경우 시간이력데이터의 step 수를 확인해주세요. <br />
- 두 인공지진파의 상관계수가 Target 값보다 작을 경우 파란색으로, Target 값보다 클 경우 빨간색으로 상관계수를 확인 할 수 있습니다. <br />

### version 1.0.0 <br />
