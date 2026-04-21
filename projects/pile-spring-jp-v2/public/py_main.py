### do not delete this import scripts ###
import json
import math
from decimal import Decimal
import numpy as np
from py_base import set_g_values, get_g_values, requests_json, MidasAPI, Product
from py_base_sub import HelloWorld, ApiGet
from py_base_sub import (
	py_db_create,
	py_db_create_item,
	py_db_read,
	py_db_read_item,
	py_db_update,
	py_db_update_item,
	py_db_delete,
)
### do not delete this import scripts ###


def main():
	print('Pile 6x6 General Spring Manual v2 - calculation script ready')


def py_db_get_maxid(item_name):
	civil = MidasAPI(Product.CIVIL, "KR")
	return json.dumps(civil.db_get_max_id(item_name))


# --------------------------------------------------------------------------------
# Shared helpers (ported from v1 pyscript_main.py)
# --------------------------------------------------------------------------------

def extract_numbers(input_string):
	if input_string is None:
		return json.dumps([0])
	if not isinstance(input_string, str):
		input_string = str(input_string)
	parts = input_string.replace(',', ' ').split()
	result = []
	for part in parts:
		if '@' in part:
			sub_parts = part.split('@')
			try:
				num1 = int(sub_parts[0])
				num2 = float(sub_parts[1])
				result += [num2] * num1
			except Exception:
				pass
		else:
			try:
				num = float(part)
				result.append(num)
			except Exception:
				pass
	if result == []:
		result = [0]
	return json.dumps(result)


def _pile_top_level(pile_item, fallback):
	try:
		value = pile_item.get('topLevel') if isinstance(pile_item, dict) else None
		if value is None:
			return float(fallback)
		return float(value)
	except Exception:
		return float(fallback)


def _pile_head_condition(pile_item, fallback):
	try:
		if isinstance(pile_item, dict) and pile_item.get('headCondition'):
			return pile_item.get('headCondition')
	except Exception:
		pass
	return fallback


def _pile_bottom_condition(pile_item, fallback):
	try:
		if isinstance(pile_item, dict) and pile_item.get('bottomCondition'):
			return pile_item.get('bottomCondition')
	except Exception:
		pass
	return fallback


# --------------------------------------------------------------------------------
# Pile geometry helpers
# --------------------------------------------------------------------------------

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
				CenterX.append(float(Decimal(str(CenterX[i])) + Decimal(str(majorSpace[i]))))
		elif pileData['majorRefValue'] == 2:
			CenterX = [float(Decimal(str(sideLength)) - Decimal(str(pileData['majorStartPoint'])))]
			for i in range(len(majorSpace)):
				CenterX.append(float(Decimal(str(CenterX[i])) - Decimal(str(majorSpace[i]))))
		CenterCoordinates = []
		if pileData['minorRefValue'] == 1:
			for i in range(len(CenterX)):
				CenterCoordinates.append([CenterX[i], float(pileData['minorStartPoint'])])
		elif pileData['minorRefValue'] == 2:
			for i in range(len(CenterX)):
				CenterCoordinates.append([CenterX[i], float(Decimal(str(foundationWidth)) - Decimal(str(pileData['minorStartPoint'])))])
	except Exception:
		return json.dumps([[0, 0]])
	return json.dumps(CenterCoordinates)


def CalPileDegree(PileData):
	pileData = json.loads(PileData)
	majorDegree = json.loads(extract_numbers(pileData['majorDegree']))
	minorDegree = json.loads(extract_numbers(pileData['minorDegree']))
	# number of piles in this group = number of positions = number of spaces + 1
	num_positions = len(majorDegree)
	# minor degree length may not match; pad with 0 if short
	if len(minorDegree) < num_positions:
		minorDegree = minorDegree + [0] * (num_positions - len(minorDegree))
	degree = []
	for i in range(num_positions):
		degree.append([majorDegree[i], minorDegree[i]])
	return json.dumps(degree)


# --------------------------------------------------------------------------------
# Beta calculation
# --------------------------------------------------------------------------------

