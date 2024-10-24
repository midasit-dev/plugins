**Intro**
---------

KDS 기준에 따라 인공합성 지진파의 상관계수를 검토 할 때 활용합니다.

midas Civil 에 입력 된 인공지진파(Time History Function) 간의 상관계수를 검토합니다.

상관계수 상한치(기본값 0.16)를 기준으로 판별하며, 상관계수를 검토할 수 없을 경우 ‘NG’ 를 출력합니다.

*   인공합성지진파 간의 상관계수를 별도 엑셀 없이 확인


**Version**
-----------

v 1.0.0 : 플러그인 배포

**Language**
------------

영어

**Benefits of this plugin**
---------------------------

기존의 검토 방법은 인공합성 지진파의 시간별 가속도 데이터를 엑셀에 입력 후, 엑셀 수식으로 상관계수 검토를 실시하였습니다.

본 플러그인은 입력 된 Time History Function 를 선택하여 빠르게 상관계수 검토를 실시 할 수 있으며, 결과를 테이블 형식으로 확인 가능합니다.

**How to use this plugin?**
---------------------------

<p align="center">
<img width="500" src="./assets/artificial_eq.png">
</p>

1.  **Time History Functions**  
    현재 입력된 Time History Function 들을 가져옵니다. Referesh 버튼을 통해 업데이트 할 수 있습니다.  
    상관계수를 검토할 시간이력함수들을 선택합니다.  
    
2.  **Correlation Coeeficient Target**  
    상관계수의 상한치를 입력합니다. 기본값은 0.16 입니다.  
    
3.  **Calculate**  
    Calculate 버튼을 클릭하면 상관계수 검토를 실시합니다.  
    결과는 오른쪽 아래 테이블에서 확인 할 수 있으며, 결과 확인 방법은 아래와 같습니다.  
      
    파란색 실수 : 상관계수는 상한치보다 작습니다.  
    빨간색 실수 : 상관계수는 상한치보다 큽니다.  
    NG : 상관계수를 검토할 수 없습니다. Time History Function의 데이터 개수가 달라 검토 할 수 없습니다.
    

**Note**
--------

KDS 17 10 00 내진설계 일반 - ‘인공합성 지반운동 시간이력’의 ‘두 개의 시간이력운동간의 상관계수는 0.16을 초과할 수 없다’ 라는 기준에 따라 인공 지진파의 상관계수를 검토합니다.

검토 식은 Correlation Coefficient Fomula 에 따라 검토하며, 테이블에서 결과를 확인 할 수 있습니다.

**Model File**
--------------

https://github.com/midasit-dev/plugins/tree/main/projects/artificial-eq-correlation/model

**Conclusion**
--------------

번거로운 엑셀 작업 없이 Time History Function 에서 직접적으로 상관계수 검토를 실시 할 수 있습니다.



