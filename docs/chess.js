
const boardElement = document.getElementById('chessboard');
let selectedSquare = null;
let turn = 'white'; // 'white' of 'black'

// Houd bij of stukken die nodig zijn voor rokade hebben bewogen
const hasMoved = {
    'white_king': false,
    'white_rook_left': false,
    'white_rook_right': false,
    'black_king': false,
    'black_rook_left': false,
    'black_rook_right': false
};

// Houd de laatste zet bij voor en passant
let lastMove = null;

// Klok instellingen
let whiteTime = 600; 
let blackTime = 600;
let timerInterval = null;
let gameEnded = true; // Zet op true tot een tijd gekozen is
let timerStarted = false; // Nieuwe vlag om te wachten tot de eerste zet

let currentStyle = 'bauhaus';
let moveHistory = [];

function selectStyle(style) {
    currentStyle = style;
    document.getElementById('btn-bauhaus').classList.toggle('selected', style === 'bauhaus');
    const btnJapanese = document.getElementById('btn-japanese');
    if (btnJapanese) btnJapanese.classList.toggle('selected', style === 'japanese');
    
    // Pas de stijl direct toe op de body voor directe visuele feedback
    document.body.className = 'style-' + style;
    
    // Update de welkomsttekst op basis van de stijl
    const welcomeTitle = document.querySelector('.welcome-text');
    if (style === 'japanese') {
        welcomeTitle.textContent = 'WELKOM BIJ JAPAN-SCHAAK';
    } else {
        welcomeTitle.textContent = 'WELKOM BIJ BAU-SCHAAK';
    }
}

function startGame(minutes) {
    const seconds = minutes * 60;
    whiteTime = seconds;
    blackTime = seconds;
    gameEnded = false;
    timerStarted = true; // Direct starten
    
    // Pas de stijl toe op de main container en het bord
    document.querySelector('.main-container').className = 'main-container style-' + currentStyle;
    document.getElementById('chessboard').className = 'style-' + currentStyle;
    
    // Verberg het startscherm
    document.getElementById('start-screen').style.display = 'none';
    
    // Initialiseer bord en klokken
    updateClockDisplay();
    updateClockVisuals();
    createBoard();
    startTimer(); // Start de klok direct
}

const pieces = {
    // Wit (blauw) op rij 6 en 7 (0-indexed)
    '0,7': 'R', '1,7': 'N', '2,7': 'B', '3,7': 'Q', '4,7': 'K', '5,7': 'B', '6,7': 'N', '7,7': 'R',
    '0,6': 'P', '1,6': 'P', '2,6': 'P', '3,6': 'P', '4,6': 'P', '5,6': 'P', '6,6': 'P', '7,6': 'P',
    // Zwart (wit) op rij 0 en 1
    '0,0': 'r', '1,0': 'n', '2,0': 'b', '3,0': 'q', '4,0': 'k', '5,0': 'b', '6,0': 'n', '7,0': 'r',
    '0,1': 'p', '1,1': 'p', '2,1': 'p', '3,1': 'p', '4,1': 'p', '5,1': 'p', '6,1': 'p', '7,1': 'p'
};

const pieceTypes = {
    'R': 'rook', 'N': 'knight', 'B': 'bishop', 'Q': 'queen', 'K': 'king', 'P': 'pawn',
    'r': 'rook', 'n': 'knight', 'b': 'bishop', 'q': 'queen', 'k': 'king', 'p': 'pawn'
};


function createBoard() {
    boardElement.innerHTML = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.classList.add('square');
            
            if ((row + col) % 2 === 0) {
                square.classList.add('white');
            } else {
                square.classList.add('black');
            }
            
            square.dataset.row = row;
            square.dataset.col = col;
            square.addEventListener('click', () => handleSquareClick(row, col));

            const pieceKey = `${col},${row}`;
            if (pieces[pieceKey]) {
                const pieceChar = pieces[pieceKey];
                const pieceType = pieceTypes[pieceChar];
                const isWhite = pieceChar === pieceChar.toUpperCase();
                
                // Markeer de koning als hij schaak staat of schaakmat
                if (pieceType === 'king') {
                    const color = isWhite ? 'white' : 'black';
                    if (isKingInCheck(color)) {
                        square.classList.add('in-check');
                        if (isCheckmate(color)) {
                            square.classList.add('checkmate');
                        }
                    }
                }

                const piece = document.createElement('div');
                piece.classList.add('piece');
                piece.classList.add(isWhite ? 'white-piece' : 'black-piece');
                piece.classList.add(`piece-${pieceType}`);
                
                if (currentStyle === 'bauhaus') {
                    const shape = document.createElement('div');
                    shape.classList.add('shape');
                    piece.appendChild(shape);
                } else {
                    // SVG voor Japans
                    const svg = getPieceSVG(pieceChar);
                    piece.innerHTML = svg;
                }
                
                square.appendChild(piece);
            }
            
            boardElement.appendChild(square);
        }
    }
}

