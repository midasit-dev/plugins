### do not delete this import scripts ###
### py_main.py 에서 쓰는 상수와 신규 레코드 템플릿. 로직은 담지 않는다. ###

DEFAULT_DEFORM= [[ 0.5, 1, 2, 4, 8],[ 0.5, 1, 2, 4, 8]]

# tableType "1"에서 강성비 자리를 채울 값. TEMPLATE placeholder 슬롯과 같은 값을 쓴다.
DEFAULT_STIFFRATIO = [0.1, 0.1]

# required 이지만 실제 입력이 없는 자리에 넣는 placeholder.
# 실제 모델의 레코드가 담고 있는 값과 동일하다.
DEFAULT_FORCE = [1, 1]
DEFAULT_CRACK = [0.5, 0.5]
DEFAULT_DISP_2ND = [0.2, 0.2]
DEFAULT_DISP_3RD = [0.3, 0.3]

TEMPLATE =  {
  "DESC": "",
  "DEFINITION": "SKEL",
  "INTERACTION_TYPE": "NONE",
  "LOCATION": "I",
  "USEIEHCLOCATION": "AUTO",
  "EXIST_IJ_PROP": [
      False,
      False,
      False,
      False,
      False,
      False,
      False
  ],
  "MULT_DATA": [],
  "SECTION_NUM": [
      3,
      3,
      3,
      3,
      3,
      3
  ],
  "ALL_PROP": [
      {
          "KINEMA": {
              "SYMMETRIC": 0,
              "YIELDSTRENGTHOPT": 1,
              "DEFORMDEFINETYPE": 1,
              "INITSTIFFNESS": 1,
              "PALPHADELTA": 0,
              "COMPONENTPROPS": {
                  "CRACKFORCE": [
                      0.5,
                      0.5
                  ],
                  "CRACKMOMENT": [
                      0.5,
                      0.5
                  ],
                  "YIELDFORCE": [
                      1,
                      1
                  ],
                  "YIELDMOMENT": [
                      1,
                      1
                  ],
                  "ULTIMATEFORCE": [
                      1,
                      1
                  ],
                  "ULTIMATEMOMENT": [
                      1,
                      1
                  ],
                  "YIELDDISP1ST": [
                      0.1,
                      0.1
                  ],
                  "YIELDROTN1ST": [
                      0.1,
                      0.1
                  ],
                  "YIELDDISP2ND": [
                      0.2,
                      0.2
                  ],
                  "YIELDROTN2ND": [
                      0.2,
                      0.2
                  ],
                  "YIELDDISP3RD": [
                      0.3,
                      0.3
                  ],
                  "YIELDROTN3RD": [
                      0.3,
                      0.3
                  ],
                  "STIFFRATIO2ND": [
                      0.1,
                      0.1
                  ],
                  "STIFFRATIO1ST": [
                      0.5,
                      0.5
                  ],
                  "DEFORMCAPACITY": [
                      [
                          0.5,
                          1,
                          2,
                          4,
                          8
                      ],
                      [
                          0.5,
                          1,
                          2,
                          4,
                          8
                      ]
                  ]
              }
          }
      },
      {
          "KINEMA": {
              "SYMMETRIC": 0,
              "YIELDSTRENGTHOPT": 1,
              "DEFORMDEFINETYPE": 1,
              "INITSTIFFNESS": 1,
              "PALPHADELTA": 0,
              "COMPONENTPROPS": {
                  "CRACKFORCE": [
                      0.5,
                      0.5
                  ],
                  "CRACKMOMENT": [
                      0.5,
                      0.5
                  ],
                  "YIELDFORCE": [
                      1,
                      1
                  ],
                  "YIELDMOMENT": [
                      1,
                      1
                  ],
                  "ULTIMATEFORCE": [
                      1,
                      1
                  ],
                  "ULTIMATEMOMENT": [
                      1,
                      1
                  ],
                  "YIELDDISP1ST": [
                      0.1,
                      0.1
                  ],
                  "YIELDROTN1ST": [
                      0.1,
                      0.1
                  ],
                  "YIELDDISP2ND": [
                      0.2,
                      0.2
                  ],
                  "YIELDROTN2ND": [
                      0.2,
                      0.2
                  ],
                  "YIELDDISP3RD": [
                      0.3,
                      0.3
                  ],
                  "YIELDROTN3RD": [
                      0.3,
                      0.3
                  ],
                  "STIFFRATIO2ND": [
                      0.1,
                      0.1
                  ],
                  "STIFFRATIO1ST": [
                      0.5,
                      0.5
                  ],
                  "DEFORMCAPACITY": [
                      [
                          0.5,
                          1,
                          2,
                          4,
                          8
                      ],
                      [
                          0.5,
                          1,
                          2,
                          4,
                          8
                      ]
                  ]
              }
          }
      },
      {
          "KINEMA": {
              "SYMMETRIC": 0,
              "YIELDSTRENGTHOPT": 1,
              "DEFORMDEFINETYPE": 1,
              "INITSTIFFNESS": 1,
              "PALPHADELTA": 0,
              "COMPONENTPROPS": {
                  "CRACKFORCE": [
                      0.5,
                      0.5
                  ],
                  "CRACKMOMENT": [
                      0.5,
                      0.5
                  ],
                  "YIELDFORCE": [
                      1,
                      1
                  ],
                  "YIELDMOMENT": [
                      1,
                      1
                  ],
                  "ULTIMATEFORCE": [
                      1,
                      1
                  ],
                  "ULTIMATEMOMENT": [
                      1,
                      1
                  ],
                  "YIELDDISP1ST": [
                      0.1,
                      0.1
                  ],
                  "YIELDROTN1ST": [
                      0.1,
                      0.1
                  ],
                  "YIELDDISP2ND": [
                      0.2,
                      0.2
                  ],
                  "YIELDROTN2ND": [
                      0.2,
                      0.2
                  ],
                  "YIELDDISP3RD": [
                      0.3,
                      0.3
                  ],
                  "YIELDROTN3RD": [
                      0.3,
                      0.3
                  ],
                  "STIFFRATIO2ND": [
                      0.1,
                      0.1
                  ],
                  "STIFFRATIO1ST": [
                      0.5,
                      0.5
                  ],
                  "DEFORMCAPACITY": [
                      [
                          0.5,
                          1,
                          2,
                          4,
                          8
                      ],
                      [
                          0.5,
                          1,
                          2,
                          4,
                          8
                      ]
                  ]
              }
          }
      },
      {
          "KINEMA": {
              "SYMMETRIC": 0,
              "YIELDSTRENGTHOPT": 1,
              "DEFORMDEFINETYPE": 1,
              "INITSTIFFNESS": 1,
              "PALPHADELTA": 0,
              "COMPONENTPROPS": {
                  "CRACKFORCE": [
                      0.5,
                      0.5
                  ],
                  "CRACKMOMENT": [
                      0.5,
                      0.5
                  ],
                  "YIELDFORCE": [
                      1,
                      1
                  ],
                  "YIELDMOMENT": [
                      1,
                      1
                  ],
                  "ULTIMATEFORCE": [
                      1,
                      1
                  ],
                  "ULTIMATEMOMENT": [
                      1,
                      1
                  ],
                  "YIELDDISP1ST": [
                      0.1,
                      0.1
                  ],
                  "YIELDROTN1ST": [
                      0.1,
                      0.1
                  ],
                  "YIELDDISP2ND": [
                      0.2,
                      0.2
                  ],
                  "YIELDROTN2ND": [
                      0.2,
                      0.2
                  ],
                  "YIELDDISP3RD": [
                      0.3,
                      0.3
                  ],
                  "YIELDROTN3RD": [
                      0.3,
                      0.3
                  ],
                  "STIFFRATIO2ND": [
                      0.1,
                      0.1
                  ],
                  "STIFFRATIO1ST": [
                      0.5,
                      0.5
                  ],
                  "DEFORMCAPACITY": [
                      [
                          0.5,
                          1,
                          2,
                          4,
                          8
                      ],
                      [
                          0.5,
                          1,
                          2,
                          4,
                          8
                      ]
                  ]
              }
          }
      },
      {
          "KINEMA": {
              "SYMMETRIC": 0,
              "YIELDSTRENGTHOPT": 1,
              "DEFORMDEFINETYPE": 1,
              "INITSTIFFNESS": 1,
              "PALPHADELTA": 0,
              "COMPONENTPROPS": {
                  "CRACKFORCE": [
                      0.5,
                      0.5
                  ],
                  "CRACKMOMENT": [
                      0.5,
                      0.5
                  ],
                  "YIELDFORCE": [
                      1,
                      1
                  ],
                  "YIELDMOMENT": [
                      1,
                      1
                  ],
                  "ULTIMATEFORCE": [
                      1,
                      1
                  ],
                  "ULTIMATEMOMENT": [
                      1,
                      1
                  ],
                  "YIELDDISP1ST": [
                      0.1,
                      0.1
                  ],
                  "YIELDROTN1ST": [
                      0.1,
                      0.1
                  ],
                  "YIELDDISP2ND": [
                      0.2,
                      0.2
                  ],
                  "YIELDROTN2ND": [
                      0.2,
                      0.2
                  ],
                  "YIELDDISP3RD": [
                      0.3,
                      0.3
                  ],
                  "YIELDROTN3RD": [
                      0.3,
                      0.3
                  ],
                  "STIFFRATIO2ND": [
                      0.1,
                      0.1
                  ],
                  "STIFFRATIO1ST": [
                      0.5,
                      0.5
                  ],
                  "DEFORMCAPACITY": [
                      [
                          0.5,
                          1,
                          2,
                          4,
                          8
                      ],
                      [
                          0.5,
                          1,
                          2,
                          4,
                          8
                      ]
                  ]
              }
          }
      },
      {
          "KINEMA": {
              "SYMMETRIC": 0,
              "YIELDSTRENGTHOPT": 1,
              "DEFORMDEFINETYPE": 1,
              "INITSTIFFNESS": 1,
              "PALPHADELTA": 0,
              "COMPONENTPROPS": {
                  "CRACKFORCE": [
                      0.5,
                      0.5
                  ],
                  "CRACKMOMENT": [
                      0.5,
                      0.5
                  ],
                  "YIELDFORCE": [
                      1,
                      1
                  ],
                  "YIELDMOMENT": [
                      1,
                      1
                  ],
                  "ULTIMATEFORCE": [
                      1,
                      1
                  ],
                  "ULTIMATEMOMENT": [
                      1,
                      1
                  ],
                  "YIELDDISP1ST": [
                      0.1,
                      0.1
                  ],
                  "YIELDROTN1ST": [
                      0.1,
                      0.1
                  ],
                  "YIELDDISP2ND": [
                      0.2,
                      0.2
                  ],
                  "YIELDROTN2ND": [
                      0.2,
                      0.2
                  ],
                  "YIELDDISP3RD": [
                      0.3,
                      0.3
                  ],
                  "YIELDROTN3RD": [
                      0.3,
                      0.3
                  ],
                  "STIFFRATIO2ND": [
                      0.1,
                      0.1
                  ],
                  "STIFFRATIO1ST": [
                      0.5,
                      0.5
                  ],
                  "DEFORMCAPACITY": [
                      [
                          0.5,
                          1,
                          2,
                          4,
                          8
                      ],
                      [
                          0.5,
                          1,
                          2,
                          4,
                          8
                      ]
                  ]
              }
          }
      },
      {},
      {}
  ],
}


