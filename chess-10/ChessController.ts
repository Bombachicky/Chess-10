// Point is row column
type Point = [number, number];

type Move = {
    pos: Point;
    path: Point[];
};

function copy2DArray(arr: string[][]): string[][] {
    return arr.map(row => [...row]);
}

class ChessController{
    board: string[][] = [
      ["R", "N", "B", "Q", "K", "B", "N", "R"],
      ["P", "P", "P", "P", "P", "P", "P", "P"],
      [" ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " "],
      ["p", "p", "p", "p", "p", "p", "p", "p"],
      ["r", "n", "b", "q", "k", "b", "n", "r"],
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
    isMovePossible(curr: Point, to: Point) : boolean {
        let removedPiece: string = this.board[to[0]][to[1]];
        this.board[to[0]][to[1]] = this.board[curr[0]][curr[1]];
        this.board[curr[0]][curr[1]] = " ";
        let white: boolean = this.isWhite(curr);
        let good: boolean = true;
        // for every enemy piece get their moves and see if they can attack our king
        for(let i = 0;i<8;i++){
            for(let j = 0;j<8;j++){
                let checking: Point = [i,j];
                if(checking === to)continue;
                if(this.sameTeam(curr,checking))continue;
                let possMoves: Move[] = this.getMoves(checking);
                for(const move of possMoves){
                    if(white && this.getPiece(move.pos) === "k") good = false;
                    if(!white && this.getPiece(move.pos) === "K") good = false;
                }
            }
        }
        this.board[curr[0]][curr[1]] = this.board[to[0]][to[1]];
        this.board[to[0]][to[1]] = removedPiece;
        return good;
    }
    getMoves(curr: Point) : Move[] {
        let row : number = curr[0];
        let col : number = curr[1];
        let currPiece: string = this.getPiece(curr);
        let white: boolean = currPiece === currPiece.toLowerCase();
        let moveable: Move[] = [];
        if(currPiece.toLowerCase() === "p"){
            let dir: number = 1;
            if(white) dir = -1;
            let steps: number = 1;
            if(curr[0] === 1 && !white){
                steps = 2;
            }
            if(curr[0] === 6 && white){
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
                    moveable.push({pos:up, path:currPath});
                }
                else stop = true;
            }
            if(this.inBounds(upup) && !stop){
                if(this.getPiece(upup)===" "){
                    currPath.push(upup);
                    moveable.push({pos:upup, path:currPath});
                }
            }
            currPath = []
            if(this.inBounds(diag1)){
                //also diag1 needs to be on lastPath and the piece at the end of lastpath needs to be a pawn
                //unless chess 10 is enabled
                // or if it's a piece then we can just take it
                let enPassant: boolean = false;

                if(this.getPiece(diag1)!==" "){
                    currPath.push(diag1);
                    moveable.push({pos:diag1, path:currPath});
                }
            }
            currPath = []
            if(this.inBounds(diag2)){
                if(this.getPiece(diag2)!==" "){
                    currPath.push(diag2);
                    moveable.push({pos:diag2, path:currPath});
                }
            }
        }else if(currPiece.toLowerCase() === "b"){
            // for every move we need to check en passant possibility and also make sure it doesnt put king in check
            // this can be a function that pretends to make the move and then check if any piece can attack our king
            // i also need to make sure a piece can only attack opponent's pieces, but is still blocked by our pieces
            let dr: number[] = [1,1,-1,-1];
            let dc: number[] = [-1,1,-1,1];
            for(let k = 0;k<4;k++){
                let currPath: Point[] = [];
                for(let i = 1;i<8;i++){
                    let currP: Point = [row+dr[k]*i,col+dc[k]*i];
                    if(this.inBounds(currP)){
                        if(this.getPiece(currP) === " "){
                            
                        }else{
                            // break early if any condition fails... eg. put ourselves in check, same team
                            if(this.sameTeam(curr,currP))break;
                            moveable.push({pos:currP, path:currPath});
                            break;
                        }
                    }
                }
            }
        }else if(currPiece.toLowerCase() === "n"){

        }else if(currPiece.toLowerCase() === "r"){

        }else if(currPiece.toLowerCase() === "q"){

        }else if(currPiece.toLowerCase() === "k"){

        }
        return moveable;
    }
}


