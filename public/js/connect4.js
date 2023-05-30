const rows = 6;
const columns = 7;

// When document loads up call setGame()
$(document).ready(function() {
    setGame();
});

function setGame() {
    //board will be a 2d array
    board = [];

    //rows
    for (let r = 0; r < rows; r++) {
        //each row
        let row = [];

        //columns
        for (let c = 0; c < columns; c++) {
            row.push(' '); //add an empty value to each column of a row

            //#region Creating tiles
            //creates <div id="0-0" class="tile"></div> in the board div
            //The square background has id SQ0-0, the cicular tile has 0-0
            //A square shaped div is created behind the circular tile to detect the hover
            let idNo = r.toString() + "-" + c.toString();
            let squareTile = document.createElement("div");
            squareTile.id = "SQ" + idNo;
            squareTile.classList.add("squareTile");

            //append squareTile to board
            $('#board').append(squareTile);

            //#endregion
        }
        board.push(row);
    }

    logArray(board);
}

// function that console.logs the values in a 2d array (or normal array)
function logArray(array){
    let output = "";
    for (let r = 0; r < array.length; r++) 
    {
        for (let c = 0; c < array[r].length; c++) 
        {
            output = output + "0 "; //swap the zero for the value of the array
        }
        output = output + "\n";
    }
    console.log(output);
}