def Cal_Beta(SoilData, PileTableData, Condition, SlopeEffectState, GroupEffectValue, TopLevel, GroundLevel):
	pileTableData = json.loads(PileTableData)
	soilData = json.loads(SoilData)

	Beta = [1 for _ in range(len(pileTableData))]
	Avg_alpha_E0 = [0 for _ in range(len(pileTableData))]
	Bh = [0 for _ in range(len(pileTableData))]
	Kh0 = [0 for _ in range(len(pileTableData))]
	Kh = [0 for _ in range(len(pileTableData))]
	Alpha_H_Theta_Total = json.loads(
		CalAlphaTheta(json.dumps(soilData), SlopeEffectState, json.dumps(pileTableData))
	)
	for i in range(len(pileTableData)):
		# per-pile top level (falls back to scalar TopLevel if not present)
		pile_top = _pile_top_level(pileTableData[i], TopLevel)

		InitialBeta = 1 / (float(pileTableData[i]['pileLength']) / 4)
		while True:
			LayerDepth = 0
			Avg_alpha_E0[i] = 0
			for j in range(len(soilData)):
				Alpha_HTheta = Alpha_H_Theta_Total[j]
				LayerDepth += float(soilData[j]['Depth'])
				if LayerDepth < (1 / InitialBeta):
					if Condition == 'normal':
						Avg_alpha_E0[i] += float(soilData[j]['aE0']) * float(soilData[j]['Depth']) * Alpha_HTheta
					elif Condition == 'seismic':
						Avg_alpha_E0[i] += float(soilData[j]['aE0_Seis']) * float(soilData[j]['Depth']) * Alpha_HTheta
					elif Condition == 'period':
						De = float(soilData[j]['DE'])
						Avg_alpha_E0[i] += float(soilData[j]['ED']) * float(soilData[j]['Depth']) * De * Alpha_HTheta
				else:
					if Condition == 'normal':
						Avg_alpha_E0[i] += float(soilData[j]['aE0']) * ((1 / InitialBeta) - (LayerDepth - float(soilData[j]['Depth']))) * Alpha_HTheta
						break
					elif Condition == 'seismic':
						Avg_alpha_E0[i] += float(soilData[j]['aE0_Seis']) * ((1 / InitialBeta) - (LayerDepth - float(soilData[j]['Depth']))) * Alpha_HTheta
						break
					elif Condition == 'period':
						De = float(soilData[j]['DE'])
						Avg_alpha_E0[i] += float(soilData[j]['ED']) * ((1 / InitialBeta) - (LayerDepth - float(soilData[j]['Depth']))) * De * Alpha_HTheta
						break
			Avg_alpha_E0[i] = Avg_alpha_E0[i] / (1 / InitialBeta)
			Properties = json.loads(Cal_EI_D(json.dumps(pileTableData[i]), (1 / InitialBeta), pile_top, GroundLevel))
			PileEI = Properties[0]
			PileD = Properties[1]
			Bh[i] = math.sqrt(PileD / InitialBeta)
			Kh0[i] = Avg_alpha_E0[i] / 0.3
			Kh[i] = Kh0[i] * math.pow((Bh[i] / 0.3), (-3 / 4)) * float(GroupEffectValue)
			Beta[i] = math.pow((Kh[i] * PileD / (4 * PileEI)), (1 / 4))
			if abs(Beta[i] - InitialBeta) > 0.00000001:
				InitialBeta = Beta[i]
			else:
				break

	result = [Beta, Avg_alpha_E0, Bh, Kh0, Kh]
	return json.dumps(result)


def CalAlphaTheta(SoilData, SlopeEffectState, PileTableData):
	soilData = json.loads(SoilData)
	pileTableData = json.loads(PileTableData)
	if len(pileTableData) == 0:
		return json.dumps([1 for _ in range(len(soilData))])
	Property = json.loads(Cal_Property(json.dumps(pileTableData[0]), 'top', 'unreinforced'))
	Diameter = float(Property[3])
	Alpha_HTheta = [1 for _ in range(len(soilData))]
	if SlopeEffectState is True and Diameter > 0:
		for i in range(len(soilData)):
			Alpha_H = float(soilData[i]['Length']) / Diameter
			if 0 <= Alpha_H < 0.5:
				Alpha_HTheta[i] = 0
			elif 0.5 <= Alpha_H < 10:
				Alpha_HTheta[i] = float(round(0.3 * math.log10(Alpha_H) + 0.7, 3))
			else:
				Alpha_HTheta[i] = 1
	return json.dumps(Alpha_HTheta)


# --------------------------------------------------------------------------------
# Kv calculation
# --------------------------------------------------------------------------------