function getPieceSVG(char) {
    const isWhite = char === char.toUpperCase();
    const type = char.toLowerCase();
    
    // Kleuren voor Klassiek (standaard)
    let color = isWhite ? "#ffffff" : "#000000";
    let stroke = isWhite ? "#000000" : "#ffffff";
    let detailColor = isWhite ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)";
    
    // Kleuren voor Romeins (Marmer, Goud, Purper)
    if (currentStyle === 'roman') {
        color = isWhite ? "#ffffff" : "#4b0082"; // Wit marmer vs Keizerlijk purper (indigo/purple)
        stroke = isWhite ? "#ffd700" : "#ffd700"; // Goud voor beide
        detailColor = isWhite ? "rgba(255,215,0,0.3)" : "rgba(255,215,0,0.5)";
    }
    
    // Kleuren voor Japans (Rijstpapier, Vermiljoen, Zwart)
    if (currentStyle === 'japanese') {
        color = isWhite ? "#fcfaf2" : "#bc4749"; // Rijstpapier vs Vermiljoen
        stroke = isWhite ? "#2b2d42" : "#2b2d42"; // Donkerblauw/Zwart
        detailColor = isWhite ? "rgba(188, 71, 73, 0.2)" : "rgba(43, 45, 66, 0.3)";
    }
    
    // Kleuren voor Egyptisch (Goud, Lapis Lazuli, Zand)
    if (currentStyle === 'egyptian') {
        color = isWhite ? "#ffd700" : "#003399"; // Goud vs Lapis Lazuli
        stroke = isWhite ? "#003399" : "#ffd700"; // Lapis vs Goud
        detailColor = isWhite ? "rgba(0, 51, 153, 0.2)" : "rgba(255, 215, 0, 0.3)";
    }
    
    let paths = "";
    
    // Egyptische symbolen (Ankh, Piramide, Farao)
    if (currentStyle === 'egyptian') {
        switch(type) {
            case 'p': // Pion - Egyptische soldaat (Schild en speer)
                paths = `
                    <circle cx="22.5" cy="12" r="6" fill="${color}" stroke="${stroke}" stroke-width="1"/>
                    <path d="M15 22h15v14h-15z" fill="${isWhite ? '#f4a460' : '#d2b48c'}" stroke="${stroke}" stroke-width="1"/>
                    <path d="M12 20l2 18M33 15l-1 23" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>
                    <path d="M31 15l2-3 2 3-2 3z" fill="${stroke}"/>
                    <rect x="17" y="24" width="11" height="10" rx="2" fill="${color}" stroke="${stroke}" stroke-width="1"/>`;
                break;
            case 'r': // Toren - Obelisk / Piramide
                paths = `
                    <path d="M15 39L22.5 5 30 39z" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>
                    <path d="M22.5 5L18 15h9z" fill="${stroke}"/>
                    <path d="M18 25h9M20 32h5" stroke="${stroke}" stroke-width="1" opacity="0.5"/>
                    <rect x="12" y="37" width="21" height="3" fill="${stroke}"/>`;
                break;
            case 'n': // Paard - Anubis (Jakhalskop)
                paths = `
                    <path d="M15 39v-8l3-10-3-10 5 5 7-5v10l3 10v8z" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>
                    <circle cx="20" cy="18" r="1" fill="${stroke}"/>
                    <path d="M22 15h5M22 20h4" stroke="${stroke}" stroke-width="1"/>
                    <rect x="12" y="37" width="21" height="3" fill="${stroke}"/>`;
                break;
            case 'b': // Loper - Horus (Valkenkop) / Ankh
                paths = `
                    <path d="M22.5 5c-4 0-7 3-7 7s3 7 7 7 7-3 7-7-3-7-7-7z" fill="none" stroke="${stroke}" stroke-width="3"/>
                    <path d="M22.5 19v16M15 26h15" stroke="${stroke}" stroke-width="4" stroke-linecap="round"/>
                    <path d="M22.5 10c-1 0-2 1-2 2s1 2 2 2 2-1 2-2-1-2-2-2z" fill="${stroke}"/>
                    <rect x="14" y="37" width="17" height="3" fill="${stroke}"/>`;
                break;
            case 'q': // Koningin - Cleopatra (Nemer-hoofdtooi stijl)
                paths = `
                    <path d="M12 15c0 15 10.5 24 10.5 24s10.5-9 10.5-24h-21z" fill="${color}" stroke="${stroke}" stroke-width="1"/>
                    <path d="M12 15c-3-2-5-10 0-10 5 0 10.5 5 10.5 5s5.5-5 10.5-5c5 0 3 8 0 10" fill="${stroke}"/>
                    <circle cx="22.5" cy="22" r="4" fill="none" stroke="${stroke}" stroke-width="1"/>
                    <path d="M18 28h9M20 32h5" stroke="${stroke}" stroke-width="1" opacity="0.6"/>
                    <path d="M22.5 5v5" stroke="${color}" stroke-width="2"/>`;
                break;
            case 'k': // Koning - Farao (Dodenmasker / Toetanchamon stijl)
                paths = `
                    <path d="M10 12c0 10 5 27 12.5 27s12.5-17 12.5-27H10z" fill="${color}" stroke="${stroke}" stroke-width="1"/>
                    <path d="M10 12l-3 15h31l-3-15z" fill="${stroke}" fill-rule="evenodd"/>
                    <path d="M15 12v15M20 12v15M25 12v15M30 12v15" stroke="${color}" stroke-width="1" opacity="0.5"/>
                    <rect x="18" y="30" width="9" height="6" fill="${stroke}"/>
                    <path d="M22.5 5v7" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>
                    <circle cx="22.5" cy="20" r="3" fill="${color}" stroke="${stroke}" stroke-width="1"/>`;
                break;
        }
        return `<svg viewBox="0 0 45 45" width="100%" height="100%">${paths}</svg>`;
    }
    
    // Romeinse soldaten en symbolen
    if (currentStyle === 'roman') {
        switch(type) {
            case 'p': // Legionair (Pion) - Helm en schild
                paths = `
                    <circle cx="22.5" cy="12" r="6" fill="${color}" stroke="${stroke}" stroke-width="1"/>
                    <path d="M16 12c0 4 3 7 6.5 7s6.5-3 6.5-7" fill="none" stroke="${stroke}" stroke-width="1"/>
                    <path d="M22.5 5v5" stroke="${stroke}" stroke-width="2"/>
                    <path d="M15 22h15v14h-15z" fill="${isWhite ? '#cc0000' : '#800000'}" stroke="${stroke}" stroke-width="1"/>
                    <path d="M22.5 22v14M15 29h15" stroke="${stroke}" stroke-width="0.5"/>
                    <path d="M12 20l3 18M33 20l-3 18" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>`;
                break;
            case 'r': // Toren - Castrum (Wachttoren)
                paths = `
                    <rect x="12" y="10" width="21" height="25" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>
                    <path d="M12 10l-2-3h25l-2 3M15 10v-4M22.5 10v-4M30 10v-4" stroke="${stroke}" stroke-width="2"/>
                    <rect x="18" y="20" width="9" height="15" rx="4" fill="rgba(0,0,0,0.4)" stroke="${stroke}" stroke-width="1"/>
                    <path d="M10 35h25v4h-25z" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>`;
                break;
            case 'n': // Paard - Equites (Romeins paard)
                paths = `
                    <path d="M15 35c0-10 5-18 15-18l3 2-2 4 4 1-5 10z" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>
                    <path d="M20 15c-3 0-6 3-6 8s2 8 5 10" fill="none" stroke="${stroke}" stroke-width="2"/>
                    <circle cx="28" cy="22" r="1.5" fill="${stroke}"/>
                    <rect x="12" y="35" width="21" height="4" rx="1" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>`;
                break;
            case 'b': // Loper - Aquilifer (Adelaarsdrager)
                paths = `
                    <path d="M22.5 15l-6 10h12z" fill="${color}" stroke="${stroke}" stroke-width="1"/>
                    <path d="M22.5 5l-4 4 4 4 4-4-4-4z" fill="${stroke}" />
                    <path d="M22.5 13v22" stroke="${stroke}" stroke-width="2"/>
                    <path d="M18 18h9v5h-9z" fill="${isWhite ? '#cc0000' : '#4b0082'}" stroke="${stroke}" stroke-width="1"/>
                    <rect x="14" y="35" width="17" height="4" rx="1" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>`;
                break;
            case 'q': // Koningin - Keizerin (Augusta)
                paths = `
                    <path d="M22.5 8c-5 0-9 4-9 12s4 15 9 15 9-7 9-15-4-12-9-12z" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>
                    <path d="M14 12l2-4 3 2 3-5 3 5 3-2 2 4z" fill="${stroke}" />
                    <circle cx="22.5" cy="20" r="4" fill="none" stroke="${stroke}" stroke-width="1"/>
                    <rect x="10" y="35" width="25" height="4" rx="1" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>
                    <path d="M18 28c2 2 7 2 9 0" fill="none" stroke="${stroke}" stroke-width="1" stroke-linecap="round"/>`;
                break;
            case 'k': // Koning - Keizer (Caesar)
                paths = `
                    <path d="M22.5 8c-6 0-10 5-10 13s4 14 10 14 10-6 10-14-4-13-10-13z" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>
                    <path d="M15 10c2-3 5-4 7.5-4s5.5 1 7.5 4" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>
                    <path d="M22.5 4v4" stroke="${stroke}" stroke-width="2"/>
                    <rect x="12" y="22" width="21" height="6" fill="${isWhite ? '#cc0000' : '#4b0082'}" stroke="${stroke}" stroke-width="1"/>
                    <rect x="10" y="35" width="25" height="4" rx="1" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>
                    <circle cx="22.5" cy="16" r="3" fill="none" stroke="${stroke}" stroke-width="1"/>`;
                break;
        }
        return `<svg viewBox="0 0 45 45" width="100%" height="100%">${paths}</svg>`;
    }

    // Japanse symbolen (Samurai, Pagode, Torii)
    if (currentStyle === 'japanese') {
        switch(type) {
            case 'p': // Pion - Ashigaru (Helm)
                paths = `
                    <path d="M12 25c0-8 5-14 10.5-14s10.5 6 10.5 14H12z" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>
                    <path d="M10 25h25l2 4H8l2-4z" fill="${stroke}" />
                    <rect x="15" y="29" width="15" height="10" fill="${color}" stroke="${stroke}" stroke-width="1"/>
                    <circle cx="22.5" cy="18" r="1.5" fill="${stroke}"/>`;
                break;
            case 'r': // Toren - Pagode
                paths = `
                    <rect x="15" y="25" width="15" height="14" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>
                    <path d="M10 25l12.5-6L35 25z" fill="${stroke}" />
                    <rect x="17" y="15" width="11" height="8" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>
                    <path d="M12 15l10.5-6L33 15z" fill="${stroke}" />
                    <path d="M22.5 4v5" stroke="${stroke}" stroke-width="1.5"/>`;
                break;
            case 'n': // Paard - Samurai te paard (Helm met hoorns)
                paths = `
                    <path d="M15 35c0-10 5-18 15-18l3 2-2 4 4 1-5 10z" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>
                    <path d="M18 15c-2-5-6-7-6-7s4 2 6 7M22 15c2-5 6-7 6-7s-4 2-6 7" stroke="${stroke}" fill="none" stroke-width="2"/>
                    <circle cx="28" cy="22" r="1.5" fill="${stroke}"/>
                    <rect x="12" y="35" width="21" height="4" fill="${stroke}"/>`;
                break;
            case 'b': // Loper - Torii Poort
                paths = `
                    <path d="M12 39V15M33 39V15" stroke="${stroke}" stroke-width="4"/>
                    <path d="M8 12c10-3 19-3 29 0" fill="none" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>
                    <path d="M10 18h25" stroke="${stroke}" stroke-width="3"/>
                    <rect x="18" y="8" width="9" height="4" fill="${stroke}"/>`;
                break;
            case 'q': // Koningin - Onna-musha (Waaier)
                paths = `
                    <path d="M22.5 39c-8-5-15-15-15-20 0-10 15-15 15-15s15 5 15 15c0 5-7 15-15 20z" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>
                    <path d="M22.5 39L10 20M22.5 39L35 20M22.5 39V10" stroke="${stroke}" stroke-width="0.5" opacity="0.5"/>
                    <circle cx="22.5" cy="15" r="5" fill="none" stroke="${stroke}" stroke-width="1"/>
                    <path d="M15 10l7.5-6 7.5 6" fill="none" stroke="${stroke}" stroke-width="1"/>`;
                break;
            case 'k': // Koning - Shogun (Grote Helm/Kabuto)
                paths = `
                    <path d="M12 35c0-15 10-22 10.5-22s10.5 7 10.5 22z" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>
                    <path d="M22.5 13L10 5M22.5 13L35 5" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>
                    <circle cx="22.5" cy="5" r="2" fill="${stroke}"/>
                    <rect x="15" y="20" width="15" height="15" fill="none" stroke="${stroke}" stroke-width="1"/>
                    <path d="M8 35h29" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>`;
                break;
        }
        return `<svg viewBox="0 0 45 45" width="100%" height="100%">${paths}</svg>`;
    }

    // Gedetailleerdere en "koninklijkere" schaaksymbolen
    switch(type) {
        case 'p': // Pion
            paths = `
                <path d="M22.5 9c-3 0-5.5 2.5-5.5 5.5s2.5 5.5 5.5 5.5 5.5-2.5 5.5-5.5-2.5-5.5-5.5-5.5z" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>
                <path d="M15 32c0-5 3-9 7.5-9s7.5 4 7.5 9" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>
                <rect x="13" y="32" width="19" height="4" rx="1" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>
                <path d="M22.5 23v4" stroke="${detailColor}" stroke-width="1"/>`;
            break;
        case 'r': // Toren
            paths = `
                <path d="M12 32h21v-4h-3v-10h-15v10h-3v4z" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>
                <path d="M14 18h17v-6h-3v2h-3v-2h-2.5v2h-2.5v-2h-3v2h-3v-2z" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>
                <rect x="11" y="32" width="23" height="4" rx="1" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>
                <path d="M18 18v10M27 18v10" stroke="${detailColor}" stroke-width="1"/>`;
            break;
        case 'n': // Paard
            paths = `
                <path d="M22 8c-6 0-11 5-11 11 0 4 2 8 5 10l-4 5h18l-2-6c4-3 6-8 6-13 0-4-5-7-12-7z" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>
                <circle cx="28" cy="14" r="2" fill="${stroke}"/>
                <path d="M17 15c2-2 5-3 8-2" fill="none" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M22 34v-4" stroke="${detailColor}" stroke-width="1.5"/>`;
            break;
        case 'b': // Loper
            paths = `
                <circle cx="22.5" cy="8" r="3" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>
                <path d="M22.5 12c-5 0-8 5-8 11h16c0-6-3-11-8-11z" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>
                <path d="M15 32h15v-4H15v4z" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>
                <path d="M22.5 12v11" stroke="${detailColor}" stroke-width="1"/>
                <path d="M18 16l9 4" stroke="${stroke}" stroke-width="1" stroke-opacity="0.5"/>
                <rect x="13" y="32" width="19" height="4" rx="1" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>`;
            break;
        case 'q': // Koningin
            paths = `
                <circle cx="12" cy="10" r="2" fill="${color}" stroke="${stroke}" stroke-width="1"/>
                <circle cx="22.5" cy="7" r="2.5" fill="${color}" stroke="${stroke}" stroke-width="1"/>
                <circle cx="33" cy="10" r="2" fill="${color}" stroke="${stroke}" stroke-width="1"/>
                <path d="M12 14l3 13h15l3-13-6 5-4-10-4 10-6-5z" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>
                <rect x="12" y="27" width="21" height="5" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>
                <rect x="10" y="32" width="25" height="4" rx="1" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>
                <circle cx="22.5" cy="20" r="2" fill="${detailColor}"/>`;
            break;
        case 'k': // Koning
            paths = `
                <path d="M22.5 4v6M19.5 7h6" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/>
                <path d="M14 14l3 13h11l3-13c-2 2-4 3-8.5 3s-6.5-1-8.5-3z" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>
                <rect x="13" y="27" width="19" height="5" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>
                <rect x="11" y="32" width="23" height="4" rx="1" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>
                <path d="M22.5 17v6M19 20h7" stroke="${detailColor}" stroke-width="1"/>`;
            break;
    }
    
    return `<svg viewBox="0 0 45 45" width="100%" height="100%">${paths}</svg>`;
}

