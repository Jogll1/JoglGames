let aiAttackedSquares = [];
let aiHitSquares = [];
let LAST_DIR = '';
let LAST_CONSECUTIVE_HITS = 0;

//function to get a random move with ship destroying
async function aiRandomMove(_playerGrid) {
    const deltas = [[-1, 0], [1, 0], [0, 1], [0, -1]]; //deltas to check when attacking a ship
    let attackGrid = copy2DArray(_playerGrid);

    // let ranCoords = getRanCoords(); //[a, b]
    let ranCoords = getAwareRanCoords(); //[a, b]

    let plays = 1;
    let consecutiveHits = 0;

    let attackCoords = ranCoords; //[a, b]

    for (let i = 0; i < plays; i++) {
        //wait a bit before attacking
        await sleep(1000); //1000

        if(aiHitSquares.length > 0) {
            //if we are currently attacking squares
            const dir = LAST_DIR;
            
            //set directions order to try, first is direction, then reverse of that, then next direction, then reverse of that
            const dirsToTry = [dir, [-dir[0], -dir[1]], [dir[1], dir[0]], [-dir[1], -dir[0]]];

            //loop through hit squares from end to start
            iLoop: for (let i = aiHitSquares.length - 1; i >= 0; i--) {
                //loop through directions
                for (let j = 0; j < dirsToTry.length; j++) {
                    const lastHitSquare = aiHitSquares[i].split('-');
                    if(parseInt(lastHitSquare[0]) + dirsToTry[j][0] <= 9 && parseInt(lastHitSquare[0]) + dirsToTry[j][0] >= 0 && parseInt(lastHitSquare[1]) + dirsToTry[j][1] <= 9 && parseInt(lastHitSquare[1]) + dirsToTry[j][1] >= 0) {
                        attackCoords = [parseInt(lastHitSquare[0]) + dirsToTry[j][0], parseInt(lastHitSquare[1]) + dirsToTry[j][1]];
                        
                        //#region to make sure ai attacks boats after finishing a line
                        if(j === 1 && aiHitSquares.includes(`${attackCoords[0]}-${attackCoords[1]}`)) {
                            //copy the attack coordinates to modify them without modifying attackCoords
                            const testCoords = attackCoords;
                            //define new loop to loop a maximum of 5 times
                            kLoop: for (let k = 1; k < 6; k++) {
                                //store a reference to the test coordinates + the direction vector
                                const a = testCoords[0] + dirsToTry[j][0] * i;
                                const b = testCoords[1] + dirsToTry[j][1] * i;
                                //store these in an array
                                const newTestCoords = [a, b];
                                //make sure these values are on the board
                                if(a <= 9 && a >= 0 && b <= 9 && b >= 0) {
                                    //if the AI has already attacked this square, continue to keep going in this direction
                                    if(aiHitSquares.includes(`${newTestCoords[0]}-${newTestCoords[1]}`)) {
                                        continue;
                                    }
                                    else {
                                        //if not, check if it has attacked these coordinates before
                                        if(!aiAttackedSquares.includes(`${newTestCoords[0]}-${newTestCoords[1]}`)) {
                                            //if it has, update the attack coords to this new value
                                            attackCoords = newTestCoords;
                                        }
                                        //if not, break this loop as its an empty tile to attack
                                        break kLoop;
                                    }
                                }
                            }
                        }
                        //#endregion

                        if (validateAttackCoord(attackCoords)) {
                            LAST_DIR = dirsToTry[j];
                            break iLoop;
                        }
                    }

                    attackCoords = ranCoords;
                }
            }
        }

        const attackTile = $(`#my${attackCoords[0]}-${attackCoords[1]}`);
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

            //update attack coords if boat sunk
            if(boatSunk.status) {
                //remove squares sunk from aiHitSquares
                for (let i = 0; i < boatSunk.boatCoords.length; i++) {
                    const coords = `${boatSunk.boatCoords[i][0]}-${boatSunk.boatCoords[i][1]}`;
                    aiHitSquares.pop(coords);
                }

                //reset attack if boat sunk and ai hit squares empty
                if(aiHitSquares.length <= 0) {
                    // attackCoords = getRanCoords();
                    attackCoords = getAwareRanCoords();
                }
            }

            if(boatSunk.gameOver) return;

            consecutiveHits++;
            plays++;
        }
        else {
            //miss
            aiAttack(attackCoords, attackTile, "missMark");

            //reset attack
            // attackCoords = getRanCoords();
            attackCoords = getAwareRanCoords();

            if(consecutiveHits > 0) {
                LAST_CONSECUTIVE_HITS = consecutiveHits;
            }
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

//function to get random coords based on space around it
function getAwareRanCoords() {
    if(aiAttackedSquares.length < 100) {
        let ranX, ranY;

        let maxChecks = 50; //should be 34?
        let counter = 0; //counter in case board has no available spaces
        while(true) {
            if(counter < maxChecks) {
                ranX = getRandomInt(0, 9);
                ranY = getRandomInt(0, 9);
    
                //if these ran + deltas = hit square, skip
                let checked = 0;
                let deltas = [[0, 1], [0, -1], [1, 0], [-1, 0]];
                for (let i = 0; i < deltas.length; i++) {
                    if(aiAttackedSquares.includes(`${ranX + deltas[i][0]}-${ranY + deltas[i][1]}`)) {
                        continue;
                    }
                    checked++;
                }
                
                if(!aiAttackedSquares.includes(`${ranX}-${ranY}`) && checked == 4) {
                    return [ranX, ranY];
                }
    
                counter++;
            }
            else {
                break;
            }
        }

        return getRanCoords(); //if cant find one quick enough return random coords
    }
    else {
        return "all moves used up"; //this should be impossible for the second player
    }
}

//function to validate updated attack c poo rd
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

function resetAIData() {
    aiAttackedSquares = [];
    aiHitSquares = [];
    LAST_DIR = '';
    LAST_CONSECUTIVE_HITS = 0;
}