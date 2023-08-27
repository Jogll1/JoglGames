let aiAttackedSquares = [];
let aiHitSquares = [];
let LAST_DIR = '';

//TODO - make bot remember if it was attacking a ship last turn

//function to get a random move with ship destroying
async function aiRandomMove(_playerGrid) {
    const deltas = [[-1, 0], [1, 0], [0, 1], [0, -1]]; //deltas to check when attacking a ship
    let attackGrid = copy2DArray(_playerGrid);

    let ranCoords = getRanCoords(); //[a, b]

    let plays = 1;
    let consecutiveHits = 0;
    let lastConsecutiveHits = 0;

    for (let i = 0; i < plays; i++) {
        let attackCoords = ranCoords;

        await sleep(1000);

        if(aiHitSquares.length > 0) {
            //if we are currently attacking squares
            const dir = LAST_DIR;

            const dirsToTry = [dir, [-dir[0], -dir[1]], [dir[1], dir[0]], [-dir[1], -dir[0]]];

            //if last attack was a miss
            if(consecutiveHits === 0 && lastConsecutiveHits > 0) {
                const lastHitSquare = aiHitSquares[0].split('-');
                const reverseDir = [dirsToTry[0] * lastConsecutiveHits, dirsToTry[1] * lastConsecutiveHits];
                const testCoords = [parseInt(lHS[0]) + reverseDir[0], parseInt(lHS[1]) + reverseDir[1]];

                if(testCoords[0] <= 9 && testCoords[0] >= 0 && testCoords[1] <= 9 && testCoords[1] >= 0) {
                    if (validateAttackCoord(testCoords)) {
                        //skip next section
                    }
                }
            }

            outerLoop: for (let i = aiHitSquares.length - 1; i >= 0; i--) {
                for (let j = 0; j < dirsToTry.length; j++) {
                    // console.log(`check square: ${aiHitSquares[i]}`);
                    const lastHitSquare = aiHitSquares[i].split('-');
                    if(parseInt(lastHitSquare[0]) + dirsToTry[j][0] <= 9 && parseInt(lastHitSquare[1]) + dirsToTry[j][1] >= 0) {
                        attackCoords = [parseInt(lastHitSquare[0]) + dirsToTry[j][0], parseInt(lastHitSquare[1]) + dirsToTry[j][1]];
    
                        if (validateAttackCoord(attackCoords)) {
                            LAST_DIR = dirsToTry[j];
                            break outerLoop;
                        }
                    }

                    attackCoords = ranCoords;
                }
            }
        }

        const attackTile = $(`#my${attackCoords[0]}-${attackCoords[1]}`);
        console.log(`atk coords: ${attackCoords}`);
        if(attackGrid[attackCoords[0]][attackCoords[1]] !== ' ') {
            //hit
            aiAttack(attackCoords, attackTile, "hitMark");

            //update array to show segment has been hit
            attackGrid[attackCoords[0]][attackCoords[1]] = `${attackGrid[attackCoords[0]][attackCoords[1]]}h`;

            //update array
            ba_myBoard.updateBoard(attackGrid);

            //if this is our first hit on a boat, pick a random direction
            if(aiHitSquares.length <= 0) {
                const dir = deltas[getRandomInt(0, 3)];
                const oldAtkCoords = attackCoords;
                
                //start attacking ship in this direction
                const directionsToTry = [dir, [-dir[0], -dir[1]], [dir[1], dir[0]], [-dir[1], -dir[0]]];

                //go through directions to make sure you can do them
                for (const _dir of directionsToTry) {
                    testCoords = [oldAtkCoords[0] + _dir[0], oldAtkCoords[1] + _dir[1]];

                    if (validateAttackCoord(testCoords)) {
                        break;
                    }
                }

                LAST_DIR = dir;
            }

            //push to ai hit squares
            aiHitSquares.push(`${attackCoords[0]}-${attackCoords[1]}`);

            //check if boat sunk
            const boatSunk = isBoatSunk(ba_myBoard.getBoard(), "my", attackGrid[attackCoords[0]][attackCoords[1]][0]);

            //update attack coords
            if(boatSunk.status) {
                //reset attack if boat sunk and ai hit squares empty
                if(aiHitSquares.length <= 0) attackCoords = getRanCoords();
                
                //remove squares sunk from aiHitSquares
                for (let i = 0; i < boatSunk.boatCoords.length; i++) {
                    const coords = `${boatSunk.boatCoords[i][0]}-${boatSunk.boatCoords[i][1]}`;
                    aiHitSquares.pop(coords);
                }
            }

            consecutiveHits++;
            plays++;
        }
        else {
            //miss
            aiAttack(attackCoords, attackTile, "missMark");

            //reset attack
            attackCoords = getRanCoords();

            if(consecutiveHits > 0) lastConsecutiveHits = consecutiveHits;
            consecutiveHits = 0;
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