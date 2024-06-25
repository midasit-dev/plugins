import React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { 
	GuideBox, 
	Panel,
	TemplatesDualComponentsTypographyDropListSpaceBetween,
  Typography,
  Radio,
  RadioGroup,
  DataGrid,
  Button
} from '@midasit-dev/moaui';
import {BH_TableRows, BH_Counter, Layer_Counter} from '../variables'
import BoringHole from './BoringHoleTable';
import LayerTable from './LayerTable';

function View(){
  const canvasRef = React.useRef(null);
  const BHTableRows = useRecoilValue(BH_TableRows);
  const BH_Count = useRecoilValue(BH_Counter);
  const Layer_Count = useRecoilValue(Layer_Counter);  

  const [GroundLevel_Line, setGroundLevel_Line] = React.useState<any>([])
  const [Layer_Line, setLayer_Line] = React.useState<any>([])
  const [Water_Line, setWater_Line] = React.useState<any>([])

  const [YMaxLevel, setYMaxLevel] = React.useState(0)
  const [YMinLevel, setYMinLevel] = React.useState(0)

  const [XMaxPos, setXMaxPos] = React.useState(0)
  const [XMinPos, setXMinPos] = React.useState(0)

  React.useEffect(() => {
    const canvas:any = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    const gridSize = 10; // 그리드 사이즈

    // 그리드 그리기
    function drawGrid() {
      context.beginPath(); 
      for(let x = 0; x <= canvas.width; x += gridSize) {
        context.moveTo(x, 0); 
        context.lineTo(x, canvas.height); 
      }

      for(let y = 0; y <= canvas.height; y += gridSize) {
        context.moveTo(0, y); 
        context.lineTo(canvas.width, y); 
      }

      context.strokeStyle = '#ccc';
      context.lineWidth = 0.3; 
      context.stroke(); 
    }

    drawGrid(); 

    // Scaling 비율 계산

    if (YMaxLevel-YMinLevel !== 0){
      const scaleY = 0.8
      const ScaleY_Coef1 = (canvas.height * scaleY)/(YMaxLevel-YMinLevel)
      const ScaleY_Coef2 = 0.05*canvas.height - YMinLevel*scaleY*canvas.height/(YMaxLevel-YMinLevel)
      let ScaleX_Coef1 = 0
      let ScaleX_Coef2 = 0
      if (XMaxPos-XMinPos !== 0){
        ScaleX_Coef1 = 0.9*canvas.width/(XMaxPos-XMinPos)
        ScaleX_Coef2 = 0.05*canvas.width - XMinPos*ScaleX_Coef1
      }
      else{
        ScaleX_Coef1 = 0.5*canvas.width/(XMaxPos)
        ScaleX_Coef2 = 0
      }
      //Ground Level 그리기
      const AdjustGroundLevelLines = GroundLevel_Line.map((point:any) => {
        return [ScaleX_Coef1*point[0]+ScaleX_Coef2, canvas.height - (ScaleY_Coef1*point[1]+ScaleY_Coef2)]
      })
      context.beginPath();
      context.moveTo(0, AdjustGroundLevelLines[0][1]);
      for(let i = 0; i<AdjustGroundLevelLines.length; i++){
        context.lineTo(AdjustGroundLevelLines[i][0], AdjustGroundLevelLines[i][1]);
      }
      context.lineTo(canvas.width, AdjustGroundLevelLines[AdjustGroundLevelLines.length-1][1])
      context.strokeStyle = 'black';
      context.lineWidth = 1;
      context.stroke();
      context.font = '10px Arial';
      context.fillStyle = 'black';
      context.fillText('G.L', 5, AdjustGroundLevelLines[0][1]-5);
      // Layer 그리기
      for(let i = 0; i<Layer_Line.length; i++){
        const AdjustLayerLines = Layer_Line[i].map((point:any) => {
          return [ScaleX_Coef1*point[0]+ScaleX_Coef2, canvas.height - (ScaleY_Coef1*point[1]+ScaleY_Coef2)]
        })
        context.beginPath();
        context.moveTo(0, AdjustLayerLines[0][1]);
        for(let j = 0; j<AdjustLayerLines.length; j++){
          context.lineTo(AdjustLayerLines[j][0], AdjustLayerLines[j][1]);
        }
        context.lineTo(canvas.width, AdjustLayerLines[AdjustLayerLines.length-1][1])
        context.strokeStyle = 'black';
        context.lineWidth = 1;
        context.stroke();
        context.font = '10px Arial';
        context.fillStyle = 'black';
        context.fillText(`Layer ${i+1}`, 5, AdjustLayerLines[0][1]-5);
      }
      
      //Water Level 그리기
      const AdjustWaterLevelLines = Water_Line.map((point:any) => {
        return [ScaleX_Coef1*point[0]+ScaleX_Coef2, canvas.height - (ScaleY_Coef1*point[1]+ScaleY_Coef2)]
      })
      context.beginPath();
      context.moveTo(0, AdjustWaterLevelLines[0][1]);
      for(let i = 0; i<AdjustWaterLevelLines.length; i++){
        context.lineTo(AdjustWaterLevelLines[i][0], AdjustWaterLevelLines[i][1]);
      }
      context.lineTo(canvas.width, AdjustWaterLevelLines[AdjustWaterLevelLines.length-1][1])
      context.strokeStyle = 'blue';
      context.lineWidth = 1;
      context.stroke();
      context.font = '10px Arial';
      context.fillStyle = 'blue';
      context.fillText('W.L', 5, AdjustWaterLevelLines[0][1]-5);

    }
  }, );

  React.useEffect(() => {
    const XPosition:any = BHTableRows.find(item => item.Index === 'X Position')
    const GroundLevel:any = BHTableRows.find(item => item.Index === 'Ground Level')
    const WaterLevel:any = BHTableRows.find(item => item.Index === 'Water Level')
    const Layer:any = []
    for(let i = 1; i<Layer_Count+1; i++){
      const Layer_i = BHTableRows.find(item => item.Index === `Layer ${i}`)
      Layer.push(Layer_i)
    }
    
    const GroundLevel_Array = []
    const WaterLevel_Array = []
    const Layer_Array = []
    for(let i = 0; i<BH_Count; i++){
      GroundLevel_Array.push([Number(XPosition[`BH${i+1}`]),Number(GroundLevel[`BH${i+1}`])])
      WaterLevel_Array.push([Number(XPosition[`BH${i+1}`]),Number(WaterLevel[`BH${i+1}`])])
    }
    for(let i = 0; i<Layer_Count; i++){
      const Layer_i = []
      for(let j = 0; j<BH_Count; j++){
        Layer_i.push([Number(XPosition[`BH${j+1}`]),Number(Layer[i][`BH${j+1}`])])
      }
      Layer_Array.push(Layer_i)
    }
    setGroundLevel_Line(GroundLevel_Array)
    setLayer_Line(Layer_Array)
    setWater_Line(WaterLevel_Array)

    const GroundLevel_YArray = []
    for(let i = 0; i<GroundLevel_Array.length; i++){
      GroundLevel_YArray.push(GroundLevel_Array[i][1])
    }
    const YMax = Math.max(...GroundLevel_YArray)
    const Layer_YArray = []
    for(let i = 0; i<Layer_Array.length; i++){
      for(let j = 0; j<Layer_Array[i].length; j++){
        Layer_YArray.push(Layer_Array[i][j][1])
      }
    }    const XPos_Array = []
    for(let i = 0; i<GroundLevel_Array.length; i++){
      XPos_Array.push(GroundLevel_Array[i][0])
    }
    const XMax = Math.max(...XPos_Array)
    const XMin = Math.min(...XPos_Array)
    const YMin = Math.min(...Layer_YArray)

    setYMaxLevel(YMax)
    setYMinLevel(YMin)
    setXMaxPos(XMax)
    setXMinPos(XMin)
  }, [BHTableRows, BH_Count, Layer_Count]);

  return(
    <GuideBox width={320} padding={1}>
      <Typography variant='h1'> View </Typography>
      <div>
        <canvas ref={canvasRef} width={300} height={400} style={{border: '1px solid black'}} />
      </div>
    </GuideBox>
  )
}

export default View;