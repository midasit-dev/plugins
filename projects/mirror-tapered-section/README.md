**Intro**
---------

Tapered Section의 I 단과 J 단을 바꾸어 새로운 Tapered Section 을 생성합니다.

*   동일한 local axis 를 가지기 위해 대칭 형상의 구조물에서 I 단과 J 단을 바꾸어 section 을 생성합니다.
    

**Version**
-----------

v 1.0.0 : 플러그인 배포

**Language**
------------

영어

**Benefits of this plugin**
---------------------------

![image-20240717-054215.png](attachments/3431628874/3431759948.png?width=760)

위와 같이 변단면을 가진 코핑부의 local axis를 일치시키기 위해, I, J 단의 section 을 바꾸어 tapered section을 생성합니다. (coping 1-1 / coping 1-2)

본 플러그인은 대칭 형상에서 한쪽의 tapered section 을 생성한 뒤, I 단과 J 단을 바꾸어 새로운 tapered section 을 구성하여 빠르게 단면을 생성할 수 있습니다.

**How to use this plugin?**
---------------------------


1.  **Tapered Section List**  
    현재 입력된 Tapered Section 들을 가져옵니다. Referesh 버튼을 통해 업데이트 할 수 있습니다.  
    Mirror 할 단면을 선택합니다.  
    
2.  **New Section Name Tag**  
    새롭게 생성될 단면 이름 뒤에 붙일 tag를 입력합니다.  
    예를 들어 A 단면을 선택했다면, A\_Mirror 로 새로운 Tapered 단면이 생성됩니다.  
    
3.  **Generate**  
    새로운 Tapered 단면을 생성합니다.
    

**Note**
--------

Section 중 Tapered 형식으로 생성된 단면에 대해서 Mirror 기능을 제공합니다. Tapered Value, User, DB 단면 모두 가능합니다.

**Model File**
--------------


**Conclusion**
--------------

대칭 형상에서의 Tapered 단면에 대해서 I, J 단을 바꾸어 가며 단면을 생성하지 않아도, Mirror 기능을 통해 쉽게 단면을 생성할 수 있습니다.

