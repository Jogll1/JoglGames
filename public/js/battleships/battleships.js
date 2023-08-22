const ba_SIZE = 10; //10x10 grid

//#region globals
var ba_myBoard = (function() {
    var board = [];

    return {
        updateBoard : function(array) {
            // logArray(board);
            return board = array;
        },

        getBoard : function() {
            return board;
        }
    }
})();

var ba_oppBoard = (function() {
    var board = [];

    return {
        updateBoard : function(array) {
            // logArray(board);
            return board = array;
        },

        getBoard : function() {
            return board;
        }
    }
})();
//#endregion

//when document loads up
$(document).ready(function() {
    $('.scoreAndIconParent').show();

    setGame();
    placeBoats()

    $(document).on('mousedown', '.gridTile', function() {
        // $(this).addClass("boatTile");
        // $(this).addClass("boatRightTile");
        // console.log($(this).attr("id"));
    });

    // const initScale = 450 / 1920;
    // $(window).resize(function() {
    //     updateElementScale("myBoardContainer", initScale);
    // });
});

//initialise the game by creating the boards and the tiles
function setGame() {
    let myBoard = [];
    let oppBoard = [];

    //rows
    for (let r = 0; r < ba_SIZE; r++) {
        //each row
        let myRow = [];
        let oppRow = [];

        //columns
        for (let c = 0; c < ba_SIZE; c++) {
            //add an empty value to each column of a row
            myRow.push(' '); 
            oppRow.push(' ');

            //1 for us and 2 for opponent

            //#region Creating tiles
            let idNo = r.toString() + "-" + c.toString();

            let tile1 = document.createElement("div");
            tile1.id = `my${idNo}`;
            tile1.classList.add("gridTile");

            let tile2 = document.createElement("div");
            tile2.id = `op${idNo}`;
            tile2.classList.add("gridTile");

            //allow pieces to be dropped on it
            // squareTile.classList.add("dropTile");

            //append squareTile to board
            $('#myBoard').append(tile1);
            $('#oppBoard').append(tile2);
            //#endregion
        }
        myBoard.push(myRow);
        oppBoard.push(myBoard);
    }

    ba_myBoard.updateBoard(myBoard);
    ba_oppBoard.updateBoard(oppBoard);
}

//function to place a random boat on the grid
function placeRandomBoat(length) {
    const vertOrHor = getRandomInt(0, 1); //0 = vertical, 1 = horizontal

    let ranX = getRandomInt(0, 9);
    let ranY = getRandomInt(0, 9);

    //make sure boat can fit in grid
    if(vertOrHor === 0) {
        if(9 - ranX < length) {
            //if boat won't fit on grid, move it back
            const extraDist = length - (9 - ranX);
            ranX = ranX - extraDist;
        }
    }
    else {
        if(ranY < length) {
            //if boat won't fit on grid, move it down
            const extraDist = length - ranY;
            ranY = ranY + extraDist;
        }
    }

    const gridArray = copy2DArray(ba_myBoard.getBoard());

    //check if boat will not overlap with anything
    for (let i = 0; i < length; i++) {
        if(vertOrHor === 0) { 
            if(gridArray[ranX + i][ranY] === 'o') return false
        }
        else {
            if(gridArray[ranX][ranY - i] === 'o') return false
        }
    }
    
    //place tiles
    for (let i = 0; i < length; i++) {
        if(i === 0) {
            //update array
            gridArray[ranX][ranY] = 'o';

            $(`#my${ranX}-${ranY}`).addClass("boatTile");
            $(`#my${ranX}-${ranY}`).addClass(vertOrHor === 0 ? "boatTopTile" : "boatRightTile");
        }
        else {
            if(vertOrHor === 0) {
                //update array
                gridArray[ranX + i][ranY] = 'o';

                //horizontal
                $(`#my${ranX + i}-${ranY}`).addClass("boatTile");
                $(`#my${ranX + i}-${ranY}`).addClass(i < length - 1 ? "boatTile" : "boatBottomTile");
            }
            else {
                //update array
                gridArray[ranX][ranY - i] = 'o';

                //vertical
                $(`#my${ranX}-${ranY - i}`).addClass("boatTile");
                $(`#my${ranX}-${ranY - i}`).addClass(i < length - 1 ? "boatTile" : "boatLeftTile");
            }
        }
    }

    ba_myBoard.updateBoard(gridArray);

    return true;
}

//function to place all 5 boats
function placeBoats() {
    const boatsLengths = [5, 4, 3, 3, 2]

    for (let i = 0; i < boatsLengths.length; i++) {
        let canPlace = placeRandomBoat(boatsLengths[i]);
        while(!canPlace) {
            canPlace = placeRandomBoat(boatsLengths[i]);
        }
    }
}