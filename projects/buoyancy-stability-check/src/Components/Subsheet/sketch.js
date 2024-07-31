export function sketch(p) {
  let data;
  let coverdepth = 0;
  let waterdepth = 0;
  let structureHeight = 0;
  let structure_topMaxZ = 0;
  let structureWidth = 0;
  let scaleFactor = 0;
  let centerX, centerY;
  let canvasWidth = 340 * 1.5;
  let canvasHeight = 150 * 1.5;
  let internalFrictionAngle = 0;
  let consideringSoilFriction = true;
  let consideringSherkey = true;
  let W1 = 0;
  let W2 = 0;
  let Ps = 0;
  let U = 0;

  p.updateWithProps = function (props) {
    if (props.data) {
      data = props.data;
    }
    // console.log(data)
    if (props.coverdepth !== undefined) coverdepth = parseFloat(props.coverdepth);
    if (props.waterdepth !== undefined) waterdepth = parseFloat(props.waterdepth);
    if (props.internalFrictionAngle !== undefined) internalFrictionAngle = parseFloat(props.internalFrictionAngle);
    if (props.consideringSoilFriction !== undefined) consideringSoilFriction = props.consideringSoilFriction;
    if (props.consideringSherkey !== undefined) consideringSherkey = props.consideringSherkey;
    if (props.W1 !== undefined) W1 = props.W1;
    if (props.W2 !== undefined) W2 = props.W2;
    if (props.Ps !== undefined) Ps = props.Ps;
    if (props.U !== undefined) U = props.U;
    p.redraw();
  };

  p.setup = function () {
    p.createCanvas(canvasWidth, canvasHeight);
    p.noLoop();
  };

  p.draw = function () {
    if (data) {
      p.clear();
      p.background(255);

      calculateStructureDimensions();
      calculateScaleFactor();
      let bottomSlabBottomY = calculateBottomSlabBottomY();
      let structureLeftX = calculateStructureLeftX();
      let structureRightX = calculateStructureRightX();
      let structureCenterY = 0;
      let groundLevelY = -structure_topMaxZ - coverdepth;
      if((bottomSlabBottomY)<0.01){
       structureCenterY = (-structureHeight) / 2; 
      } else{structureCenterY = (structureHeight+structureHeight) / 2; }
      let structureCenterX = (structureLeftX + structureRightX) / 2;



      centerY = canvasHeight / 2 - structureCenterY * scaleFactor;
      centerX = canvasWidth / 2 - structureCenterX * scaleFactor;

      p.push();
      p.translate(centerX, centerY);

      p.stroke('#A8ABAC');
      p.fill('#EAF4FF');
      drawElements(data.ele_top_slb);
      drawElements(data.ele_bot_slb);
      drawElements(data.ele_outsid_wall);
      drawElements(data.ele_insid_wall);
      // console.log(Object.keys(data.ele_bot_slb).length);
      // console.log(Object.keys(data.ele_top_slb).length);
      
      if (Object.keys(data.ele_top_slb).length > 0) {
        if (consideringSherkey && consideringSoilFriction) {
          markBottomSlabNodes();
        } else if (!consideringSherkey && consideringSoilFriction) {
          markTopSlabNodes();
        } else if (consideringSherkey && !consideringSoilFriction) {
          markBottomSlabnofrictionNodes();
        } else if (!consideringSherkey && !consideringSoilFriction) {
          markTopSlabnofrictionNodes();
        }
      }

      p.pop();

      // 지반선 그리기
      let topSlabThickness = calculateTopSlabThickness();
      p.stroke('#8B4513');
      p.strokeWeight(2); // 선 두께를 2로 설정 (원하는 두께로 조절 가능)
      let adjustedGroundLevelY = centerY + (groundLevelY-topSlabThickness*0.5) * scaleFactor;
      p.line(0, adjustedGroundLevelY, canvasWidth, adjustedGroundLevelY);


      // 수위선 그리기
      if (waterdepth > 0) {
        p.stroke('#0000FF');
        p.strokeWeight(1); // 선 두께를 2로 설정 (원하는 두께로 조절 가능)
        let waterLevelY = adjustedGroundLevelY + waterdepth * scaleFactor;
        p.line(0, waterLevelY, canvasWidth, waterLevelY);
      }


    // 값들을 화면에 표시
        p.fill(0);
        p.noStroke();
        p.textSize(12);
        p.textAlign(p.LEFT, p.TOP);
      
        // 정보 표시
        const lineHeight = 18; // 줄 간격 설정
        const startY = canvasHeight - 80; // 시작 Y 위치
        p.text(`W1(Structure): ${W1.toFixed(2)} kN`, 20, startY);
        p.text(`W2(Soil): ${W2.toFixed(2)} kN`, 20, startY + lineHeight);
        p.text(`Ps(Friction): ${Ps.toFixed(2)} kN`, 20, startY + lineHeight * 2);
        p.text(`U(Buoyancy): ${U.toFixed(2)} kN`, 20, startY + lineHeight * 3);
        // p.text(`Soil Friction: ${consideringSoilFriction ? 'On' : 'Off'}`, 20, startY + lineHeight * 3);
        // p.text(`Shearkey: ${consideringSherkey ? 'On' : 'Off'}`, 20, startY + lineHeight * 4);
        // p.text(`Scale: ${scaleFactor.toFixed(4)}`, 10, 20);
        // p.text(`Cover Depth: ${coverdepth}`, 10, 35);
        // p.text(`Water Depth: ${waterdepth}`, 10, 50);
        // p.text(`Center X: ${centerX.toFixed(2)}, Y: ${centerY.toFixed(2)}`, 10, 65);
      }
  };

  function soilweightline() {
    let xmin = Infinity;
    let xmax = -Infinity;
    let nodeMin, nodeMax;

    for (let key in data.ele_top_slb) {
      const element = data.ele_top_slb[key];
      if (element.start_node.x < xmin) {
        xmin = element.start_node.x;
        nodeMin = element.start_node;
      }
      if (element.end_node.x < xmin) {
        xmin = element.end_node.x;
        nodeMin = element.end_node;
      }
      if (element.start_node.x > xmax) {
        xmax = element.start_node.x;
        nodeMax = element.start_node;
      }
      if (element.end_node.x > xmax) {
        xmax = element.end_node.x;
        nodeMax = element.end_node;
      }
    }
    let topSlabThickness = calculateTopSlabThickness();
    // 프로젝트된 점 계산 및 표시
    let angleRad = p.radians(180);
    let adjustedGroundLevelY = calculateTopSlabTopY() - coverdepth - topSlabThickness*0.5;  // 상부 슬래브 상단을 기준으로 함
    let depthFromGround = adjustedGroundLevelY * -1 - nodeMin.z;  // 상부 슬래브 상단으로부터의 깊이
    let dx = depthFromGround * Math.tan(angleRad);
    // 커버 깊이가 양수일 경우에만 선을 그림
    // 왼쪽 프로젝트된 점
    let leftProjectedX = nodeMin.x - dx;
    let leftProjectedZ = adjustedGroundLevelY;

    // 오른쪽 프로젝트된 점
    let rightProjectedX = nodeMax.x + dx;
    let rightProjectedZ = adjustedGroundLevelY;

    // 선 그리기
    if (coverdepth > 0) {
      // console.log("Inside coverdepth > 0 condition");
      p.stroke(0);  // 검은색
      p.strokeWeight(1);  // 선 두께 설정
      p.drawingContext.setLineDash([3, 3]);  // 점선 설정 (픽셀 선, 픽셀 간격)
      p.line(nodeMin.x * scaleFactor, -nodeMin.z * scaleFactor,
        leftProjectedX * scaleFactor, leftProjectedZ * scaleFactor);
      p.line(nodeMax.x * scaleFactor, -nodeMax.z * scaleFactor,
        rightProjectedX * scaleFactor, rightProjectedZ * scaleFactor);
      p.drawingContext.setLineDash([]);
    } else {
      // console.log("coverdepth is not greater than 0:", coverdepth);
    }
  }




  function markBottomSlabNodes() {
    if (data.ele_bot_slb && consideringSherkey && consideringSoilFriction) {
      if (data.ele_top_slb && Object.keys(data.ele_top_slb).length > 0) {
        soilweightline()
      }
      markBottomSlabnofrictionNodes()
      let xmin = Infinity;
      let xmax = -Infinity;
      let nodeMin, nodeMax;

      for (let key in data.ele_bot_slb) {
        const element = data.ele_bot_slb[key];
        if (element.start_node.x < xmin) {
          xmin = element.start_node.x;
          nodeMin = element.start_node;
        }
        if (element.end_node.x < xmin) {
          xmin = element.end_node.x;
          nodeMin = element.end_node;
        }
        if (element.start_node.x > xmax) {
          xmax = element.start_node.x;
          nodeMax = element.start_node;
        }
        if (element.end_node.x > xmax) {
          xmax = element.end_node.x;
          nodeMax = element.end_node;
        }
      }

      // 원래 노드 표시
      // p.fill(255, 0, 0);  // 빨간색
      // p.noStroke();
      // let nodeSize = 5;
      // p.ellipse(nodeMin.x * scaleFactor, -nodeMin.z * scaleFactor, nodeSize, nodeSize);
      // p.ellipse(nodeMax.x * scaleFactor, -nodeMax.z * scaleFactor, nodeSize, nodeSize);

      // 프로젝트된 점 계산 및 표시
      let angleRad = p.radians(internalFrictionAngle);
      let adjustedGroundLevelY = calculateTopSlabTopY() - coverdepth;
      let depthFromGround = Math.abs(adjustedGroundLevelY - nodeMin.z);  // 지반선으로부터의 깊이

      let dx = depthFromGround * Math.tan(angleRad);

      // 왼쪽 프로젝트된 점
      let leftProjectedX = nodeMin.x - dx;
      // console.log(nodeMin.x)
      // console.log(dx)
      // console.log(leftProjectedX)
      let leftProjectedZ = adjustedGroundLevelY;

      // 오른쪽 프로젝트된 점
      let rightProjectedX = nodeMax.x + dx;
      let rightProjectedZ = adjustedGroundLevelY;
      // console.log(leftProjectedZ)
      // console.log(rightProjectedZ)
      // 프로젝트된 점 표시
      // p.fill(0, 255, 0);  // 녹색
      // p.ellipse(leftProjectedX * scaleFactor, leftProjectedZ * scaleFactor, nodeSize, nodeSize);
      // p.ellipse(rightProjectedX * scaleFactor, rightProjectedZ * scaleFactor, nodeSize, nodeSize);
      // console.log(leftProjectedX)
      // console.log(rightProjectedX)
      p.stroke(0);  // 검은색
      p.strokeWeight(1);  // 선 두께 설정
      p.drawingContext.setLineDash([3, 3]);  // 점선 설정 (픽셀 선, 픽셀 간격)
      p.line(nodeMin.x * scaleFactor, -nodeMin.z * scaleFactor,
        leftProjectedX*scaleFactor , leftProjectedZ * scaleFactor);
      p.line(nodeMax.x * scaleFactor, -nodeMax.z * scaleFactor,
        rightProjectedX * scaleFactor, rightProjectedZ * scaleFactor);
      p.drawingContext.setLineDash([]);
    }
  }

  function markTopSlabNodes() {
    if (data.ele_top_slb && !consideringSherkey && consideringSoilFriction) {
      let xmin = Infinity;
      let xmax = -Infinity;
      let nodeMin, nodeMax;
      if (data.ele_top_slb && Object.keys(data.ele_top_slb).length > 0) {
        markTopSlabnofrictionNodes()
      }
      for (let key in data.ele_top_slb) {
        const element = data.ele_top_slb[key];
        if (element.start_node.x < xmin) {
          xmin = element.start_node.x;
          nodeMin = element.start_node;
        }
        if (element.end_node.x < xmin) {
          xmin = element.end_node.x;
          nodeMin = element.end_node;
        }
        if (element.start_node.x > xmax) {
          xmax = element.start_node.x;
          nodeMax = element.start_node;
        }
        if (element.end_node.x > xmax) {
          xmax = element.end_node.x;
          nodeMax = element.end_node;
        }
      }

      // 원래 노드 표시
      // p.fill(0, 0, 255);  // 파란색
      // p.noStroke();
      // let nodeSize = 5;
      // p.ellipse(nodeMin.x * scaleFactor, -nodeMin.z * scaleFactor, nodeSize, nodeSize);
      // p.ellipse(nodeMax.x * scaleFactor, -nodeMax.z * scaleFactor, nodeSize, nodeSize);
      let topSlabThickness = calculateTopSlabThickness();
      // 프로젝트된 점 계산 및 표시
      let angleRad = p.radians(internalFrictionAngle);
      let adjustedGroundLevelY = calculateTopSlabTopY() - coverdepth-topSlabThickness*0.5;  // 상부 슬래브 상단을 기준으로 함
      let depthFromGround = Math.abs(adjustedGroundLevelY + nodeMin.z);  // 상부 슬래브 상단으로부터의 깊이
      // console.log(depthFromGround)
      let dx = depthFromGround * Math.tan(angleRad);

      // 왼쪽 프로젝트된 점
      let leftProjectedX = nodeMin.x - dx;
      let leftProjectedZ = adjustedGroundLevelY;

      // 오른쪽 프로젝트된 점
      let rightProjectedX = nodeMax.x + dx;
      let rightProjectedZ = adjustedGroundLevelY;
      // console.log(leftProjectedZ)
      // console.log(rightProjectedZ)
      // 프로젝트된 점 표시
      // p.fill(0, 255, 255);  // 청록색
      // p.ellipse(leftProjectedX * scaleFactor, leftProjectedZ * scaleFactor, nodeSize, nodeSize);
      // p.ellipse(rightProjectedX * scaleFactor, rightProjectedZ * scaleFactor, nodeSize, nodeSize);

      // 선 그리기
      if (coverdepth > 0) {
        // console.log("Inside coverdepth > 0 condition");
        p.stroke(0);  // 검은색
        p.strokeWeight(1);  // 선 두께 설정
        p.drawingContext.setLineDash([3, 3]);  // 점선 설정 (픽셀 선, 픽셀 간격)
        p.line(nodeMin.x * scaleFactor, -nodeMin.z * scaleFactor,
          leftProjectedX * scaleFactor, leftProjectedZ * scaleFactor);
        p.line(nodeMax.x * scaleFactor, -nodeMax.z * scaleFactor,
          rightProjectedX * scaleFactor, rightProjectedZ * scaleFactor);
        p.drawingContext.setLineDash([]);
      } else {
        // console.log("coverdepth is not greater than 0:", coverdepth);
      }
    }
  }



  function markBottomSlabnofrictionNodes() {
    let xmin = Infinity;
    let xmax = -Infinity;
    let nodeMin, nodeMax;
    if (data.ele_top_slb && Object.keys(data.ele_top_slb).length > 0) {
      markTopSlabnofrictionNodes()
    }
    for (let key in data.ele_bot_slb) {
      const element = data.ele_bot_slb[key];
      if (element.start_node.x < xmin) {
        xmin = element.start_node.x;
        nodeMin = element.start_node;
      }
      if (element.end_node.x < xmin) {
        xmin = element.end_node.x;
        nodeMin = element.end_node;
      }
      if (element.start_node.x > xmax) {
        xmax = element.start_node.x;
        nodeMax = element.start_node;
      }
      if (element.end_node.x > xmax) {
        xmax = element.end_node.x;
        nodeMax = element.end_node;
      }
    }

    // 원래 노드 표시
    // p.fill(255, 0, 0);  // 빨간색
    // p.noStroke();
    // let nodeSize = 5;
    // p.ellipse(nodeMin.x * scaleFactor, -nodeMin.z * scaleFactor, nodeSize, nodeSize);
    // p.ellipse(nodeMax.x * scaleFactor, -nodeMax.z * scaleFactor, nodeSize, nodeSize);
    let topSlabThickness = calculateTopSlabThickness();
    // 프로젝트된 점 계산 및 표시
    let angleRad = p.radians(180);
    let adjustedGroundLevelY = calculateTopSlabTopY() - coverdepth-topSlabThickness*0.5;
    let depthFromGround = Math.abs(adjustedGroundLevelY - nodeMin.z);  // 지반선으로부터의 깊이

    let dx = depthFromGround * Math.tan(angleRad);

    // 왼쪽 프로젝트된 점
    let leftProjectedX = nodeMin.x - dx;
    // console.log(nodeMin.x)
    // console.log(dx)
    // console.log(leftProjectedX)
    let leftProjectedZ = adjustedGroundLevelY;

    // 오른쪽 프로젝트된 점
    let rightProjectedX = nodeMax.x + dx;
    let rightProjectedZ = adjustedGroundLevelY;
    // 프로젝트된 점 표시
    // p.fill(0, 255, 0);  // 녹색
    // p.ellipse(leftProjectedX * scaleFactor, leftProjectedZ * scaleFactor, nodeSize, nodeSize);
    // p.ellipse(rightProjectedX * scaleFactor, rightProjectedZ * scaleFactor, nodeSize, nodeSize);
    // console.log(leftProjectedX)
    // console.log(rightProjectedX)
    // 선 그리기
    p.stroke(0);  // 검은색
    p.strokeWeight(1);  // 선 두께 설정
    p.drawingContext.setLineDash([3, 3]);  // 점선 설정 (픽셀 선, 픽셀 간격)
    p.line(nodeMin.x * scaleFactor, -nodeMin.z * scaleFactor,
      leftProjectedX * scaleFactor, leftProjectedZ * scaleFactor);
    p.line(nodeMax.x * scaleFactor, -nodeMax.z * scaleFactor,
      rightProjectedX * scaleFactor, rightProjectedZ * scaleFactor);
    p.drawingContext.setLineDash([]);

  }

  function markTopSlabnofrictionNodes() {
    let xmin = Infinity;
    let xmax = -Infinity;
    let nodeMin, nodeMax;

    for (let key in data.ele_top_slb) {
      const element = data.ele_top_slb[key];
      if (element.start_node.x < xmin) {
        xmin = element.start_node.x;
        nodeMin = element.start_node;
      }
      if (element.end_node.x < xmin) {
        xmin = element.end_node.x;
        nodeMin = element.end_node;
      }
      if (element.start_node.x > xmax) {
        xmax = element.start_node.x;
        nodeMax = element.start_node;
      }
      if (element.end_node.x > xmax) {
        xmax = element.end_node.x;
        nodeMax = element.end_node;
      }
    }

    // 원래 노드 표시
    // p.fill(0, 0, 255);  // 파란색
    // p.noStroke();
    // let nodeSize = 5;
    // p.ellipse(nodeMin.x * scaleFactor, -nodeMin.z * scaleFactor, nodeSize, nodeSize);
    // p.ellipse(nodeMax.x * scaleFactor, -nodeMax.z * scaleFactor, nodeSize, nodeSize);
    let topSlabThickness = calculateTopSlabThickness();
    // 프로젝트된 점 계산 및 표시
    let angleRad = p.radians(180);
    let adjustedGroundLevelY = calculateTopSlabTopY() - coverdepth-topSlabThickness*0.5;  // 상부 슬래브 상단을 기준으로 함
    let depthFromGround = Math.abs(adjustedGroundLevelY + nodeMin.z);  // 상부 슬래브 상단으로부터의 깊이
    // console.log(depthFromGround)
    let dx = depthFromGround * Math.tan(angleRad);

    // 왼쪽 프로젝트된 점
    let leftProjectedX = nodeMin.x - dx;
    let leftProjectedZ = adjustedGroundLevelY;

    // 오른쪽 프로젝트된 점
    let rightProjectedX = nodeMax.x + dx;
    let rightProjectedZ = adjustedGroundLevelY;
    // console.log(leftProjectedZ)
    // console.log(rightProjectedZ)
    // 프로젝트된 점 표시
    // p.fill(0, 255, 255);  // 청록색
    // p.ellipse(leftProjectedX * scaleFactor, leftProjectedZ * scaleFactor, nodeSize, nodeSize);
    // p.ellipse(rightProjectedX * scaleFactor, rightProjectedZ * scaleFactor, nodeSize, nodeSize);

    // 선 그리기
    if (coverdepth > 0) {
      // console.log("Inside coverdepth > 0 condition");
      p.stroke(0);  // 검은색
      p.strokeWeight(1);  // 선 두께 설정
      p.drawingContext.setLineDash([3, 3]);  // 점선 설정 (픽셀 선, 픽셀 간격)
      p.line(nodeMin.x * scaleFactor, -nodeMin.z * scaleFactor,
        leftProjectedX * scaleFactor, leftProjectedZ * scaleFactor);
      p.line(nodeMax.x * scaleFactor, -nodeMax.z * scaleFactor,
        rightProjectedX * scaleFactor, rightProjectedZ * scaleFactor);
      p.drawingContext.setLineDash([]);
    } else {
      // console.log("coverdepth is not greater than 0:", coverdepth);
    }
  }

  function calculateTopSlabTopY() {
    let topMaxZ = -Infinity;
    for (let key in data.ele_top_slb) {
      const element = data.ele_top_slb[key];
      topMaxZ = Math.max(topMaxZ, element.start_node.z, element.end_node.z);
    }
    return -topMaxZ;
  }

  function calculateTopSlabThickness() {
    if (!data.ele_top_slb || Object.keys(data.ele_top_slb).length === 0) {
      return 0;
    }
    // 첫 번째 상부 슬래브 요소의 두께를 반환
    return Object.values(data.ele_top_slb)[0].thickness;
  }



  // function wallheight() {
  //   let wallMaxZ = -Infinity;
  //   let wallMinZ = Infinity;
  //   let wallheightforcal = 0;
  //   for (let key in data.ele_outsid_wall) {
  //     const element = data.ele_outsid_wall[key];
  //     wallMaxZ = Math.max(wallMaxZ, element.start_node.z, element.end_node.z);
  //     wallMinZ = Math.max(wallMinZ, element.start_node.z, element.end_node.z);
  //     wallheightforcal = wallMaxZ - wallMinZ
  //   }
  //   return wallheightforcal;
  // }
  
  // console.log(wallheight())
  
  function calculateBottomSlabBottomY() {
    let botMinZ = Infinity;
    for (let key in data.ele_bot_slb) {
      const element = data.ele_bot_slb[key];
      botMinZ = Math.min(botMinZ, element.start_node.z, element.end_node.z);
    }
    return -botMinZ;
  }

  function calculateStructureLeftX() {
    let minX = Infinity;
    for (let elementType in data) {
      for (let key in data[elementType]) {
        const element = data[elementType][key];
        minX = Math.min(minX, element.start_node.x, element.end_node.x);
      }
    }
    return minX;
  }

  function calculateStructureRightX() {
    let maxX = -Infinity;
    for (let elementType in data) {
      for (let key in data[elementType]) {
        const element = data[elementType][key];
        maxX = Math.max(maxX, element.start_node.x, element.end_node.x);
      }
    }
    return maxX;
  }

  function drawElements(elements) {
    for (let key in elements) {
      const element = elements[key];
      const startNode = element.start_node;
      const endNode = element.end_node;
      const thickness = element.thickness;

      drawElementWithThickness(startNode, endNode, thickness);
    }
  }

  function drawElementWithThickness(startNode, endNode, thickness) {
    let dx = endNode.x - startNode.x;
    let dz = endNode.z - startNode.z;
    let len = p.sqrt(dx * dx + dz * dz);

    let ux = dx / len;
    let uz = dz / len;

    let offsetX = thickness * uz / 2;
    let offsetZ = thickness * ux / 2;

    let x1 = startNode.x - offsetX;
    let z1 = startNode.z + offsetZ;
    let x2 = startNode.x + offsetX;
    let z2 = startNode.z - offsetZ;
    let x3 = endNode.x + offsetX;
    let z3 = endNode.z - offsetZ;
    let x4 = endNode.x - offsetX;
    let z4 = endNode.z + offsetZ;

    p.beginShape();
    p.vertex(x1 * scaleFactor, -z1 * scaleFactor);
    p.vertex(x2 * scaleFactor, -z2 * scaleFactor);
    p.vertex(x3 * scaleFactor, -z3 * scaleFactor);
    p.vertex(x4 * scaleFactor, -z4 * scaleFactor);
    p.endShape(p.CLOSE);
  }

  function calculateStructureDimensions() {
    if (!data) return;
    let topMaxZ = -Infinity;
    let botMinZ = Infinity;
    let minX = Infinity;
    let maxX = -Infinity;
    for (let elementType in data) {
      for (let key in data[elementType]) {
        const element = data[elementType][key];
        topMaxZ = Math.max(topMaxZ, element.start_node.z, element.end_node.z);
        botMinZ = Math.min(botMinZ, element.start_node.z, element.end_node.z);
        minX = Math.min(minX, element.start_node.x, element.end_node.x);
        maxX = Math.max(maxX, element.start_node.x, element.end_node.x);
      }
    }
    structure_topMaxZ = topMaxZ
    structureHeight = topMaxZ - botMinZ;
    structureWidth = maxX - minX;
  }

  function calculateScaleFactor() {
    let totalHeight = structureHeight;
    if (coverdepth > 0) {
      totalHeight += coverdepth;
    }
    if (waterdepth > 0) {
      totalHeight += 0;
    }

    let heightScaleFactor = ((canvasHeight - coverdepth) * 0.9) / (totalHeight+Math.abs(coverdepth+1));
    let widthScaleFactor = (canvasWidth * 0.9) / structureWidth;
    scaleFactor = Math.min(heightScaleFactor, widthScaleFactor);
  }
}