function handleSquareClick(row, col) {
    const squareKey = `${col},${row}`;
    const piece = pieces[squareKey];

    // Blokkeer interactie als promotie-dialoog open is
    if (document.getElementById('promotion-dialog').style.display === 'flex') {
        return;
    }

    // Als er al een vakje geselecteerd is
    if (selectedSquare) {
        const moves = getValidMoves(selectedSquare.row, selectedSquare.col);
        const move = moves.find(m => m.row === row && m.col === col);

        if (move) {
            const pieceChar = pieces[`${selectedSquare.col},${selectedSquare.row}`];
            const isPawn = pieceChar.toLowerCase() === 'p';
            const isPromotionRow = (turn === 'white' && row === 0) || (turn === 'black' && row === 7);

            if (isPawn && isPromotionRow) {
                showPromotionDialog(selectedSquare.row, selectedSquare.col, row, col);
            } else {
                movePiece(selectedSquare.row, selectedSquare.col, row, col, move.isCastling, move.isEnPassant);
            }
            
            selectedSquare = null;
            clearHighlights();
            createBoard();
            return;
        }
    }

    // Selecteer een nieuw stuk (pionnen, paarden, dame, torens, lopers en koning)
    if (piece && isCorrectTurn(piece) && !gameEnded) {
        const pieceLower = piece.toLowerCase();
        const selectablePieces = ['p', 'n', 'q', 'r', 'b', 'k'];
        if (selectablePieces.includes(pieceLower)) {
            clearHighlights();
            selectedSquare = { row, col };
            highlightSquare(row, col, 'selected');
            const moves = getValidMoves(row, col);
            moves.forEach(m => highlightSquare(m.row, m.col, 'valid-move'));
        }
    } else {
        selectedSquare = null;
        clearHighlights();
    }
}

