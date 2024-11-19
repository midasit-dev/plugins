'''
██████╗ ██╗   ██╗    ███╗   ███╗ █████╗ ██╗███╗   ██╗
██╔══██╗╚██╗ ██╔╝    ████╗ ████║██╔══██╗██║████╗  ██║
██████╔╝ ╚████╔╝     ██╔████╔██║███████║██║██╔██╗ ██║
██╔═══╝   ╚██╔╝      ██║╚██╔╝██║██╔══██║██║██║╚██╗██║
██║        ██║       ██║ ╚═╝ ██║██║  ██║██║██║ ╚████║
╚═╝        ╚═╝       ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝

@description This is a sample code for python script.
'''

# this is sample code for python script.
# if you want to use other python files, import here and functions export your javascript code.
import json
import math
from pyscript_engineers_web import set_g_values, get_g_values, requests_json
from pyscript_engineers_web import MidasAPI, Product
from decimal import Decimal
import numpy as np


def HelloWorld():
	return (f'Hello World! this message is from def HelloWorld of PythonCode.py')


def ApiGet():
	values = json.loads(get_g_values())
	base_uri = values["g_base_uri"]
	res = requests_json.get(url=f'https://{base_uri}/health', headers={
		'Content-Type': 'application/json'
	})
	return json.dumps(res)


# Basic CRUD Sample
def py_db_create(item_name, items):
	civil = MidasAPI(Product.CIVIL, "KR")
	return json.dumps(civil.db_create(item_name, json.loads(items)))


def py_db_create_item(item_name, item_id, item):
	civil = MidasAPI(Product.CIVIL, "KR")
	return json.dumps(civil.db_create_item(item_name, item_id, json.loads(item)))


def py_db_read(item_name):
	civil = MidasAPI(Product.CIVIL, "KR")
	return json.dumps(civil.db_read(item_name))


def py_db_read_item(item_name, item_id):
	civil = MidasAPI(Product.CIVIL, "KR")
	return json.dumps(civil.db_read_item(item_name, item_id))


def py_db_update(item_name, items):
	civil = MidasAPI(Product.CIVIL, "KR")
	return json.dumps(civil.db_update(item_name, json.loads(items)))


def py_db_update_item(item_name, item_id, item):
	civil = MidasAPI(Product.CIVIL, "KR")
	return json.dumps(civil.db_update_item(item_name, item_id, json.loads(item)))


def py_db_delete(item_name, item_id):
	civil = MidasAPI(Product.CIVIL, "KR")
	return json.dumps(civil.db_delete(item_name, item_id))


def py_db_get_maxid(item_name):
	civil = MidasAPI(Product.CIVIL, "KR")
	return json.dumps(civil.db_get_max_id(item_name))


def extract_numbers(input_string):
	parts = input_string.replace(',', ' ').split()

	result = []
	for part in parts:
		if '@' in part:
			sub_parts = part.split('@')
			try:
				num1 = int(sub_parts[0])
				num2 = float(sub_parts[1])
				result += [num2] * num1
			except:
				pass
		else:
			try:
				num = float(part)
				result.append(num)
			except:
				pass

	if(result == []):
		result = [0]

	return json.dumps(result)


# 각 pile의 좌표 계산
def CalPileCoordinates(PileTableData, PileLocationData):
    
    # Width는 Y축, Length는 X축
    # PileDia는 Pile의 지름
    # MajorRefValue는 X축의 기준점 (1일 경우 원점, 2일 경우 Length)
    # MinorRefValue는 Y축의 기준점 (1일 경우 원점, 2일 경우 Width)
    
	pileTableData = json.loads(PileTableData)
	pileLocationData = json.loads(PileLocationData)
	Coordinates = []
	for i in range(len(pileLocationData)):
		GroupCoordinates = []
		for j in range(len(pileLocationData[i])):
			Diameter = float(pileTableData[i]['concreteDiameter'])/1000
			EachPileCoordinates = []
			for angle in range(0, 360, 30):
				# Dia 단위가 mm
				x = float(pileLocationData[i][j][0]) + Diameter/2 * math.cos(math.radians(angle))
				y = float(pileLocationData[i][j][1]) + Diameter/2 * math.sin(math.radians(angle))
				EachPileCoordinates.append([x, y])
			EachPileCoordinates.append(EachPileCoordinates[0])
			GroupCoordinates.append(EachPileCoordinates)
		Coordinates.append(GroupCoordinates)
	return json.dumps(Coordinates)
	


# 각 파일의 중심 좌표 계산 (각 파일 타입 별로 받음)
def CalPileCenterCoordinates(PileData, FoundationWidth, SideLength):

	pileData = json.loads(PileData)
	foundationWidth = float(json.loads(FoundationWidth))
	sideLength = float(json.loads(SideLength))
	majorSpace = json.loads(extract_numbers(pileData['majorSpace']))
	CenterX = []
	try:
		if pileData['majorRefValue'] == 1:
			CenterX = [float(Decimal(str(pileData['majorStartPoint'])))]
			for i in range(len(majorSpace)):
				CenterX.append(float(Decimal(str(CenterX[i]))+Decimal(str(majorSpace[i]))))
		elif pileData['majorRefValue'] == 2:
			CenterX=[float(Decimal(str(sideLength))-Decimal(str(pileData['majorStartPoint'])))]
			for i in range(len(majorSpace)):
				CenterX.append(float(Decimal(str(CenterX[i]))-Decimal(str(majorSpace[i]))))
		CenterCoordinates = []
		if pileData['minorRefValue'] == 1:
			for i in range(len(CenterX)):
				CenterCoordinates.append([CenterX[i], float(pileData['minorStartPoint'])])
		elif pileData['minorRefValue'] == 2:
			for i in range(len(CenterX)):
				CenterCoordinates.append([CenterX[i], float(Decimal(str(foundationWidth))-Decimal(str(pileData['minorStartPoint'])))])
	except:
		ErrorReturn = [[0,0]]
		return json.dumps(ErrorReturn)
	return json.dumps(CenterCoordinates)


# 각 파일의 각도 계산
def CalPileDegree(PileData):
	pileData = json.loads(PileData)

	majorDegree = json.loads(extract_numbers(pileData['majorDegree']))
	minorDegree = json.loads(extract_numbers(pileData['minorDegree']))
	degree = []
	# 각 파일의 각도의 개수를 조정하는 코드 추가 필요함
	for i in range(len(majorDegree)):
		degree.append([majorDegree[i], minorDegree[i]])
	return json.dumps(degree)

