### do not delete this import scripts ###
import json
from py_base import set_g_values, get_g_values, requests_json, MidasAPI, Product
from py_base_sub import HelloWorld, ApiGet
import math
import numpy as np
import matplotlib.pyplot as plt
import random
### do not delete this import scripts ###

def DS_KDS_2019(importance_factor, response_modi_coef, maximum_period, sds, sd1):
	st = 0
	ed = maximum_period
	Step = 100
	dt = (ed - st) / Step
	dTol = dt / Step  # Tolerance

	dSds = sds
	dSd1 = sd1
	dTs = dSd1 / dSds
	dT0 = 0.2 * dTs
	dI = importance_factor
	dR = response_modi_coef

	period = []
	value = []

	for i in range(Step + 1):
		Tn = st + dt * i

		if (0 <= Tn <= dT0):
			dSa = (0.6 * dSds / dT0 * Tn + 0.4 * dSds) * dI / dR
		elif (dT0 < Tn <= dTs):
			dSa = dSds * dI / dR
		elif dTs < Tn <= 5.0:
			dSa = dSd1 / Tn * dI / dR
		elif (Tn > 5.0):
			dSa = dSd1 * 5.0 / Tn / Tn * dI / dR

		if ((dT0 + dTol) < Tn < (dT0 + dt - dTol)):  # transition point
			period.append(dT0)
			value.append(dSds * dI / dR)
		if ((dTs + dTol) < Tn < (dTs + dt - dTol)):  # transition point
			period.append(dTs)
			value.append(dSds * dI / dR)

		period.append(Tn)
		value.append(dSa)
           
	return json.dumps({
		"period": period,
		"value": value
	})

def initialize(minPeriod, inMaxPeriod, inNumPeriod, inPeriod, inRs, rsVel, numPeriod, minNumber, dPeriod, periods, freqs, omegas):

    rsAcc = np.zeros(numPeriod)

    periods[0] = minPeriod    
    for i in range(1, numPeriod - 1):
        periods[i] = minPeriod * math.pow(10., i * dPeriod)
    periods[numPeriod - 1] = inMaxPeriod

    for i in range(numPeriod):
        j = numPeriod - i - 1
        freqs[j] = 1. / periods[i]
        omegas[j] = 2. * math.pi / periods[i]

    flag = False
    for i in range(numPeriod):
        for j in range(1, inNumPeriod):
            if inRs[j] < minNumber or inRs[j - 1] < minNumber or inPeriod[j] < minNumber or inPeriod[j - 1] < minNumber:
                x1 = inPeriod[j - 1]
                x2 = inPeriod[j]
                y1 = inRs[j - 1]
                y2 = inRs[j]
                x = periods[i]
                flag = False
            else:
                x1 = math.log(inPeriod[j - 1])
                x2 = math.log(inPeriod[j])
                y1 = math.log(inRs[j - 1])
                y2 = math.log(inRs[j])
                x = math.log(periods[i])
                flag = True

            if periods[i] < inPeriod[j]:
                val = (y2 - y1) * (x - x1) / (x2 - x1) + y1
                rsAcc[i] = math.exp(val) if flag else val
                break
            elif periods[i] == inPeriod[j]:
                rsAcc[i] = inRs[j]
                break

    for i in range(numPeriod):
        rsVel[i] = rsAcc[i] / (2. * math.pi / periods[i])  # *_grav;

    # print(rsAcc, rsVel)