def CalKv(PileTableData, groundLevel, topLevel):
	pileTableData = json.loads(PileTableData)
	Alpha1 = [0 for _ in range(len(pileTableData))]
	Alpha2 = [0 for _ in range(len(pileTableData))]
	Kv = [0 for _ in range(len(pileTableData))]

	for i in range(len(pileTableData)):
		# per-pile top level
		pile_top = _pile_top_level(pileTableData[i], topLevel)
		exposed_length = float(pile_top) - float(groundLevel)
		if exposed_length < 0:
			exposed_length = 0

		method = pileTableData[i]['constructionMethod']
		if method == 'CM_DropHammer':
			Alpha1[i] = 0.014; Alpha2[i] = 0.72
		elif method == 'CM_VibroHammer':
			Alpha1[i] = 0.017; Alpha2[i] = -0.014
		elif method == 'CM_InSitu':
			Alpha1[i] = 0.031; Alpha2[i] = -0.15
		elif method == 'CM_Boring':
			Alpha1[i] = 0.01; Alpha2[i] = 0.36
		elif method == 'CM_Preboring':
			Alpha1[i] = 0.013; Alpha2[i] = 0.53
		elif method == 'CM_SoilCement':
			Alpha1[i] = 0.040; Alpha2[i] = 0.15
		elif method == 'CM_Rotate':
			Alpha1[i] = 0.013; Alpha2[i] = 0.54

		section_depths = section_elements(pileTableData[i])

		if exposed_length > 0:
			value_exists = any(item[0] == exposed_length for item in section_depths)
			if not value_exists:
				insert_pos = 0
				for j in range(len(section_depths)):
					if section_depths[j][0] > exposed_length:
						insert_pos = j
						break
				new_section = [exposed_length, section_depths[insert_pos - 1][1], section_depths[insert_pos - 1][2]]
				section_depths.insert(insert_pos, new_section)

		for j in range(len(section_depths)):
			if section_depths[j][0] <= exposed_length:
				section_depths[j].append('exposed')
			else:
				section_depths[j].append('embedded')

		# 단일말뚝이거나, 단면 특성이 같은 경우
		if pileTableData[i]['compositeTypeCheck'] is False or (
			pileTableData[i]['compositeTypeCheck'] is True
			and pileTableData[i]['pileType'] == pileTableData[i]['compPileType']
		):
			Property = json.loads(Cal_Property(json.dumps(pileTableData[i]), 'top', 'unreinforced'))
			if pileTableData[i]['pileType'] == 'Soil_Cement_Pile':
				Section_EA = Property[7] * Property[5] + Property[6] * Property[4]
			else:
				Section_EA = Property[1] * Property[0]
			Section_D = Property[3]

			coeef_a = Alpha1[i] * (float(pileTableData[i]['pileLength']) - float(exposed_length)) / float(Section_D) + Alpha2[i] if Section_D > 0 else 0

			if exposed_length != 0:
				Kv_Pile = coeef_a * Section_EA / (float(pileTableData[i]['pileLength']) - exposed_length) if (float(pileTableData[i]['pileLength']) - exposed_length) > 0 else 0
			else:
				Kv_Pile = coeef_a * Section_EA / float(pileTableData[i]['pileLength'])

		else:
			# 복합말뚝 (SC + PHC 예외 처리)
			if (pileTableData[i]['pileType'] == 'SC_Pile' and pileTableData[i]['compPileType'] == 'PHC_Pile') or (
				pileTableData[i]['pileType'] == 'PHC_Pile' and pileTableData[i]['compPileType'] == 'SC_Pile'
			):
				position = 'top' if pileTableData[i]['pileType'] == 'PHC_Pile' else 'bottom'
				Property = json.loads(Cal_Property(json.dumps(pileTableData[i]), position, 'unreinforced'))
				Section_EA = Property[1] * Property[0]
				Section_D = Property[3]
				coeef_a = Alpha1[i] * (float(pileTableData[i]['pileLength']) - float(exposed_length)) / float(Section_D) + Alpha2[i] if Section_D > 0 else 0
				if exposed_length != 0:
					Kv_Pile = coeef_a * Section_EA / (float(pileTableData[i]['pileLength']) - exposed_length) if (float(pileTableData[i]['pileLength']) - exposed_length) > 0 else 0
				else:
					Kv_Pile = coeef_a * Section_EA / float(pileTableData[i]['pileLength'])
			else:
				Kv_Pile = 0
				for j in range(len(section_depths)):
					Property = json.loads(Cal_Property(json.dumps(pileTableData[i]), section_depths[j][1], section_depths[j][2]))
					if pileTableData[i]['pileType'] == 'Soil_Cement_Pile':
						Section_EA = Property[7] * Property[5] + Property[6] * Property[4]
					else:
						Section_EA = Property[1] * Property[0]
					Section_D = Property[3]

					if section_depths[j][3] == 'exposed':
						coeef_a = 0
					else:
						coeef_a = Alpha1[i] * (float(pileTableData[i]['pileLength']) - float(exposed_length)) / float(Section_D) + Alpha2[i] if Section_D > 0 else 0

					if j == 0:
						length_j = float(section_depths[j][0])
						Kv_i = (coeef_a * Section_EA / length_j) if length_j > 0 else 0
						Kv_Pile = Kv_i
					else:
						length_j = float(section_depths[j][0] - section_depths[j - 1][0])
						Kv_i = (coeef_a * Section_EA / length_j) if length_j > 0 else 0
						if Kv_Pile > 0 and Kv_i > 0:
							Kv_Pile = 1 / (1 / Kv_Pile + 1 / Kv_i)
						elif Kv_i > 0:
							Kv_Pile = Kv_i

		Kv[i] = Kv_Pile

	return json.dumps([Kv, Alpha1, Alpha2])


# --------------------------------------------------------------------------------
# K-value (K1~K4) calculation
# --------------------------------------------------------------------------------