# 말뚝 특성치 계산
def Cal_Beta(SoilData, PileTableData, Condition, SlopeEffectState, GroupEffectValue, TopLevel, GroundLevel):
    
	pileTableData = json.loads(PileTableData)
	soilData = json.loads(SoilData)

	Beta = [1 for i in range(len(pileTableData))]
	Avg_alpha_E0 = [0 for i in range(len(pileTableData))]
	Bh = [0 for i in range(len(pileTableData))]
	Kh0 = [0 for i in range(len(pileTableData))]
	Kh = [0 for i in range(len(pileTableData))]
	Alpha_H_Theta_Total = json.loads(CalAlphaTheta(json.dumps(soilData), SlopeEffectState, json.dumps(pileTableData)))
	for i in range(len(pileTableData)):

		InitialBeta = 1/(float(pileTableData[i]['pileLength'])/4)
		while True:
			LayerDepth = 0
			Avg_alpha_E0[i] = 0
			for j in range(len(soilData)):
				Alpha_HTheta = Alpha_H_Theta_Total[j]
				LayerDepth += float(soilData[j]['Depth'])
				if LayerDepth < (1/InitialBeta):
					# DE(액상화 저감계수)는 고유주기 특성치 계산시에만 적용
					# 군말뚝 효과는 항상 적용
					# 사면 효과는 항상 적용
					if (Condition == 'normal'):
						Avg_alpha_E0[i] += float(soilData[j]['aE0'])*float(soilData[j]['Depth']) * Alpha_HTheta
					elif (Condition == 'seismic'):
						De = float(soilData[j]['DE'])
						Avg_alpha_E0[i] += float(soilData[j]['aE0_Seis'])*float(soilData[j]['Depth'])* Alpha_HTheta
					elif (Condition == 'period'):
						De = float(soilData[j]['DE'])
						Avg_alpha_E0[i] += float(soilData[j]['ED'])*float(soilData[j]['Depth'])*De*Alpha_HTheta
				else:
					if (Condition == 'normal'):
						Avg_alpha_E0[i] += float(soilData[j]['aE0'])*((1/InitialBeta)-(LayerDepth-float(soilData[j]['Depth'])))* Alpha_HTheta
						break
					elif (Condition == 'seismic'):
						De = float(soilData[j]['DE'])
						Avg_alpha_E0[i] += float(soilData[j]['aE0_Seis'])*((1/InitialBeta)-(LayerDepth-float(soilData[j]['Depth'])))* Alpha_HTheta
						break
					elif (Condition == 'period'):
						De = float(soilData[j]['DE'])
						Avg_alpha_E0[i] += float(soilData[j]['ED'])*((1/InitialBeta)-(LayerDepth-float(soilData[j]['Depth'])))*De*Alpha_HTheta
						break
			Avg_alpha_E0[i] = Avg_alpha_E0[i]/(1/InitialBeta)
			Properties = json.loads(Cal_EI_D(json.dumps(pileTableData[i]), (1/InitialBeta), TopLevel, GroundLevel))
			PileEI = Properties[0]
			PileD = Properties[1]
			Bh[i] = math.sqrt(PileD/InitialBeta)
			Kh0[i] = Avg_alpha_E0[i] / (0.3)
			Kh[i] = Kh0[i] * math.pow((Bh[i]/0.3),(-3/4))*float(GroupEffectValue)
			Beta[i] = math.pow((Kh[i]*PileD/(4*PileEI)),(1/4))
			if abs(Beta[i]-InitialBeta) > 0.00000001:
				InitialBeta = Beta[i]	
			elif abs(Beta[i]-InitialBeta) <= 0.00000001:
				break

	result = [Beta, Avg_alpha_E0, Bh, Kh0, Kh]
	return json.dumps(result)


def CalAlphaTheta(SoilData, SlopeEffectState, PileTableData):
  ## 사면영향을 고려하기 위한 보정 계수 산정
  ## 사면 영향을 고려하지 않으면 모두 1로 반환
	soilData = json.loads(SoilData)
	pileTableData = json.loads(PileTableData)
	Property = json.loads(Cal_Property(json.dumps(pileTableData[0]), 'top', 'unreinforced'))
	Diameter = float(Property[3])
	Alpha_HTheta = [1 for i in range(len(soilData))]
	if (SlopeEffectState is True):
		for i in range(len(soilData)):
			Alpha_H = float(soilData[i]['Length'])/Diameter
			if (Alpha_H >= 0 and Alpha_H < 0.5):
				Alpha_HTheta[i] = 0
			elif (Alpha_H >= 0.5 and Alpha_H < 10):
				Alpha_HTheta[i] = float(round(0.3*math.log10(Alpha_H)+0.7, 3))
			else:
				Alpha_HTheta[i] = 1
	return json.dumps(Alpha_HTheta)


def CalKv(PileTableData, groundLevel, topLevel):
	pileTableData = json.loads(PileTableData)
	Alpha1 = [0 for i in range(len(pileTableData))]
	Alpha2 = [0 for i in range(len(pileTableData))]
	Kv = [0 for i in range(len(pileTableData))]

	# 보강부를 고려한 section 분류
	exposed_length = float(topLevel) - float(groundLevel)
	for i in range(len(pileTableData)):
  
		if (pileTableData[i]['constructionMethod'] == 'CM_DropHammer'):
			Alpha1[i] = 0.014
			Alpha2[i] = 0.72
		elif (pileTableData[i]['constructionMethod'] == 'CM_VibroHammer'):
			Alpha1[i] = 0.017
			Alpha2[i] = -0.014
		elif (pileTableData[i]['constructionMethod'] == 'CM_InSitu'):
			Alpha1[i] = 0.031
			Alpha2[i] = -0.15
		elif (pileTableData[i]['constructionMethod'] == 'CM_Boring'):
			Alpha1[i] = 0.01
			Alpha2[i] = 0.36
		elif (pileTableData[i]['constructionMethod'] == 'CM_Preboring'):
			Alpha1[i] = 0.013
			Alpha2[i] = 0.53
		elif (pileTableData[i]['constructionMethod'] == 'CM_SoilCement'):
			Alpha1[i] = 0.040
			Alpha2[i] = 0.15
		elif (pileTableData[i]['constructionMethod'] == 'CM_Rotate'):
			Alpha1[i] = 0.013
			Alpha2[i] = 0.54
  
		# 보강부를 고려한 section 분류
		section_depths = section_elements(pileTableData[i])
		
		if exposed_length > 0:
			value_exists = any(item[0] == exposed_length for item in section_depths)
		
			if not value_exists:
				insert_pos = 0
				for j in range(len(section_depths)):
					if section_depths[j][0] > exposed_length:
						insert_pos = j
						break
				new_section = [exposed_length, section_depths[insert_pos-1][1], section_depths[insert_pos-1][2]]
				section_depths.insert(insert_pos, new_section)
  
		for j in range(len(section_depths)):
			if section_depths[j][0] <= exposed_length:
				section_depths[j].append('exposed')
			else:
				section_depths[j].append('embedded')


		# 단일말뚝이거나, 단면 특성이 같은 경우
		if pileTableData[i]['compositeTypeCheck'] is False or (pileTableData[i]['compositeTypeCheck'] is True and pileTableData[i]['pileType'] == pileTableData[i]['compPileType']):
			
			Property = json.loads(Cal_Property(json.dumps(pileTableData[i]), 'top', 'unreinforced'))
			Kv_Pile = 0
			if (pileTableData[i]['pileType'] == 'Soil_Cement_Pile'):
				Concrete_E = Property[7]
				Concrete_A = Property[5]
				Steel_E = Property[6]
				Steel_A = Property[4]
				Section_EA = Concrete_E*Concrete_A + Steel_E*Steel_A

			else:
				Section_E = Property[1]
				Section_A = Property[0]
				Section_EA = Section_E*Section_A
			Section_D = Property[3]

			coeef_a = Alpha1[i]*(float(pileTableData[i]['pileLength'])-float(exposed_length))/float(Section_D) + Alpha2[i]

			if exposed_length != 0:
				## 08.13 Exposed 시 고려하지 않음
				K_exposed = Section_EA / exposed_length
				K_embedded = coeef_a * Section_EA / (float(pileTableData[i]['pileLength'])-exposed_length)
				Kv_Pile = K_embedded
    
			else:
				Kv_Pile = coeef_a * Section_EA / float(pileTableData[i]['pileLength'])

		else:
			# 복합말뚝의 경우
			# SC 말뚝 + PHC 말뚝
			if (pileTableData[i]['pileType'] == 'SC_Pile' and pileTableData[i]['compPileType'] == 'PHC_Pile') or (pileTableData[i]['pileType'] == 'PHC_Pile' and pileTableData[i]['compPileType'] == 'SC_Pile'):
				#PHC 말뚝의 제원을 사용함
				if (pileTableData[i]['pileType'] == 'PHC_Pile'):
					position = 'top'
				else:
					position = 'bottom'
				Property = json.loads(Cal_Property(json.dumps(pileTableData[i]), position, 'unreinforced'))
				Section_E = Property[1]
				Section_A = Property[0]
				Section_EA = Section_E*Section_A
				Section_D = Property[3]

				coeef_a = Alpha1[i]*(float(pileTableData[i]['pileLength'])-float(exposed_length))/float(Section_D) + Alpha2[i]
				
				if exposed_length != 0:
					## 08.13 Exposed 시 고려하지 않음
					K_exposed = Section_EA / exposed_length
					K_embedded = coeef_a * Section_EA / (float(pileTableData[i]['pileLength'])-exposed_length)
					Kv_Pile = K_embedded
				else:
					Kv_Pile = coeef_a * Section_EA / float(pileTableData[i]['pileLength'])

			# 일반 복합 말뚝의 경우
			else:
				Kv_Pile = 0
				for j in range(len(section_depths)):
					Property = json.loads(Cal_Property(json.dumps(pileTableData[i]), section_depths[j][1], section_depths[j][2]))
					if (pileTableData[i]['pileType'] == 'Soil_Cement_Pile'):
						Concrete_E = Property[7]
						Concrete_A = Property[5]
						Steel_E = Property[6]
						Steel_A = Property[4]
						Section_EA = Concrete_E*Concrete_A + Steel_E*Steel_A
					else:
						Section_E = Property[1]
						Section_A = Property[0]
						Section_EA = Section_E*Section_A
					Section_D = Property[3]
     
					if section_depths[j][3] == 'exposed':
						## 08.13 Exposed 시 고려하지 않음
						coeef_a = 0
					else:
						coeef_a = Alpha1[i]*(float(pileTableData[i]['pileLength'])-float(exposed_length))/float(Section_D) + Alpha2[i]

					if j == 0:
						Kv_i = coeef_a * Section_EA / float(section_depths[j][0])
						Kv_Pile = Kv_i
					else:
						Kv_i = coeef_a * Section_EA / float(section_depths[j][0]-section_depths[j-1][0])
						Kv_Pile = 1/(1/Kv_Pile + 1/Kv_i)  

		# 같은 타입의 단면일 경우
		Kv[i] = Kv_Pile
	
	result = [Kv, Alpha1, Alpha2]	
	return json.dumps(result)