def calculatePSD(totalTime, levelTime, dampingRatio, numPeriod, rsVel, rsPs, psd, omegas):
    
    t0 = (totalTime + levelTime) / 2.0
    xi = dampingRatio

    p = 0.368
    dpow, trans, xis, qys, xsp, rstar, et, arg, rsp = 0., 1.0, 0., 0., 0., 0., 0., 0., 0.
    Gw_sum = 0.0

    for i in range(numPeriod):        
        dpow = 2.0 * xi * omegas[i] * t0
        trans = 1.0
        if dpow <= 50.0: trans = 1.0 - math.exp(-dpow)
        xis = xi / trans
        qys = math.sqrt(4.0 * xis / math.pi)
        xsp = -omegas[i] * t0 / (2 * math.pi * math.log(p))
        
        chk_value1 = math.log(2.0 * xsp)
        if chk_value1 < 0.0: rsp = 1.0
        else:
            rstar = math.sqrt(2.0 * math.log(2.0 * xsp))
            et = -rstar * qys * math.sqrt(math.pi / 2.0)
            arg = 2.0 * xsp * (1.0 - math.exp(et))
            chk_value2 = math.log(arg)
            if(chk_value2 < 0.0): rsp = 1.0
            else:
                rsp = math.sqrt(2.0 * chk_value2)

        #if arg < 1.0 or math.isnan(arg) or not math.isfinite(arg): rsp = 1.0
        #else: rsp = math.sqrt(2.0 * math.log(arg))

        rsPs[i] = rsp

        j = numPeriod - 1 - i
        psd[i] = (4.0 * xis / (omegas[i] * math.pi)) * (math.pow((rsVel[j] * omegas[i] / rsp), 2) - Gw_sum)

        if i > 0: Gw_sum += psd[i] * (omegas[i] - (omegas[i - 1]))
        else: Gw_sum = 0.5 * omegas[0] * psd[0]

    Dumx, Dumy, A, B, Wbar, Wstar, Area = 0, 0, 0, 0, 0, 0, 0
    Xlam0, Xlam1, Xlam2 = 0.0, 0.0, 0.0

    for i in range(1, numPeriod):
        Dumx = (psd[i] + psd[i - 1]) / 2.0
        Dumy = omegas[i] - (omegas[i - 1])
        if psd[i] < psd[i - 1]:
            A = psd[i]
            B = psd[i - 1]
            Wbar = Dumy * (2.0 * B + A) / (3.0 * (A + B))
            Wstar = omegas[i] - Wbar
        else:
            A = psd[i - 1]
            B = psd[i]
            Wbar = Dumy * (2.0 * B + A) / (3.0 * (A + B))
            Wstar = (omegas[i - 1]) + Wbar
        Area = Dumx * Dumy
        Xlam0 += Area
        Xlam1 += Wstar * Area
        Xlam2 += Wstar * Wstar * Area

    Wcp = math.sqrt(Xlam2 / Xlam0)  # central frequency
    Ratio = (Xlam1 * Xlam1) / (Xlam0 * Xlam2)
    Qp = math.sqrt(1.0 - Ratio)  # dispersion parameter    


def interpolate(w_temp, n, df, Gwk, mode, numPeriod, omegas):
    slop = 0
    npos = n
    dfreq = df
    for i in range(npos, numPeriod):
        if w_temp < omegas[i]:
            if i > 0:
                if mode == 1:
                    slop = (Gwk[i] - Gwk[i - 1]) / (omegas[i] - omegas[i-1])
                    dfreq = Gwk[i - 1] + slop * (w_temp - omegas[i-1])
                    break
                elif mode == 2:
                    slop = (omegas[i] + omegas[i-1]) / 2.0
                    if w_temp <= slop: dfreq = Gwk[i - 1]
                    if w_temp > slop: dfreq = Gwk[i]
                    break
        elif w_temp != omegas[i]:
            npos += 1
            if npos <= numPeriod: continue
            dfreq = Gwk[numPeriod - 1]
            break
        dfreq = Gwk[i]
        break
    return [dfreq, npos]

def curve_fitting(x_data, y_data):
    # Prepare data for regression library
    model = np.polyfit(x_data, y_data, 3)
    predict = np.poly1d(model)
    for i in range(len(x_data)):
        y_data[i] -= predict(x_data[i])

