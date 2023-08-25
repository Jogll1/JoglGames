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

    $(".gridTile").click(function(e) {
        if($(this).attr("id").includes("op")) {
            spawnSplash(e, $(this));
            spawnMark($(this), getRandomInt(0, 1) === 0 ? "missMark" : "hitMark");

            $(this).addClass("checkedTile");
        }
    });

    logArray(ba_myBoard.getBoard());

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
            tile1.classList.add("checkedTile");

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
function placeRandomBoat(_length, _i, _colour) {
    const vertOrHor = getRandomInt(0, 1); //0 = vertical, 1 = horizontal

    let ranX = getRandomInt(0, 9);
    let ranY = getRandomInt(0, 9);

    //make sure boat can fit in grid
    if(vertOrHor === 0) {
        if(9 - ranX < _length) {
            //if boat won't fit on grid, move it back
            const extraDist = _length - (9 - ranX);
            ranX = ranX - extraDist;
        }
    }
    else {
        if(ranY < _length) {
            //if boat won't fit on grid, move it down
            const extraDist = _length - ranY;
            ranY = ranY + extraDist;
        }
    }

    const gridArray = copy2DArray(ba_myBoard.getBoard());

    if(isValidPlacement(gridArray, vertOrHor, _length, ranX, ranY)) {
        //place tiles (down and left)
        for (let i = 0; i < _length; i++) {
            if(i === 0) {
                //update array
                gridArray[ranX][ranY] = _i;
                // logArray(gridArray);

                $(`#my${ranX}-${ranY}`).addClass(`boatTile ${vertOrHor === 0 ? "boatTopTile" : "boatRightTile"}`);
                $(`#my${ranX}-${ranY}`).css("background-color", _colour);
            }
            else {
                if(vertOrHor === 0) {
                    //update array
                    gridArray[ranX + i][ranY] = _i;
                    // logArray(gridArray);

                    //horizontal
                    $(`#my${ranX + i}-${ranY}`).addClass(`boatTile ${i < _length - 1 ? "boatTile" : "boatBottomTile"}`);
                    $(`#my${ranX + i}-${ranY}`).css("background-color", _colour);
                }
                else {
                    //update array
                    gridArray[ranX][ranY - i] = _i;
                    // logArray(gridArray);

                    //vertical
                    $(`#my${ranX}-${ranY - i}`).addClass(`boatTile ${i < _length - 1 ? "boatTile" : "boatLeftTile"}`);
                    $(`#my${ranX}-${ranY - i}`).css("background-color", _colour);
                }
            }
        }

        ba_myBoard.updateBoard(gridArray);

        return true;
    }
    else {
        return false;
    }
}

//check for valid boat placement
function isValidPlacement(_gridArray, _vertOrHor, _length, _ranX, _ranY) {
    for (let i = 0; i < _length; i++) {
        if(_vertOrHor === 0) {
            if(_gridArray[_ranX + i][_ranY] !== ' ') return false;
        }
        else {
            if(_gridArray[_ranX][_ranY - i] !== ' ') return false;
        }
    }

    return true;
}

//function to place all 5 boats
function placeBoats() {
    const boatLengths = [5, 4, 3, 3, 2]
    const boatColours = ["#c91847", "#4ea9d0", "limegreen", "#f6ae2d", "#ef2ac9"]; //#3d72e3

    for (let i = 0; i < boatLengths.length; i++) {
        let canPlace = placeRandomBoat(boatLengths[i], i + 1, boatColours[i]);
        while(!canPlace) {
            canPlace = placeRandomBoat(boatLengths[i], i + 1, boatColours[i]);
        }
    }
}

//function to spawn a splash effect
function spawnSplash(e, tile) {
    const splash = $('<div></div');
    splash.addClass("splashEffect");

    splash.css({
        top: `calc(50% - ${12.5}px)`,
        left: `calc(50% - ${12.5}px)`
    });

    splash.appendTo(tile);

    setTimeout(function() {
        splash.css({
          transform: "scale(3)",
          opacity: 0,
          transition: "transform 0.6s ease-out, opacity 0.6s ease-out"
        });
        
        // Remove the splash element from the DOM after 500
        setTimeout(function() {
          splash.remove();  
        }, 500);
    }, 0);
}

//function to spawn a hit mark
function spawnMark(tile, type) {
    const mark = $('<div></div');
    mark.addClass(type);

    mark.appendTo(tile);
}