# K1 ~ K4 값 계산
def CalKValue(PileTableData, GroundLevel, TopLevel, SoilData, Condition, headCondition, bottomCondition, AlphaThetaResult, BetaNormalResult, BetaSeismicResult, BetaPeriodResult, liquefactionState):
	pileTableData = json.loads(PileTableData)
	soilData = json.loads(SoilData)
	h = Decimal(TopLevel) - Decimal(GroundLevel)
	h = float(h)
	Kvalue = [[0, 0, 0, 0] for i in range(len(pileTableData))]
	# soilData 내의 Depth를 누적으로 더해서 배열에 저장
	SoilDepth = [0 for i in range(len(soilData))]
	for i in range(len(soilData)):
		if i == 0:
			SoilDepth[i] = Decimal(soilData[i]['Depth']) + Decimal(h)
		else:
			SoilDepth[i] = Decimal(SoilDepth[i-1]) + Decimal(soilData[i]['Depth'])
	soilDepth = [float(i) for i in SoilDepth]
	soilDepth.insert(0, h)
	
	# 각 파일의 깊이 별 제원 계산하여 배열로 저장
	
	for i in range(len(pileTableData)):
		elements = []
		sections = section_elements(pileTableData[i])
		section_depths = [subarray[0] for subarray in sections]
  
		combined_depths = list(set(soilDepth + section_depths))
		combined_depths.sort()
		combined_depths = [float(Decimal(depths)) for depths in combined_depths]

		# 각 파일의 각 깊이별 요소 제원 계산
		for j, depth in enumerate(combined_depths):
			Section_E = 0
			Section_I = 0
			Section_D = 0
			KH = 0
			Length = 0
			# EI 값 계산
			for k, section in enumerate(sections):
				# 요소 길이 계산
				if j == 0:
					Length = Decimal(float(depth))
					Length = float(Length)
				else:
					Length = Decimal(float(depth)) - Decimal(float(combined_depths[j-1]))
					Length = float(Length)
				# 요소 단면 특성치 계산
				if depth <= section[0]:
					Property = json.loads(Cal_Property(json.dumps(pileTableData[i]), section[1], section[2]))
					if (pileTableData[i]['pileType'] == 'Soil_Cement_Pile'):
						Section_E = Property[6]
						Section_I = Property[8]
					else:
						Section_E = Property[1]
						Section_I = Property[2]
					Section_D = Property[3]

					# 요소 KH 계산
					for k, soildepth in enumerate(soilDepth):
						if depth <= soildepth:
							if k == 0:
								KH = 0
							else:
								if (Condition == 'period'):
									KH0 = float(soilData[k-1]['ED'])/0.3*float(AlphaThetaResult[k-1])
									KH = KH0*math.pow((BetaPeriodResult[2][i]/0.3),(-3/4))

								elif (Condition == 'normal'):
									KH0 = float(soilData[k-1]['aE0'])/0.3*float(AlphaThetaResult[k-1])
									KH = KH0*math.pow((BetaNormalResult[2][i]/0.3),(-3/4))

								elif (Condition == 'seismic'):
									KH0 = float(soilData[k-1]['aE0_Seis'])/0.3*float(AlphaThetaResult[k-1])
									if(liquefactionState == 'yes'):
										KH = KH0*math.pow((BetaNormalResult[2][i]/0.3),(-3/4))*float(soilData[k-1]['DE'])
									else:
										KH = KH0*math.pow((BetaNormalResult[2][i]/0.3),(-3/4))

							elements.append({"Length": Length, "E": Section_E, "I": Section_I, "D": Section_D, "KH": KH})
							break
					break

		new_elements = []
		for element in elements:
			L = element['Length']
			KH = element['KH']*element['D']
			EI = element['E']*element['I']
			if (L !=0):
				divideNum = 5
				for Num in range(divideNum):
					new_elements.append({"Length": float(Decimal(L)/Decimal(divideNum)), "EI": EI, "KH": KH})

    
		element_stiffness_matrices = []
  
		for element in new_elements:
			L = element['Length']
			EI = element['EI']
			KH = element['KH']

			
			k = beam_stiffness_matrix(EI, L)
			kr = spring_stiffness_matrix(KH, L)
	
			K_element = k + kr
			element_stiffness_matrices.append(K_element)

		NodeNum = len(new_elements) + 1
		K_global = np.zeros((NodeNum*2, NodeNum*2))
		
		for index, K_element in enumerate(element_stiffness_matrices):
			K_global[index*2:index*2+4, index*2:index*2+4] += K_element

		# 경계조건에 따른 행렬 축소
		k_Reduced = apply_boundary_conditions(K_global, bottomCondition)
		# 단위 수평력 및 단위 모멘트 하중 벡터
		# 단위 수평력
		F_horizontal = np.zeros(k_Reduced.shape[0])
		F_horizontal[0] = 1

		# 단위 모멘트
		F_moment = np.zeros(k_Reduced.shape[0])
		F_moment[1] = 1

		# 변위 계산
		u_horizontal = np.linalg.solve(k_Reduced, F_horizontal)
		u_moment = np.linalg.solve(k_Reduced, F_moment)
  
		if headCondition == 'Head_Condition_Fixed':
			# 말뚝머리 변위 및 회전각에 대한 연립방정식
			Head_u = np.array([[u_horizontal[0], u_moment[0]],[u_horizontal[1], u_moment[1]]])
			# 단위 수평력에 대한 연립방정식
			b1 = np.array([1, 0])
			X_Y1 = np.linalg.solve(Head_u, b1)
			Kvalue[i][0] = X_Y1[0]
			Kvalue[i][2] = X_Y1[1]
		
			# 단위 모멘트에 대한 연립방정식
			b2 = np.array([0, 1])
			X_Y2 = np.linalg.solve(Head_u, b2)
			Kvalue[i][1] = X_Y2[0]
			Kvalue[i][3] = X_Y2[1]
		else:
			Kvalue[i][0] = 1/u_horizontal[0]
			Kvalue[i][1] = 0
			Kvalue[i][2] = 0
			Kvalue[i][3] = 0


	return json.dumps(Kvalue)


def beam_stiffness_matrix(EI, L):
	k = (EI / L**3) * np.array([
			[12, 6*L, -12, 6*L],
			[6*L, 4*L**2, -6*L, 2*L**2],
			[-12, -6*L, 12, -6*L],
			[6*L, 2*L**2, -6*L, 4*L**2]
	])
	return k


