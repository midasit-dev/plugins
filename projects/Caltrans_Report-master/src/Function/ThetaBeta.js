function ThetaBeta1(x, y) {
    const table1 = [[[22.3, 6.32],[20.4, 4.75],[21.0, 4.10],[21.8, 3.75],[24.3, 3.24],[26.6, 2.94],[30.5, 2.59],[33.7, 2.38],[36.4, 2.23]],
    [[18.1, 3.79],[20.4, 3.38],[21.4, 3.24],[22.5, 3.14],[24.9, 2.91],[27.1, 2.75],[30.8, 2.50],[34.0, 2.32],[36.7, 2.18]],
    [[19.9, 3.18],[21.9, 2.99],[22.8, 2.94],[23.7, 2.87],[25.9, 2.74],[27.9, 2.62],[31.4, 2.42],[34.4, 2.26],[37.0, 2.13]],
    [[21.6, 2.88],[23.3, 2.79],[24.2, 2.78],[25.0, 2.72],[26.9, 2.60],[28.8, 2.52],[32.1, 2.36],[34.9, 2.21],[37.3, 2.08]],
    [[23.2, 2.73],[24.7, 2.66],[25.5, 2.65],[26.2, 2.60],[28.0, 2.52],[29.7, 2.44],[32.7, 2.28],[35.2, 2.14],[36.8, 1.96]],
    [[24.7, 2.63],[26.1, 2.59],[26.7, 2.52],[27.4, 2.51],[29.0, 2.43],[30.6, 2.37],[32.8, 2.14],[34.5, 1.94],[36.1, 1.79]],
    [[26.1, 2.53],[27.3, 2.45],[27.9, 2.42],[28.5, 2.40],[30.0, 2.34],[30.8, 2.14],[32.3, 1.86],[34.0, 1.73],[35.7, 1.64]],
    [[27.5, 2.39],[28.6, 2.39],[29.1, 2.33],[29.7, 2.33],[30.6, 2.12],[31.3, 1.93],[32.8, 1.70],[34.3, 1.58],[35.8, 1.50]]
];

    const xValues1 = [-0.20, -0.1, -0.05, 0, 0.125, 0.25, 0.5, 0.75, 1];
    const yValues1 = [0.075, 0.1, 0.125, 0.15, 0.175, 0.2, 0.225, 0.25];

   return bilinearInterpolation(x, y, xValues1, yValues1, table1)

}

function ThetaBeta2(x,y) {
    const table2 = [[[25.4, 6.36],[25.5, 6.06],[25.9, 5.56],[26.4, 5.15],[27.7, 4.41],[28.9, 3.91],[30.9, 3.26],[32.4, 2.86],[33.7, 2.58][35.6, 2.21],[37.2, 1.96]],
    [[27.6, 5.78],[27.6, 5.78],[28.3, 5.38],[29.3, 4.89],[31.6, 4.05],[33.5, 3.52],[36.3, 2.88],[38.4, 2.50],[40.1, 2.23],[42.7, 1.88],[44.7, 1.65]],
    [[29.5, 5.34],[29.5, 5.34],[29.7, 5.27],[31.1, 4.73],[34.1, 3.82],[36.5, 3.28],[39.9, 2.64],[42.4, 2.26],[44.4, 2.01],[47.4, 1.68],[49.7, 1.46]],
    [[31.2, 4.99],[31.2, 4.99],[31.2, 4.99],[32.3, 4.61],[36.0, 3.65],[38.8, 3.09],[42.7, 2.46],[45.5, 2.09],[47.6, 1.85],[50.9, 1.52],[53.4, 1.31]],
    [[34.1, 4.46],[34.1, 4.46],[34.1, 4.46],[34.2, 4.43],[38.9, 3.39],[42.3, 2.82],[46.9, 2.19],[50.1, 1.84],[52.6, 1.60],[56.3, 1.30],[59.0, 1.10]],
    [[36.6, 4.06],[36.6, 4.06],[36.6, 4.06],[36.6, 4.06],[41.2, 3.20],[45.0, 2.62],[50.2, 2.00],[53.7, 1.66],[56.3, 1.43],[60.2, 1.14],[63.0, 0.95]],
    [[40.8, 3.50],[40.8, 3.50],[40.8, 3.50],[40.8, 3.50],[44.5, 2.92],[49.2, 2.32],[55.1, 1.72],[58.9, 1.40],[61.8, 1.18],[65.8, 0.92],[68.6, 0.75]],
    [[44.3, 3.10],[44.3, 3.10],[44.3, 3.10],[44.3, 3.10],[47.1, 2.71],[52.3, 2.11],[58.7, 1.52],[62.8, 1.21],[65.7, 1.01],[69.7, 0.76],[72.4, 0.62]]
];
    const xValues2 = [-0.20, -0.1, -0.05, 0, 0.125, 0.25, 0.5, 0.75, 1, 1.5, 2.0];
    const yValues2 = [5, 10, 15, 20, 30, 40, 60, 80];
  return  bilinearInterpolation(x, y, xValues2, yValues2, table2)
}


function bilinearInterpolation(x, y, xValues, yValues, table) {

    x = Math.max(xValues[0], Math.min(xValues[xValues.length - 1], x));
    y = Math.max(yValues[0], Math.min(yValues[yValues.length - 1], y));
    // Find the indices of the surrounding grid points
    const x1Index = findIndex(xValues, x);
    const x2Index = x1Index + 1;
    const y1Index = findIndex(yValues, y);
    const y2Index = y1Index + 1;

    // Get the x and y coordinates of the surrounding grid points
    const x1 = xValues[x1Index];
    const x2 = xValues[x2Index];
    const y1 = yValues[y1Index];
    const y2 = yValues[y2Index];
    // console.log(x1, x2, y1, y2);
    //Get the values at the surrounding grid points
    const P11 = table[y1Index][x1Index][0];
    const P21 = table[y1Index][x2Index][0];
    const P12 = table[y2Index][x1Index][0];
    const P22 = table[y2Index][x2Index][0];
    // console.log(P11, P21, P12, P22)
    const Q11 = table[y1Index][x1Index][1];
    const Q21 = table[y1Index][x2Index][1];
    const Q12 = table[y2Index][x1Index][1];
    const Q22 = table[y2Index][x2Index][1];
    // console.log(Q11, Q21, Q12, Q22)
    const P1=  ((x2 - x) / (x2 - x1)) * P11 + ((x - x1) / (x2 - x1)) * P21;
    const P2 = ((x2 - x) / (x2 - x1)) * P12 + ((x - x1) / (x2 - x1)) * P22;
    const P=((y2 - y) / (y2 - y1)) * P1 + ((y - y1) / (y2 - y1)) * P2;

    const Q1=  ((x2 - x) / (x2 - x1)) * Q11 + ((x - x1) / (x2 - x1)) * Q21;
    const Q2 = ((x2 - x) / (x2 - x1)) * Q12 + ((x - x1) / (x2 - x1)) * Q22;
    const Q=((y2 - y) / (y2 - y1)) * Q1 + ((y - y1) / (y2 - y1)) * Q2;
    // console.log(P,Q);
    return [P,Q];
}
function findIndex(values, value) {
    console.log(value);
    console.log(values);
    for (let i = 0; i < [values.length - 1]; i++) {
        if (value >= values[i] && value <= values[i + 1]) {
            return i;
        }
    }
    // if(value<=values[0]) return 0;
    // if(value>=values [values.length - 1]) return values.length - 1;
    // throw new Error('Value out of bounds');
    return value <= values[0] ? 0 : values.length - 1;
}

export { ThetaBeta1, ThetaBeta2 }