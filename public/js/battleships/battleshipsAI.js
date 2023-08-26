let aiAttackedSquares = [];

//TODO - make bot remember if it was attacking a ship last turn
//also detect if defeated ship
//also fix bot attacking same spots after a hit
//also fix splash not showing sometimes

//function to get a random move with ship destroying
async function aiRandomMove(_playerGrid) {
    const deltas = [[-1, 0], [1, 0], [0, 1], [0, -1]]; //deltas to check when attacking a ship
    let attackGrid = copy2DArray(_playerGrid);

    let lastRanDir = 0; //get value of last ran dir
    let lastMoveHit = false;

    let plays = 1;
    let consecutiveHits = 0;

    let ranX = getRandomInt(0, 9);
    let ranY = getRandomInt(0, 9);
    while(aiAttackedSquares.includes(`${ranX}-${ranY}`)) { //make sure don't already attack squares
        ranX = getRandomInt(0, 9);
        ranY = getRandomInt(0, 9);
    }

    for (let i = 0; i < plays; i++) {
        const attackTile = $(`#my${ranX}-${ranY}`);

        await sleep(1000);

        if(attackGrid[ranX][ranY] !== ' ') {
            spawnMark(attackTile, "hitMark");
            aiAttackedSquares.push(`${ranX}-${ranY}`);

            //try to destroy boat
            if(!lastMoveHit) { //if last move didn't hit
                let ranDir = getRandomInt(0, 3);
                ranX += deltas[ranDir][0];
                ranY += deltas[ranDir][1];
                
                if(aiAttackedSquares.includes(`${ranX}-${ranY}`)) {
                    //reverse ran dir
                    if(ranDir % 2 == 0) {
                        ranDir++;
                    }
                    else {
                        ranDir--;
                    }

                    //attack correct square
                    ranX += (consecutiveHits * deltas[ranDir][0]);
                    ranY += (consecutiveHits * deltas[ranDir][1]);
                }

                lastRanDir = ranDir;
                consecutiveHits++;
            }
            else {
                ranX += deltas[lastRanDir][0];
                ranY += deltas[lastRanDir][1];
            }
            
            lastMoveHit = true;
            plays++;
        }
        else {
            spawnMark(attackTile, "missMark");
            aiAttackedSquares.push(`${ranX}-${ranY}`);

            //reset attack
            ranX = getRandomInt(0, 9);
            ranY = getRandomInt(0, 9);
            while(aiAttackedSquares.includes(`${ranX}-${ranY}`)) { //make sure don't already attack squares
                ranX = getRandomInt(0, 9);
                ranY = getRandomInt(0, 9);
            }

            lastMoveHit = false;
            consecutiveHits = 0;
        }
        console.log(attackTile.attr("id"));
    }

    //alternate player
    ba_isMyTurn.setState(!ba_isMyTurn.getState());

    //alternate who has the border around their icon
    if($('#playerIcon').hasClass('currentGo')) {
        $('#playerIcon').removeClass('currentGo');
        $('#opponentIcon').addClass('currentGo');
    }
    else if ($('#opponentIcon').hasClass('currentGo')) {
        $('#opponentIcon').removeClass('currentGo');
        $('#playerIcon').addClass('currentGo');
    }
}

async function aiRandomMove2(_playerGrid) {
    const deltas = [[-1, 0], [1, 0], [0, 1], [0, -1]]; //deltas to check when attacking a ship
    let attackGrid = copy2DArray(_playerGrid);

    let ranCoords = getRanCoords();

    let plays = 1;

    for (let i = 0; i < plays; i++) {
        const attackTile = $(`#my${ranCoords[0]}-${ranCoords[1]}`);

        await sleep(1000);

        if(attackGrid[ranCoords[0]][ranCoords[1]] !== ' ') {
            spawnMark(attackTile, "hitMark");
            aiAttackedSquares.push(`${ranCoords[0]}-${ranCoords[1]}`);

            //update array to show segment has been hit
            attackGrid[ranCoords[0]][ranCoords[1]] = `${attackGrid[ranCoords[0]][ranCoords[1]]}h`;

            //update array
            ba_myBoard.updateBoard(attackGrid);

            //check if boat sunk
            isBoatSunk(ba_myBoard.getBoard(), "my", attackGrid[ranCoords[0]][ranCoords[1]][0]);

            //reset attack
            ranCoords = getRanCoords();

            plays++;
        }
        else {
            spawnMark(attackTile, "missMark");
            aiAttackedSquares.push(`${ranCoords[0]}-${ranCoords[1]}`);

            //reset attack
            ranCoords = getRanCoords();
        }
    }

    //alternate player
    ba_isMyTurn.setState(!ba_isMyTurn.getState());

    //alternate who has the border around their icon
    if($('#playerIcon').hasClass('currentGo')) {
        $('#playerIcon').removeClass('currentGo');
        $('#opponentIcon').addClass('currentGo');
    }
    else if ($('#opponentIcon').hasClass('currentGo')) {
        $('#opponentIcon').removeClass('currentGo');
        $('#playerIcon').addClass('currentGo');
    }
}

//function to generate ranX and ranY
function getRanCoords() {
    if(aiAttackedSquares.length < 100) {
        let ranX = getRandomInt(0, 9);
        let ranY = getRandomInt(0, 9);
        while(aiAttackedSquares.includes(`${ranX}-${ranY}`)) { //make sure don't already attack squares
            ranX = getRandomInt(0, 9);
            ranY = getRandomInt(0, 9);
        }

        return [ranX, ranY];
    }
    else {
        return "all moves used up";
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}