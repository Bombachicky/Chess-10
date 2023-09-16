// Point is row column
type Point = [number, number];

type Move = {
    start: Point;
    end: Point;
    path: Point[];
};

function copy2DArray(arr: string[][]): string[][] {
    return arr.map(row => [...row]);
}

class ChessController{
    board: string[][] = [
      ["p", "p", "p", "p", "p", "p", "p", "p"],
      ["r", "n", "b", "q", "k", "b", "n", "r"],
      [" ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " "],
      ["R", "N", "B", "Q", "K", "B", "N", "R"],
      ["P", "P", "P", "P", "P", "P", "P", "P"],
    ];
    // include the points along the path of the last move including the ending point
    lastPath: Point[];
    getPiece(curr: Point) : string{
        return this.board[curr[0]][curr[1]];
    }
    inBounds(curr: Point): boolean {
        return curr[0]>=0 && curr[1] >=0 && curr[0] < 8 && curr[1] < 8;
    }
    isWhite(us: Point): boolean {
        let currPiece: string = this.getPiece(us);
        let white: boolean = currPiece === currPiece.toLowerCase();
        return white;
    }
    sameTeam(us: Point, them: Point): boolean{
        return this.isWhite(us) === this.isWhite(them);
    }
    clone(): ChessController {
        const result = new ChessController();
        result.board = this.board.map(x => [...x]);
        result.lastPath = [...this.lastPath];
        return result;
    }
    getMoves(curr: Point): Move[] {
        return this.getMovesInternal(curr).filter(move => {
            const cloned = this.clone();
            cloned.executeMove(move);
            return !cloned.inCheck(this.isWhite(curr));
        });
    }
    getMovesInternal(curr: Point) : Move[] {
        let row : number = curr[0];
        let col : number = curr[1];
        let currPiece: string = this.getPiece(curr);
        let white: boolean = currPiece === currPiece.toLowerCase();
        let moveable: Move[] = [];
        if(currPiece.toLowerCase() === "p"){
            let dir: number = 1;
            if(!white) dir = -1;
            let steps: number = 1;
            if(curr[0] === 1 && white){
                steps = 2;
            }
            if(curr[0] === 6 && !white){
                steps = 2;
            }
            let up: Point = [row+dir,col];
            let upup: Point = [row+steps*dir,col];
            let diag1: Point = [row+dir,col-1];
            let diag2: Point = [row+dir,col+1];
            let stop: boolean = false;
            let currPath: Point[] = [];
            if(this.inBounds(up)){
                if(this.getPiece(up)===" ") {
                    currPath.push(up);
                    moveable.push({start:curr, end:up, path:currPath});
                }
                else stop = true;
            }
            if(this.inBounds(upup) && !stop){
                if(this.getPiece(upup)===" "){
                    currPath.push(upup);
                    moveable.push({start:curr, end:upup, path:currPath});
                }
            }
            currPath = []
            let lastCell: Point = this.lastPath[this.lastPath.length-1];
            let diags: Point[] = [diag1,diag2];
            for (const diag of diags){
                currPath = []
                if(this.inBounds(diag)){
                    //also diag needs to be on lastPath and the piece at the end of lastpath needs to be a pawn
                    //unless chess 10 is enabled
                    // or if it's a piece then we can just take it
                    let intersect: boolean = false;
                    for(const checkCell of this.lastPath){
                        if(diag[0] === checkCell[0] && diag[1] === checkCell[1]){
                            intersect = true;
                        }
                    }
                    if(intersect && this.getPiece(lastCell).toLowerCase() === "p"){
                        currPath.push(diag);
                        moveable.push({start:curr, end:diag, path:currPath});
                    }
                }
            }
        }if(currPiece.toLowerCase() === "b" || currPiece.toLowerCase() === "q"){
            // for every move we need to check en passant possibility
            let dr: number[] = [1,1,-1,-1];
            let dc: number[] = [-1,1,-1,1];
            for(let k = 0;k<4;k++){
                let currPath: Point[] = [];
                for(let i = 1;i<8;i++){
                    let currP: Point = [row+dr[k]*i,col+dc[k]*i];
                    currPath.push(currP);
                    if(this.inBounds(currP)){
                        if(this.getPiece(currP) === " "){
                            moveable.push({start:curr, end:currP, path:currPath});
                        }else{
                            // break early if any condition fails... eg. put ourselves in check, same team
                            moveable.push({start:curr, end:currP, path:currPath});
                            break;
                        }
                    }
                }
            }
        }if(currPiece.toLowerCase() === "n"){
            let dr: number[] = [2,2,-2,-2,1,1,-1,-1];
            let dc: number[] = [1,-1,1,-1,2,-2,2,-2];
            for(let k = 0;k<8;k++){
                let currPath: Point[] = [];
                let currP: Point = [row+dr[k],col+dc[k]];
                if(this.inBounds(currP)){
                    moveable.push({start:curr, end:currP, path:currPath});
                }
            }
        }if(currPiece.toLowerCase() === "r" || currPiece.toLowerCase() === "q"){
            let dr: number[] = [1,-1,0,0];
            let dc: number[] = [0,0,1,-1];
            for(let k = 0;k<4;k++){
                let currPath: Point[] = [];
                for(let i = 1;i<8;i++){
                    let currP: Point = [row+dr[k]*i,col+dc[k]*i];
                    currPath.push(currP);
                    if(this.inBounds(currP)){
                        if(this.getPiece(currP) === " "){
                            moveable.push({start:curr, end:currP, path:currPath});
                        }else{
                            // break early if any condition fails... eg. put ourselves in check, same team
                            moveable.push({start:curr, end:currP, path:currPath});
                            break;
                        }
                    }
                }
            }    
        }if(currPiece.toLowerCase() === "k"){
            let dr: number[] = [1,-1,0,1,-1,0,1,-1];
            let dc: number[] = [1,1,1,-1,-1,-1,0,0];
            for(let k = 0;k<8;k++){
                let currPath: Point[] = [];
                let currP: Point = [row+dr[k],col+dc[k]];
                if(this.inBounds(currP)){
                    moveable.push({start:curr, end:currP, path:currPath});
                }
            }
        }
        return moveable;
    }
    isTeamKilling(move: Move) : boolean {
        return this.sameTeam(move.start,move.end);
    }
    inCheck(white: boolean) : boolean {
        let good: boolean = true;
        // for every enemy piece get their moves and see if they can attack our king
        for(let i = 0;i<8;i++){
            for(let j = 0;j<8;j++){
                let checking: Point = [i,j];
                if(this.isWhite(checking) === white)continue;
                let possMoves: Move[] = this.getMoves(checking);
                for(const move of possMoves){
                    // if my king is white and this piece can attack white king im screwed
                    if(white && this.getPiece(move.end) === "k") good = false;
                    if(!white && this.getPiece(move.end) === "K") good = false;
                }
            }
        }
        return good;
    }
    
    executeMove(move: Move){
        // check if we en passanted
        let lastCell: Point = this.lastPath[this.lastPath.length-1];
        let intersect: boolean = false;
        for(const cell of move.path){
            for(const checkCell of this.lastPath){
                if(cell[0] === checkCell[0] && cell[1] === checkCell[1]){
                    intersect = true;
                }
            }
        }
        if(intersect){
            //wipe the thing at lastCell
            this.board[lastCell[0]][lastCell[1]] = " ";
        }
        this.board[move.end[0]][move.end[1]] = this.board[move.start[0]][move.end[1]];
        this.lastPath = move.path;
    }
}


