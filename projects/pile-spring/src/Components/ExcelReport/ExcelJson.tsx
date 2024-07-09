import {CalculateProperties} from '../../utils_pyscript'

function ExcelJsonResult(
  translate:any,
  projectName:any,
  piletableData:any,
  soilData:any,
  topLevel:any,
  GroundLevel:any,
  WaterLevel:any,
  GroupEffectValue:any, 
  betaNormalResult:any,
  betaPeriodResult:any,
  alphaHThetaResult:any,
  kValueNormalResult:any,
  kValueSeismicResult:any,
  KValueSeismicLiqResult:any,
  kValuePeriodResult:any,
  liquefactionState:any,
  KvResult:any,
  Matrix_Normal_X:any,
  Matrix_Normal_Z:any,
  Matrix_Seismic_X:any,
  Matrix_Seismic_Z:any,
  Matrix_Seismic_Liq_X:any,
  Matrix_Seismic_Liq_Z:any,
  Matrix_Period_X:any,
  Matrix_Period_Z:any,
){
  let reportjson_items:any = {};
  const sheetName = "report";
  //프로젝트 명
  reportjson_items["_Project"] = {
    "__ProjectName" : projectName
  }
  // 1.1 일반
  let ItemArray:any = [];
  for(let i=0; i<piletableData.length; i++){
    const TopProperty = CalculateProperties(piletableData[i], 'top', 'unreinforced')
    ItemArray.push({
      "__PileName" : '('+(i+1)+') '+ piletableData[i].pileName,
      "__TopLevel" : Number(topLevel),
      "__PileType" : translate(piletableData[i].pileType),
      "__ConstructionMethod" : translate(piletableData[i].constructionMethod),
      "__HeadCondition" : translate(piletableData[i].headCondition),
      "__BottomCondition" : translate(piletableData[i].bottomCondition),
      "__PileDia" : Number(TopProperty[3]),
      "__PileLength" : Number(piletableData[i].pileLength)
    })
  }
  reportjson_items["_General"] = ItemArray

  // 1.2 말뚝배치
  reportjson_items["_PileBatch"] = {
  }

  //1.3 말뚝 제원
  reportjson_items["_PilePropertyName"] = {
  }

  // (1) 말뚝 타입
  ItemArray = []
  for(let i =0; i<piletableData.length; i++){
    
    // [상부 말뚝 or 하부말뚝 or 단일말뚝]
    let pileType_Name = ''
    let pileType_Name2 = ''
    if (piletableData[i].compositeTypeCheck){
      pileType_Name = '상부 말뚝'
      pileType_Name2 = '하부 말뚝'
    }
    else{
      pileType_Name = '단일 말뚝'
      pileType_Name2 = '단일 말뚝'
    }

    const TopProperty = CalculateProperties(piletableData[i], 'top', 'unreinforced')
    const BottomProperty = CalculateProperties(piletableData[i], 'bottom', 'unreinforced')
    
    // 변수 정의
    let top_conc_E = 0;    let top_conc_Area = 0;    let top_conc_I = 0;
    let top_steel_E = 0;    let top_steel_Area = 0;    let top_steel_I = 0;

    let bot_conc_E = 0;    let bot_conc_Area = 0;    let bot_conc_I = 0;
    let bot_steel_E = 0;    let bot_steel_Area = 0;    let bot_steel_I = 0;

    if (piletableData[i].pileType == 'Soil_Cement_Pile'){
      top_steel_E = TopProperty[6];    top_steel_Area = TopProperty[4];    top_steel_I = TopProperty[8];
      top_conc_E = TopProperty[7];    top_conc_Area = TopProperty[5];    top_conc_I = TopProperty[9];
    }
    else{
      top_conc_E = TopProperty[1];    top_conc_Area = TopProperty[0];    top_conc_I = TopProperty[2];
    }
    if (piletableData[i].compositeTypeCheck){
      if (piletableData[i].compPileType == 'Soil_Cement_Pile'){
        bot_steel_E = BottomProperty[6];    bot_steel_Area = BottomProperty[4];    bot_steel_I = BottomProperty[8];
        bot_conc_E = BottomProperty[7];    bot_conc_Area = BottomProperty[5];    bot_conc_I = BottomProperty[9];
      }
      else{
        bot_conc_E = BottomProperty[1];    bot_conc_Area = BottomProperty[0];    bot_conc_I = BottomProperty[2];
      }
    }
    ItemArray.push({
      "__PilePropertyIndex" : '('+(i+1)+') '+ piletableData[i].pileName,
      "__PileProperty_TopName" : pileType_Name,
      "__PileProperty_BotName" : pileType_Name2,
      "__Top_Conc_E" : Number(top_conc_E),
      "__Top_Conc_Area" : Number(top_conc_Area),
      "__Top_Conc_I" : Number(top_conc_I),
      "__Top_Steel_E" : Number(top_steel_E),
      "__Top_Steel_Area" : Number(top_steel_Area),
      "__Top_Steel_I" : Number(top_steel_I),
      "__Bot_Conc_E" : Number(bot_conc_E),
      "__Bot_Conc_Area" : Number(bot_conc_Area),
      "__Bot_Conc_I" : Number(bot_conc_I),
      "__Bot_Steel_E" : Number(bot_steel_E),
      "__Bot_Steel_Area" : Number(bot_steel_Area),
      "__Bot_Steel_I" : Number(bot_steel_I),
    })
  }
  reportjson_items["_PileProperty_Main"] = ItemArray
  
  // 1.4 지반 조건
  let TableData:any = []
  let Level = Number(GroundLevel)
  for(let i=0; i<soilData.length; i++){
    let TableRowData: any = []
    TableRowData.push(soilData[i].LayerNo)
    TableRowData.push(soilData[i].LayerType)
    TableRowData.push(Number(Level.toFixed(3)))
    TableRowData.push(Number(soilData[i].Depth))
    TableRowData.push(Number(soilData[i].AvgNValue))
    TableRowData.push(Number(soilData[i].gamma))
    TableRowData.push(Number(soilData[i].aE0))
    TableRowData.push(Number(soilData[i].aE0_Seis))
    TableRowData.push(Number(soilData[i].vd))
    TableRowData.push(Number(soilData[i].Vsi.toFixed(2)))
    TableRowData.push(Number(soilData[i].ED.toFixed(2)))
    TableRowData.push(Number(soilData[i].DE))
    Level = Level-soilData[i].Depth
    TableData.push(TableRowData)
  }

  reportjson_items["_Soil_Condition"] = {
    "__GroundLevel" : Number(GroundLevel),
    "__WaterLevel" : Number(WaterLevel),
    "__SoilTableData": TableData
  }
  
  //2. 지반반력계수, 2.1 수평방향 지반반력계수
  reportjson_items["_Soil_R_Coef_Title"] = {}

  // (1) 말뚝 타입 별 특성치 및 표
  ItemArray = []
  
  for(let i=0; i<piletableData.length; i++){
    //상시, 지진시
    
    let Level = Number(GroundLevel)

    // 상시/지진시 테이블 (__Normal_Table)
    let TableData_Normal:any = []
    for(let j = 0; j<soilData.length; j++){
      let TableRowData: any = []
      console.log('ae0', soilData[j].aE0)
      console.log('alphaHThetaResult', alphaHThetaResult[j])
      let KH0 =soilData[j].aE0 / 0.3*alphaHThetaResult[j]
      let KH = (KH0)*Math.pow((betaNormalResult[2][i]/0.3),(-3/4))
      let KH0_Seis = soilData[j].aE0_Seis / 0.3*alphaHThetaResult[j]
      let KH_Seis = (KH0_Seis)*Math.pow((betaNormalResult[2][i]/0.3),(-3/4))
      
      TableRowData.push(soilData[j].LayerNo)
      TableRowData.push(Number(Level).toFixed(3))
      TableRowData.push(Number(soilData[j].Depth))
      TableRowData.push(Number(soilData[j].DE))
      TableRowData.push(Number(alphaHThetaResult[j].toFixed(3)))
      TableRowData.push(Number((soilData[j].aE0*alphaHThetaResult[j]).toFixed(0)))
      TableRowData.push(Number((soilData[j].aE0_Seis*alphaHThetaResult[j]).toFixed(0)))
      TableRowData.push(Number(KH0.toFixed(0)))
      TableRowData.push(Number(KH0_Seis.toFixed(0)))
      TableRowData.push(Number(KH))
      TableRowData.push(Number(KH_Seis.toFixed(0)))
      if (liquefactionState){
        TableRowData.push(Number((KH_Seis * soilData[j].DE).toFixed(0)))
      }
      else{
        TableRowData.push('-')
      }
      Level = Level - soilData[j].Depth
      TableData_Normal.push(TableRowData)
    }
    
    // 고유주기 테이블 (__Period_Table)
    let TableData_Period:any = []
    Level = Number(GroundLevel)
    for(let j = 0; j<soilData.length; j++){
      let TableRowData: any = []
      let KH0_Period = soilData[j].ED / 0.3*alphaHThetaResult[j]
      let KH_Period =  (KH0_Period)*Math.pow((betaPeriodResult[2][i]/0.3),(-3/4))
      TableRowData.push(soilData[j].LayerNo)
      TableRowData.push(Number(Level.toFixed(3)))
      TableRowData.push(Number(soilData[j].Depth))
      TableRowData.push(Number(soilData[j].DE))
      TableRowData.push(Number(alphaHThetaResult[j].toFixed(3)))
      TableRowData.push(Number((soilData[j].ED*alphaHThetaResult[j]).toFixed(0)))
      TableRowData.push(Number(KH0_Period.toFixed(0)))
      TableRowData.push(Number(KH_Period.toFixed(0)))
      Level = Level - soilData[j].Depth
      TableData_Period.push(TableRowData)
    }

    ItemArray.push({
      "__Soil_R_Coef_Index" : '('+(i+1)+') '+ piletableData[i].pileName,
      "__Normal_Beta" : Number(betaNormalResult[0][i].toFixed(6)) ,
      "__Normal_aE0" : Number(betaNormalResult[1][i].toFixed(3)) ,
      "__Normal_BH" : Number(betaNormalResult[2][i].toFixed(3)) ,
      "__Normal_KH0" : Number(betaNormalResult[3][i].toFixed(3)) ,
      "__Normal_KH" : Number(betaNormalResult[4][i].toFixed(3)) ,
      "__Normal_mu" : GroupEffectValue,
      "__Normal_Table" : TableData_Normal,
      "__Period_Beta" :Number(betaPeriodResult[0][i].toFixed(6)),
      "__Period_aE0" :Number(betaPeriodResult[1][i].toFixed(3)),
      "__Period_BH" :Number(betaPeriodResult[2][i].toFixed(3)),
      "__Period_KH0" :Number(betaPeriodResult[3][i].toFixed(3)),
      "__Period_KH" :Number(betaPeriodResult[4][i].toFixed(3)),
      "__Period_mu" :GroupEffectValue,
      "__Period_Table" : TableData_Period,
    })
  }
  reportjson_items["_Soil_R_Coef_Main"] = ItemArray

  
  //3. 말뚝 스프링 정수
  reportjson_items["_PileSpring_Kv_Title"] = {}
  ItemArray = []
  
  for (let i= 0; i<piletableData.length; i++){
    ItemArray.push({"__PileSpring_Kv_Index" : '('+(i+1)+') '+ piletableData[i].pileName,
    "__PileSpring_Kv_Alpha1" : KvResult[1][i],
    "__PileSpring_Kv_Alpha2" : KvResult[2][i],
    "__PileSpring_Kv" : KvResult[0][i]
  })
  }
  reportjson_items["_PileSpring_Kv_Main"] = ItemArray
  
 // 3.2 말뚝 축 직각방향 스프링정수
  reportjson_items["_PileSpring_K_Title"] = {}
  // K1 ~ K4 결과는 아래와 같음.
  // Kvalue = [[0, 0, 0, 0] for i in range(len(pileTableData))]
  let PileSpring_Table = []
  for (let i = 0; i<piletableData.length; i++){

    let PileSpring_K_table = []
    let PileSpring_K1_Data = []
    let PileSpring_K2_Data = []
    let PileSpring_K3_Data = []
    let PileSpring_K4_Data = []

    PileSpring_K1_Data.push(kValueNormalResult[i][0])
    PileSpring_K1_Data.push(kValueSeismicResult[i][0])
    if (liquefactionState){
      PileSpring_K1_Data.push(KValueSeismicLiqResult[i][0])
    }
    else{
      PileSpring_K1_Data.push('-')
    }
    PileSpring_K1_Data.push(kValuePeriodResult[i][0])

    PileSpring_K2_Data.push(kValueNormalResult[i][1])
    PileSpring_K2_Data.push(kValueSeismicResult[i][1])
    if (liquefactionState){
      PileSpring_K2_Data.push(KValueSeismicLiqResult[i][1])
    }
    else{
      PileSpring_K2_Data.push('-')
    }
    PileSpring_K2_Data.push(kValuePeriodResult[i][1])

    PileSpring_K3_Data.push(kValueNormalResult[i][2])
    PileSpring_K3_Data.push(kValueSeismicResult[i][2])
    if (liquefactionState){
      PileSpring_K3_Data.push(KValueSeismicLiqResult[i][2])
    }
    else{
      PileSpring_K3_Data.push('-')
    }
    PileSpring_K3_Data.push(kValuePeriodResult[i][2])

    PileSpring_K4_Data.push(kValueNormalResult[i][3])
    PileSpring_K4_Data.push(kValueSeismicResult[i][3])
    if (liquefactionState){
      PileSpring_K4_Data.push(KValueSeismicLiqResult[i][3])
    }
    else{
      PileSpring_K4_Data.push('-')
    }
    PileSpring_K4_Data.push(kValuePeriodResult[i][3])

    PileSpring_K_table.push(PileSpring_K1_Data, PileSpring_K2_Data, PileSpring_K3_Data, PileSpring_K4_Data)
    
    PileSpring_Table.push({
      "__PileSpring_K_Index" : '('+(i+1)+') '+ piletableData[i].pileName,
      "__PileSpring_K_Table" : PileSpring_K_table
    })
  }
  reportjson_items["_PileSpring_K_Table_Area"] = PileSpring_Table
  
  // 3.3 말뚝 반력 및 변위 계산
  reportjson_items["_PileMatrix_Title"] = {}
  
  reportjson_items["_PileSpring_Matrix_Main"] = {
    "__X_Normal_Axx" : Number(Matrix_Normal_X[0].toFixed(3)),
    "__X_Normal_Axy" : Number(Matrix_Normal_X[1].toFixed(3)),
    "__X_Normal_Axa" : Number(Matrix_Normal_X[2].toFixed(3)),
    "__X_Normal_Ayx" : Number(Matrix_Normal_X[1].toFixed(3)),
    "__X_Normal_Ayy" : Number(Matrix_Normal_X[3].toFixed(3)),
    "__X_Normal_Aya" : Number(Matrix_Normal_X[4].toFixed(3)),
    "__X_Normal_Aax" : Number(Matrix_Normal_X[2].toFixed(3)),
    "__X_Normal_Aay" : Number(Matrix_Normal_X[4].toFixed(3)),
    "__X_Normal_Aaa" : Number(Matrix_Normal_X[5].toFixed(3)),

    "__X_Seis_Axx" : Number(Matrix_Seismic_X[0].toFixed(3)),
    "__X_Seis_Axy" : Number(Matrix_Seismic_X[1].toFixed(3)),
    "__X_Seis_Axa" : Number(Matrix_Seismic_X[2].toFixed(3)),
    "__X_Seis_Ayx" : Number(Matrix_Seismic_X[1].toFixed(3)),
    "__X_Seis_Ayy" : Number(Matrix_Seismic_X[3].toFixed(3)),
    "__X_Seis_Aya" : Number(Matrix_Seismic_X[4].toFixed(3)),
    "__X_Seis_Aax" : Number(Matrix_Seismic_X[2].toFixed(3)),
    "__X_Seis_Aay" : Number(Matrix_Seismic_X[4].toFixed(3)),
    "__X_Seis_Aaa" : Number(Matrix_Seismic_X[5].toFixed(3)),

    "__X_Period_Axx" : Number(Matrix_Period_X[0].toFixed(3)),
    "__X_Period_Axy" : Number(Matrix_Period_X[1].toFixed(3)),
    "__X_Period_Axa" : Number(Matrix_Period_X[2].toFixed(3)),
    "__X_Period_Ayx" : Number(Matrix_Period_X[1].toFixed(3)),
    "__X_Period_Ayy" : Number(Matrix_Period_X[3].toFixed(3)),
    "__X_Period_Aya" : Number(Matrix_Period_X[4].toFixed(3)),
    "__X_Period_Aax" : Number(Matrix_Period_X[2].toFixed(3)),
    "__X_Period_Aay" : Number(Matrix_Period_X[4].toFixed(3)),
    "__X_Period_Aaa" : Number(Matrix_Period_X[5].toFixed(3)),

    "__Z_Normal_Axx" : Number(Matrix_Normal_Z[0].toFixed(3)),
    "__Z_Normal_Axy" : Number(Matrix_Normal_Z[1].toFixed(3)),
    "__Z_Normal_Axa" : Number(Matrix_Normal_Z[2].toFixed(3)),
    "__Z_Normal_Ayx" : Number(Matrix_Normal_Z[1].toFixed(3)),
    "__Z_Normal_Ayy" : Number(Matrix_Normal_Z[3].toFixed(3)),
    "__Z_Normal_Aya" : Number(Matrix_Normal_Z[4].toFixed(3)),
    "__Z_Normal_Aax" : Number(Matrix_Normal_Z[2].toFixed(3)),
    "__Z_Normal_Aay" : Number(Matrix_Normal_Z[4].toFixed(3)),
    "__Z_Normal_Aaa" : Number(Matrix_Normal_Z[5].toFixed(3)),

    "__Z_Seis_Axx" : Number(Matrix_Seismic_Z[0].toFixed(3)),
    "__Z_Seis_Axy" : Number(Matrix_Seismic_Z[1].toFixed(3)),
    "__Z_Seis_Axa" : Number(Matrix_Seismic_Z[2].toFixed(3)),
    "__Z_Seis_Ayx" : Number(Matrix_Seismic_Z[1].toFixed(3)),
    "__Z_Seis_Ayy" : Number(Matrix_Seismic_Z[3].toFixed(3)),
    "__Z_Seis_Aya" : Number(Matrix_Seismic_Z[4].toFixed(3)),
    "__Z_Seis_Aax" : Number(Matrix_Seismic_Z[2].toFixed(3)),
    "__Z_Seis_Aay" : Number(Matrix_Seismic_Z[4].toFixed(3)),
    "__Z_Seis_Aaa" : Number(Matrix_Seismic_Z[5].toFixed(3)),

    "__Z_Period_Axx" : Number(Matrix_Period_Z[0].toFixed(3)),
    "__Z_Period_Axy" : Number(Matrix_Period_Z[1].toFixed(3)),
    "__Z_Period_Axa" : Number(Matrix_Period_Z[2].toFixed(3)),
    "__Z_Period_Ayx" : Number(Matrix_Period_Z[1].toFixed(3)),
    "__Z_Period_Ayy" : Number(Matrix_Period_Z[3].toFixed(3)),
    "__Z_Period_Aya" : Number(Matrix_Period_Z[4].toFixed(3)),
    "__Z_Period_Aax" : Number(Matrix_Period_Z[2].toFixed(3)),
    "__Z_Period_Aay" : Number(Matrix_Period_Z[4].toFixed(3)),
    "__Z_Period_Aaa" : Number(Matrix_Period_Z[5].toFixed(3)),
  }
  
  if (liquefactionState){
    reportjson_items["_PileSpring_Matrix_Main"]["__X_Seis_Liq_Axx"] = Number(Matrix_Seismic_Liq_X[0].toFixed(3))
    reportjson_items["_PileSpring_Matrix_Main"]["__X_Seis_Liq_Axy"] = Number(Matrix_Seismic_Liq_X[1].toFixed(3))
    reportjson_items["_PileSpring_Matrix_Main"]["__X_Seis_Liq_Axa"] = Number(Matrix_Seismic_Liq_X[2].toFixed(3))
    reportjson_items["_PileSpring_Matrix_Main"]["__X_Seis_Liq_Ayx"] = Number(Matrix_Seismic_Liq_X[1].toFixed(3))
    reportjson_items["_PileSpring_Matrix_Main"]["__X_Seis_Liq_Ayy"] = Number(Matrix_Seismic_Liq_X[3].toFixed(3))
    reportjson_items["_PileSpring_Matrix_Main"]["__X_Seis_Liq_Aya"] = Number(Matrix_Seismic_Liq_X[4].toFixed(3))
    reportjson_items["_PileSpring_Matrix_Main"]["__X_Seis_Liq_Aax"] = Number(Matrix_Seismic_Liq_X[2].toFixed(3))
    reportjson_items["_PileSpring_Matrix_Main"]["__X_Seis_Liq_Aay"] = Number(Matrix_Seismic_Liq_X[4].toFixed(3))
    reportjson_items["_PileSpring_Matrix_Main"]["__X_Seis_Liq_Aaa"] = Number(Matrix_Seismic_Liq_X[5].toFixed(3))

    reportjson_items["_PileSpring_Matrix_Main"]["__Z_Seis_Liq_Axx"] = Number(Matrix_Seismic_Liq_Z[0].toFixed(3))
    reportjson_items["_PileSpring_Matrix_Main"]["__Z_Seis_Liq_Axy"] = Number(Matrix_Seismic_Liq_Z[1].toFixed(3))
    reportjson_items["_PileSpring_Matrix_Main"]["__Z_Seis_Liq_Axa"] = Number(Matrix_Seismic_Liq_Z[2].toFixed(3))
    reportjson_items["_PileSpring_Matrix_Main"]["__Z_Seis_Liq_Ayx"] = Number(Matrix_Seismic_Liq_Z[1].toFixed(3))
    reportjson_items["_PileSpring_Matrix_Main"]["__Z_Seis_Liq_Ayy"] = Number(Matrix_Seismic_Liq_Z[3].toFixed(3))
    reportjson_items["_PileSpring_Matrix_Main"]["__Z_Seis_Liq_Aya"] = Number(Matrix_Seismic_Liq_Z[4].toFixed(3))
    reportjson_items["_PileSpring_Matrix_Main"]["__Z_Seis_Liq_Aax"] = Number(Matrix_Seismic_Liq_Z[2].toFixed(3))
    reportjson_items["_PileSpring_Matrix_Main"]["__Z_Seis_Liq_Aay"] = Number(Matrix_Seismic_Liq_Z[4].toFixed(3))
    reportjson_items["_PileSpring_Matrix_Main"]["__Z_Seis_Liq_Aaa"] = Number(Matrix_Seismic_Liq_Z[5].toFixed(3))
  }
  else{
    reportjson_items["_PileSpring_Matrix_Main"]["__X_Seis_Liq_Axx"] = "-"
    reportjson_items["_PileSpring_Matrix_Main"]["__X_Seis_Liq_Axy"] = "-"
    reportjson_items["_PileSpring_Matrix_Main"]["__X_Seis_Liq_Axa"] = "-"
    reportjson_items["_PileSpring_Matrix_Main"]["__X_Seis_Liq_Ayx"] = "-"
    reportjson_items["_PileSpring_Matrix_Main"]["__X_Seis_Liq_Ayy"] = "-"
    reportjson_items["_PileSpring_Matrix_Main"]["__X_Seis_Liq_Aya"] = "-"
    reportjson_items["_PileSpring_Matrix_Main"]["__X_Seis_Liq_Aax"] = "-"
    reportjson_items["_PileSpring_Matrix_Main"]["__X_Seis_Liq_Aay"] = "-"
    reportjson_items["_PileSpring_Matrix_Main"]["__X_Seis_Liq_Aaa"] = "-"

    reportjson_items["_PileSpring_Matrix_Main"]["__Z_Seis_Liq_Axx"] = "-"
    reportjson_items["_PileSpring_Matrix_Main"]["__Z_Seis_Liq_Axy"] = "-"
    reportjson_items["_PileSpring_Matrix_Main"]["__Z_Seis_Liq_Axa"] = "-"
    reportjson_items["_PileSpring_Matrix_Main"]["__Z_Seis_Liq_Ayx"] = "-"
    reportjson_items["_PileSpring_Matrix_Main"]["__Z_Seis_Liq_Ayy"] = "-"
    reportjson_items["_PileSpring_Matrix_Main"]["__Z_Seis_Liq_Aya"] = "-"
    reportjson_items["_PileSpring_Matrix_Main"]["__Z_Seis_Liq_Aax"] = "-"
    reportjson_items["_PileSpring_Matrix_Main"]["__Z_Seis_Liq_Aay"] = "-"
    reportjson_items["_PileSpring_Matrix_Main"]["__Z_Seis_Liq_Aaa"] = "-"
  }
  // Rest
  reportjson_items["_Rest"] = {}

  const reportjson = {"report": reportjson_items}

  return reportjson

}

export default ExcelJsonResult;
