import { useRecoilValue } from 'recoil';
import { CalculateProperties, CalculatePileCenterCoordinates, ExtractNumbers } from '../../utils_pyscript';

const PlanViewDrawing = (translate:any, SideLength:any, FoundationWidth:any, Force_Point_X:any, Force_Point_Y:any, PileTableData:any) => {
  const canvas = document.createElement('canvas');
  const context:any = canvas.getContext('2d');
  const canvasSize = 250;
  
  canvas.width = canvasSize;
  canvas.height = canvasSize;

  const width = Number(SideLength);
  const height = Number(FoundationWidth);

  const MaxSize = Math.max(width, height);
  const AmplifyRatio = (canvasSize * 0.8) / MaxSize;
  const ForcePointX = Number(Force_Point_X);
  const ForcePointY = Number(Force_Point_Y);
  const pileTableData = PileTableData;


  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  const headlen = 6;

  context.strokeStyle = "#BFBFBF";
  context.lineWidth = 1.5;
  context.setLineDash([5, 2]);
  context.moveTo(canvasSize * 0.6, canvasSize * 0.04);
  context.lineTo(canvasSize * 0.4, canvasSize * 0.04);
  context.moveTo(canvasSize * 0.96, canvasSize * 0.4);
  context.lineTo(canvasSize * 0.96, canvasSize * 0.6);
  context.moveTo(canvasSize * 0.4, canvasSize * 0.04);
  context.lineTo(canvasSize * 0.4 + headlen * Math.cos(-Math.PI / 6), canvasSize * 0.04 + headlen * Math.sin(-Math.PI / 6));
  context.moveTo(canvasSize * 0.4, canvasSize * 0.04);
  context.lineTo(canvasSize * 0.4 + headlen * Math.cos(Math.PI / 6), canvasSize * 0.04 + headlen * Math.sin(Math.PI / 6));
  context.font = '10px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.moveTo(canvasSize * 0.96, canvasSize * 0.6);
  context.lineTo(canvasSize * 0.96 + headlen * Math.cos(-Math.PI / 3), canvasSize * 0.6 - headlen * Math.sin(Math.PI / 3));
  context.moveTo(canvasSize * 0.96, canvasSize * 0.6);
  context.lineTo(canvasSize * 0.96 - headlen * Math.cos(Math.PI / 3), canvasSize * 0.6 - headlen * Math.sin(Math.PI / 3));
  context.fillText(translate('Pile_X_Dir'), canvasSize * 0.5, canvasSize * 0.03);

  context.translate(canvasSize * 0.97, canvasSize * 0.5);
  context.rotate(Math.PI / 2);
  context.fillText(translate('Pile_Y_Dir'), 0, 0);
  context.stroke();
  context.rotate(-Math.PI / 2);
  context.translate(-canvasSize * 0.97, -canvasSize * 0.5);

  context.setLineDash([0, 0]);
  context.strokeStyle = "#000000";
  context.lineWidth = 1;
  const newWidth = width * AmplifyRatio;
  const newHeight = height * AmplifyRatio;

  const x = (canvasSize - newWidth) / 2;
  const y = (canvasSize - newHeight) / 2;
  context.beginPath();
  context.strokeRect(x, y, newWidth, newHeight);
  context.lineWidth = 0.5;
  const dimOffset = 5;
  const dimTickSize = 2;
  context.moveTo(x, y - dimOffset);
  context.lineTo(x + newWidth, y - dimOffset);
  context.moveTo(x, y - dimOffset - dimTickSize);
  context.lineTo(x, y - dimOffset + dimTickSize);
  context.moveTo(x + newWidth, y - dimOffset - dimTickSize);
  context.lineTo(x + newWidth, y - dimOffset + dimTickSize);
  context.stroke();

  context.moveTo(x + newWidth + dimOffset, y);
  context.lineTo(x + newWidth + dimOffset, y + newHeight);
  context.moveTo(x + newWidth + dimOffset - dimTickSize, y);
  context.lineTo(x + newWidth + dimOffset + dimTickSize, y);
  context.moveTo(x + newWidth + dimOffset - dimTickSize, y + newHeight);
  context.lineTo(x + newWidth + dimOffset + dimTickSize, y + newHeight);
  context.stroke();
  context.closePath();

  context.beginPath();
  context.arc(x + newWidth - ForcePointX * AmplifyRatio, y + ForcePointY * AmplifyRatio, 3, 0, 2 * Math.PI);
  context.stroke();
  context.fillStyle = 'black';
  context.fill();
  context.fillStyle = 'black';
  context.closePath();

  context.font = '10px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  const offsetY = 5;
  context.fillText(`${width * 1000}`, x + newWidth / 2, y - dimOffset - offsetY);

  context.save();
  context.translate(x + newWidth + dimOffset + offsetY, y + newHeight / 2);
  context.rotate(Math.PI / 2);
  context.fillText(`${height * 1000}`, 0, 0);
  context.restore();

  const drawTables = (ctx:any) => {
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;

    for (let i = 0; i < pileTableData.length; i++) {
      const PileProperty = CalculateProperties(pileTableData[i], 'top', 'reinforced');
      const Diameter = Number(PileProperty[3]) * AmplifyRatio;
      const pilecoordinate = CalculatePileCenterCoordinates(pileTableData[i], height, width);
      const orginX = canvasSize / 2 + width / 2 * AmplifyRatio;
      const orginY = canvasSize / 2 - height / 2 * AmplifyRatio;
      pilecoordinate.forEach((center:any) => {
        ctx.beginPath();
        ctx.arc(orginX - Number(center[0] * AmplifyRatio), orginY + Number(center[1] * AmplifyRatio), Diameter / 2, 0, 2 * Math.PI);
        ctx.stroke();
      });
    }
  };

  const drawOutlines = (context:any) => {
    
  };

  // 순서대로 그리기

  drawOutlines(context);
  drawTables(context);

  // Base64 데이터 URL 반환
  const dataURL = canvas.toDataURL();
  return dataURL.split(',')[1];
};

export default PlanViewDrawing;