function isCorrectTurn(piece) {
    const isWhitePiece = piece === piece.toUpperCase();
    return (turn === 'white' && isWhitePiece) || (turn === 'black' && !isWhitePiece);
}

function getValidMoves(row, col, checkSafety = true) {
    const pieceKey = `${col},${row}`;
    const piece = pieces[pieceKey];
    const moves = [];

    if (!piece) return moves;

    const isWhite = piece === piece.toUpperCase();
    const pieceLower = piece.toLowerCase();

    if (pieceLower === 'p') {
        const direction = isWhite ? -1 : 1;
        const startRow = isWhite ? 6 : 1;

        // 1 stap vooruit
        const nextRow = row + direction;
        if (nextRow >= 0 && nextRow < 8 && !pieces[`${col},${nextRow}`]) {
            moves.push({ row: nextRow, col: col });
            // 2 stappen vooruit (alleen vanaf startpositie)
            const doubleNextRow = row + 2 * direction;
            if (row === startRow && !pieces[`${col},${doubleNextRow}`] && !pieces[`${col},${nextRow}`]) {
                moves.push({ row: doubleNextRow, col: col });
            }
        }

        // Diagonaal slaan
        const attackCols = [col - 1, col + 1];
        attackCols.forEach(aCol => {
            if (aCol >= 0 && aCol < 8 && nextRow >= 0 && nextRow < 8) {
                const targetPiece = pieces[`${aCol},${nextRow}`];
                if (targetPiece && ((isWhite && targetPiece === targetPiece.toLowerCase()) || (!isWhite && targetPiece === targetPiece.toUpperCase()))) {
                    moves.push({ row: nextRow, col: aCol });
                }
                
                // En Passant
                if (!targetPiece && lastMove && lastMove.piece.toLowerCase() === 'p' && 
                    lastMove.toRow === row && lastMove.toCol === aCol &&
                    Math.abs(lastMove.fromRow - lastMove.toRow) === 2) {
                    moves.push({ row: nextRow, col: aCol, isEnPassant: true });
                }
            }
        });
    }

    if (pieceLower === 'n') {
        const knightMoves = [
            { r: -2, c: -1 }, { r: -2, c: 1 },
            { r: -1, c: -2 }, { r: -1, c: 2 },
            { r: 1, c: -2 }, { r: 1, c: 2 },
            { r: 2, c: -1 }, { r: 2, c: 1 }
        ];

        knightMoves.forEach(m => {
            const targetRow = row + m.r;
            const targetCol = col + m.c;

            if (targetRow >= 0 && targetRow < 8 && targetCol >= 0 && targetCol < 8) {
                const targetPiece = pieces[`${targetCol},${targetRow}`];
                if (!targetPiece || (isWhite && targetPiece === targetPiece.toLowerCase()) || (!isWhite && targetPiece === targetPiece.toUpperCase())) {
                    moves.push({ row: targetRow, col: targetCol });
                }
            }
        });
    }

    if (pieceLower === 'r' || pieceLower === 'q') {
        const directions = [
            { r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 }
        ];

        directions.forEach(d => {
            let targetRow = row + d.r;
            let targetCol = col + d.c;

            while (targetRow >= 0 && targetRow < 8 && targetCol >= 0 && targetCol < 8) {
                const targetPiece = pieces[`${targetCol},${targetRow}`];
                if (!targetPiece) {
                    moves.push({ row: targetRow, col: targetCol });
                } else {
                    const isEnemy = (isWhite && targetPiece === targetPiece.toLowerCase()) || (!isWhite && targetPiece === targetPiece.toUpperCase());
                    if (isEnemy) moves.push({ row: targetRow, col: targetCol });
                    break;
                }
                targetRow += d.r;
                targetCol += d.c;
            }
        });
    }

    if (pieceLower === 'b' || pieceLower === 'q') {
        const directions = [
            { r: -1, c: -1 }, { r: -1, c: 1 }, { r: 1, c: -1 }, { r: 1, c: 1 }
        ];

        directions.forEach(d => {
            let targetRow = row + d.r;
            let targetCol = col + d.c;

            while (targetRow >= 0 && targetRow < 8 && targetCol >= 0 && targetCol < 8) {
                const targetPiece = pieces[`${targetCol},${targetRow}`];
                if (!targetPiece) {
                    moves.push({ row: targetRow, col: targetCol });
                } else {
                    const isEnemy = (isWhite && targetPiece === targetPiece.toLowerCase()) || (!isWhite && targetPiece === targetPiece.toUpperCase());
                    if (isEnemy) moves.push({ row: targetRow, col: targetCol });
                    break;
                }
                targetRow += d.r;
                targetCol += d.c;
            }
        });
    }

    if (pieceLower === 'k') {
        const directions = [
            { r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 },
            { r: -1, c: -1 }, { r: -1, c: 1 }, { r: 1, c: -1 }, { r: 1, c: 1 }
        ];

        directions.forEach(d => {
            const targetRow = row + d.r;
            const targetCol = col + d.c;

            if (targetRow >= 0 && targetRow < 8 && targetCol >= 0 && targetCol < 8) {
                const targetPiece = pieces[`${targetCol},${targetRow}`];
                if (!targetPiece || (isWhite && targetPiece === targetPiece.toLowerCase()) || (!isWhite && targetPiece === targetPiece.toUpperCase())) {
                    moves.push({ row: targetRow, col: targetCol });
                }
            }
        });

        // Rokade logica
        if (checkSafety && !isKingInCheck(isWhite ? 'white' : 'black')) {
            const colorPrefix = isWhite ? 'white' : 'black';
            const rookChar = isWhite ? 'R' : 'r';
            
            // Koningsvleugel (kort)
            if (!hasMoved[`${colorPrefix}_king`] && !hasMoved[`${colorPrefix}_rook_right`]) {
                const rookPos = isWhite ? '7,7' : '7,0';
                if (pieces[rookPos] === rookChar) {
                    const square1 = { row: row, col: col + 1 };
                    const square2 = { row: row, col: col + 2 };
                    if (!pieces[`${square1.col},${square1.row}`] && !pieces[`${square2.col},${square2.row}`]) {
                        if (!isSquareAttacked(square1.row, square1.col, isWhite ? 'black' : 'white') &&
                            !isSquareAttacked(square2.row, square2.col, isWhite ? 'black' : 'white')) {
                            moves.push({ row: square2.row, col: square2.col, isCastling: true });
                        }
                    }
                }
            }

            // Damevleugel (lang)
            if (!hasMoved[`${colorPrefix}_king`] && !hasMoved[`${colorPrefix}_rook_left`]) {
                const rookPos = isWhite ? '0,7' : '0,0';
                if (pieces[rookPos] === rookChar) {
                    const square1 = { row: row, col: col - 1 };
                    const square2 = { row: row, col: col - 2 };
                    const square3 = { row: row, col: col - 3 };
                    if (!pieces[`${square1.col},${square1.row}`] && !pieces[`${square2.col},${square2.row}`] && !pieces[`${square3.col},${square3.row}`]) {
                        if (!isSquareAttacked(square1.row, square1.col, isWhite ? 'black' : 'white') &&
                            !isSquareAttacked(square2.row, square2.col, isWhite ? 'black' : 'white')) {
                            moves.push({ row: square2.row, col: square2.col, isCastling: true });
                        }
                    }
                }
            }
        }
    }

    // Filter zetten die de eigen koning in schaak laten staan
    if (checkSafety) {
        return moves.filter(m => {
            const originalPiece = pieces[`${m.col},${m.row}`];
            const movingPiece = pieces[`${col},${row}`];
            
            // Simuleer de zet
            delete pieces[`${col},${row}`];
            pieces[`${m.col},${m.row}`] = movingPiece;
            
            // Simuleer verwijderen van geslagen pion bij en passant
            let capturedEnPassant = null;
            if (m.isEnPassant) {
                const direction = isWhite ? 1 : -1;
                capturedEnPassant = pieces[`${m.col},${m.row + direction}`];
                delete pieces[`${m.col},${m.row + direction}`];
            }
            
            const isSafe = !isKingInCheck(isWhite ? 'white' : 'black');
            
            // Zet de staat terug
            pieces[`${col},${row}`] = movingPiece;
            if (originalPiece) {
                pieces[`${m.col},${m.row}`] = originalPiece;
            } else {
                delete pieces[`${m.col},${m.row}`];
            }
            
            if (m.isEnPassant) {
                const direction = isWhite ? 1 : -1;
                pieces[`${m.col},${m.row + direction}`] = capturedEnPassant;
            }
            
            return isSafe;
        });
    }

    return moves;
}