def computeAcceleration(rise_time, level_time, dur_time, Gwg, Fq, Pa, Ftc1, Ftc2, dt):
    nacc = int(dur_time / dt)

    accel = np.zeros(nacc)

    nfreq = len(Gwg)
    kcheck = 1000
    for i in range(nfreq):
        Aa = math.sqrt(abs(Gwg[i]))
        Alfa = Fq[i] * dt
        Sina = math.sin(Alfa)
        Cosa = math.cos(Alfa)
        Sn = math.sin(Pa[i])
        Cn = math.cos(Pa[i])
        Sna = Sina * Cn + Cosa * Sn
        Cna = Cosa * Cn - Sina * Sn
        accel[1] = Aa * Sna + accel[1]

        for j in range(2, nacc):
            if j >= kcheck:
                kcheck += 1000
                Sna = math.sin(Pa[i] + (j - 1) * Alfa)
                Cna = math.cos(Pa[i] + (j - 1) * Alfa)
            else:
                Sno = Sna
                Sna = Sna * Cosa + Cna * Sina
                Cna = Cna * Cosa - Sno * Sina

            accel[j] += Aa * Sna

    Tx = rise_time
    for j in range(1, nacc):
        Ti = j * dt
        if Ti <= Tx:
            Ft = Ftc1 * Ti
        elif Ti - Tx - level_time > 0.:
            Ft = 1. + (Ti - Tx - level_time) * Ftc2
        else:
            Ft = 1.
        accel[j] *= Ft

    x_data = np.array([dt * i for i in range(nacc)])
    curve_fitting(x_data, accel)    

    return accel

def scalingAcceleration(accel, max_g, dt):
    acc = 0
    disp = 0
    vel = 0
    Amax = abs(accel[0])
    Vmax = 0
    Dmax = 0

    nacc = len(accel)
    for i in range(1, nacc):
        acc = abs(accel[i])
        vel += accel[i] * dt
        disp += vel * dt
        if abs(acc) > Amax:
            Amax = abs(acc)
        if abs(vel) > Vmax:
            Vmax = abs(vel)
        if abs(disp) > Dmax:
            Dmax = abs(disp)

    if max_g > 0:
        scale = abs(Amax / max_g)
        if scale <= 1:
            for i in range(nacc):
                accel[i] /= scale
        else:
            for i in range(nacc):
                val = abs(accel[i]) - max_g
                if val > 0:
                    accel[i] /= scale    

def computeResponseSpectrum(damp_ratio, accel, rs_vel, periods, dt):
    nstep = len(periods)
    ndata = len(accel)

    rs_acc = np.zeros(nstep)

    T = [0]*3
    XD = [0]*2
    XV = [0]*2

    n1 = 1
    for i in range(nstep):
        dW  = 2 * math.pi / periods[i]
        dWd = math.sqrt(1 - damp_ratio * damp_ratio) * dW
        dW2 = dW * dW
        dW3 = dW2 * dW

        n1 = int(math.floor(dt / (periods[i] / 10)) + 1)
        new_dt = dt / n1

        ZD = 0
        ZV = 0
        ZA = 0
        XD = [0, 0]
        XV = [0, 0]

        F1 = 2 * damp_ratio / (dW3 * new_dt)
        F2 = 1 / dW2
        F3 = damp_ratio * dW
        F4 = 1 / dWd
        F5 = F3 * F4
        F6 = 2 * F3

        E = math.exp(-F3 * new_dt)
        S = math.sin(dWd * new_dt)
        C = math.cos(dWd * new_dt)

        G1 = E * S
        G2 = E * C
        H1 = dWd * G2 - F3 * G1
        H2 = dWd * G1 + F3 * G2

        for j in range(ndata - 1):
            dacc = (accel[j + 1] - accel[j]) / n1
            for k in range(n1):
                Z1 = F2 * dacc
                Z2 = F2 * (accel[j] + dacc * k)
                Z3 = F1 * dacc
                Z4 = Z1 / new_dt
                B = XD[0] + Z2 - Z3
                A = F4 * XV[0] + F5 * B + F4 * Z4
                XD[1] = A * G1 + B * G2 + Z3 - Z2 - Z1
                XV[1] = A * H1 - B * H2 - Z4
                XD[0] = XD[1]
                XV[0] = XV[1]
                AA = -F6 * XV[0] - dW2 * XD[0]
                F = XD[0]
                G = XV[0]
                H = AA
                if abs(F) > abs(ZD):
                    T[0] = j
                    ZD = F
                if abs(G) > abs(ZV):
                    T[1] = j
                    ZV = G
                if abs(H) > abs(ZA):
                    T[2] = j
                    ZA = H

        for j in range(3):
            T[j] = T[j] * new_dt

        rs_acc[i] = dW2 * ZD
        rs_vel[i] = dW * ZD

    return rs_acc

