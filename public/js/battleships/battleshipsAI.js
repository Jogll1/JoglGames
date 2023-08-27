let aiAttackedSquares = [];
let aiHitSquares = [];
let LAST_DIR = '';

//TODO - make bot remember if it was attacking a ship last turn

//function to get a random move with ship destroying
async function aiRandomMove(_playerGrid) {
    const deltas = [[-1, 0], [1, 0], [0, 1], [0, -1]]; //deltas to check when attacking a ship
    let attackGrid = copy2DArray(_playerGrid);

    let ranCoords = getRanCoords();

    let plays = 1;
    let consecutiveHits = 0;

    for (let i = 0; i < plays; i++) {
        console.log(ranCoords);

        const attackTile = $(`#my${ranCoords[0]}-${ranCoords[1]}`);

        await sleep(1000);

        if(aiHitSquares.length > 0) {
            //if we are currently attacking squares
            console.log("heeb");
        }
        else {
            if(attackGrid[ranCoords[0]][ranCoords[1]] !== ' ') {
                //hit
                aiAttack(ranCoords, attackTile, "hitMark");

                //update array to show segment has been hit
                attackGrid[ranCoords[0]][ranCoords[1]] = `${attackGrid[ranCoords[0]][ranCoords[1]]}h`;

                //update array
                ba_myBoard.updateBoard(attackGrid);

                //check if boat sunk
                const boatSunk = isBoatSunk(ba_myBoard.getBoard(), "my", attackGrid[ranCoords[0]][ranCoords[1]][0]);

                //update attack coords
                if(boatSunk.status) {
                    console.log("boat sunk");
                    //reset attack if boat sunk
                    ranCoords = getRanCoords();
                    
                    //remove squares sunk from aiHitSquares
                    for (let i = 0; i < boatSunk.boatCoords.length; i++) {
                        const coords = `${boatSunk.boatCoords[i][0]}-${boatSunk.boatCoords[i][1]}`;
                        aiHitSquares.pop(coords);
                    }
                }
                else {
                    if(aiHitSquares.length <= 0) { //this should always pass
                        //if this is our first hit on a boat, pick a random direction
                        const dir = deltas[getRandomInt(0, 3)];
                        const oldRanCoords = ranCoords;
                        
                        //start attacking ship in this direction
                        const directionsToTry = [dir, [-dir[0], -dir[1]], [dir[1], dir[0]], [-dir[1], -dir[0]]];

                        //go through directions to make sure you can do them
                        for (const dir of directionsToTry) {
                            ranCoords = [oldRanCoords[0] + dir[0], oldRanCoords[1] + dir[1]];

                            if (validateAttackCoord(ranCoords)) {
                                break;
                            }
                        }

                        LAST_DIR = dir;
                    }
                }

                aiHitSquares.push(`${ranCoords[0]}-${ranCoords[1]}`);
                consecutiveHits++;
                plays++;
            }
            else {
                //miss
                aiAttack(ranCoords, attackTile, "missMark");

                //reset attack
                ranCoords = getRanCoords();

                consecutiveHits = 0;
            }
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
        let ranX, ranY;

        do {
            ranX = getRandomInt(0, 9);
            ranY = getRandomInt(0, 9);
        }
        while(aiAttackedSquares.includes(`${ranX}-${ranY}`)); //make sure don't already attack squares

        return [ranX, ranY];
    }
    else {
        return "all moves used up"; //this should be impossible for the second player
    }
}

//function to validate updated attack coord
function validateAttackCoord(_coords) {
    //_coords in format [a, b]
    //returns true if aiAttackedSquares doesn't include _coords
    return !aiAttackedSquares.includes(`${_coords[0]}-${_coords[1]}`);
}

//function to play ai attack
function aiAttack(_coords, _attackTile, _markType) {
    spawnMark(_attackTile, _markType);
    aiAttackedSquares.push(`${_coords[0]}-${_coords[1]}`);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}