def CalKValue(PileTableData, GroundLevel, TopLevel, SoilData, Condition, headCondition, bottomCondition, AlphaThetaResult, BetaNormalResult, BetaSeismicResult, BetaPeriodResult, liquefactionState):
	pileTableData = json.loads(PileTableData)
	soilData = json.loads(SoilData)

	Kvalue = [[0, 0, 0, 0] for _ in range(len(pileTableData))]

	for i in range(len(pileTableData)):
		# per-pile top level, head/bottom conditions
		pile_top = _pile_top_level(pileTableData[i], TopLevel)
		pile_head = _pile_head_condition(pileTableData[i], headCondition)
		pile_bottom = _pile_bottom_condition(pileTableData[i], bottomCondition)

		h = float(Decimal(str(pile_top)) - Decimal(str(GroundLevel)))
		if h < 0:
			h = 0

		# 누적 깊이 (+h는 기초 저면 위로의 노출길이 offset)
		SoilDepth = [0 for _ in range(len(soilData))]
		for k in range(len(soilData)):
			if k == 0:
				SoilDepth[k] = Decimal(str(soilData[k]['Depth'])) + Decimal(str(h))
			else:
				SoilDepth[k] = Decimal(str(SoilDepth[k - 1])) + Decimal(str(soilData[k]['Depth']))
		soilDepth = [float(x) for x in SoilDepth]
		soilDepth.insert(0, h)

		sections = section_elements(pileTableData[i])
		section_depths = [subarray[0] for subarray in sections]

		combined_depths = list(set(soilDepth + section_depths))
		combined_depths.sort()
		combined_depths = [float(Decimal(str(d))) for d in combined_depths]

		elements = []
		for j, depth in enumerate(combined_depths):
			Section_E = 0
			Section_I = 0
			Section_D = 0
			KH = 0
			Length = 0
			for k, section in enumerate(sections):
				if j == 0:
					Length = float(Decimal(str(depth)))
				else:
					Length = float(Decimal(str(depth)) - Decimal(str(combined_depths[j - 1])))
				if depth <= section[0]:
					Property = json.loads(Cal_Property(json.dumps(pileTableData[i]), section[1], section[2]))
					if pileTableData[i]['pileType'] == 'Soil_Cement_Pile':
						Section_E = Property[6]
						Section_I = Property[8]
					else:
						Section_E = Property[1]
						Section_I = Property[2]
					Section_D = Property[3]

					for kk, soildepth in enumerate(soilDepth):
						if depth <= soildepth:
							if kk == 0:
								KH = 0
							else:
								if Condition == 'period':
									KH0 = float(soilData[kk - 1]['ED']) / 0.3 * float(AlphaThetaResult[kk - 1])
									KH = KH0 * math.pow((BetaPeriodResult[2][i] / 0.3), (-3 / 4))
								elif Condition == 'normal':
									KH0 = float(soilData[kk - 1]['aE0']) / 0.3 * float(AlphaThetaResult[kk - 1])
									KH = KH0 * math.pow((BetaNormalResult[2][i] / 0.3), (-3 / 4))
								elif Condition == 'seismic':
									KH0 = float(soilData[kk - 1]['aE0_Seis']) / 0.3 * float(AlphaThetaResult[kk - 1])
									if liquefactionState == 'yes':
										KH = KH0 * math.pow((BetaNormalResult[2][i] / 0.3), (-3 / 4)) * float(soilData[kk - 1]['DE'])
									else:
										KH = KH0 * math.pow((BetaNormalResult[2][i] / 0.3), (-3 / 4))
							elements.append({"Length": Length, "E": Section_E, "I": Section_I, "D": Section_D, "KH": KH})
							break
					break

		new_elements = []
		for element in elements:
			L = element['Length']
			KH = element['KH'] * element['D']
			EI = element['E'] * element['I']
			if L != 0:
				divideNum = 5
				for _ in range(divideNum):
					new_elements.append({"Length": float(Decimal(str(L)) / Decimal(divideNum)), "EI": EI, "KH": KH})

		if len(new_elements) == 0:
			Kvalue[i] = [0, 0, 0, 0]
			continue

		element_stiffness_matrices = []
		for element in new_elements:
			L = element['Length']
			EI = element['EI']
			KH = element['KH']
			k = beam_stiffness_matrix(EI, L)
			kr = spring_stiffness_matrix(KH, L)
			element_stiffness_matrices.append(k + kr)

		NodeNum = len(new_elements) + 1
		K_global = np.zeros((NodeNum * 2, NodeNum * 2))
		for index, K_element in enumerate(element_stiffness_matrices):
			K_global[index * 2:index * 2 + 4, index * 2:index * 2 + 4] += K_element

		k_Reduced = apply_boundary_conditions(K_global, pile_bottom)

		F_horizontal = np.zeros(k_Reduced.shape[0])
		F_horizontal[0] = 1
		F_moment = np.zeros(k_Reduced.shape[0])
		F_moment[1] = 1

		try:
			u_horizontal = np.linalg.solve(k_Reduced, F_horizontal)
			u_moment = np.linalg.solve(k_Reduced, F_moment)
		except Exception:
			Kvalue[i] = [0, 0, 0, 0]
			continue

		if pile_head == 'Head_Condition_Fixed':
			Head_u = np.array([[u_horizontal[0], u_moment[0]], [u_horizontal[1], u_moment[1]]])
			try:
				X_Y1 = np.linalg.solve(Head_u, np.array([1, 0]))
				Kvalue[i][0] = X_Y1[0]
				Kvalue[i][2] = X_Y1[1]
				X_Y2 = np.linalg.solve(Head_u, np.array([0, 1]))
				Kvalue[i][1] = X_Y2[0]
				Kvalue[i][3] = X_Y2[1]
			except Exception:
				Kvalue[i] = [0, 0, 0, 0]
		else:
			Kvalue[i][0] = 1 / u_horizontal[0] if u_horizontal[0] != 0 else 0
			Kvalue[i][1] = 0
			Kvalue[i][2] = 0
			Kvalue[i][3] = 0

	return json.dumps(Kvalue)


def beam_stiffness_matrix(EI, L):
	if L == 0:
		return np.zeros((4, 4))
	k = (EI / L ** 3) * np.array([
		[12, 6 * L, -12, 6 * L],
		[6 * L, 4 * L ** 2, -6 * L, 2 * L ** 2],
		[-12, -6 * L, 12, -6 * L],
		[6 * L, 2 * L ** 2, -6 * L, 4 * L ** 2]
	])
	return k


def spring_stiffness_matrix(KH, L):
	Kr = (KH * L / 420) * np.array([
		[156, 22 * L, 54, -13 * L],
		[22 * L, 4 * L ** 2, 13 * L, -3 * L ** 2],
		[54, 13 * L, 156, -22 * L],
		[-13 * L, -3 * L ** 2, -22 * L, 4 * L ** 2]
	])
	return Kr


def apply_boundary_conditions(K, boundary_condition):
	if boundary_condition == 'Bottom_Condition_Fixed':
		K_reduced = K[:-2, :-2]
	elif boundary_condition == 'Bottom_Condition_Hinge':
		K_reduced = np.delete(K, -2, axis=0)
		K_reduced = np.delete(K_reduced, -2, axis=1)
	else:
		K_reduced = K
	return K_reduced