function isCheckmate(color) {
    if (!isKingInCheck(color)) return false;

    // Check of er nog een geldige zet is voor deze kleur
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = pieces[`${c},${r}`];
            if (piece) {
                const isWhite = piece === piece.toUpperCase();
                const pieceColor = isWhite ? 'white' : 'black';
                if (pieceColor === color) {
                    const moves = getValidMoves(r, c, true);
                    if (moves.length > 0) return false;
                }
            }
        }
    }
    return true;
}

function isKingInCheck(color) {
    // Zoek de koning
    let kingPos = null;
    const kingChar = color === 'white' ? 'K' : 'k';
    
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (pieces[`${c},${r}`] === kingChar) {
                kingPos = { row: r, col: c };
                break;
            }
        }
        if (kingPos) break;
    }
    
    if (!kingPos) return false; // Zou niet moeten gebeuren in schaak
    
    const enemyColor = color === 'white' ? 'black' : 'white';
    return isSquareAttacked(kingPos.row, kingPos.col, enemyColor);
}

function isSquareAttacked(row, col, attackerColor) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = pieces[`${c},${r}`];
            if (piece) {
                const isWhite = piece === piece.toUpperCase();
                const pieceColor = isWhite ? 'white' : 'black';
                
                if (pieceColor === attackerColor) {
                    // Voor pionnen is de aanval anders dan de gewone zet (diagonaal)
                    if (piece.toLowerCase() === 'p') {
                        const direction = isWhite ? -1 : 1;
                        const attackRow = r + direction;
                        if (attackRow === row && (c - 1 === col || c + 1 === col)) {
                            return true;
                        }
                    } else {
                        // Voor andere stukken checken we hun mogelijke zetten (zonder veiligheid-check)
                        const moves = getValidMoves(r, c, false);
                        if (moves.some(m => m.row === row && m.col === col)) {
                            return true;
                        }
                    }
                }
            }
        }
    }
    return false;
}

