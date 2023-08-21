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

    // setGame();
    placeRandomBoat();
    // $(document).on('mousedown', '.gridTile', function() {
    //     $(this).addClass("boatTile");
    // });

    pxToViewportUnit("myBoardContainer", true);
    pxToViewportUnit("oppBoardContainer", true);
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

function placeRandomBoat() {
    const length = getRandomInt(2, 5);
}

function pxToViewportUnit(id, keepAspect) {
    const viewportWidth = $(window).width();
    const viewportHeight = $(window).height();

    const width = $(`#${id}`).width();
    const height = $(`#${id}`).height();

    const vw = 100 * width / viewportWidth;
    const vh = 100 * height / viewportHeight;

    if(keepAspect) { //TODO - make div keep its aspect when window is resized (using $(window).resize(function() {});?)
        $(`#${id}`).css({
            "width": vw + "vw",
            "height": vh + "vh"
        });
    }
    else {
        $(`#${id}`).css({
            "width": vw + "vw",
            "height": vh + "vh"
        });
    }
}