def section_elements(data):
	sections = []
	pile_length = float(data['pileLength'])
	composite_type_check = data['compositeTypeCheck']
	comp_start_length = float(data['compStartLength'])
	reinforced_start_length = float(data['reinforcedStartLength'])
	reinforced_end_length = float(data['reinforcedEndLength'])

	if not composite_type_check:
		if reinforced_end_length - reinforced_start_length > 0:
			if reinforced_start_length > 0:
				sections.append([reinforced_start_length, 'top', 'unreinforced'])
				sections.append([reinforced_end_length, 'top', 'reinforced'])
			else:
				sections.append([reinforced_end_length, 'top', 'reinforced'])
			if reinforced_end_length < pile_length:
				sections.append([pile_length, 'top', 'unreinforced'])
		else:
			sections.append([pile_length, 'top', 'unreinforced'])
	else:
		if reinforced_end_length - reinforced_start_length > 0:
			if reinforced_end_length < comp_start_length:
				sections.append([reinforced_start_length, 'top', 'unreinforced'])
				sections.append([reinforced_end_length, 'top', 'reinforced'])
				sections.append([comp_start_length, 'top', 'unreinforced'])
				sections.append([pile_length, 'bottom', 'unreinforced'])
			elif reinforced_end_length == comp_start_length:
				sections.append([reinforced_start_length, 'top', 'unreinforced'])
				sections.append([reinforced_end_length, 'top', 'reinforced'])
				sections.append([pile_length, 'bottom', 'unreinforced'])
			else:
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
				elif reinforced_start_length == comp_start_length:
					sections.append([reinforced_start_length, 'top', 'unreinforced'])
					if reinforced_end_length < pile_length:
						sections.append([reinforced_end_length, 'bottom', 'reinforced'])
						sections.append([pile_length, 'bottom', 'unreinforced'])
					else:
						sections.append([reinforced_end_length, 'bottom', 'reinforced'])
				else:
					sections.append([comp_start_length, 'top', 'unreinforced'])
					sections.append([reinforced_start_length, 'bottom', 'unreinforced'])
					if reinforced_end_length < pile_length:
						sections.append([reinforced_end_length, 'bottom', 'reinforced'])
						sections.append([pile_length, 'bottom', 'unreinforced'])
					else:
						sections.append([reinforced_end_length, 'bottom', 'reinforced'])
		else:
			sections.append([comp_start_length, 'top', 'unreinforced'])
			sections.append([pile_length, 'bottom', 'unreinforced'])
	return sections


# --------------------------------------------------------------------------------
# Matrix (A-matrix) calculation
# --------------------------------------------------------------------------------

def CalDistFromCentriod(PileTableData, FoundationWidth, SideLength, Force_Point_X, Force_Point_Y):
	pileTableData = json.loads(PileTableData)
	foundationWidth = json.loads(FoundationWidth)
	sideLength = json.loads(SideLength)

	CentroidX = float(Force_Point_X)
	CentroidY = float(Force_Point_Y)
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

	disFromCentroid = json.loads(CalDistFromCentriod(PileTableData, FoundationWidth, SideLength, float(Force_Point_X), float(Force_Point_Y)))

	PileDegree = []
	for pileData in pileTableData:
		PileDegree.append(json.loads(CalPileDegree(json.dumps(pileData))))

	for i in range(len(PileDegree)):
		for j in range(len(PileDegree[i])):
			PileDegree[i][j][0] = math.radians(PileDegree[i][j][0])
			PileDegree[i][j][1] = math.radians(PileDegree[i][j][1])

	CalKvResult = json.loads(KvResult)
	Kv = CalKvResult[0]

	if ResultType == 'normal':
		KValue = json.loads(KValue_Normal)
	elif ResultType == 'seismic':
		KValue = json.loads(KValue_Seismic_Liq) if liquifactionstate == 'yes' else json.loads(KValue_Seismic)
	elif ResultType == 'period':
		KValue = json.loads(KValue_Period)
	else:
		KValue = json.loads(KValue_Normal)

	Axx = 0.0; Axy = 0.0; Axa = 0.0
	Ayy = 0.0; Aya = 0.0; Aaa = 0.0

	dir_index = 0 if Direction == 'X' else 1
	for i in range(len(Kv)):
		for j in range(len(PileDegree[i])):
			theta = PileDegree[i][j][dir_index]
			dist = float(disFromCentroid[i][j][dir_index])
			cos_t = math.cos(theta)
			sin_t = math.sin(theta)
			K0 = float(KValue[i][0])
			K1 = float(KValue[i][1])
			K2 = float(KValue[i][2])
			K3 = float(KValue[i][3])
			Kvi = float(Kv[i])

			Axx += K0 * cos_t ** 2 + Kvi * sin_t ** 2
			Axy += (Kvi - K0) * sin_t * cos_t
			Axa += (Kvi - K0) * dist * sin_t * cos_t - K1 * cos_t
			Ayy += Kvi * cos_t ** 2 + K0 * sin_t ** 2
			Aya += (Kvi * cos_t ** 2 + K0 * sin_t ** 2) * dist + K1 * sin_t
			Aaa1 = (Kvi * cos_t ** 2 + K0 * sin_t ** 2) * dist ** 2
			Aaa2 = (K1 + K2) * dist * sin_t + K3
			Aaa += Aaa1 + Aaa2

	return json.dumps([Axx, Axy, Axa, Ayy, Aya, Aaa])


# --------------------------------------------------------------------------------
# Section property calculation
# --------------------------------------------------------------------------------

