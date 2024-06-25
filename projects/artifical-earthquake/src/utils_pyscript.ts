/**
 * 
 * ██╗   ██╗████████╗██╗██╗       ██╗     ██╗██████╗ ██╗   ██╗██╗ 
 * ██║   ██║╚══██╔══╝██║██║      ███║    ██╔╝██╔══██╗╚██╗ ██╔╝╚██╗
 * ██║   ██║   ██║   ██║██║█████╗╚██║    ██║ ██████╔╝ ╚████╔╝  ██║
 * ██║   ██║   ██║   ██║██║╚════╝ ██║    ██║ ██╔═══╝   ╚██╔╝   ██║
 * ╚██████╔╝   ██║   ██║███████╗  ██║    ╚██╗██║        ██║   ██╔╝
 *  ╚═════╝    ╚═╝   ╚═╝╚══════╝  ╚═╝     ╚═╝╚═╝        ╚═╝   ╚═╝ 
 * 
 * @description Functions for executing python script in typescript
 * @linkcode ./public/py_main.py
 */

import { VerifyUtil } from "@midasit-dev/moaui";

export function checkPyScriptReady(callback: any) {
	// if pyscript is ready, call callback function
	if (pyscript && pyscript.interpreter) {
		return callback();
	} else {
		// if not, wait 100ms and try again
		setTimeout(() => checkPyScriptReady(callback), 100);
	}
}

//before execute a python main function, insert this function
export function setGlobalVariable() {
	const set_func = pyscript.interpreter.globals.get('set_g_values');
	set_func(JSON.stringify({
		g_mapi_key: VerifyUtil.getMapiKey(),
		g_base_uri: VerifyUtil.getBaseUri(),
		g_base_port: VerifyUtil.getBasePort()
	}));
}

export function getGlobalVariable() {
	const get_func = pyscript.interpreter.globals.get('get_g_values');
	const g_values = JSON.parse(get_func());
	console.log(`
┌─┐┬ ┬  ┬┌┐┌┌─┐┌┬┐┌─┐┬  ┬  ┌─┐┌┬┐
├─┘└┬┘  ││││└─┐ │ ├─┤│  │  ├┤  ││
┴   ┴   ┴┘└┘└─┘ ┴ ┴ ┴┴─┘┴─┘└─┘─┴┘

@ Global variables in python script
- MAPI-Key: ${g_values.g_mapi_key}
- Base-Uri: ${g_values.g_base_uri}
- Base-Port: ${g_values.g_base_port}
 `);
}

/**
 * @description this function is for python script to create data in database
 * @see ./public/py_main.py
 * @param item: item to create
 * @returns
 * @example
 */
export function dbCreate(itemName: string, items: any) {
	return checkPyScriptReady(() => {
		const py_db_create_func = pyscript.interpreter.globals.get('py_db_create');
		const result = py_db_create_func(itemName, JSON.stringify(items));
		return JSON.parse(result);
	});
}

/**
 * @description this function is for python script to create data in database
 * @see ./public/py_main.py
 * @param key: key of item
 * @param item: item to create
 * @returns 
 * @example
 */
export function dbCreateItem(itemName: string, key: string, item: any) {
	return checkPyScriptReady(() => {
		const py_db_create_item_func = pyscript.interpreter.globals.get('py_db_create_item');
		const result = py_db_create_item_func(itemName, key, JSON.stringify(item));
		return JSON.parse(result);
	});
}

/**
 * @description this function is for python script to read data from database
 * @see ./public/py_main.py
 * @param itemName: name of item
 * @param key: key of item
 * @returns
 * @example
 */
export function dbRead(itemName: string): any {
	return checkPyScriptReady(() => {
		const py_db_read_func = pyscript.interpreter.globals.get('py_db_read');
		const result = py_db_read_func(itemName);
		return JSON.parse(result);
	});
}

