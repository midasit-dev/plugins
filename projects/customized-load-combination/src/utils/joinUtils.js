export function join(factorCombinations) {
  const joinArray = [];
  let extractedFactorsStore = {};
  let extractedFactorsStore_add = {}; let extractedFactorsStore_either = {};
  for (const combination of factorCombinations) {
    const join = [];
    let { add, either, envelope,firstKey,secondLastKey } = combination;
    let add_specialKeys = add;
    let either_specialKeys = either;
    let envelope_specialKeys = envelope;
    add = transformArray(add);
    either = transformArray(either);
    envelope = transformArray(envelope);
    function transformArray(inputArray) {
      // Deep clone the array first
      const processArray = (arr) => {
          return arr.map(item => {
              if (Array.isArray(item)) {
                  return processArray(item);
              } else if (typeof item === 'object' && item !== null) {
                  const newObj = {};
                  for (const key in item) {
                      if (!key.endsWith('|specialKeys')) {
                          newObj[key] = { ...item[key] };
                      }
                  }
                  return newObj;
              }
              return item;
          });
      };
      return processArray(inputArray);
  }
  add = transformArrays(add_specialKeys,add,either);
  either = transformArrays(either_specialKeys,add,either);
  envelope = transformArrays(envelope_specialKeys,add,either);

  function transformArrays(inputArray, add_specialKeys, either_specialKeys) {
    const clonedArray = JSON.parse(JSON.stringify(inputArray));
    clonedArray.forEach((outerArray) => {
      if (Array.isArray(outerArray)) {
        outerArray.forEach((innerArray) => {
          if (innerArray && typeof innerArray === "object") {
            Object.entries(innerArray).forEach(([key, value]) => {
              if (key.includes("|specialKeys")) {
                const specialKeysObject = value;
                if (specialKeysObject && specialKeysObject.specialKeys) {
                  const specialArray = specialKeysObject.specialKeys;
                  const loadcaseNames = [];
                  specialArray.forEach((outerItem) => {
                    if (outerItem && typeof outerItem === "object") {
                      Object.values(outerItem).forEach((nestedArray) => {
                        if (Array.isArray(nestedArray)) {
                          nestedArray.forEach((innerArray) => {
                            if (Array.isArray(innerArray)) {
                              innerArray.forEach((deepNestedItem) => {
                                if (
                                  deepNestedItem &&
                                  typeof deepNestedItem === "object"
                                ) {
                                  if (deepNestedItem.loadCaseName) {
                                    loadcaseNames.push(deepNestedItem.loadCaseName);
                                  } else {
                                    Object.values(deepNestedItem).forEach(
                                      (nestedValue) => {
                                        if (
                                          nestedValue &&
                                          typeof nestedValue === "object"
                                        ) {
                                          if (nestedValue.loadCaseName) {
                                            loadcaseNames.push(
                                              nestedValue.loadCaseName
                                            );
                                          }
                                        }
                                      }
                                    );
                                  }
                                }
                              });
                            }
                          });
                        }
                      });
                    }
                  });
                  console.log("Extracted loadcaseNames:", loadcaseNames);
  
                  let replacementArray = null;
                  let matchedArrayIndex = -1;
                  let matchedKeySource = null; 
                  add_specialKeys.forEach((specialKeyArray, arrayIndex) => {
                    if (Array.isArray(specialKeyArray)) {
                      for (let objectIndex = 0; objectIndex < specialKeyArray.length; objectIndex++) {
                        const specialKeyObject = specialKeyArray[objectIndex];
                        if (specialKeyObject && typeof specialKeyObject === "object") {
                          Object.entries(specialKeyObject).forEach(([key, value]) => {
                            const allLoadCaseNames = []; // Array to store all found loadCaseNames
                  
                            const collectLoadCaseNames = (obj) => {
                              if (obj && typeof obj === "object") {
                                Object.values(obj).forEach((innerValue) => {
                                  if (innerValue && typeof innerValue === "object") {
                                    if (innerValue.loadCaseName) {
                                      allLoadCaseNames.push(innerValue.loadCaseName);
                                    } else {
                                      collectLoadCaseNames(innerValue);
                                    }
                                  }
                                });
                              }
                            };
                  
                            collectLoadCaseNames(value); // Start collecting loadCaseName values
                  
                            if (allLoadCaseNames.some((name) => loadcaseNames.includes(name))) {
                              replacementArray = [specialKeyArray];
                              matchedArrayIndex = arrayIndex;
                              matchedKeySource = "add_specialKeys"; // Mark the source
                            }
                          });
                        }
                      }
                    }
                  });
                  
                  // If no match found in add_specialKeys, check either_specialKeys
                  if (!replacementArray) {
                    either_specialKeys.forEach((specialKeyArray, arrayIndex) => {
                      if (Array.isArray(specialKeyArray)) {
                        for (let objectIndex = 0; objectIndex < specialKeyArray.length; objectIndex++) {
                          const specialKeyObject = specialKeyArray[objectIndex];
                          if (specialKeyObject && typeof specialKeyObject === "object") {
                            Object.entries(specialKeyObject).forEach(([key, value]) => {
                              const allLoadCaseNames = []; // Array to store all found loadCaseNames
                  
                              const collectLoadCaseNames = (obj) => {
                                if (obj && typeof obj === "object") {
                                  Object.values(obj).forEach((innerValue) => {
                                    if (innerValue && typeof innerValue === "object") {
                                      if (innerValue.loadCaseName) {
                                        allLoadCaseNames.push(innerValue.loadCaseName);
                                      } else {
                                        collectLoadCaseNames(innerValue);
                                      }
                                    }
                                  });
                                }
                              };
                  
                              collectLoadCaseNames(value); // Start collecting loadCaseName values
                  
                              if (allLoadCaseNames.some((name) => loadcaseNames.includes(name))) {
                                replacementArray = [specialKeyArray];
                                matchedArrayIndex = arrayIndex;
                                matchedKeySource = "either_specialKeys"; // Mark the source
                              }
                            });
                          }
                        }
                      }
                    });
                  }
                  
                  // Replace the specialKeys array if a match is found
                  if (replacementArray) {
                    if (specialKeysObject && specialKeysObject.hasOwnProperty('specialKeys')) {
                      // Iterate over the key-value pairs in the specialKeys object
                      Object.entries(specialKeysObject.specialKeys).forEach(([key, value]) => {
                        
                        // If the key is one of the specified strings, replace its value
                        if (key === "Add" || key === "Either" || key === "Envelope") {
                          specialKeysObject.specialKeys[key] = replacementArray;  // Replace the value for the specific key
                        }
                    
                        // If the key is a number, inspect its value
                        else if (!isNaN(key)) {
                          // If the value is an object, check for key:value pairs within it
                          if (typeof value === "object" && value !== null) {
                            Object.entries(value).forEach(([nestedKey, nestedValue]) => {
                              // Check for your specific conditions within the nested key-value pair
                              if (nestedKey === "Add" || nestedKey === "Either") {
                                // Replace nested value or take any other action as needed
                                value[nestedKey] = replacementArray;
                              }
                            });
                          }
                        }
                      });
                    }                    
                  
                    // Make the matched specialKeyArray null in its original position
                    if (matchedKeySource === "add_specialKeys") {
                      add_specialKeys[matchedArrayIndex] = null;
                    } else if (matchedKeySource === "either_specialKeys") {
                      either_specialKeys[matchedArrayIndex] = null;
                    }
                  }
                  
                }
              }
            });
          }
        });
      }
    });
  
    return clonedArray;
  }
  
   console.log(add);
   console.log(either);
    const eitherJoin = [];
    const envelopeJoin  = [];
    console.log(either);
    console.log(add);
    console.log(envelope);
    function getSingleFactor(factor, factorIndex, i) {
      if (factor.length > factorIndex) {
        let value = factor[factorIndex];
        if (!Array.isArray(value) && i === 0) {
          return value;
        }
        if (Array.isArray(value) && value.length > 1) {
          const flattenedArray = value.flat();
          if (flattenedArray.length > i) {
            return flattenedArray[i];
          }
        }
      }
      return undefined;
    }
    function extractFactorsFromObject(factorObj, factorIndex, i,type) {
      const extractedFactors = [];
    
      for (const key in factorObj) {
  if (factorObj.hasOwnProperty(key)) {
    if (!isNaN(key)) {
      // Handle numeric keys
      const value = factorObj[key];
      if (value && typeof value === "object") {
        // Process the value recursively or handle it as needed
        extractedFactors.push(...extractFactorsFromObject(value, factorIndex, i,type));
      }
    } 
    else if (key.includes("specialKeys")) {  // General check for any specialKeys
      const { specialKeys } = factorObj[key] || {};
      if (specialKeys && Array.isArray(specialKeys)) {
        Object.entries(specialKeys).forEach(([key, value]) => {
          // Check if the key is 'Add' and if the value is an array
          if (key === "Add" && Array.isArray(value)) {
            // Process each item in the 'Add' array
            value.forEach(item => {
              extractedFactors.push(extractFactorsFromObject(item, factorIndex, i,type));
            });
          }
          
          // Check if the key is a number (like 0, 1, 2, etc.)
          else if (!isNaN(key)) {
            Object.entries(value).forEach(([innerKey, innerValue]) => {
              if (innerKey === "Add" && Array.isArray(innerValue)) {
                innerValue.forEach(item => {
                  if (Array.isArray(item)) {
                    item.forEach(subItem => {
                      extractedFactors.push(extractFactorsFromObject(subItem, factorIndex, i,type));
                    });
                  }
                  else if (item && typeof item === "object") {
                    extractedFactors.push(extractFactorsFromObject(item, factorIndex, i,type));
                  }
                  else {
                  }
                });
              }
            });
          }
        });
        specialKeys.forEach(innerObj => {
          if (innerObj && typeof innerObj === "object") {
            if ('Either' in innerObj) {
              const flattenedInnerObj = Array.isArray(innerObj) ? innerObj.flat(1) : [innerObj];
              extractedFactors.push(...extractFactorsFromObject(flattenedInnerObj, factorIndex, i,type));
            }
          }
        });
      }
    }
    else {
      const { loadCaseName, sign, factor } = factorObj[key];
      let factorValue;
      if (factor !== undefined && factor !== null && factor !== "") {
        factorValue = getSingleFactor(factor, factorIndex, i);
      }
      if (factorValue !== undefined && factorValue !== 0 && factorValue !== null && factorValue !== "") {
        extractedFactors.push({ loadCaseName, sign, factor: factorValue });
      }
    }
  }
}
if (type == "add") {
if (!extractedFactorsStore_add[factorIndex]) {
  extractedFactorsStore_add[factorIndex] = [];
}
extractedFactorsStore_add[factorIndex][i] = extractedFactors;
      return extractedFactors;
} else {
    if (!extractedFactorsStore_either[factorIndex]) {
      extractedFactorsStore_either[factorIndex] = [];
    }
    extractedFactorsStore_either[factorIndex][i] = extractedFactors;
    return extractedFactors;
} 
    }
    function combineMatchingFactors(either, factorIndex, i, either_specialKeys,type,check) {
      console.log(either_specialKeys);
      console.log(either);
      let combinedResult = []; let fullyFlattenedResult = [];
     if(check) {
      const separateExtractedFactors = [];
      either.forEach((arr, arrIndex) => {
          if (Array.isArray(arr)) {
            let extractedFactors;
            if (type === "add") {
              extractedFactors = either.flatMap(arr => {
                const commonArray = [];
                if (Array.isArray(arr) && arr.length > 1) {
                  let combo = [];
                    arr.forEach(subArray => {
                        const flattenedArr = Array.isArray(subArray) ? subArray.flat() : [subArray];
                        const subArrayResults = flattenedArr.flatMap(factorObj => {
                            if (Array.isArray(factorObj)) {
                                return factorObj.map(innerObj => extractFactorsFromObject(innerObj, factorIndex, i,type));
                            } else {
                                return [extractFactorsFromObject(factorObj, factorIndex, i,type)];
                            }
                        });
                        combo.push(subArrayResults);
                    });
                    commonArray.push(combo);
                } else {
                    const flattenedArr = Array.isArray(arr) ? arr.flat() : [arr];
                    const singleArrayResults = flattenedArr.flatMap(factorObj => {
                        if (Array.isArray(factorObj)) {
                            return factorObj.flatMap(innerObj => extractFactorsFromObject(innerObj, factorIndex, i,type));
                        } else {
                            return [extractFactorsFromObject(factorObj, factorIndex, i,type)];
                        }
                    });
                    commonArray.push(singleArrayResults); 
                }
                
                return commonArray;
            });
            
          } else {
            extractedFactors = arr.flatMap(subArray => {
              const flattenedArr = Array.isArray(subArray) ? subArray.flat() : [subArray];
              return flattenedArr.flatMap(factorObj => {
                  if (Array.isArray(factorObj)) {
                      return factorObj.map(innerObj => extractFactorsFromObject(innerObj, factorIndex, i,type));
                  } else {
                      return [extractFactorsFromObject(factorObj, factorIndex, i,type)];
                  }
              });
          });
          }
              separateExtractedFactors.push(extractedFactors);
            
          } else {
              console.warn(`Non-array element encountered in either at index ${arrIndex}, skipping:`, arr);
          }
      });
      if (type == add) {
      if (!extractedFactorsStore_add[factorIndex]) {
        extractedFactorsStore_add[factorIndex] = [];
    }
    extractedFactorsStore_add[factorIndex][i] = separateExtractedFactors;
      } else {
        if (!extractedFactorsStore_either[factorIndex]) {
          extractedFactorsStore_either[factorIndex] = [];
      }
      extractedFactorsStore_either[factorIndex][i] = separateExtractedFactors;
      }
      separateExtractedFactors.forEach((factorsGroup, groupIndex) => {
          const groupCombinedResult = [];
          
          function generateCombinations(arrays, temp = [], index = 0) {
              if (index === arrays.length) {
                  groupCombinedResult.push([...temp]);
                  return;
              }
              for (const item of arrays[index]) {
                  temp.push(item);
                  generateCombinations(arrays, temp, index + 1);
                  temp.pop();
              }
          }
          generateCombinations(factorsGroup);
          if (Array.isArray(groupCombinedResult)) {
              combinedResult.push({
                  groupIndex,
                  combinations: groupCombinedResult.map(innerArray => {
                      if (Array.isArray(innerArray)) {
                          const flattenedArray = [];
                          innerArray.forEach(item => {
                              if (Array.isArray(item)) {
                                  flattenedArray.push(...item);
                              } else {
                                  flattenedArray.push(item);
                              }
                          });
                          return flattenedArray;
                      }
                      return innerArray;
                  }),
              });
          }
      });
     } else {
      let extractedFactors;
      if (type === "add") {
        extractedFactors = either.flatMap(arr => {  
          let commonArray = []; 
          
          if (Array.isArray(arr) && arr.length > 1) {
            let combo = [];
              arr.forEach(subArray => {
                  const flattenedArr = Array.isArray(subArray) ? subArray.flat() : [subArray];
                  const subArrayResults = flattenedArr.flatMap(factorObj => {
                      if (Array.isArray(factorObj)) {
                          return factorObj.map(innerObj => extractFactorsFromObject(innerObj, factorIndex, i,type));
                      } else {
                          return [extractFactorsFromObject(factorObj, factorIndex, i,type)];
                      }
                  });
                     combo.push(subArrayResults);
              });
                commonArray.push(combo);
          } else {
              const flattenedArr = Array.isArray(arr) ? arr.flat() : [arr];
              const singleArrayResults = flattenedArr.flatMap(factorObj => {
                  if (Array.isArray(factorObj)) {
                      return factorObj.flatMap(innerObj => extractFactorsFromObject(innerObj, factorIndex, i,type));
                  } else {
                      return [extractFactorsFromObject(factorObj, factorIndex, i,type)];
                  }
              });
                commonArray.push(singleArrayResults);
              }
          return commonArray;
      });
      
    } else {
      extractedFactors = either.flatMap(arr => {
        if (Array.isArray(arr) && arr.length > 1) {
          return arr.flatMap(subArray => {
            const flattenedArr = Array.isArray(subArray) ? subArray.flat() : [subArray];
              return flattenedArr.flatMap(factorObj => {
                if (Array.isArray(factorObj)) {
                  return factorObj.map(innerObj => extractFactorsFromObject(innerObj, factorIndex, i,type));
                } else {
                  return [extractFactorsFromObject(factorObj, factorIndex, i,type)];
                }
              });
          });
        } else {
          const flattenedArr = Array.isArray(arr) ? arr.flat() : [arr];
          return flattenedArr.flatMap(factorObj => {
            if (Array.isArray(factorObj)) {
              return factorObj.flatMap(innerObj => extractFactorsFromObject(innerObj, factorIndex, i,type));
            } else {
              return [extractFactorsFromObject(factorObj, factorIndex, i,type)];
            }
          });
        }
      });
    }
    if (type == add) {
      if (!extractedFactorsStore_add[factorIndex]) {
        extractedFactorsStore_add[factorIndex] = [];
      }
      extractedFactorsStore_add[factorIndex][i] = extractedFactors;
    } else {
      if (!extractedFactorsStore_either[factorIndex]) {
        extractedFactorsStore_either[factorIndex] = [];
      }
      extractedFactorsStore_either[factorIndex][i] = extractedFactors;
    }
      function generateCombinations(arrays, temp = [], index = 0) {
        if (type === 'add') {
          function combineSubarrays(subarrays, temp = [], subIndex = 0, currentResult = []) {
            if (subIndex === subarrays.length) {
              currentResult.push([...temp]);
              return;
            }
            for (const item of subarrays[subIndex]) {
              temp.push(item);
              combineSubarrays(subarrays, temp, subIndex + 1, currentResult);
              temp.pop();
            }
          }
          for (const factorArray of arrays) {
            const factorArrayResult = []; 
            if (Array.isArray(factorArray[0])) {
              combineSubarrays(factorArray, [], 0, factorArrayResult);
            } else {
              factorArrayResult.push([...factorArray]);
            }
            combinedResult.push(factorArrayResult);
          }
          function joinAllSubarrays(combinedResult, temp = [], index = 0, result = []) {
            if (index === combinedResult.length) {
              result.push([...temp]); // Push the current combination of subarrays
              return;
            }
            for (const item of combinedResult[index]) {
              temp.push(item); // Add the current item
              joinAllSubarrays(combinedResult, temp, index + 1, result); // Recur for the next array
              temp.pop(); // Backtrack to explore other combinations
            }
          }
          const finalResult = [];
          joinAllSubarrays(combinedResult, [], 0, finalResult);
          const processedResult = finalResult
              .map(array => array.flat()) // Flatten each combination
              .filter(array => array.length > 0); // Remove arrays with zero elements

          console.log(processedResult);
if (processedResult.length > 1){
              fullyFlattenedResult = processedResult.map(array => array.flat());
          } else {
              fullyFlattenedResult = processedResult;
          }
          if (either.flat(1).length === 1) {
              fullyFlattenedResult = [fullyFlattenedResult.flat(Infinity)];
          }
          console.log(fullyFlattenedResult);

          return;
          }
          else {
              if (index === arrays.length) {
                  combinedResult.push([...temp]);
                  return;
              }
              for (const item of arrays[index]) {
                  temp.push(item);
                  generateCombinations(arrays, temp, index + 1);
                  temp.pop();
              }
          }
          }
          generateCombinations(extractedFactors);
      if (type === "add") {
      if (Array.isArray(combinedResult)) {
        combinedResult = combinedResult.map(innerArray => {
          if (Array.isArray(innerArray)) {
            const flattenedArray = [];
            innerArray.forEach(item => {
              if (Array.isArray(item)) {
                flattenedArray.push(...item);
              } else {
                flattenedArray.push(item);
              }
            });
            return flattenedArray; 
          }
          return innerArray; 
        });
      } }
     }
     if (type === "add") {
      return fullyFlattenedResult;
     } else {
      return combinedResult;
     }  
  }
  
    function getMaxIValue(either) {
      let maxIValue = 5;  
      either.forEach(arr => {
        arr.forEach(item => {
          Object.keys(item).forEach(key => {
            const subItem = item[key];
            if (subItem && subItem.factor && Array.isArray(subItem.factor)) {
              const factorDepth = getArrayDepth(subItem.factor);
              maxIValue = Math.max(maxIValue, Math.pow(5, factorDepth - 1));
            }
          });
        });
      });
      return maxIValue;
    }
    function getArrayDepth(array) {
      let depth = 1;
      let current = array;
      while (Array.isArray(current[0])) {
        depth += 1;
        current = current[0];
      }
      return depth;
    }
    let maxI;
    if (either !== undefined){
        maxI = getMaxIValue(either, add);
    }
    console.log('Max i value based on dimensionality:', maxI);
    
    function combineLoadCases(either, add, envelope,type) {
      let allCombinations = [];
      const addmulti = [];
      const factorLimit = either.length;
      const maxI = getMaxIValue(either, add);
      console.log(maxI);
      for (let factorIndex = 0; factorIndex < 5; factorIndex++) {
        console.log(factorIndex);
        addmulti[factorIndex] = [];
        for (let i = 0; i < maxI; i++) {
          let check;
          let factorCombinations = [];
          if (firstKey === "Either" || firstKey === "Envelope") {
            let modifiedArray = [];
            let nonModifiedArray = [];
            const modifiedEither = either.map(eitherArray => {
                if (Array.isArray(eitherArray) && eitherArray.length > 0) {
                    const allHaveSamePreviousKey = eitherArray.every(obj => {
                        const previousKeys = Object.values(obj).map(innerObj => innerObj?.previousKey);
                        return previousKeys.every(key => key === previousKeys[0]);
                    });
                    if (allHaveSamePreviousKey && Object.values(eitherArray[0])[0]?.previousKey === "Either") {
                        const separatedArrays = eitherArray.map(obj => [obj]); 
                        modifiedArray.push(...separatedArrays);      
                    } else if (eitherArray.length === 1) {
                        nonModifiedArray.push(eitherArray);
                    }
                }
                return eitherArray;
            }); 
            let combinedArrays = [];
            if (modifiedArray.length > 0 && nonModifiedArray.length > 0) {
                modifiedArray.forEach(modified => {
                    nonModifiedArray.forEach(nonModified => {
                        combinedArrays.push([...modified, ...nonModified]);
                    });
                });
            }
            let result = combineMatchingFactors(combinedArrays, factorIndex, i, either_specialKeys,type,check);
            factorCombinations.push(...result);
            if (combinedArrays.length === 0) {
              factorCombinations = combineMatchingFactors(either,factorIndex,i,either_specialKeys,type,check=false);
            }
            console.log(factorCombinations);
            addmulti[factorIndex][i] = factorCombinations;
        } else if (firstKey === "Add") {
            let modifiedArray = [];
            let nonModifiedArray = [];
            const modifiedEither = either.map(eitherArray => {
                if (Array.isArray(eitherArray) && eitherArray.length > 1) {
                    const allHaveSamePreviousKey = eitherArray.every(obj => {
                        const previousKeys = Object.values(obj).map(innerObj => innerObj?.previousKey);
                        return previousKeys.every(key => key === previousKeys[0]);
                    });
                    if (allHaveSamePreviousKey && Object.values(eitherArray[0])[0]?.previousKey === "Either") {
                        const separatedArrays = eitherArray.map(obj => [obj]); 
                        modifiedArray.push(...separatedArrays); 
                    } 
                }
                else if (
                  eitherArray.length === 1
                ) {
                  nonModifiedArray.push(eitherArray);  
              }
            }); 
            console.log("nonModifiedArray", nonModifiedArray)
            let combinedArrays = [];
        
            if (modifiedArray.length > 0 && nonModifiedArray.length > 0) {
                modifiedArray.forEach(modified => {
                    nonModifiedArray.forEach(nonModified => {
                        combinedArrays.push([...modified, ...nonModified]);
                    });
                });
            }
            let result = combineMatchingFactors(combinedArrays, factorIndex, i, either_specialKeys,type,check=true);
            factorCombinations.push(...result);
            if (combinedArrays.length === 0) {
              factorCombinations = combineMatchingFactors(either,factorIndex,i,either_specialKeys,type,check=false);
            }
            console.log(factorCombinations);
            addmulti[factorIndex][i] = factorCombinations;
        }
        const allComb = [];
        if (type !== "add") {
        add.forEach((addArray, arrayIndex) => {
          if (Array.isArray(addArray) && addArray.length > 0) {
            const currentArrayCombinations = [];
            const generateCombinations = (subArrays, index, currentCombination) => {
              if (index === subArrays.length) {
                currentArrayCombinations.push([...currentCombination]);
                return;
              }
              
              const currentSubArray = subArrays[index];
              if (Array.isArray(currentSubArray)) {
                currentSubArray.forEach(item => {
                  currentCombination.push(item);
                  generateCombinations(subArrays, index + 1, currentCombination);
                  currentCombination.pop();
                });
              }
            };
            
            generateCombinations(addArray, 0, []);
            if (currentArrayCombinations.length === 0 && addArray.length > 0) {
              currentArrayCombinations.push(...addArray);
            }
            allComb.push(currentArrayCombinations);
          }
        });}
const finalCombinations = [];
let joinArrays = (arrays, index, currentCombination) => {
  if (index === arrays.length) {
    finalCombinations.push([...currentCombination.flat()]);
    return;
  }
  const currentArray = arrays[index];
  currentArray.forEach(combination => {
    currentCombination.push(combination);
    joinArrays(arrays, index + 1, currentCombination);
    currentCombination.pop();
  });
};
if (allComb.length > 0) {
  joinArrays(allComb, 0, []);
}
      finalCombinations.forEach(combination => {
  // If factorCombinations is empty, only push combinedResult if it exists, then skip the rest
  // if (!factorCombinations || factorCombinations.length === 0) {
  //   const combinedResult = [];
  //   // Extraction logic for combinedResult
  //   if (Array.isArray(combination)) {
  //     combination.forEach(item => {
  //       Object.keys(item).forEach(key => {
  //         if (!isNaN(Number(key, 10))) {
  //           const nestedObj = item[key];
  //           Object.keys(nestedObj).forEach(nestedKey => {
  //             const nestedValue = nestedObj[nestedKey];
  //             const loadCaseName = nestedValue.loadCaseName;
  //             const sign = nestedValue.sign;
  //             const factor = nestedValue.factor;
  //             let factorValue;
  //             if (factor !== undefined && factor !== "") {
  //               factorValue = getSingleFactor(factor, factorIndex, i);
  //             }
  //             if (factorValue !== undefined && factorValue !== null && factorValue !== 0 && factor !== "") {
  //               combinedResult.push({ loadCaseName, sign, factor: factorValue });
  //             }
  //           });
  //         } else {
  //           const value = item[key];
  //           const loadCaseName = value.loadCaseName;
  //           const sign = value.sign;
  //           let factor;
  //           if (value.factor !== undefined && value.factor !== null && value.factor !== 0) {
  //             factor = value.factor;
  //           }
  //           let factorValue;
  //           if (factor !== undefined && factor !== "") {
  //             factorValue = getSingleFactor(factor, factorIndex, i);
  //           }
  //           if (factorValue !== undefined && factorValue !== null && factorValue !== 0 && factor !== "") {
  //             combinedResult.push({ loadCaseName, sign, factor: factorValue });
  //           }
  //         }
  //       });
  //     });
  //   } else if (typeof combination === "object" && combination !== null) {
  //     Object.keys(combination).forEach(key => {
  //       if (!isNaN(Number(key, 10))) {
  //         const nestedObj = combination[key];
  //         Object.keys(nestedObj).forEach(nestedKey => {
  //           const nestedValue = nestedObj[nestedKey];
  //           const loadCaseName = nestedValue.loadCaseName;
  //           const sign = nestedValue.sign;
  //           let factor;
  //           if (nestedValue.factor !== undefined && nestedValue.factor !== null && nestedValue.factor !== 0) {
  //             factor = nestedValue.factor;
  //           }
  //           let factorValue;
  //           if (factor !== undefined && factor !== "") {
  //             factorValue = getSingleFactor(factor, factorIndex, i);
  //           }
  //           if (factorValue !== undefined && factorValue !== null && factorValue !== 0 && factor !== "") {
  //             combinedResult.push({ loadCaseName, sign, factor: factorValue });
  //           }
  //         });
  //       } else {
  //         const value = combination[key];
  //         const loadCaseName = value.loadCaseName;
  //         const sign = value.sign;
  //         let factor;
  //         if (value.factor !== undefined && value.factor !== null && value.factor !== 0) {
  //           factor = value.factor;
  //         }
  //         let factorValue;
  //         if (factor !== undefined && factor !== "") {
  //           factorValue = getSingleFactor(factor, factorIndex, i);
  //         }
  //         if (factorValue !== undefined && factorValue !== null && factorValue !== 0 && factor !== "") {
  //           combinedResult.push({ loadCaseName, sign, factor: factorValue });
  //         }
  //       }
  //     });
  //   }
  //   if (combinedResult.length > 0) {
  //     allCombinations.push([...combinedResult]);
  //   }
  //   return; // Skip the rest of the loop for this combination
  // }

  // Only run this part if factorCombinations is not empty
  factorCombinations.forEach(factorCombination => {
    const combinedResult = [];
    // ...existing extraction logic for combinedResult...

    if (Array.isArray(combination)) {
      combination.forEach(item => {
        Object.keys(item).forEach(key => {
          if (!isNaN(Number(key, 10))) {
            const nestedObj = item[key];
            Object.keys(nestedObj).forEach(nestedKey => {
              const nestedValue = nestedObj[nestedKey];
              const loadCaseName = nestedValue.loadCaseName;
              const sign = nestedValue.sign;
              const factor = nestedValue.factor;
              let factorValue;
              if (factor !== undefined && factor !== "") {
                factorValue = getSingleFactor(factor, factorIndex, i);
              }
              if (factorValue !== undefined && factorValue !== null && factorValue !== 0 && factor !== "") {
                combinedResult.push({ loadCaseName, sign, factor: factorValue });
              }
            });
          } else {
            const value = item[key];
            const loadCaseName = value.loadCaseName;
            const sign = value.sign;
            let factor;
            if (value.factor !== undefined && value.factor !== null && value.factor !== 0) {
              factor = value.factor;
            }
            let factorValue;
            if (factor !== undefined && factor !== "") {
              factorValue = getSingleFactor(factor, factorIndex, i);
            }
            if (factorValue !== undefined && factorValue !== null && factorValue !== 0 && factor !== "") {
              combinedResult.push({ loadCaseName, sign, factor: factorValue });
            }
          }
        });
      });
    } else if (typeof combination === "object" && combination !== null) {
      Object.keys(combination).forEach(key => {
        if (!isNaN(Number(key, 10))) {
          const nestedObj = combination[key];
          Object.keys(nestedObj).forEach(nestedKey => {
            const nestedValue = nestedObj[nestedKey];
            const loadCaseName = nestedValue.loadCaseName;
            const sign = nestedValue.sign;
            let factor;
            if (nestedValue.factor !== undefined && nestedValue.factor !== null && nestedValue.factor !== 0) {
              factor = nestedValue.factor;
            }
            let factorValue;
            if (factor !== undefined && factor !== "") {
              factorValue = getSingleFactor(factor, factorIndex, i);
            }
            if (factorValue !== undefined && factorValue !== null && factorValue !== 0 && factor !== "") {
              combinedResult.push({ loadCaseName, sign, factor: factorValue });
            }
          });
        } else {
          const value = combination[key];
          const loadCaseName = value.loadCaseName;
          const sign = value.sign;
          let factor;
          if (value.factor !== undefined && value.factor !== null && value.factor !== 0) {
            factor = value.factor;
          }
          let factorValue;
          if (factor !== undefined && factor !== "") {
            factorValue = getSingleFactor(factor, factorIndex, i);
          }
          if (factorValue !== undefined && factorValue !== null && factorValue !== 0 && factor !== "") {
            combinedResult.push({ loadCaseName, sign, factor: factorValue });
          }
        }
      });
    }

    if (combinedResult.length > 0) {
      if (firstKey === "Either") {
        if (factorCombination.combinations) {
          const extractedCombinations = factorCombination.combinations;
          extractedCombinations.forEach(innerArray => {
            allCombinations.push([ ...combinedResult ]);
            allCombinations.push([ ...innerArray ]);
          });
        } else {
          const tempCombinedResult = [...combinedResult]; 
          allCombinations.push(tempCombinedResult);
          allCombinations.push([ ...factorCombination ]);
        }
      } else {
        if (factorCombination.combinations) {
          const extractedCombinations = factorCombination.combinations;
          extractedCombinations.forEach(innerArray => {
            const tempCombinedResult = [...combinedResult, ...innerArray];
            allCombinations.push(tempCombinedResult);
          });
        } else {
          const tempCombinedResult = [...combinedResult, ...factorCombination];
          allCombinations.push(tempCombinedResult);
        }
      }
    } else {
      if (factorCombination.combinations) {
        const extractedCombinations = factorCombination.combinations;
        extractedCombinations.forEach(innerArray => {
          const tempCombinedResult = [...innerArray];
          allCombinations.push(tempCombinedResult);
        });
      } else {
        const tempCombinedResult = [...factorCombination];
        allCombinations.push(tempCombinedResult);
      }
    }
  });
});
          const nonEmptyFactorCombinations = factorCombinations.filter(factor => factor.length > 0);
          if (add.length === 0 && nonEmptyFactorCombinations.length > 0) {
            allCombinations.push(...factorCombinations);
          }
          if (type === "add") {
            factorCombinations.forEach(factorCombination => {
              if (Array.isArray(factorCombination) && factorCombination.some(subArray => Array.isArray(subArray))) {
                // If factorCombination contains subarrays, process each subarray
                factorCombination.forEach(subArray => {
                  if (Array.isArray(subArray) && subArray.length > 0) {
                    allCombinations.push(subArray);
                  }
                });
              } else if (factorCombination.length > 0) {
                allCombinations.push(factorCombination);
              }
            });            
            allCombinations = allCombinations.filter(array => array.length > 0);
          }
        }
      }
      let nestedArrayCount = 0; 
      if (type === "add") {
      outerLoop: for (const [key, value] of Object.entries(extractedFactorsStore_add)) {
        if (Array.isArray(value)) {
          for (const innerArray of value) {
            if (Array.isArray(innerArray) && innerArray.length > 0) {
              if (innerArray.some(item => 
                Array.isArray(item) && item.length > 0 && item.some(subItem => Array.isArray(subItem))
              )) {
                nestedArrayCount += innerArray.length;
                break outerLoop;
              } else {
              }
            }
          }
        }
      } } else {
        outerLoop: for (const [key, value] of Object.entries(extractedFactorsStore_either)) {
          if (Array.isArray(value)) {
            for (const innerArray of value) {
              if (Array.isArray(innerArray) && innerArray.length > 0) {
                if (innerArray.some(item => 
                  Array.isArray(item) && item.length > 0 && item.some(subItem => Array.isArray(subItem))
                )) {
                  nestedArrayCount += innerArray.length;
                  break outerLoop;
                } else {
                }
              }
            }
          }
        }
      }

console.log('Extracted Factors:add', extractedFactorsStore_add);
console.log('Extracted Factors:either', extractedFactorsStore_either);
console.log('All Combinations:', allCombinations);
console.log('Number of Nested Arrays from First Inner Arrays:', nestedArrayCount);
const extractedValues_either = Object.values(extractedFactorsStore_either);  
const extractedValues_add = Object.values(extractedFactorsStore_add);
const mergeArray = [];
function getCustomCombinations(arrays,arrays_1) {
  const result = [];
  const filteredArrays = arrays.filter(
    arr => arr.some(subArray => subArray.length > 0)
  );
  const flatArrays1 = arrays_1.flat();
  const arrays1Length = arrays_1.length;
  function buildCombination(currentCombination, currentIndex) {
    if (currentIndex === filteredArrays.length) {
      result.push([...currentCombination]);
      return;
    }
    if (filteredArrays[currentIndex].length === 0) {
      buildCombination(currentCombination, currentIndex + 1);
      return;
    }
    if (currentIndex === 0) {
      filteredArrays[currentIndex].forEach((subArray, index) => {
        if (filteredArrays[currentIndex + 1] !== undefined) {
          const nextSubArray = filteredArrays[currentIndex + 1][filteredArrays[currentIndex + 1].length - 1 - index];
          if (subArray.length > 0 && nextSubArray.length > 0) {
            if (arrays_1.flat(1).length === 1) {
              currentCombination.push(nextSubArray); 
            } else {
              currentCombination.push(subArray, nextSubArray); 
            }
            buildCombination(currentCombination, currentIndex + 2); 
            currentCombination.pop(); 
            currentCombination.pop(); 
          }
        }
      });
    }
  }
  buildCombination([], 0);
  filteredArrays.forEach(filteredArray => {
    if (JSON.stringify(filteredArray) !== JSON.stringify(flatArrays1)) {
      result.push(filteredArray);
    }
  });
  return result;
}
let loopCount = nestedArrayCount > 0 ? nestedArrayCount : 1;
for (let loopIndex = 0; loopIndex < loopCount; loopIndex++) {      
  let iterationArray = [];
for (let j = 0; j < 5; j++) {
  for (let i = 0; i < 5; i++) {
      let baseInnerArray;
      if (type === "add"){
      if ( loopCount === 1) { 
        baseInnerArray = extractedValues_add[i][j];
      } else {
        baseInnerArray = extractedValues_add[i][j][loopIndex]; 
      }} else {
        if ( loopCount === 1) { 
          baseInnerArray = extractedValues_either[i][j];
        } else {
          baseInnerArray = extractedValues_either[i][j][loopIndex]; 
        }
      }
    const fixedElement = baseInnerArray[0];
    let elementsToPermute = [baseInnerArray.slice(1)];
    let elementsToPermute_first = [baseInnerArray.slice(1)];
    for (let k = 0; k < 5; k++) {
      if (k === i) continue;
      let additionalArray;
      if (type === "add"){
      if ( loopCount === 1) { 
        additionalArray = extractedValues_add[k][j];
      } else {
        additionalArray = extractedValues_add[k][j][loopIndex]; 
      } } else { 
        if ( loopCount === 1) { 
          additionalArray = extractedValues_either[k][j];
        } else {
          additionalArray = extractedValues_either[k][j][loopIndex]; 
        }
      }
      if (additionalArray && additionalArray.length > 1) {
        const nonEmptyElements = additionalArray.slice(1);
        elementsToPermute.push(nonEmptyElements);
      }
    }
    console.log(elementsToPermute);
    const permutations = getCustomCombinations(elementsToPermute,elementsToPermute_first);
    permutations.forEach(perm => {
      const mergedInnerArray = [fixedElement, ...perm];
      if (mergedInnerArray.every(el => el && el.length > 0)) {
        iterationArray.push(mergedInnerArray);
      }
    });
  }
}
if (iterationArray.length > 0) {
  mergeArray.push([...iterationArray]);
}
 }
console.log(mergeArray);
      function generateCombinations(arrays, tempResult = [], index = 0, finalCombinations = []) {
        if (index === arrays.length) {
          finalCombinations.push([...tempResult]);
          return;
        }
        if (Array.isArray(arrays[index])) {
          for (const item of arrays[index]) {
            tempResult.push(item); 
            generateCombinations(arrays, tempResult, index + 1, finalCombinations);  
            tempResult.pop();  
          }
        } else {
        }
        return finalCombinations;
      }
      let combinedResult  = [];
      for (const outerArray of mergeArray) {
        let finalCombinations = [];
        let combinations = [];
        for (let subArray of outerArray) {
            combinations = generateCombinations(subArray);
            finalCombinations.push(combinations);
        }
        combinedResult.push(finalCombinations);
      }
      console.log(combinedResult);
      let addresult = {};

for (let factorIndex = 0; factorIndex < 5; factorIndex++) {
  for (let i = 0; i < 5; i++) {
    if (!addresult[factorIndex]) {
      addresult[factorIndex] = {};
    }
    addresult[factorIndex][i] = [];
    let finalResults = [];
    add.forEach(addArray => {
      if (Array.isArray(addArray) && addArray.length > 0) {
        addArray.forEach(item => {
          let itemResults = [];
          if (Array.isArray(item)) {
            item.forEach(subItem => {
              const processedSubItem = processItem(subItem);
              itemResults.push(processedSubItem);
            });
          } else {
            const processedItem = processItem(item); 
            itemResults.push(processedItem);
          }
          finalResults.push(itemResults);
          if (itemResults.length > 0) {
            addresult[factorIndex][i].push(itemResults);
          }
        });
      }
    });
    function processItem(item) {
      let addmultiResult = [];
      Object.keys(item).forEach(key => {
        if (!isNaN(Number(key, 10))) {
          const nestedObj = item[key];
          Object.keys(nestedObj).forEach(nestedKey => {
            const nestedValue = nestedObj[nestedKey];
            const loadCaseName = nestedValue.loadCaseName;
            const sign = nestedValue.sign;
            const factor = nestedValue.factor;
            let factorValue;
            if (factor !== undefined && factor !== null && factor !== '') {
              factorValue = getSingleFactor(factor, factorIndex, i);
            }
            if (factorValue !== undefined && factorValue !== null && factorValue !== 0 && factorValue !== '') {
              addmultiResult.push({ loadCaseName, sign, factor: factorValue });
            }
          });
        } else {
          const value = item[key];
          const loadCaseName = value.loadCaseName;
          const sign = value.sign;
          const factor = value.factor;
          let factorValue;
    
          if (factor !== undefined && factor !== null && factor !== '') {
            factorValue = getSingleFactor(factor, factorIndex, i);
          }
    
          if (factorValue !== undefined && factorValue !== null && factorValue !== 0 && factorValue !== '') {
            addmultiResult.push({ loadCaseName, sign, factor: factorValue });
          }
        }
      });
      console.log(addmultiResult);
      return addmultiResult; 
    }
    console.log(finalResults);
  }
}
console.log(addresult);

Object.keys(addresult).forEach((outerKey) => {
  const outerValue = addresult[outerKey];

  // Ensure the outerValue is an object
  if (typeof outerValue === "object" && outerValue !== null) {   
    Object.keys(outerValue).forEach((innerKey) => {
      const innerValue = outerValue[innerKey];
      if (Array.isArray(innerValue) && innerValue.length > 1) {
        const combinedArrays = backtrackAndJoin(innerValue);
        outerValue[innerKey] = combinedArrays;
      }
    });
  }
});
 
console.log("Updated addresult:", addresult);

let allCombinations_multi = []; 
const inputCombination = combinedResult.length > 0 ? combinedResult : addmulti;
if (inputCombination.length > 0 && type !== "add") {
inputCombination.forEach((mainArray,mainIndex) => {
  mainArray.forEach((innerArray, innerIndex) => { 
    let combinedSet = [];
    Object.keys(addresult).forEach((key) => {
      if (Number(key) === mainIndex) {
        return;
      }
      const addArray = addresult[key];
      if (
        typeof addArray === 'object' &&
        addArray !== null ||
        Object.values(addArray).every(item =>
          Array.isArray(item) &&
          item.length > 0 &&
          item.every(subItem =>
            Array.isArray(subItem)
              ? subItem.length > 0 &&
                subItem.every(nestedItem => !Array.isArray(nestedItem) || nestedItem.length > 0)
              : true
          )
        )
      ) {
        innerArray.forEach((subArray, index) => {
           Object.keys(addArray).forEach((addKey) => {
          const correspondingAddSubArray = addArray[addKey];
          if (
            (Array.isArray(subArray) && correspondingAddSubArray) ||
            (subArray.combinations.length > 0 && correspondingAddSubArray)
          ) {
            const modifiedSubArray = backtrackAndJoin(correspondingAddSubArray);
            let combinedArray;
            modifiedSubArray.forEach((nestedArray) => {
               if (
    Array.isArray(nestedArray) &&
    nestedArray.length === 1 &&
    Array.isArray(nestedArray[0]) &&
    nestedArray[0].length === 0
  ) {
    return; // Skip this nestedArray
  }
              nestedArray.forEach((subSubArray) => {
                if (firstKey === "Either") {
            // For Either, add subArray and subSubArray items separately
            if (Array.isArray(subArray)) {
              subArray.forEach(item => combinedSet.push([item]));
            } else if (typeof subArray === "object" && subArray !== null && subArray.combinations) {
              subArray.combinations.forEach(item => combinedSet.push([item]));
            }
          if (Array.isArray(subSubArray)) {
            combinedSet.push(subSubArray);
          } else {
            combinedSet.push([subSubArray]);
          }
          } else {
            // Default: merge subArray and subSubArray
            if (Array.isArray(subArray)) {
              combinedArray = [...subArray];
            } else if (typeof subArray === "object" && subArray !== null && subArray.combinations) {
              combinedArray = [...subArray.combinations];
            }
            combinedArray.push(...subSubArray);
            combinedSet.push(combinedArray);
          }
              });
              combinedArray = [];
            });
          }
        });
        });

      }
      if (combinedSet.length > 0) {
        allCombinations_multi.push(combinedSet);
      }
      combinedSet = [];
    });
  });
}); }
console.log(allCombinations_multi);
const flattenedCombinations = allCombinations_multi.flat(1);
function backtrackAndJoin(array) {
  let result = [];
  function backtrack(index, current) {
    if (index === array.length) {
      result.push([...current]);
      return;
    }
    array[index].forEach((element) => {
      current.push(element);
      backtrack(index + 1, current);
      current.pop(); 
    });
  }
  backtrack(0, []);
  return result;
}
function flattenArray(arr) {
  return arr.reduce((acc, item) => {
      if (Array.isArray(item)) {
          // Recursively flatten if the item is an array
          acc.push(...flattenArray(item));
      } else {
          acc.push(item);
      }
      return acc;
  }, []);
}
const fullyFlattenedCombinations = flattenedCombinations.map(array => flattenArray(array));
console.log(fullyFlattenedCombinations);
const joinedCombinations = [...fullyFlattenedCombinations, ...allCombinations];
console.log(joinedCombinations);
return joinedCombinations;
}
    if (either && either.length > 0 || envelope &&  envelope.length > 0) {
      let type = "either";
      const combinedLoadCases = [...(either || []), ...(envelope || [])];
      const combined = combineLoadCases(combinedLoadCases, add, envelope,type);
      eitherJoin.push(...combined);
      joinArray.push(eitherJoin);
    }
    const addJoin = [];
    if (either.length === 0 && envelope.length === 0 && add.length > 0) {
      let type = "add";
      const combinedLoadCases = [...add];
      const combined = combineLoadCases(combinedLoadCases, add, envelope,type);
      addJoin.push(...combined);
      joinArray.push(addJoin);
    }
  }
  console.log("Extracted Factors Store: ", extractedFactorsStore);
  return joinArray;
}


