//file for general utilites

//#region array utilites
function findIndex2DArray(array, targetObject) {
    for (var i = 0; i < array.length; i++) {
        for (var j = 0; j < array[i].length; j++) {
        if (array[i][j] === targetObject) {
            return { row: i, column: j };
        }
        }
    }

    return { row: -1, column: -1 }; // Object not found in the array
}

// function that console.logs the values in a 2d array (or normal array)
function logArray(array) {
    let output = "";
    for (let r = 0; r < array.length; r++) 
    {
        for (let c = 0; c < array[r].length; c++) 
        {
            if(array[r][c] == " ") {
                output = output + "0 "; //output a 0 representing an empty string (" ")
            }
            else {
                output = output + array[r][c] + " ";
            }
        }
        output = output + "\n";
    }
    console.log(output);
}
//#endregion