function movePiece(fromRow, fromCol, toRow, toCol, isCastling = false, isEnPassant = false, promotionPiece = null) {
    let piece = pieces[`${fromCol},${fromRow}`];
    
    // Promotie verwerken
    if (promotionPiece) {
        piece = promotionPiece;
    }

    const isWhite = piece === piece.toUpperCase();
    const pieceLower = piece.toLowerCase();
    const colorPrefix = isWhite ? 'white' : 'black';

    // Rokade uitvoering
    if (isCastling) {
        if (toCol === 6) { // Kort
            const rookFrom = `7,${fromRow}`;
            const rookTo = `5,${fromRow}`;
            pieces[rookTo] = pieces[rookFrom];
            delete pieces[rookFrom];
            hasMoved[`${colorPrefix}_rook_right`] = true;
        } else if (toCol === 2) { // Lang
            const rookFrom = `0,${fromRow}`;
            const rookTo = `3,${fromRow}`;
            pieces[rookTo] = pieces[rookFrom];
            delete pieces[rookFrom];
            hasMoved[`${colorPrefix}_rook_left`] = true;
        }
    }

    // En Passant uitvoering
    if (isEnPassant) {
        const direction = isWhite ? 1 : -1;
        delete pieces[`${toCol},${toRow + direction}`];
    }

    // Update hasMoved status
    if (pieceLower === 'k') {
        hasMoved[`${colorPrefix}_king`] = true;
    } else if (pieceLower === 'r') {
        if (fromCol === 0) hasMoved[`${colorPrefix}_rook_left`] = true;
        if (fromCol === 7) hasMoved[`${colorPrefix}_rook_right`] = true;
    }

    // Sla de laatste zet op voor en passant (moet vóór het verplaatsen of met de oude waarden)
    lastMove = {
        piece: piece,
        fromRow: fromRow,
        fromCol: fromCol,
        toRow: toRow,
        toCol: toCol
    };

    delete pieces[`${fromCol},${fromRow}`];
    pieces[`${toCol},${toRow}`] = piece;
    
    // Na de zet, check of de andere speler nu schaak staat of schaakmat
    const otherColor = turn === 'white' ? 'black' : 'white';
    if (isKingInCheck(otherColor)) {
        if (isCheckmate(otherColor)) {
            console.log(`${otherColor} staat SCHAAKMAT!`);
            gameEnded = true;
            clearInterval(timerInterval);
            // Voeg de checkmate klasse toe aan het bord voor de globale animatie
            boardElement.classList.add('checkmate');
        } else {
            console.log(`${otherColor} staat SCHAAK!`);
        }
    }

    turn = turn === 'white' ? 'black' : 'white';
    
    // Voeg zet toe aan historie
    addMoveToHistory(piece, fromRow, fromCol, toRow, toCol, isCastling, isEnPassant);
    
    updateClockVisuals();
    if (timerStarted) {
        startTimer();
    }
}

