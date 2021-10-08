const game_board = document.querySelector('.game-board');
const portions = Array.from(document.querySelectorAll('.portion'));
const new_game_btn = document.querySelector('.new-game');
const turn = document.querySelector('.turn h1');
const winner = document.querySelector('.winner h1');
const singlePlayerBtn = document.querySelector('.single-player');
const multiPlayerBtn = document.querySelector('.multi-player');
const select_player = document.querySelector('.select-player');
const x_score = document.querySelector('.x_score');
const o_score = document.querySelector('.o_score');


const socket = io();

const showGame = (isSinglePlayer) => {
    select_player.style.display = 'none';
    singlePlayer = isSinglePlayer;
}

singlePlayerBtn.addEventListener('click', () => showGame(true))
multiPlayerBtn.addEventListener('click', () => showGame(false))


const X = 'X';
const O = 'O';
let counter = 1;
let X_turn = true;
let tie =false;
let thereIsWinner = false;
let singlePlayer = true;

const emptyArray = new Array(9);
emptyArray.fill(null);



function incrementCount (element) {
    let currentCount = element.textContent;
    currentCount = Number(currentCount);
    currentCount ++;
    element.textContent = currentCount;
}


//recreate the game after a win, or a draw was encountered
const reCreateGameBoard = () => {
    const portion = document.createElement('div');
    portion.className = 'portion';
    
    for (let index = 0; index < 9; index++) {
        let clonePortion = portion.cloneNode(true);
        game_board.appendChild(clonePortion);
        let game_board_clone = clonePortion.parentElement;
        var game_board_children = Array.from(game_board_clone.children);
    }
    game_board_children.map((child, index) => {
        child.addEventListener('click', () => {
           !singlePlayer && socket.emit('game-play', { portion : child, index });
            portionClickHandler(child, index);
        }, { once: true });
    })
}

//restart the game
const restart = () => {
    new_game_btn.removeEventListener('click', restart);
    counter = 1;
    thereIsWinner = false;
    tie = false;
    game_board.innerHTML = '';
    reCreateGameBoard();
    X_turn = true;
    turn.textContent = `X's turn`
    winner.textContent = '';
    emptyArray.fill(null);
    portions.map(portion => {
        portion.textContent = '';
    });
}

//check if the game was a draw
const checkTie = () => {
    if(counter >= 9 && thereIsWinner == false){
        tie = true;
        winner.textContent = 'TIE!!!';
        turn.textContent = '';
        new_game_btn.addEventListener('click', () => {
            !singlePlayer && socket.emit('restart');
            restart();
        });
    }
}

//check if there is a winner
const checkWinner = () => {
    //check for if X wins
    if(((emptyArray[0] === X) && (emptyArray[1] === X) && (emptyArray[2] === X)) ||
       ((emptyArray[3] === X) && (emptyArray[4] === X) && (emptyArray[5] === X)) ||
       ((emptyArray[6] === X) && (emptyArray[7] === X) && (emptyArray[8] === X)) || 
       ((emptyArray[0] === X) && (emptyArray[4] === X) && (emptyArray[8] === X)) || 
       ((emptyArray[0] === X) && (emptyArray[3] === X) && (emptyArray[6] === X)) || 
       ((emptyArray[1] === X) && (emptyArray[4] === X) && (emptyArray[7] === X)) ||
       ((emptyArray[2] === X) && (emptyArray[5] === X) && (emptyArray[8] === X)) || 
       ((emptyArray[2] === X) && (emptyArray[4] === X) && (emptyArray[6] === X)))  
    {
        thereIsWinner = true;
        winner.textContent = 'X WINS!!!';
        turn.textContent = '';
        new_game_btn.addEventListener('click', () => {
            restart();
            !singlePlayer && socket.emit('restart');
        });
        incrementCount(x_score);
    }

    //check for if O wins
     if(((emptyArray[0] === O) && (emptyArray[1] === O) && (emptyArray[2] === O)) ||
        ((emptyArray[3] === O) && (emptyArray[4] === O) && (emptyArray[5] === O)) ||
        ((emptyArray[6] === O) && (emptyArray[7] === O) && (emptyArray[8] === O)) || 
        ((emptyArray[0] === O) && (emptyArray[4] === O) && (emptyArray[8] === O)) || 
        ((emptyArray[0] === O) && (emptyArray[3] === O) && (emptyArray[6] === O)) || 
        ((emptyArray[1] === O) && (emptyArray[4] === O) && (emptyArray[7] === O)) ||
        ((emptyArray[2] === O) && (emptyArray[5] === O) && (emptyArray[8] === O)) || 
        ((emptyArray[2] === O) && (emptyArray[4] === O) && (emptyArray[6] === O)))  
 {
     thereIsWinner = true;
     winner.textContent = 'O WINS!!!';
     turn.textContent = '';
     new_game_btn.addEventListener('click', () => {
        restart();
        !singlePlayer && socket.emit('restart');
    });
    incrementCount(o_score);
 }
}

//click handler for each tic tac toe div
const portionClickHandler = (portion, index) => {
        if ( thereIsWinner || portion.textContent !== '' ) return;

        checkTie();
        if(X_turn){
            portion.textContent = X;
            tie ? turn.textContent = `` : turn.textContent = `O's turn`;
            emptyArray[index] = X;
            counter++;
            checkWinner();

        } else{
            portion.textContent = O;            
            tie ? turn.textContent = `` : turn.textContent = `X's turn`;
            emptyArray[index] = O;
            counter++;
            checkWinner();
        }
        
        X_turn = !X_turn;
        portion.style.cursor = 'not-allowed';
    
}

 portions.map((portion, index) => {
    portion.addEventListener('click', () =>{
        !singlePlayer && socket.emit('game-play', { portion, index });
         portionClickHandler(portion, index);
        } , { once : true });
})

// socket event listeners...
socket.on('game-play', ({ portion, index }) => {
    const portions = Array.from(document.querySelectorAll('.portion'));
    portions.map((portion, idx) => {
        if(index == idx) {
            portionClickHandler(portion, idx);
        }
    })
})

socket.on('restart', restart);