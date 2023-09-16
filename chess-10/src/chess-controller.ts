// Point is row column
export type Point = [number, number];

export type Move = {
    start: Point;
    end: Point;
    path: Point[];
};

function copy2DArray(arr: string[][]): string[][] {
    return arr.map(row => [...row]);
}

export class ChessController{
    enableEnpassant: boolean
    board: string[][] = [
      ["r", "n", "b", "q", "k", "b", "n", "r"],
      ["p", "p", "p", "p", "p", "p", "p", "p"],
      [" ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " "],
      ["P", "P", "P", "P", "P", "P", "P", "P"],
      ["R", "N", "B", "Q", "K", "B", "N", "R"],
    ];
    constructor({ enableEnpassant }: {
        enableEnpassant: boolean;
    }){
        this.enableEnpassant = enableEnpassant;
    }
    // include the points along the path of the last move including the ending point
    lastPath: Point[] = [];
    getPiece(curr: Point) : string{
        const result = this.board[curr[0]][curr[1]];
        if (result === undefined) {
            throw new Error(`${curr[0]}, ${curr[1]} is not valid`);
        }
        return result;
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
        if(this.getPiece(us) === " " || this.getPiece(them) === " ")return false;
        return this.isWhite(us) === this.isWhite(them);
    }
    clone(): ChessController {
        const result = new ChessController({
            enableEnpassant: this.enableEnpassant,
        });
        result.board = this.board.map(x => [...x]);
        result.lastPath = [...this.lastPath];
        return result;
    }
    getMoves(curr: Point): Move[] {
        console.log(curr);
        this.board.forEach(row => console.log(...row));
        return this.getMovesInternal(curr).filter(move => {
            const cloned = this.clone();
            cloned.executeMove(move);
            console.log("MOVE TO", move.end, "IS...");
            console.log("    check?", cloned.inCheck(this.isWhite(curr)));
            console.log("    team kill?", this.isTeamKilling(move));
            console.log("");
            return (!cloned.inCheck(this.isWhite(curr)) && !this.isTeamKilling(move));
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
            if(this.inBounds(up)){
                if(this.getPiece(up)===" ") {
                    moveable.push({start:curr, end:up, path:[up]});
                }
                else stop = true;
            }
            if(this.inBounds(upup) && !stop){
                if(this.getPiece(upup)===" "){
                    moveable.push({start:curr, end:upup, path:[up, upup]});
                }
            }
            if(this.lastPath.length>0){
                let lastCell: Point = this.lastPath[this.lastPath.length-1];
                let diags: Point[] = [diag1,diag2];
                for (const diag of diags){
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
                        if(intersect 
                            && (this.getPiece(lastCell).toLowerCase() === "p" || this.enableEnpassant) 
                            || this.getPiece(diag) !== " "){
                                moveable.push({start:curr, end:diag, path:[diag]});
                        }
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
                            moveable.push({start:curr, end:currP, path:[...currPath]});
                        }else{
                            // break early if any condition fails... eg. put ourselves in check, same team
                            moveable.push({start:curr, end:currP, path:[...currPath]});
                            break;
                        }
                    }
                }
            }
        }if(currPiece.toLowerCase() === "n"){
            let dr: number[] = [2,2,-2,-2,1,1,-1,-1];
            let dc: number[] = [1,-1,1,-1,2,-2,2,-2];
            for(let k = 0;k<8;k++){
                let currP: Point = [row+dr[k],col+dc[k]];
                if(this.inBounds(currP)){
                    moveable.push({start:curr, end:currP, path:[currP]});
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
                            moveable.push({start:curr, end:currP, path:[...currPath]});
                        }else{
                            // break early if any condition fails... eg. put ourselves in check, same team
                            moveable.push({start:curr, end:currP, path:[...currPath]});
                            break;
                        }
                    }
                }
            }    
        }if(currPiece.toLowerCase() === "k"){
            let dr: number[] = [1,-1,0,1,-1,0,1,-1];
            let dc: number[] = [1,1,1,-1,-1,-1,0,0];
            for(let k = 0;k<8;k++){
                let currP: Point = [row+dr[k],col+dc[k]];
                if(this.inBounds(currP)){
                    moveable.push({start:curr, end:currP, path:[currP]});
                }
            }
        }
        return moveable;
    }
    isTeamKilling(move: Move) : boolean {
        let emptySquare: boolean = this.getPiece(move.end) === " ";
        let selfEnpassant: boolean = false;
        if(this.enableEnpassant && emptySquare && this.lastPath.length>0){
            // make sure we dont kill ourselves
            const enPassanted = this.lastPath.some(value => value[0] === move.end[0] && value[1] === move.end[1]);
            let lastCell: Point = this.lastPath[this.lastPath.length-1];
            if(this.sameTeam(move.start,lastCell) && enPassanted) selfEnpassant = true;
        }
        return this.sameTeam(move.start,move.end) || selfEnpassant;
    }
    inCheck(white: boolean) : boolean {
        // for every enemy piece get their moves and see if they can attack our king
        for(let i = 0;i<8;i++){
            for(let j = 0;j<8;j++){
                let checking: Point = [i,j];
                if(this.isWhite(checking) === white)continue;
                let possMoves: Move[] = this.getMovesInternal(checking);
                for(const move of possMoves){
                    // if my king is white and this piece can attack white king im screwed
                    if(white && this.getPiece(move.end) === "k") return true;
                    if(!white && this.getPiece(move.end) === "K") return true;
                }
            }
        }
        return false;
    }
    
    executeMove(move: Move): Point | undefined {
        // check if we en passanted
        let result: Point | undefined;
        if(this.enableEnpassant && this.lastPath.length > 0){
            let lastCell: Point = this.lastPath[this.lastPath.length-1];
            const enPassanted = this.lastPath.some(value => value[0] === move.end[0] && value[1] === move.end[1]);
            if(enPassanted){
                //wipe the thing at lastCell
                this.board[lastCell[0]][lastCell[1]] = " ";
                result = lastCell;
            }
        }
        if (this.board[move.end[0]][move.end[1]] !== " ") {
            if (result)
                throw 0;
            result = move.end;
        }
        this.board[move.end[0]][move.end[1]] = this.board[move.start[0]][move.start[1]];
        this.board[move.start[0]][move.start[1]] = " ";
        this.lastPath = move.path;
        return result;
    }
}