/**
 * @description this function is for python script to read data each item from database
 * @see ./public/py_main.py
 * @param itemName: name of item
 * @param key: key of item
 * @returns
 * @example
 */
export function dbReadItem(itemName: string, key: string): any {
	return checkPyScriptReady(() => {
		const py_db_read_item_func = pyscript.interpreter.globals.get('py_db_read_item');
		const result = py_db_read_item_func(itemName, key);
		return JSON.parse(result);
	});
}

/**
 * @description this function is for python script to update data in database
 * @see ./public/py_main.py
 * @param itemName name of item
 * @param items items to update
 * @returns 
 * @example
 */
export function dbUpdate(itemName: string, items: any) {
	return checkPyScriptReady(() => {
		const py_db_update_func = pyscript.interpreter.globals.get('py_db_update');
		const result = py_db_update_func(itemName, JSON.stringify(items));
		return JSON.parse(result);
	});
}

/**
 * @description this function is for python script to update data in database
 * @see ./public/py_main.py
 * @param itemName name of item
 * @param key key of item
 * @param item item to update
 * @returns 
 * @example
 */
export function dbUpdateItem(itemName: string, key: string, item: any) {
	return checkPyScriptReady(() => {
		const py_db_update_item_func = pyscript.interpreter.globals.get('py_db_update_item');
		const result = py_db_update_item_func(itemName, key, JSON.stringify(item));
		return JSON.parse(result);
	});
}

/**
 * @description this function is for python script to delete data in database
 * @see ./public/py_main.py
 * @param itemName name of item
 * @returns 
 * @example
 */
export function dbDelete(itemName: string, item_id: string | number) {
	return checkPyScriptReady(() => {
		const py_db_delete_func = pyscript.interpreter.globals.get('py_db_delete');
		const result = py_db_delete_func(itemName, item_id);
		return JSON.parse(result);
	});
}

export function DS_KDS_2019(
	importance_factor: string,
	response_modi_coef: string,
	maximum_period: string,
	sds: string,
	sd1: string,
) {
	return checkPyScriptReady(() => {
		const py_create_graph_data_func =
			pyscript.interpreter.globals.get("DS_KDS_2019");
		const result = py_create_graph_data_func(
			parseFloat(importance_factor),
			parseFloat(response_modi_coef),
			parseFloat(maximum_period),
			parseFloat(sds),
			parseFloat(sd1)
		);
		return JSON.parse(result);
	});
}

export function calculate_artificial_motion(
	random_seed: number,
	rise_time: number,
	level_time: number,
	dur_time: number,
	damp_ratio: number,
	max_iter: number,
	max_g: number,
	inNumPeriod: number,
	inPeriods: number[],
	inRs: number[],
) {
	const py_calc_artificial_earquake_func = pyscript.interpreter.globals.get("calculate_artificial_motion");

	const result = py_calc_artificial_earquake_func(
		random_seed,
		rise_time,
		level_time,
		dur_time,
		damp_ratio,
		max_iter,
		max_g,
		inNumPeriod,
		inPeriods,
		inRs,
	);
	return JSON.parse(result);
}

export function update_response_spectrum(
	funcName: string,
	description: string,
	periods: number[],
	values: number[]
  ) {
	return checkPyScriptReady(() => {
	  const py_spfc_update_func = pyscript.interpreter.globals.get(
		"update_response_spectrum"
	  );
  
	  const result = py_spfc_update_func(
		funcName,
		description,
		periods,
		values
	  );
		  
	  return JSON.parse(result);
	});
  }

export function update_artificial_earthquake(
	funcName: string,
	description: string,
	dts: number[],
	values: number[]
  ) {
	return checkPyScriptReady(() => {
	  const py_spfc_update_func = pyscript.interpreter.globals.get(
		"update_artificial_earthquake"
	  );
  
	  const result = py_spfc_update_func(
		funcName,
		description,
		dts,
		values
	  );
		  
	  return JSON.parse(result);
	});
  }