def spring_stiffness_matrix(KH, L):
	Kr = (KH * L / 420) * np.array([
			[156, 22*L, 54, -13*L],
			[22*L, 4*L**2, 13*L, -3*L**2],
			[54, 13*L, 156, -22*L],
			[-13*L, -3*L**2, -22*L, 4*L**2]
	])
	return Kr


def apply_boundary_conditions(K, boundary_condition):
	if boundary_condition == 'Bottom_Condition_Fixed':
		# 마지막 절점의 변위를 고정 (행과 열 삭제)
		K_reduced = K[:-2, :-2]
	elif boundary_condition == 'Bottom_Condition_Hinge':
		# 마지막 절점의 변위만 고정 (행과 열 삭제)
		K_reduced = np.delete(K, -2, axis=0)
		K_reduced = np.delete(K_reduced, -2, axis=1)
	else:
		# 자유 경계조건
		K_reduced = K
	return K_reduced


def section_elements(data):
	sections = []
	pile_length = float(data['pileLength'])
	composite_type_check = data['compositeTypeCheck']
	comp_start_length = float(data['compStartLength'])
	reinforced_start_length = float(data['reinforcedStartLength'])
	reinforced_end_length = float(data['reinforcedEndLength'])

	# 단면이 1개인 경우
	if not composite_type_check:
			# 보강 단면이 있는 경우
			if reinforced_end_length - reinforced_start_length > 0:
				if reinforced_start_length > 0:
					sections.append([reinforced_start_length, 'top', 'unreinforced'])
					sections.append([reinforced_end_length, 'top', 'reinforced'])
				else:
					sections.append([reinforced_end_length, 'top', 'reinforced'])
				
				if reinforced_end_length < pile_length:
					sections.append([pile_length, 'top', 'unreinforced'])

			# 보강 단면이 없는 경우
			else:
				sections.append([pile_length, 'top', 'unreinforced'])
	# 단면이 2개인 경우
	else:
			# 보강 단면이 있는 경우
			if reinforced_end_length - reinforced_start_length > 0:
				# 보강 끝이 2단면보다 작은 경우
				if reinforced_end_length < comp_start_length:
					sections.append([reinforced_start_length, 'top', 'unreinforced'])
					sections.append([reinforced_end_length, 'top', 'reinforced'])
					sections.append([comp_start_length, 'top', 'unreinforced'])
					sections.append([pile_length, 'bottom', 'unreinforced'])
				# 보강 끝이 2단면과 같은 경우
				elif reinforced_end_length == comp_start_length:
					sections.append([reinforced_start_length, 'top', 'unreinforced'])
					sections.append([reinforced_end_length, 'top', 'reinforced'])
					sections.append([pile_length, 'bottom', 'unreinforced'])
				# 보강 끝이 2단면보다 큰 경우
				else:
					# 보강 시작점이 2단면보다 작은 경우
					if reinforced_start_length < comp_start_length:
						if reinforced_start_length > 0:
							sections.append([reinforced_start_length, 'top', 'unreinforced'])
							sections.append([comp_start_length, 'top', 'reinforced'])
						else:
							sections.append([comp_start_length, 'top', 'reinforced'])
						if reinforced_end_length < pile_length:
							sections.append([reinforced_end_length, 'bottom', 'reinforced'])
							sections.append([pile_length, 'bottom', 'unreinforced'])
						else:
							sections.append([reinforced_end_length, 'bottom', 'reinforced'])
					# 보강 시작점이 2단면과 같은 경우
					elif reinforced_start_length == comp_start_length:
						sections.append([reinforced_start_length, 'top', 'unreinforced'])
						if reinforced_end_length < pile_length:
							sections.append([reinforced_end_length, 'bottom', 'reinforced'])
							sections.append([pile_length, 'bottom', 'unreinforced'])
						else:
							sections.append([reinforced_end_length, 'bottom', 'reinforced'])
					# 보강 시작점이 2단면보다 큰 경우
					else:
						sections.append([comp_start_length, 'top', 'unreinforced']) 
						sections.append([reinforced_start_length, 'bottom', 'unreinforced'])
						if reinforced_end_length < pile_length:
							sections.append([reinforced_end_length, 'bottom', 'reinforced'])
							sections.append([pile_length, 'bottom', 'unreinforced'])
						else:
							sections.append([reinforced_end_length, 'bottom', 'reinforced'])
			# 보강 단면이 없는 경우
			else:
				sections.append([comp_start_length, 'top', 'unreinforced'])
				sections.append([pile_length, 'bottom', 'unreinforced'])
	return sections

def CalDistFromCentriod(PileTableData, FoundationWidth, SideLength, Force_Point_X, Force_Point_Y):
	## 외력 작용점으로부터의 중심 좌표 계산
	pileTableData = json.loads(PileTableData)
	foundationWidth = json.loads(FoundationWidth)
	sideLength = json.loads(SideLength)

	CentroidX = 0
	CentroidY = 0
	
	## X, Y 방향 Centroid 계산
	CentroidX = Force_Point_X
	CentroidY = Force_Point_Y
	DistFromCentroid = []
	for pileData in pileTableData:
		CenterCoordinates = json.loads(CalPileCenterCoordinates(json.dumps(pileData), json.dumps(foundationWidth), json.dumps(sideLength)))
		for i in range(len(CenterCoordinates)):
			CenterCoordinates[i][0] = float(Decimal(str(CenterCoordinates[i][0])) - Decimal(str(CentroidX)))
			CenterCoordinates[i][1] = float(Decimal(str(CenterCoordinates[i][1])) - Decimal(str(CentroidY)))
		
		DistFromCentroid.append(CenterCoordinates)
	return json.dumps(DistFromCentroid)
    