def Cal_Property(PileData, Position, ReinforcedState):
	pileData = json.loads(PileData)
	Area = 0; Modulus = 0; SecInertia = 0; Diameter = 0
	SteelArea = 0; CementArea = 0
	SteelModulus = 0; CementModulus = 0
	SteelInertia = 0; CementInertia = 0

	try:
		if Position == 'top':
			concreteDiameter = float(pileData['concreteDiameter']) / 1000
			concreteThickness = float(pileData['concreteThickness']) / 1000
			concreteModulus = float(pileData['concreteModulus']) * 1000
			if pileData['pileType'] == 'PHC_Pile' or pileData['pileType'] == 'Cast_In_Situ':
				steelDiameter = float(pileData['steelDiameter']) / 1000000
			else:
				steelDiameter = float(pileData['steelDiameter']) / 1000
			steelThickness = float(pileData['steelThickness']) / 1000
			steelModulus = float(pileData['steelModulus']) * 1000
			steelCorThickness = float(pileData['steelCorThickness']) / 1000
		elif Position == 'bottom':
			concreteDiameter = float(pileData['compConcreteDiameter']) / 1000
			concreteThickness = float(pileData['compConcreteThickness']) / 1000
			concreteModulus = float(pileData['compConcreteModulus']) * 1000
			if pileData['compPileType'] == 'PHC_Pile' or pileData['compPileType'] == 'Cast_In_Situ':
				steelDiameter = float(pileData['compSteelDiameter']) / 1000000
			else:
				steelDiameter = float(pileData['compSteelDiameter']) / 1000
			steelThickness = float(pileData['compSteelThickness']) / 1000
			steelModulus = float(pileData['compSteelModulus']) * 1000
			steelCorThickness = float(pileData['compSteelCorThickness']) / 1000
		else:
			concreteDiameter = 0; concreteThickness = 0; concreteModulus = 0
			steelDiameter = 0; steelThickness = 0; steelModulus = 0; steelCorThickness = 0

		outerThickness = float(pileData['outerThickness']) / 1000
		outerModulus = float(pileData['outerModulus']) * 1000
		innerThickness = float(pileData['innerThickness']) / 1000
		innerModulus = float(pileData['innerModulus']) * 1000
	except Exception:
		return json.dumps([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

	try:
		pType = pileData['pileType'] if Position == 'top' else pileData['compPileType']

		if ReinforcedState == 'unreinforced':
			if pType == 'Cast_In_Situ':
				Area = math.pi / 4 * concreteDiameter ** 2
				Modulus = concreteModulus
				SecInertia = (math.pi * concreteDiameter ** 4) / 64
				Diameter = concreteDiameter
			elif pType == 'PHC_Pile':
				Area = (concreteDiameter - concreteThickness) * math.pi * concreteThickness + (steelModulus / concreteModulus - 1) * steelDiameter
				Modulus = concreteModulus
				Ic = math.pi / 64 * (math.pow(concreteDiameter, 4) - math.pow((concreteDiameter - 2 * concreteThickness), 4))
				Is = (steelModulus / concreteModulus - 1) * (1 / 2) * steelDiameter * math.pow(steelCorThickness, 2)
				SecInertia = Ic + Is
				Diameter = concreteDiameter
			elif pType == 'SC_Pile':
				Area1 = math.pi / 4 * (math.pow(concreteDiameter - 2 * steelCorThickness, 2) - math.pow(concreteDiameter - 2 * concreteThickness, 2))
				Area2 = math.pi / 4 * (steelModulus / concreteModulus - 1) * (math.pow(concreteDiameter - 2 * steelCorThickness, 2) - math.pow(concreteDiameter - 2 * steelThickness, 2))
				Area = Area1 + Area2
				Modulus = concreteModulus
				Ic = math.pi / 64 * (math.pow(concreteDiameter - 2 * steelCorThickness, 4) - math.pow(concreteDiameter - 2 * concreteThickness, 4))
				Is = math.pi / 64 * (steelModulus / concreteModulus - 1) * (math.pow(concreteDiameter - 2 * steelCorThickness, 4) - math.pow(concreteDiameter - 2 * steelThickness, 4))
				SecInertia = Ic + Is
				Diameter = concreteDiameter
			elif pType == 'Steel_Pile':
				Area = math.pi / 4 * (math.pow(steelDiameter - 2 * steelCorThickness, 2) - math.pow(steelDiameter - 2 * steelThickness, 2))
				Modulus = steelModulus
				SecInertia = math.pi / 64 * (math.pow(steelDiameter - 2 * steelCorThickness, 4) - math.pow(steelDiameter - 2 * steelThickness, 4))
				Diameter = steelDiameter
			elif pType == 'Soil_Cement_Pile':
				SteelArea = math.pi / 4 * (math.pow(steelDiameter - 2 * steelCorThickness, 2) - math.pow(steelDiameter - 2 * steelThickness, 2))
				SteelModulus = steelModulus
				SteelInertia = math.pi / 64 * (math.pow(steelDiameter - 2 * steelCorThickness, 4) - math.pow(steelDiameter - 2 * steelThickness, 4))
				CementArea = math.pi / 4 * math.pow(concreteDiameter, 2) - SteelArea
				CementModulus = concreteModulus
				CementInertia = math.pi / 64 * math.pow(concreteDiameter, 4) - SteelInertia
				Diameter = concreteDiameter
		elif ReinforcedState == 'reinforced':
			if pType == 'Cast_In_Situ':
				Area1 = math.pi / 4 * concreteDiameter ** 2
				Area2 = outerModulus / concreteModulus * (concreteDiameter + outerThickness + 2 * innerThickness) * math.pi * outerThickness
				Area3 = innerModulus / concreteModulus * (concreteDiameter + innerThickness) * math.pi * innerThickness
				Area = Area1 + Area2 + Area3
				Modulus = concreteModulus
				SecInertia1 = (math.pi * concreteDiameter ** 4) / 64
				SecInertia2 = outerModulus / concreteModulus / 8 * math.pow(concreteDiameter + outerThickness + innerThickness, 2) * (concreteDiameter + outerThickness) * math.pi * outerThickness
				SecInertia3 = innerModulus / concreteModulus / 8 * math.pow(concreteDiameter + innerThickness, 3) * math.pi * innerThickness
				SecInertia = SecInertia1 + SecInertia2 + SecInertia3
				Diameter = concreteDiameter + 2 * outerThickness + 2 * innerThickness
			elif pType == 'PHC_Pile':
				Area1 = (concreteDiameter - concreteThickness) * math.pi * concreteThickness + (steelModulus / concreteModulus - 1) * steelDiameter
				Area2 = outerModulus / concreteModulus * (concreteDiameter + outerThickness + 2 * innerThickness) * math.pi * outerThickness
				Area3 = innerModulus / concreteModulus * (concreteDiameter + innerThickness) * math.pi * innerThickness
				Area = Area1 + Area2 + Area3
				Modulus = concreteModulus
				Ic = math.pi / 64 * (math.pow(concreteDiameter, 4) - math.pow((concreteDiameter - 2 * concreteThickness), 4))
				Is = (steelModulus / concreteModulus - 1) * (1 / 2) * steelDiameter * math.pow(steelCorThickness, 2)
				SecInertia1 = Ic + Is
				SecInertia2 = outerModulus / concreteModulus / 8 * math.pow(concreteDiameter + outerThickness + innerThickness, 2) * (concreteDiameter + outerThickness) * math.pi * outerThickness
				SecInertia3 = innerModulus / concreteModulus / 8 * math.pow(concreteDiameter + innerThickness, 3) * math.pi * innerThickness
				SecInertia = SecInertia1 + SecInertia2 + SecInertia3
				Diameter = concreteDiameter + 2 * outerThickness + 2 * innerThickness
			elif pType == 'SC_Pile':
				Area1 = math.pi / 4 * (math.pow(concreteDiameter - 2 * steelCorThickness, 2) - math.pow(concreteDiameter - 2 * concreteThickness, 2))
				Area2 = math.pi / 4 * (steelModulus / concreteModulus - 1) * (math.pow(concreteDiameter - 2 * steelCorThickness, 2) - math.pow(concreteDiameter - 2 * steelThickness, 2))
				Area3 = Area1 + Area2
				Area4 = outerModulus / concreteModulus * (concreteDiameter + outerThickness + 2 * innerThickness) * math.pi * outerThickness
				Area5 = innerModulus / concreteModulus * (concreteDiameter + innerThickness) * math.pi * innerThickness
				Area = Area3 + Area4 + Area5
				Modulus = concreteModulus
				Ic = math.pi / 64 * (math.pow(concreteDiameter - 2 * steelCorThickness, 4) - math.pow(concreteDiameter - 2 * concreteThickness, 4))
				Is = math.pi / 64 * (steelModulus / concreteModulus - 1) * (math.pow(concreteDiameter - 2 * steelCorThickness, 4) - math.pow(concreteDiameter - 2 * steelThickness, 4))
				SecInertia1 = Ic + Is
				SecInertia2 = outerModulus / concreteModulus / 8 * math.pow(concreteDiameter + outerThickness + innerThickness, 2) * (concreteDiameter + outerThickness) * math.pi * outerThickness
				SecInertia3 = innerModulus / concreteModulus / 8 * math.pow(concreteDiameter + innerThickness, 3) * math.pi * innerThickness
				SecInertia = SecInertia1 + SecInertia2 + SecInertia3
				Diameter = concreteDiameter + 2 * outerThickness + 2 * innerThickness
			elif pType == 'Steel_Pile':
				Area1 = math.pi / 4 * (math.pow(steelDiameter - 2 * steelCorThickness, 2) - math.pow(steelDiameter - 2 * steelThickness, 2))
				Area2 = outerModulus / steelModulus * (steelDiameter + outerThickness + 2 * innerThickness) * math.pi * outerThickness
				Area3 = innerModulus / steelModulus * (steelDiameter + innerThickness) * math.pi * innerThickness
				Area = Area1 + Area2 + Area3
				Modulus = steelModulus
				SecInertia1 = math.pi / 64 * (math.pow(steelDiameter - 2 * steelCorThickness, 4) - math.pow(steelDiameter - 2 * steelThickness, 4))
				SecInertia2 = outerModulus / steelModulus / 8 * math.pow(steelDiameter + outerThickness + innerThickness, 2) * (steelDiameter + outerThickness) * math.pi * outerThickness
				SecInertia3 = innerModulus / steelModulus / 8 * math.pow(steelDiameter + innerThickness, 3) * math.pi * innerThickness
				SecInertia = SecInertia1 + SecInertia2 + SecInertia3
				Diameter = steelDiameter + 2 * outerThickness + 2 * innerThickness
			elif pType == 'Soil_Cement_Pile':
				SteelArea = math.pi / 4 * (math.pow(steelDiameter - 2 * steelCorThickness, 2) - math.pow(steelDiameter - 2 * steelThickness, 2))
				SteelModulus = steelModulus
				SteelInertia = math.pi / 64 * (math.pow(steelDiameter - 2 * steelCorThickness, 4) - math.pow(steelDiameter - 2 * steelThickness, 4))
				CementArea = math.pi / 4 * math.pow(concreteDiameter, 2) - SteelArea
				CementModulus = concreteModulus
				CementInertia = math.pi / 64 * math.pow(concreteDiameter, 4) - SteelInertia
				Diameter = concreteDiameter
	except Exception:
		Area = 0; Modulus = 0; SecInertia = 0; Diameter = 0
		SteelArea = 0; CementArea = 0; SteelModulus = 0; CementModulus = 0
		SteelInertia = 0; CementInertia = 0

	result = [Area, Modulus, SecInertia, Diameter, SteelArea, CementArea, SteelModulus, CementModulus, SteelInertia, CementInertia]
	return json.dumps(result)


def Cal_EI_D(PileData, Length, TopLevel, GroundLevel):
	pileData = json.loads(PileData)
	PileTotalLength = float(pileData['pileLength'])
	CompStartLength = float(pileData['compStartLength'])
	ReinforcedStartLength = float(pileData['reinforcedStartLength'])
	ReinforcedEndLength = float(pileData['reinforcedEndLength'])

	if float(TopLevel) > float(GroundLevel):
		ExposedLength = float(TopLevel) - float(GroundLevel)
	else:
		ExposedLength = 0

	Modified_PileTotalLength = max(PileTotalLength - ExposedLength, 0)
	Modified_CompStartLength = max(CompStartLength - ExposedLength, 0)
	Modified_ReinforcedStartLength = max(ReinforcedStartLength - ExposedLength, 0)
	Modified_ReinforcedEndLength = max(ReinforcedEndLength - ExposedLength, 0)

	Top_unreinforced_Length = 0
	Top_reinforced_Length = 0
	Bottom_unreinforced_Length = 0
	Bottom_reinforced_Length = 0

	Top_reinforced_Property = json.loads(Cal_Property(json.dumps(pileData), 'top', 'reinforced'))
	Top_unreinforced_Property = json.loads(Cal_Property(json.dumps(pileData), 'top', 'unreinforced'))
	Bottom_unreinforced_Property = json.loads(Cal_Property(json.dumps(pileData), 'bottom', 'unreinforced'))
	Bottom_reinfored_Property = json.loads(Cal_Property(json.dumps(pileData), 'bottom', 'reinforced'))

	if pileData['pileType'] == 'Soil_Cement_Pile':
		Top_unreinforced_PileEI = Top_unreinforced_Property[6] * Top_unreinforced_Property[8]
		Top_unreinforced_PileD = Top_unreinforced_Property[3]
		Top_reinforced_PileEI = Top_reinforced_Property[6] * Top_reinforced_Property[8]
		Top_reinforced_PileD = Top_reinforced_Property[3]
	else:
		Top_unreinforced_PileEI = Top_unreinforced_Property[1] * Top_unreinforced_Property[2]
		Top_unreinforced_PileD = Top_unreinforced_Property[3]
		Top_reinforced_PileEI = Top_reinforced_Property[1] * Top_reinforced_Property[2]
		Top_reinforced_PileD = Top_reinforced_Property[3]

	if pileData['compPileType'] == 'Soil_Cement_Pile':
		Bottom_unreinforced_PileEI = Bottom_unreinforced_Property[6] * Bottom_unreinforced_Property[8]
		Bottom_unreinforced_PileD = Bottom_unreinforced_Property[3]
		Bottom_reinforced_PileEI = Bottom_reinfored_Property[6] * Bottom_reinfored_Property[8]
		Bottom_reinforced_PileD = Bottom_reinfored_Property[3]
	else:
		Bottom_unreinforced_PileEI = Bottom_unreinforced_Property[1] * Bottom_unreinforced_Property[2]
		Bottom_unreinforced_PileD = Bottom_unreinforced_Property[3]
		Bottom_reinforced_PileEI = Bottom_reinfored_Property[1] * Bottom_reinfored_Property[2]
		Bottom_reinforced_PileD = Bottom_reinfored_Property[3]

	if CompStartLength > 0:
		Top_Length = Modified_CompStartLength
		Bottom_Length = Length - Modified_CompStartLength
	else:
		Top_Length = Modified_PileTotalLength
		Bottom_Length = 0

	if Top_Length < Length:
		Bottom_Length = Length - Top_Length
	else:
		Top_Length = Length
		Bottom_Length = 0

	if Modified_ReinforcedEndLength - Modified_ReinforcedStartLength == 0:
		Top_unreinforced_Length = Top_Length
		Top_reinforced_Length = 0
		Bottom_unreinforced_Length = Bottom_Length
		Bottom_reinforced_Length = 0
	else:
		if Top_Length <= Modified_ReinforcedStartLength:
			Top_unreinforced_Length = Top_Length
			Top_reinforced_Length = 0
			if Length <= Modified_ReinforcedEndLength:
				Bottom_reinforced_Length = min(Length, Modified_ReinforcedStartLength) - Top_Length
				Bottom_unreinforced_Length = Bottom_Length - Bottom_reinforced_Length
			else:
				Bottom_reinforced_Length = Modified_ReinforcedEndLength - Modified_ReinforcedStartLength
				Bottom_unreinforced_Length = Bottom_Length - Modified_ReinforcedEndLength
		elif Modified_ReinforcedStartLength < Top_Length and Top_Length <= Modified_ReinforcedEndLength:
			Top_reinforced_Length = Top_Length - Modified_ReinforcedStartLength
			Top_unreinforced_Length = Top_Length - Top_reinforced_Length
			Bottom_reinforced_Length = min(Length, Modified_ReinforcedEndLength) - Top_Length
			Bottom_unreinforced_Length = Bottom_Length - Bottom_reinforced_Length
		else:
			Top_reinforced_Length = Modified_ReinforcedEndLength - Modified_ReinforcedStartLength
			Top_unreinforced_Length = Top_Length - Top_reinforced_Length
			Bottom_unreinforced_Length = Bottom_Length
			Bottom_reinforced_Length = 0

	if Length == 0:
		return json.dumps([0, 0])

	PileEI = (
		Top_unreinforced_PileEI * Top_unreinforced_Length
		+ Top_reinforced_PileEI * Top_reinforced_Length
		+ Bottom_unreinforced_PileEI * Bottom_unreinforced_Length
		+ Bottom_reinforced_PileEI * Bottom_reinforced_Length
	) / Length
	PileD = (
		Top_unreinforced_PileD * Top_unreinforced_Length
		+ Top_reinforced_PileD * Top_reinforced_Length
		+ Bottom_unreinforced_PileD * Bottom_unreinforced_Length
		+ Bottom_reinforced_PileD * Bottom_reinforced_Length
	) / Length
	return json.dumps([PileEI, PileD])