def calculate_artificial_motion(rand_seed, rise_time, level_time, dur_time, damp_ratio, max_iter, max_g, inNumPeriod, inPeriods, inRs):
    minNumber = 1.e-6    
    DELTA_W = 0.005
    MIN_W_FACTOR = 0.5
    MAX_W_FACTOR = 2.0

    dt = 0.01
    num_motion = 1

    inMaxPeriod = 10
    MinPeriod = 0.02
    numPeriod = 300

    rsVel = np.zeros(numPeriod)
    rsPs = np.zeros(numPeriod)
    psd = np.zeros(numPeriod)
    periods = np.zeros(numPeriod)

    dPeriod = math.log10(inMaxPeriod / MinPeriod)/(numPeriod -1)

    omegas = np.zeros(numPeriod)
    freqs = np.zeros(numPeriod)    

    initialize(MinPeriod, inMaxPeriod, inNumPeriod, inPeriods, inRs, rsVel, numPeriod, minNumber, dPeriod, periods, freqs, omegas)
    calculatePSD(dur_time, level_time, damp_ratio, numPeriod, rsVel, rsPs, psd, omegas)
    
    w_begin = MIN_W_FACTOR * omegas[0]
    w_end = MAX_W_FACTOR * omegas[numPeriod-1]

    nfreq = 0
    w_temp = w_begin
    while w_temp < w_end:
        dw = DELTA_W * w_temp
        w_temp += dw
        nfreq += 1

    Delw = np.zeros(nfreq)
    Fq = np.zeros(nfreq)
    Gwg = np.zeros(nfreq)
    Pa = np.zeros(nfreq)
    
    Gwk = np.zeros(numPeriod)
    mod_Gwk = np.zeros(numPeriod)

    rs_vel = np.zeros(numPeriod)
    
    dfreq = 0

    # Initialize random seed
    random.seed(rand_seed)

    for i in range(num_motion):
        npos = 0
        Areag = 0
        Sigms = 0
        w_temp = w_begin

        for j in range(numPeriod):
            Gwk[j] = psd[j]

        for j in range(nfreq):
            dw = DELTA_W * w_temp
            w_temp += dw

            [dfreq, npos] = interpolate(w_temp, npos, dfreq, Gwk, 1, numPeriod, omegas)

            Gwg[j] = dfreq
            Fq[j] = w_temp
            Delw[j] = dw
            Areag += Gwg[j] * dw
            Sigms += Gwg[j] * dw * w_temp * w_temp

        for j in range(max_iter):
            if j > 0:
                Areag = 0
                npos = 0
                for k in range(nfreq):
                    [dfreq, npos]= interpolate(Fq[k], npos, dfreq, Gwk, 2, numPeriod, omegas)
                    Gwg[k] = dfreq
                    Areag += (Delw[k] * Gwg[k])

            for k in range(nfreq):
                Gwg[k] *= (Delw[k] * 2)

            if j == 0:
                Sigms /= Areag
                Wa = np.sqrt(Sigms)
                Ta = 2 * np.pi / Wa

                if rise_time <= 0:
                    rise_time = 0.25 * dur_time
                    level_time = 0

                Ftc1 = 1 / rise_time
                chk_value = dur_time - rise_time - level_time
                if chk_value == 0:
                    Ftc2 = 0
                else:
                    Ftc2 = -1 / chk_value

                for k in range(nfreq):
                    Pa[k] = 2 * np.pi * random.random()

            accel = computeAcceleration(rise_time, level_time, dur_time, Gwg, Fq, Pa, Ftc1, Ftc2, dt)
            rs_acc = computeResponseSpectrum(damp_ratio, accel, rs_vel, periods, dt)

            if j < max_iter - 1:
                for k in range(numPeriod):
                    factor = rs_vel[k] / (rs_vel[k])

                    idx = numPeriod - k - 1
                    mod_Gwk[idx] = Gwk[idx] * factor * factor
                for k in range(numPeriod):
                    Gwk[k] = mod_Gwk[k]

    scalingAcceleration(accel, max_g, dt)
    dts = [dt * i for i in range(len(accel))]
    rs_acc = [abs(rs_acc[i]) for i in range(len(rs_acc))]
    
    return json.dumps({
		"period": periods.tolist(),
        "rs_acc": rs_acc,
        "dts": dts,
		"accel": accel.tolist()        
	})