def CalMatrix(PileTableData, FoundationWidth, SideLength, SoilData, ResultType, Direction, KvResult, KValue_Normal, KValue_Seismic, KValue_Seismic_Liq, KValue_Period, Force_Point_X, Force_Point_Y, liquifactionstate):
	pileTableData = json.loads(PileTableData)
	foundationWidth = json.loads(FoundationWidth)
	sideLength = json.loads(SideLength)
	soilData = json.loads(SoilData)
	disFromCentroid = json.loads(CalDistFromCentriod(PileTableData, FoundationWidth, SideLength, float(Force_Point_X), float(Force_Point_Y)))
	PileDegree = []
	for pileData in pileTableData:
		PileDegree.append(json.loads(CalPileDegree(json.dumps(pileData))))

	# PileDegree 안의 모든 값을 radian으로 변환
	for i in range(len(PileDegree)):
		for j in range(len(PileDegree[i])):
			PileDegree[i][j][0] = math.radians(PileDegree[i][j][0])
			PileDegree[i][j][1] = math.radians(PileDegree[i][j][1])
	CalKvResult = json.loads(KvResult)
	Kv = CalKvResult[0]
	if (ResultType == 'normal'):
		KValue = json.loads(KValue_Normal)
	elif (ResultType == 'seismic'):
		if (liquifactionstate == 'yes'):
			KValue = json.loads(KValue_Seismic_Liq)
		else:
			KValue = json.loads(KValue_Seismic)
	elif (ResultType == 'period'):
		KValue = json.loads(KValue_Period)
	Axx = 0 
	Axy = 0 
	Axa = 0 
	Ayy = 0
	Aya = 0
	Aaa = 0
	if (Direction == 'X'):
		for i in range(len(Kv)):
			for j in range(len(PileDegree[i])):
				Axx = Axx + float(KValue[i][0])*math.pow(math.cos(PileDegree[i][j][0]),2) + float(Kv[i])*math.pow(math.sin(PileDegree[i][j][0]),2)
				Axy = Axy + (float(Kv[i])-float(KValue[i][0]))*math.sin(PileDegree[i][j][0])*math.cos(PileDegree[i][j][0])
				Axa = Axa + (float(Kv[i])-float(KValue[i][0]))*float(disFromCentroid[i][j][0])*math.sin(PileDegree[i][j][0])*math.cos(PileDegree[i][j][0])-float(KValue[i][1])*math.cos(PileDegree[i][j][0])
				Ayy = Ayy + float(Kv[i])*math.pow(math.cos(PileDegree[i][j][0]),2) + float(KValue[i][0])*math.pow(math.sin(PileDegree[i][j][0]),2)
				Aya = Aya + (float(Kv[i])*math.pow(math.cos(PileDegree[i][j][0]),2) + float(KValue[i][0])*math.pow(math.sin(PileDegree[i][j][0]),2))*float(disFromCentroid[i][j][0])+float(KValue[i][1])*math.sin(PileDegree[i][j][0])
				Aaa1 = 0
				Aaa2 = 0
				Aaa1 = (float(Kv[i])*math.pow(math.cos(PileDegree[i][j][0]),2) + float(KValue[i][0])*math.pow(math.sin(PileDegree[i][j][0]),2))*math.pow(float(disFromCentroid[i][j][0]),2)
				Aaa2 = (float(KValue[i][1])+float(KValue[i][2]))*float(disFromCentroid[i][j][0])*math.sin(PileDegree[i][j][0])+float(KValue[i][3])
				Aaa = Aaa + Aaa1 + Aaa2	

	elif (Direction == 'Z'):
		for i in range(len(Kv)):
			for j in range(len(PileDegree[i])):
				Axx = Axx + float(KValue[i][0])*math.pow(math.cos(PileDegree[i][j][1]),2) + float(Kv[i])*math.pow(math.sin(PileDegree[i][j][1]),2)
				Axy = Axy + (float(Kv[i])-float(KValue[i][0]))*math.sin(PileDegree[i][j][1])*math.cos(PileDegree[i][j][1])
				Axa = Axa + (float(Kv[i])-float(KValue[i][0]))*float(disFromCentroid[i][j][1])*math.sin(PileDegree[i][j][1])*math.cos(PileDegree[i][j][1])-float(KValue[i][1])*math.cos(PileDegree[i][j][1])
				Ayy = Ayy + float(Kv[i])*math.pow(math.cos(PileDegree[i][j][1]),2) + float(KValue[i][0])*math.pow(math.sin(PileDegree[i][j][1]),2)
				Aya = Aya + (float(Kv[i])*math.pow(math.cos(PileDegree[i][j][1]),2) + float(KValue[i][0])*math.pow(math.sin(PileDegree[i][j][1]),2))*float(disFromCentroid[i][j][1])+float(KValue[i][1])*math.sin(PileDegree[i][j][1])
				Aaa1 = 0
				Aaa2 = 0
				Aaa1 = (float(Kv[i])*math.pow(math.cos(PileDegree[i][j][1]),2) + float(KValue[i][0])*math.pow(math.sin(PileDegree[i][j][1]),2))*math.pow(float(disFromCentroid[i][j][1]),2)
				Aaa2 = (float(KValue[i][1])+float(KValue[i][2]))*float(disFromCentroid[i][j][1])*math.sin(PileDegree[i][j][1])+float(KValue[i][3])
				Aaa = Aaa + Aaa1 + Aaa2

	result = [Axx, Axy, Axa, Ayy, Aya, Aaa]

	return json.dumps(result)
 
  