function showPromotionDialog(fromRow, fromCol, toRow, col) {
    const dialog = document.getElementById('promotion-dialog');
    dialog.innerHTML = '';
    dialog.style.display = 'flex';
    dialog.className = 'promotion-overlay style-' + currentStyle;

    const piecesToPromote = turn === 'white' ? ['Q', 'R', 'B', 'N'] : ['q', 'r', 'b', 'n'];
    
    piecesToPromote.forEach(pChar => {
        const option = document.createElement('div');
        option.classList.add('promotion-option');
        
        const pieceContainer = document.createElement('div');
        pieceContainer.classList.add('piece');
        pieceContainer.classList.add(turn === 'white' ? 'white-piece' : 'black-piece');
        pieceContainer.classList.add('piece-' + pieceTypes[pChar]);
        
        if (currentStyle === 'bauhaus') {
            const shape = document.createElement('div');
            shape.classList.add('shape');
            pieceContainer.appendChild(shape);
        } else {
            pieceContainer.innerHTML = getPieceSVG(pChar);
        }
        
        option.appendChild(pieceContainer);
        option.onclick = () => {
            dialog.style.display = 'none';
            movePiece(fromRow, fromCol, toRow, col, false, false, pChar);
            createBoard();
        };
        dialog.appendChild(option);
    });
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    if (gameEnded) return;

    timerInterval = setInterval(() => {
        if (turn === 'white') {
            whiteTime--;
            if (whiteTime <= 0) endGame('black');
        } else {
            blackTime--;
            if (blackTime <= 0) endGame('white');
        }
        updateClockDisplay();
    }, 1000);
}