export function join_factor(finalCombinations_sign) {
  const deepFlatten = (arr) => {
    if (Array.isArray(arr)) {
      return arr.reduce((flat, item) => {
        if (Array.isArray(item)) {
          return flat.concat(deepFlatten(item));
        } else {
          return flat.concat(item);
        }
      }, []);
    } else {
      return [arr];
    }
  };
  const mergeFactors = (target, source) => {
    if (Array.isArray(source)) {
      for (let i = 0; i < source.length; i++) {
        if (Array.isArray(source[i])) {
          if (!target[i]) {
            target[i] = [];
          }
          mergeFactors(target[i], source[i]);
        } else {
          if (source[i] !== undefined) {
            target[i] = source[i] !== undefined ? source[i] : target[i];
          }
        }
      }
    }
  };

  if (typeof finalCombinations_sign === 'object' && finalCombinations_sign !== null) {
    const { addObj, eitherArray, envelopeObj,firstKey,secondLastKey } = finalCombinations_sign;
    let flattenedEitherArray = [], flattenedAddObj = [], flattenedEnvelopeObj = [];

    if (Array.isArray(eitherArray)) {
      eitherArray.forEach((arr) => {
        if (Array.isArray(arr)) {
          const groupedArray = [];
          arr.forEach((subArr) => {
            if (Array.isArray(subArr)) {
              groupedArray.push(deepFlatten(subArr));
            } else {
              groupedArray.push(subArr);
            }
          });
          if (groupedArray.length > 0) {
            flattenedEitherArray.push(groupedArray);
          }
        } else {
          flattenedEitherArray.push(arr);
        }
      });
    }
    // Flatten addObj
    if (Array.isArray(addObj) && addObj.length > 0) {
      addObj.forEach(mainArray => {
        if (Array.isArray(mainArray)) {
          let mainArrayGroup = []; 
          let combinedArray = [];
          if (mainArray.length === 1) {
            const currentArray = mainArray[0];
            if (currentArray.length === 1 && Array.isArray(currentArray[0]) && currentArray[0].every(item => !Array.isArray(item))) {
              combinedArray.push(currentArray);
              mainArrayGroup.push([...deepFlatten(combinedArray)]);
              combinedArray = [];
            } else {
              if (currentArray.length > 0) {
                const length = currentArray[0].length;
                // for (let i = 0; i < length; i++) {
                  let combinedArray = [];
                  for (let i = 0; i < length; i++) {
                    let shouldBreak = false;
                  currentArray.forEach(subArray => {
                    if (Array.isArray(subArray) && subArray.some(item => Array.isArray(item))) {
                      combinedArray.push(subArray[i]);
                    }
                     else {
                      combinedArray.push(subArray);
                      shouldBreak = true;
                    }
                  });
                  mainArrayGroup.push([...deepFlatten(combinedArray)]);
                  combinedArray = [];
                  if (shouldBreak) break; 
                 }
                }
              }
          } else {
            mainArray.forEach(currentArray => {
              if (currentArray.length > 0) {
                  let currentArrayGroup = [];
                  const containsNestedSubArray = currentArray.some(item => {
                      if (Array.isArray(item)) {
                          return item.some(subItem => Array.isArray(subItem));
                      }
                      return false;
                  });
                  if (!containsNestedSubArray) {
                      currentArrayGroup.push([...deepFlatten(currentArray)]);
                  } else {
                      const length = currentArray[0].length;
                      for (let i = 0; i < length; i++) {
                          let combinedArray = [];
                          currentArray.forEach(subArray => {
                              if (Array.isArray(subArray) && subArray[i]) {
                                  combinedArray.push(subArray[i]);
                              }
                          });
                          currentArrayGroup.push([...deepFlatten(combinedArray)]);
                      }
                  }
                  mainArrayGroup.push(currentArrayGroup);
              }
          });         
          }
          flattenedAddObj.push(mainArrayGroup);
        }
      });
  }
    if (Array.isArray(envelopeObj)) {
      envelopeObj.forEach(arr => {
        if (Array.isArray(arr)) {
          const groupedArray = []; 
          arr.forEach((subArr) => {
            if (Array.isArray(subArr)) {
              groupedArray.push(deepFlatten(subArr));
            } else {
              groupedArray.push(subArr);
            }
          });
          if (groupedArray.length > 0) {
            flattenedEnvelopeObj.push(groupedArray);
          }
        } else {
          flattenedEnvelopeObj.push(arr);
        }
      });
    }
    const combinedResults = {};
    const combineFactors = (items) => {
      let combinedResult = {};
      items.forEach(item => {
        if (item && typeof item === 'object') {
          if (item.loadCaseName && item.factor) {
            const key = `${item.loadCaseName}|${item.sign}`;
            if (!combinedResult[key]) {
              combinedResult[key] = {
                loadCaseName: item.loadCaseName,
                sign: item.sign,
                factor: [],
                previousKey: item.previousKey
              };
            }
            mergeFactors(combinedResult[key].factor, item.factor);
          } else if (item.specialKeys) {
            const key = `${item.previousKey}|specialKeys`;
            if (!combinedResult[key]) {
              combinedResult[key] = {
                specialKeys: [],
                previousKey: item.previousKey
              };
            }
            mergeFactors(combinedResult[key].specialKeys, item.specialKeys);
          }
        }
        
      });
      Object.keys(combinedResult).forEach(key => {
        if (!combinedResults[key]) {
          combinedResults[key] = combinedResult[key];
        } else {
          mergeFactors(combinedResults[key].factor, combinedResult[key].factor);
        }
      });
      return combinedResult;
    };

    const processFactorsArray = (commonArray) => {
      commonArray.forEach(itemArray => {
        // Check if itemArray is neither undefined nor an empty string
        if (itemArray && typeof itemArray !== 'string') {
          itemArray.forEach(subArray => {
            Object.keys(subArray).forEach(key => {
              // Check if the key is a number
              if (!isNaN(Number(key))) {
                // If key is a number, go deeper into its nested key-value pairs
                const nestedObj = subArray[key];
                Object.keys(nestedObj).forEach(nestedKey => {
                  const factor = nestedObj[nestedKey].factor;
                  if (Array.isArray(factor)) {
                    nestedObj[nestedKey].factor = normalizeFactors(factor);
                  }
                });
              } else {
                // Follow the current process for non-integer keys
                const factor = subArray[key].factor;
                if (Array.isArray(factor)) {
                  subArray[key].factor = normalizeFactors(factor);
                }
              }
            });
          });
        }
      });
    };
    const commonArray_add = flattenedAddObj.map(mainArray => {
      // Check if mainArray is valid (not empty and is an array)
      if (Array.isArray(mainArray) && mainArray.length > 0) {
        if (mainArray.length > 1) {
            // If mainArray has more than one subarray, process each inner array
            return mainArray.map(subArray => {
                // Check if subArray is valid
                if (Array.isArray(subArray)) {
                    // If subArray doesn't contain nested arrays, send directly to combineFactors
                    if (!subArray.some(item => Array.isArray(item))) {
                        return combineFactors(subArray);
                    }
                    return subArray.map(innerArray => {
                        return Array.isArray(innerArray) ? combineFactors(innerArray) : innerArray;
                    });
                }
                return subArray;
            });
        }
        else {
          return mainArray.map(subArray => {
            return Array.isArray(subArray) ? [combineFactors(subArray)] : subArray;
          });
        }
      }
      return [];
    });
    
    const commonArray_Either = flattenedEitherArray.map(item => {
      if (Array.isArray(item)) {
        return item.map(subArray => combineFactors(Array.isArray(subArray) ? subArray : [subArray]));
      } else {
        return [combineFactors([item])];
      }
    });
    const commonArray_Envelope = flattenedEnvelopeObj.map(item => {
      if (Array.isArray(item)) {
        return item.map(subArray => combineFactors(Array.isArray(subArray) ? subArray : [subArray]));
      } else {
        return [combineFactors([item])];
      }
    });

    const normalizeFactors = (factorArray) => {
      if (!Array.isArray(factorArray)) return factorArray;
      return factorArray.map(item => {
        if (typeof item === 'object' && item !== null) {
          const maxKey = Math.max(...Object.keys(item).map(Number));
          for (let index = 0; index <= maxKey; index++) {
            if (!(index in item)) item[index] = undefined;
          }
          return item;
        } else {
          return item === "empty" ? undefined : item;
        }
      });
    };

    processFactorsArray(commonArray_add);
    processFactorsArray(commonArray_Either);
    processFactorsArray(commonArray_Envelope);

    console.log("Final Common Array of Results: Add", commonArray_add);
    console.log("Final Common Array of Results: Either", commonArray_Either);
    console.log("Final Common Array of Results: Envelope", commonArray_Envelope);

    return {
      add: commonArray_add,
      either: commonArray_Either,
      envelope: commonArray_Envelope,
      firstKey,
      secondLastKey
    };
  } else {
    console.error("finalCombinations_sign is not an object or is null:", finalCombinations_sign);
  }
}