def Cal_Property(PileData, Position, ReinforcedState):
  
	pileData = json.loads(PileData)
	Area = 0
	Modulus = 0
	SecInertia = 0
	Diameter = 0
	SteelArea = 0
	CementArea = 0
	SteelModulus = 0
	CementModulus = 0
	SteelInertia = 0
	CementInertia = 0
	
	# 입력 제원 정리 / 단위계는 KN m 단위로 통일
	# 상부 말뚝일 경우
	try:
		if (Position == 'top'):
			concreteDiameter = float(pileData['concreteDiameter'])/1000  # mm -> m
			concreteThickness = float(pileData['concreteThickness'])/1000  # mm -> m
			concreteModulus = float(pileData['concreteModulus'])*1000  # N/mm^2 -> kN/m^2
			if (pileData['pileType'] == 'PHC_Pile' or pileData['pileType'] == 'Cast_In_Situ'):
				## 08.09 단위계 cm^2 -> mm^2로 변경
				steelDiameter = float(pileData['steelDiameter'])/1000000  # mm^2 -> m^2
			else:
				steelDiameter = float(pileData['steelDiameter'])/1000  # mm -> m
			steelThickness = float(pileData['steelThickness'])/1000  # mm -> m
			steelModulus = float(pileData['steelModulus'])*1000  # N/mm^2 -> kN/m^2
			steelCorThickness = float(pileData['steelCorThickness'])/1000  # mm -> m
		
		# 하부 말뚝일 경우
		elif (Position == 'bottom'):
			concreteDiameter = float(pileData['compConcreteDiameter'])/1000  # mm -> m
			concreteThickness = float(pileData['compConcreteThickness'])/1000  # mm -> m
			concreteModulus = float(pileData['compConcreteModulus'])*1000  # N/mm^2 -> kN/m^2
			if (pileData['compPileType'] == 'PHC_Pile' or pileData['compPileType'] == 'Cast_In_Situ'):
				## 08.09 단위계 cm^2 -> mm^2로 변경
				steelDiameter = float(pileData['compSteelDiameter'])/1000000  # mm^2 -> m^2
			else:
				steelDiameter = float(pileData['compSteelDiameter'])/1000  # mm -> m
			steelThickness = float(pileData['compSteelThickness'])/1000  # mm -> m
			steelModulus = float(pileData['compSteelModulus'])*1000  # N/mm^2 -> kN/m^2
			steelCorThickness = float(pileData['compSteelCorThickness'])/1000  # mm -> m
		
		# 보강 단면일 경우
		outerThickness = float(pileData['outerThickness'])/1000  # mm -> m
		outerModulus = float(pileData['outerModulus'])*1000  # N/mm^2 -> kN/m^2
		innerThickness = float(pileData['innerThickness'])/1000
		innerModulus = float(pileData['innerModulus'])*1000  # N/mm^2 -> kN/m^2
	except:
		error = 'error'
	try:
	# 미보강 단면 특성치 계산 (상부)
		if (Position == 'top'):
			if (ReinforcedState == 'unreinforced'):
				if (pileData['pileType'] == 'Cast_In_Situ'):
					Area = math.pi/4 * (concreteDiameter)**2
					Modulus = concreteModulus
					SecInertia = (math.pi * (concreteDiameter)**4)/64
					Diameter = concreteDiameter

				elif (pileData['pileType'] == 'PHC_Pile'):
					Area = (concreteDiameter-concreteThickness) * math.pi * (concreteThickness) + (steelModulus/concreteModulus-1)*steelDiameter
					Modulus = concreteModulus
					Ic = math.pi/64 * (math.pow(concreteDiameter, 4)-math.pow((concreteDiameter-2*concreteThickness),4))
					Is = ((steelModulus)/(concreteModulus)-1)*(1/2)*steelDiameter*math.pow(steelCorThickness,2)
					SecInertia = Ic + Is
					Diameter = concreteDiameter

				elif (pileData['pileType']=='SC_Pile'):
					Area1 = math.pi/4 * (math.pow(concreteDiameter-2*steelCorThickness,2) - math.pow(concreteDiameter-2*concreteThickness,2))
					Area2 = math.pi/4 * (steelModulus/concreteModulus-1)*(math.pow(concreteDiameter-2*steelCorThickness,2)-math.pow(concreteDiameter-2*steelThickness,2))
					Area = Area1 + Area2
					Modulus = concreteModulus
					Ic = math.pi/64*(math.pow(concreteDiameter-2*steelCorThickness,4)-math.pow(concreteDiameter-2*concreteThickness,4))
					Is = math.pi/64*(steelModulus/concreteModulus-1)*(math.pow(concreteDiameter-2*steelCorThickness,4)-math.pow(concreteDiameter-2*steelThickness,4))
					SecInertia = Ic + Is
					Diameter = concreteDiameter
		
				elif (pileData['pileType']=='Steel_Pile'):
					Area = math.pi/4 * (math.pow(steelDiameter - 2*steelCorThickness,2)-math.pow(steelDiameter-2*steelThickness,2))
					Modulus = steelModulus
					SecInertia = math.pi/64 * (math.pow(steelDiameter - 2*steelCorThickness,4)-math.pow(steelDiameter-2*steelThickness,4))
					Diameter = steelDiameter
		
				elif (pileData['pileType']=='Soil_Cement_Pile'):
					SteelArea = math.pi/4 * (math.pow(steelDiameter-2*steelCorThickness,2)-math.pow(steelDiameter-2*steelThickness,2))
					SteelModulus = steelModulus
					SteelInertia = math.pi/64 * (math.pow(steelDiameter-2*steelCorThickness,4)-math.pow(steelDiameter-2*steelThickness,4))
					CementArea = math.pi/4*math.pow(concreteDiameter,2) - SteelArea
					CementModulus = concreteModulus
					CementInertia = math.pi/64 * math.pow(concreteDiameter,4) - SteelInertia
					Diameter = concreteDiameter
		
			# 보강 단면 특성치 계산
			elif (ReinforcedState == 'reinforced'):
				if (pileData['pileType'] == 'Cast_In_Situ'):
					Area1 = math.pi/4 * (concreteDiameter)**2
					Area2 = outerModulus/concreteModulus*(concreteDiameter + outerThickness+ 2*innerThickness)*math.pi*outerThickness
					Area3 = innerModulus/concreteModulus*(concreteDiameter + innerThickness)*math.pi*innerThickness
					Area = Area1 + Area2 + Area3
					Modulus = concreteModulus
					SecInertia1 = (math.pi * (concreteDiameter)**4)/64
					SecInertia2 = (outerModulus)/(concreteModulus)/8*math.pow(concreteDiameter+outerThickness+innerThickness,2)*(concreteDiameter+outerThickness)*math.pi*outerThickness
					SecInertia3 = (innerModulus)/(concreteModulus)/8*math.pow(concreteDiameter+innerThickness,3)*math.pi*innerThickness
					SecInertia = SecInertia1 + SecInertia2 + SecInertia3
					Diameter = concreteDiameter + 2* outerThickness + 2* innerThickness
		
				elif (pileData['pileType'] == 'PHC_Pile'):
					Area1 = (concreteDiameter-concreteThickness) * math.pi * (concreteThickness) + (steelModulus/concreteModulus-1)*steelDiameter
					Area2 = outerModulus/concreteModulus*(concreteDiameter + outerThickness+ 2*innerThickness)*math.pi*outerThickness
					Area3 = innerModulus/concreteModulus*(concreteDiameter + innerThickness)*math.pi*innerThickness
					Area = Area1 + Area2 + Area3
					Modulus = concreteModulus
					Ic = math.pi/64 * (math.pow(concreteDiameter,4)-math.pow((concreteDiameter-2*concreteThickness),4))
					Is = ((steelModulus)/(concreteModulus)-1)*(1/2)*steelDiameter*math.pow(steelCorThickness,2)
					SecInertia1 = Ic + Is
					SecInertia2 = (outerModulus)/(concreteModulus)/8*math.pow(concreteDiameter+outerThickness+innerThickness,2)*(concreteDiameter+outerThickness)*math.pi*outerThickness
					SecInertia3 = (innerModulus)/(concreteModulus)/8*math.pow(concreteDiameter+innerThickness,3)*math.pi*innerThickness
					SecInertia = SecInertia1 + SecInertia2 + SecInertia3
					Diameter = concreteDiameter + 2* outerThickness + 2* innerThickness

				elif (pileData['pileType'] == 'SC_Pile'):
					Area1 = math.pi/4 * (math.pow(concreteDiameter-2*steelCorThickness,2) - math.pow(concreteDiameter-2*concreteThickness,2))
					Area2 = math.pi/4 * (steelModulus/concreteModulus-1)*(math.pow(concreteDiameter-2*steelCorThickness,2)-math.pow(concreteDiameter-2*steelThickness,2))
					Area3 = Area1 + Area2
					Area4 = outerModulus/concreteModulus*(concreteDiameter + outerThickness+2*innerThickness)*math.pi*outerThickness
					Area5 = innerModulus/concreteModulus*(concreteDiameter + innerThickness)*math.pi*innerThickness
					Area = Area3 + Area4 + Area5
					Modulus = concreteModulus
					Ic = math.pi/64*(math.pow(concreteDiameter-2*steelCorThickness,4)-math.pow(concreteDiameter-2*concreteThickness,4))
					Is = math.pi/64*(steelModulus/concreteModulus-1)*(math.pow(concreteDiameter-2*steelCorThickness,4)-math.pow(concreteDiameter-2*steelThickness,4))
					SecInertia1 = Ic + Is
					SecInertia2 = (outerModulus)/(concreteModulus)/8*math.pow(concreteDiameter+outerThickness+innerThickness,2)*(concreteDiameter+outerThickness)*math.pi*outerThickness
					SecInertia3 = (innerModulus)/(concreteModulus)/8*math.pow(concreteDiameter+innerThickness,3)*math.pi*innerThickness
					SecInertia = SecInertia1 + SecInertia2 + SecInertia3
					Diameter = concreteDiameter + 2* outerThickness + 2* innerThickness

				elif (pileData['pileType'] == 'Steel_Pile'):
					Area1 = math.pi/4 * (math.pow(steelDiameter - 2*steelCorThickness,2)-math.pow(steelDiameter-2*steelThickness,2))
					Area2 = outerModulus/steelModulus*(steelDiameter + outerThickness+2*innerThickness)*math.pi*outerThickness
					Area3 = innerModulus/steelModulus*(steelDiameter + innerThickness)*math.pi*innerThickness
					Area = Area1 + Area2 + Area3
					Modulus = steelModulus
					SecInertia1 = math.pi/64 * (math.pow(steelDiameter - 2*steelCorThickness,4)-math.pow(steelDiameter-2*steelThickness,4))
					SecInertia2 = (outerModulus)/(steelModulus)/8*math.pow(steelDiameter+outerThickness+innerThickness,2)*(steelDiameter+outerThickness)*math.pi*outerThickness
					SecInertia3 = (innerModulus)/(steelModulus)/8*math.pow(steelDiameter+innerThickness,3)*math.pi*innerThickness
					SecInertia = SecInertia1 + SecInertia2 + SecInertia3
					Diameter = steelDiameter + 2* outerThickness + 2* innerThickness

				elif (pileData['pileType']=='Soil_Cement_Pile'):
					SteelArea = math.pi/4 * (math.pow(steelDiameter-2*steelCorThickness,2)-math.pow(steelDiameter-2*steelThickness,2))
					SteelModulus = steelModulus
					SteelInertia = math.pi/64 * (math.pow(steelDiameter-2*steelCorThickness,4)-math.pow(steelDiameter-2*steelThickness,4))
					CementArea = math.pi/4*math.pow(concreteDiameter,2) - SteelArea
					CementModulus = concreteModulus
					CementInertia = math.pi/64 * math.pow(concreteDiameter,4) - SteelInertia
					Diameter = concreteDiameter
		
		# 미보강 단면 특성치 계산 (하부)
		if (Position == 'bottom'):
			if (ReinforcedState == 'unreinforced'):
				if (pileData['compPileType'] == 'Cast_In_Situ'):
					Area = math.pi/4 * (concreteDiameter)**2
					Modulus = concreteModulus
					SecInertia = (math.pi * (concreteDiameter)**4)/64
					Diameter = concreteDiameter

				elif (pileData['compPileType'] == 'PHC_Pile'):
					Area = (concreteDiameter-concreteThickness) * math.pi * (concreteThickness) + (steelModulus/concreteModulus-1)*steelDiameter
					Modulus = concreteModulus
					Ic = math.pi/64 * (math.pow(concreteDiameter,4)-math.pow((concreteDiameter-2*concreteThickness),4))
					Is = ((steelModulus)/(concreteModulus)-1)*(1/2)*steelDiameter*math.pow(steelCorThickness,2)
					SecInertia = Ic + Is
					Diameter = concreteDiameter

				elif (pileData['compPileType']=='SC_Pile'):
					
					Area1 = math.pi/4 * (math.pow(concreteDiameter-2*steelCorThickness,2) - math.pow(concreteDiameter-2*concreteThickness,2))
					Area2 = math.pi/4 * (steelModulus/concreteModulus-1)*(math.pow(concreteDiameter-2*steelCorThickness,2)-math.pow(concreteDiameter-2*steelThickness,2))
					Area = Area1 + Area2
					Modulus = concreteModulus
					Ic = math.pi/64*(math.pow(concreteDiameter-2*steelCorThickness,4)-math.pow(concreteDiameter-2*concreteThickness,4))
					Is = math.pi/64*(steelModulus/concreteModulus-1)*(math.pow(concreteDiameter-2*steelCorThickness,4)-math.pow(concreteDiameter-2*steelThickness,4))
					SecInertia = Ic + Is
					Diameter = concreteDiameter
		
				elif (pileData['compPileType']=='Steel_Pile'):
					Area = math.pi/4 * (math.pow(steelDiameter - 2*steelCorThickness,2)-math.pow(steelDiameter-2*steelThickness,2))
					Modulus = steelModulus
					SecInertia = math.pi/64 * (math.pow(steelDiameter - 2*steelCorThickness,4)-math.pow(steelDiameter-2*steelThickness,4))
					Diameter = steelDiameter
		
				elif (pileData['compPileType']=='Soil_Cement_Pile'):
					SteelArea = math.pi/4 * (math.pow(steelDiameter-2*steelCorThickness,2)-math.pow(steelDiameter-2*steelThickness,2))
					SteelModulus = steelModulus
					SteelInertia = math.pi/64 * (math.pow(steelDiameter-2*steelCorThickness,4)-math.pow(steelDiameter-2*steelThickness,4))
					CementArea = math.pi/4*math.pow(concreteDiameter,2) - SteelArea
					CementModulus = concreteModulus
					CementInertia = math.pi/64 * math.pow(concreteDiameter,4) - SteelInertia
					Diameter = concreteDiameter
		
			# 보강 단면 특성치 계산
			elif (ReinforcedState == 'reinforced'):
				if (pileData['compPileType'] == 'Cast_In_Situ'):
					Area1 = math.pi/4 * (concreteDiameter)**2
					Area2 = outerModulus/concreteModulus*(concreteDiameter + outerThickness+ 2*innerThickness)*math.pi*outerThickness
					Area3 = innerModulus/concreteModulus*(concreteDiameter + innerThickness)*math.pi*innerThickness
					Area = Area1 + Area2 + Area3
					Modulus = concreteModulus
					SecInertia1 = (math.pi * (concreteDiameter)**4)/64
					SecInertia2 = (outerModulus)/(concreteModulus)/8*math.pow(concreteDiameter+outerThickness+innerThickness,2)*(concreteDiameter+outerThickness)*math.pi*outerThickness
					SecInertia3 = (innerModulus)/(concreteModulus)/8*math.pow(concreteDiameter+innerThickness,3)*math.pi*innerThickness
					SecInertia = SecInertia1 + SecInertia2 + SecInertia3
					Diameter = concreteDiameter + 2* outerThickness + 2* innerThickness
		
				elif (pileData['compPileType'] == 'PHC_Pile'):
					Area1 = (concreteDiameter-concreteThickness) * math.pi * (concreteThickness) + (steelModulus/concreteModulus-1)*steelDiameter
					Area2 = outerModulus/concreteModulus*(concreteDiameter + outerThickness+ 2*innerThickness)*math.pi*outerThickness
					Area3 = innerModulus/concreteModulus*(concreteDiameter + innerThickness)*math.pi*innerThickness
					Area = Area1 + Area2 + Area3
					Modulus = concreteModulus
					Ic = math.pi/64 * (math.pow(concreteDiameter,4)-math.pow((concreteDiameter-2*concreteThickness),4))
					Is = ((steelModulus)/(concreteModulus)-1)*(1/2)*steelDiameter*math.pow(steelCorThickness,2)
					SecInertia1 = Ic + Is
					SecInertia2 = (outerModulus)/(concreteModulus)/8*math.pow(concreteDiameter+outerThickness+innerThickness,2)*(concreteDiameter+outerThickness)*math.pi*outerThickness
					SecInertia3 = (innerModulus)/(concreteModulus)/8*math.pow(concreteDiameter+innerThickness,3)*math.pi*innerThickness
					SecInertia = SecInertia1 + SecInertia2 + SecInertia3
					Diameter = concreteDiameter + 2* outerThickness + 2* innerThickness

				elif (pileData['compPileType'] == 'SC_Pile'):
					Area1 = math.pi/4 * (math.pow(concreteDiameter-2*steelCorThickness,2) - math.pow(concreteDiameter-2*concreteThickness,2))
					Area2 = math.pi/4 * (steelModulus/concreteModulus-1)*(math.pow(concreteDiameter-2*steelCorThickness,2)-math.pow(concreteDiameter-2*steelThickness,2))
					Area3 = Area1 + Area2
					Area4 = outerModulus/concreteModulus*(concreteDiameter + outerThickness+2*innerThickness)*math.pi*outerThickness
					Area5 = innerModulus/concreteModulus*(concreteDiameter + innerThickness)*math.pi*innerThickness
					Area = Area3 + Area4 + Area5
					Modulus = concreteModulus
					Ic = math.pi/64*(math.pow(concreteDiameter-2*steelCorThickness,4)-math.pow(concreteDiameter-2*concreteThickness,4))
					Is = math.pi/64*(steelModulus/concreteModulus-1)*(math.pow(concreteDiameter-2*steelCorThickness,4)-math.pow(concreteDiameter-2*steelThickness,4))
					SecInertia1 = Ic + Is
					SecInertia2 = (outerModulus)/(concreteModulus)/8*math.pow(concreteDiameter+outerThickness+innerThickness,2)*(concreteDiameter+outerThickness)*math.pi*outerThickness
					SecInertia3 = (innerModulus)/(concreteModulus)/8*math.pow(concreteDiameter+innerThickness,3)*math.pi*innerThickness
					SecInertia = SecInertia1 + SecInertia2 + SecInertia3
					Diameter = concreteDiameter + 2* outerThickness + 2* innerThickness

				elif (pileData['compPileType'] == 'Steel_Pile'):
					Area1 = math.pi/4 * (math.pow(steelDiameter - 2*steelCorThickness,2)-math.pow(steelDiameter-2*steelThickness,2))
					Area2 = outerModulus/steelModulus*(steelDiameter + outerThickness+2*innerThickness)*math.pi*outerThickness
					Area3 = innerModulus/steelModulus*(steelDiameter + innerThickness)*math.pi*innerThickness
					Area = Area1 + Area2 + Area3
					Modulus = steelModulus
					SecInertia1 = math.pi/64 * (math.pow(steelDiameter - 2*steelCorThickness,4)-math.pow(steelDiameter-2*steelThickness,4))
					SecInertia2 = (outerModulus)/(steelModulus)/8*math.pow(steelDiameter+outerThickness+innerThickness,2)*(steelDiameter+outerThickness)*math.pi*outerThickness
					SecInertia3 = (innerModulus)/(steelModulus)/8*math.pow(steelDiameter+innerThickness,3)*math.pi*innerThickness
					SecInertia = SecInertia1 + SecInertia2 + SecInertia3
					Diameter = steelDiameter + 2* outerThickness + 2* innerThickness

				elif (pileData['compPileType']=='Soil_Cement_Pile'):
					SteelArea = math.pi/4 * (math.pow(steelDiameter-2*steelCorThickness,2)-math.pow(steelDiameter-2*steelThickness,2))
					SteelModulus = steelModulus
					SteelInertia = math.pi/64 * (math.pow(steelDiameter-2*steelCorThickness,4)-math.pow(steelDiameter-2*steelThickness,4))
					CementArea = math.pi/4*math.pow(concreteDiameter,2) - SteelArea
					CementModulus = concreteModulus
					CementInertia = math.pi/64 * math.pow(concreteDiameter,4) - SteelInertia
					Diameter = concreteDiameter
	except:
		Area = 0
		Modulus = 0
		SecInertia = 0
		Diameter = 0
		SteelArea = 0
		CementArea = 0
		SteelModulus = 0
		CementModulus = 0
		SteelInertia = 0
		CementInertia = 0
	result = [Area, Modulus, SecInertia, Diameter, SteelArea, CementArea, SteelModulus, CementModulus, SteelInertia, CementInertia]
	return json.dumps(result)
	