function updateClockDisplay() {
    const whiteTimeDisplay = document.getElementById('white-time');
    const blackTimeDisplay = document.getElementById('black-time');
    if (whiteTimeDisplay) whiteTimeDisplay.textContent = formatTime(whiteTime);
    if (blackTimeDisplay) blackTimeDisplay.textContent = formatTime(blackTime);
}

function formatTime(seconds) {
    const mins = Math.floor(Math.max(0, seconds) / 60);
    const secs = Math.max(0, seconds) % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function updateClockVisuals() {
    const whiteClock = document.getElementById('white-clock');
    const blackClock = document.getElementById('black-clock');
    
    if (turn === 'white') {
        whiteClock.classList.add('active');
        blackClock.classList.remove('active');
    } else {
        blackClock.classList.add('active');
        whiteClock.classList.remove('active');
    }
}

function endGame(winner) {
    gameEnded = true;
    clearInterval(timerInterval);
    console.log(`Game Over! Winnaar: ${winner}`);
    // Je zou hier eventueel nog een visuele melding kunnen toevoegen
}

function addMoveToHistory(piece, fromRow, fromCol, toRow, toCol, isCastling, isEnPassant) {
    const cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const rows = ['8', '7', '6', '5', '4', '3', '2', '1'];
    
    let notation = "";
    const pieceChar = piece.toUpperCase();
    
    if (isCastling) {
        notation = toCol === 6 ? "0-0" : "0-0-0";
    } else {
        if (pieceChar !== 'P') {
            const symbols = {
                'K': 'K', 'Q': 'D', 'R': 'T', 'B': 'L', 'N': 'P'
            };
            notation += symbols[pieceChar] || pieceChar;
        }
        notation += cols[toCol] + rows[toRow];
    }
    
    // Kleur toevoegen (optioneel voor debugging in console)
    const isWhite = piece === piece.toUpperCase();
    
    if (isWhite) {
        moveHistory.push({ white: notation, black: "" });
    } else {
        if (moveHistory.length > 0) {
            moveHistory[moveHistory.length - 1].black = notation;
        } else {
            moveHistory.push({ white: "...", black: notation });
        }
    }
    
    updateHistoryUI();
}

function updateHistoryUI() {
    const listElement = document.getElementById('moves-list');
    listElement.innerHTML = '';
    
    moveHistory.forEach((move, index) => {
        const row = document.createElement('div');
        row.classList.add('move-row');
        
        row.innerHTML = `
            <span class="move-number">${index + 1}.</span>
            <span class="move-white">${move.white}</span>
            <span class="move-black">${move.black}</span>
        `;
        listElement.appendChild(row);
    });
    
    // Scroll naar beneden
    listElement.scrollTop = listElement.scrollHeight;
}

function highlightSquare(row, col, className) {
    const squares = boardElement.getElementsByClassName('square');
    const index = row * 8 + col;
    if (squares[index]) {
        squares[index].classList.add(className);
    }
}

function clearHighlights() {
    const squares = boardElement.getElementsByClassName('square');
    for (let s of squares) {
        s.classList.remove('selected');
        s.classList.remove('valid-move');
    }
}

