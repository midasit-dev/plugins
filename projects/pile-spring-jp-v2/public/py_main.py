### do not delete this import scripts ###
import json
from py_base import set_g_values, get_g_values, requests_json, MidasAPI, Product
from py_base_sub import HelloWorld, ApiGet
### do not delete this import scripts ###

def main():
	print('write here ...')

VALID_POSITIONS = {"top", "middle", "bottom"}
VALID_REINFORCED_STATES = {"reinforced", "unreinforced"}

def Cal_Property(PileData, Position, ReinforcedState):
    """
    Calculate properties of the pile depending on its position and reinforcement state.

    Parameters:
    - PileData: dict (pile input data)
    - Position: str, must be one of {'top', 'middle', 'bottom'}
    - ReinforcedState: str, must be one of {'reinforced', 'unreinforced'}

    Returns:
    - dict of computed properties
    """
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
    
    # 입력 제원 정리 / 단위계는 kN m 단위로 통일
    # 상부 말뚝일 경우
    try:
        if Position == "top":
            concreteDiameter = float(pileData["sectionData"][0])


def CalAlphaTheta(SoilData, SoilBasic, PileData):
    soilData = json.loads(SoilData)
    pileData = json.loads(PileData)
    soilBasic = json.loads(SoilBasic)
    

def Cal_Beta(Condition, SoilData, PileData, SoilBasic):
    """
    This function is for calculating beta value.
    Condition: normal, seismic, period
    SoilData: SoilData
    PileData: PileData
    SoilBasic: SoilBasic
    """
    soilData = json.loads(SoilData)
    pileData = json.loads(PileData)
    soilBasic = json.loads(SoilBasic)
    n = len(pileData)
    
    Beta = [1.0] * n
    Avg_alpha_E0 = [0.0] * n
    Bh = [0.0] * n
    Kh0 = [0.0] * n
    Kh = [0.0] * n
    
    