def SPFC_UPDATE(ID, name, desc, GRAV, aFUNC):
    civilApp = MidasAPI(Product.CIVIL, "KR")
    data = {
        "NAME": name,
        "iTYPE": 1,
        "iMETHOD": 0,
        "SCALE": 1,
        "GRAV": GRAV,
        "DRATIO": 0.05,
        "STR": {
            "SPEC_CODE": "USER"
        },
        "aFUNC": aFUNC
        
    }
    civilApp.db_update_item("SPFC", ID, data)
    
    result_message = {"success":"Updating SPFC is completed"}
    return json.dumps(result_message)

def THFC_UPDATE(ID, name, desc, GRAV, aFUNC):
    civilApp = MidasAPI(Product.CIVIL, "KR")
    data = {
        "NAME": name,
        "FUNCTYPE": 1,
        "iTYPE": 1,
        "iMETHOD": 0,
        "SCALE": 1,
        "GRAV": GRAV,        
        "aFUNCDATA": aFUNC,
        "DESC": desc
    }
    civilApp.db_update_item("THFC", ID, data)
    
    result_message = {"success":"Updating THFC is completed"}
    return json.dumps(result_message)
    

def UNIT_GET():
    civilApp = MidasAPI(Product.CIVIL, "KR")
    unit = civilApp.db_read("UNIT")
    #유닛에 따른 GRAV 값을 지정합니다.
    dist_unit = unit[1]['DIST']
    GRAV_const = 9.806
    if dist_unit == "M":
        GRAV_const = 9.806
    elif dist_unit == "CM":
        GRAV_const = 980.6
    elif dist_unit == "MM":
        GRAV_const = 9806
    elif dist_unit == "IN":
        GRAV_const = 386.063
    else:
        GRAV_const = 32.1719
    return GRAV_const

def to_aFUNC(x_values, y_values, type):
    aFUNC = []
    for i in range(len(x_values)):
        X_VALUE = x_values[i]
        Y_VALUE = y_values[i]
        if type == "THFC":
            aFUNC.append({"TIME":X_VALUE, "VALUE":Y_VALUE})
        elif type == "SPFC":
            aFUNC.append({"PERIOD":X_VALUE, "VALUE":Y_VALUE})
    return aFUNC

def update_artificial_earthquake(func_name: str, desc: str, dts: list, values: list):
	civilApp = MidasAPI(Product.CIVIL, "KR")
	ID = civilApp.db_get_next_id("THFC")
	name = func_name
	aFUNC = to_aFUNC(dts, values, "THFC")
	GRAV = UNIT_GET()
	return THFC_UPDATE(ID, name, desc, GRAV, aFUNC)

def update_response_spectrum(func_name: str, desc: str, periods: list, values: list):
	civilApp = MidasAPI(Product.CIVIL, "KR")
	ID = civilApp.db_get_next_id("SPFC")
	name = func_name
	aFUNC = to_aFUNC(periods, values, "SPFC")
	GRAV = UNIT_GET()
	return SPFC_UPDATE(ID, name, str, GRAV, aFUNC)