def Cal_EI_D(PileData, Length, TopLevel, GroundLevel):
  
  ## 특정 위치에서의 평균 EI 값과 평균 D 값 계산
	pileData = json.loads(PileData)
	PileTotalLength = float(pileData['pileLength'])
	CompStartLength = float(pileData['compStartLength'])
	ReinforcedStartLength = float(pileData['reinforcedStartLength'])
	ReinforcedEndLength = float(pileData['reinforcedEndLength'])
 
	if (float(TopLevel) > float(GroundLevel)):
		ExposedLength = float(TopLevel) - float(GroundLevel)
	else:
		ExposedLength = 0
  
	Modified_PileTotalLength = PileTotalLength - ExposedLength
	Modified_CompStartLength = CompStartLength - ExposedLength
	Modified_ReinforcedStartLength = ReinforcedStartLength - ExposedLength
	Modified_ReinforcedEndLength = ReinforcedEndLength - ExposedLength
	
	if (Modified_PileTotalLength < 0):
		Modified_PileTotalLength = 0
	if (Modified_CompStartLength < 0):
		Modified_CompStartLength = 0
	if (Modified_ReinforcedStartLength < 0):
		Modified_ReinforcedStartLength = 0
	if (Modified_ReinforcedEndLength < 0):
		Modified_ReinforcedEndLength = 0
	
 	# 상부 미보강 길이, 상부 보강 길이, 상부 미보강길이, 하부 미보강 길이, 하부 보강 길이
	
	Top_Length = 0
	Bottom_Length = 0
	Top_unreinforced_Length = 0
	Top_reinforced_Length = 0
	Bottom_unreinforced_Length = 0
	Bottom_reinforced_Length = 0
	Top_unreinforced_PileEI = 0
	Top_unreinforced_PileD = 0
	Top_reinforced_PileEI = 0
	Top_reinforced_PileD = 0
	Bottom_unreinforced_PileEI = 0
	Bottom_unreinforced_PileD = 0
	Bottom_reinforced_PileEI = 0
	Bottom_reinforced_PileD = 0
	
	# 말뚝 특성치
	Top_reinforced_Property = json.loads(Cal_Property(json.dumps(pileData), 'top', 'reinforced'))
	Top_unreinforced_Property = json.loads(Cal_Property(json.dumps(pileData), 'top', 'unreinforced'))
	Bottom_unreinforced_Property = json.loads(Cal_Property(json.dumps(pileData), 'bottom', 'unreinforced'))
	Bottom_reinfored_Property = json.loads(Cal_Property(json.dumps(pileData), 'bottom', 'reinforced'))
	
	if(pileData['pileType'] == 'Soil_Cement_Pile'):
		Top_unreinforced_PileEI = Top_unreinforced_Property[6]*Top_unreinforced_Property[8]
		Top_unreinforced_PileD = Top_unreinforced_Property[3]
		Top_reinforced_PileEI = Top_reinforced_Property[6]*Top_reinforced_Property[8]
		Top_reinforced_PileD = Top_reinforced_Property[3]
	else:
		Top_unreinforced_PileEI = Top_unreinforced_Property[1]*Top_unreinforced_Property[2]
		Top_unreinforced_PileD = Top_unreinforced_Property[3]
		Top_reinforced_PileEI = Top_reinforced_Property[1]*Top_reinforced_Property[2]
		Top_reinforced_PileD = Top_reinforced_Property[3]
  
	if (pileData['compPileType'] == 'Soil_Cement_Pile'):
		Bottom_unreinforced_PileEI = Bottom_unreinforced_Property[6]*Bottom_unreinforced_Property[8]
		Bottom_unreinforced_PileD = Bottom_unreinforced_Property[3]
		Bottom_reinforced_PileEI = Bottom_reinfored_Property[6]*Bottom_reinfored_Property[8]
		Bottom_reinforced_PileD = Bottom_reinfored_Property[3]
	else:
		Bottom_unreinforced_PileEI = Bottom_unreinforced_Property[1]*Bottom_unreinforced_Property[2]
		Bottom_unreinforced_PileD = Bottom_unreinforced_Property[3]
		Bottom_reinforced_PileEI = Bottom_reinfored_Property[1]*Bottom_reinfored_Property[2]
		Bottom_reinforced_PileD = Bottom_reinfored_Property[3]
	
	# 하부 말뚝이 있는 경우
	if CompStartLength > 0:
		Top_Length = Modified_CompStartLength
		Bottom_Length = Length - Modified_CompStartLength
	#하부 말뚝이 없는 경우
	else:
		Top_Length = Modified_PileTotalLength
		Bottom_Length = 0

	# Length 내 상부 길이, 하부 길이 계산
	# 이음 위치가 요구 길이보다 작을 경우
	if (Top_Length < Length):
		Top_Length = Top_Length
		Bottom_Length = Length - Top_Length
	# 이음 위치가 요구 길이보다 클 경우
	else:
		Top_Length = Length
		Bottom_Length = 0
	
	# 보강이 없을 경우
	if (Modified_ReinforcedEndLength - Modified_ReinforcedStartLength == 0):
		Top_unreinforced_Length = Top_Length
		Top_reinforced_Length = 0
		Bottom_unreinforced_Length = Bottom_Length
		Bottom_reinforced_Length = 0
  
	# 보강이 있을 경우
	else:
		#  이음 위치가 보강 시작부보다 작을 경우
		if (Top_Length <= Modified_ReinforcedStartLength):
			Top_unreinforced_Length = Top_Length
			Top_reinforced_Length = 0
			# 전체 길이가 보강 종료부보다 작을 경우
			if (Length <= Modified_ReinforcedEndLength):
				Bottom_reinforced_Length = min(Length, Modified_ReinforcedStartLength) - Top_Length
				Bottom_unreinforced_Length = Bottom_Length - Bottom_reinforced_Length
			# 전체 길이가 보강 종료부보다 클 경우
			else:
				Bottom_reinforced_Length = Modified_ReinforcedEndLength - Modified_ReinforcedStartLength
				Bottom_unreinforced_Length = Bottom_Length - Modified_ReinforcedEndLength
    
    # 이음 위치가 보강 사이에 있을 경우
		elif ( Modified_ReinforcedStartLength< Top_Length and Top_Length <= Modified_ReinforcedEndLength):
			Top_reinforced_Length = Top_Length - Modified_ReinforcedStartLength
			Top_unreinforced_Length = Top_Length - Top_reinforced_Length
			Bottom_reinforced_Length = min(Length, Modified_ReinforcedEndLength) - Top_Length
			Bottom_unreinforced_Length = Bottom_Length - Bottom_reinforced_Length
   
		# 이음 위치가 보강 종료부보다 클 경우
		else:
			Top_reinforced_Length = Modified_ReinforcedEndLength - Modified_ReinforcedStartLength
			Top_unreinforced_Length = Top_Length - Top_reinforced_Length
			Bottom_unreinforced_Length = Bottom_Length
			Bottom_reinforced_Length = 0

	## 	
 
	PileEI = (Top_unreinforced_PileEI*Top_unreinforced_Length + Top_reinforced_PileEI*Top_reinforced_Length + Bottom_unreinforced_PileEI*Bottom_unreinforced_Length + Bottom_reinforced_PileEI*Bottom_reinforced_Length)/Length
	PileD = (Top_unreinforced_PileD*Top_unreinforced_Length + Top_reinforced_PileD*Top_reinforced_Length + Bottom_unreinforced_PileD*Bottom_unreinforced_Length + Bottom_reinforced_PileD*Bottom_reinforced_Length)/Length
	result = [PileEI, PileD]
	return json.dumps(result)

