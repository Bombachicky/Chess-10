// Point is row column
type Point = [number, number];

type Move = {
    pos: Point;
    path: Point[];
};

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
    inBounds(curr: Point): boolean {
        return curr[0]>=0 && curr[1] >=0 && curr[0] < 8 && curr[1] < 8;
    }
    getMoves(curr: Point) : Move[] {
        let row : number = curr[0];
        let col : number = curr[1];
        let currPiece: string = this.board[curr[0]][curr[1]];
        let white: boolean = currPiece === currPiece.toLowerCase();
        let moveable: Move[] = [];
        if(currPiece.toLowerCase() === "p"){
            let dir: number = 1;
            if(white) dir = -1;
            let steps: number = 1;
            if(curr[0] === 1 && !white){
                steps = 2;
            }
            let up: Point = [row+dir,col];
            let upup: Point = [row+steps*dir,col];
            let diag1: Point = [row+dir,col-1];
            let diag2: Point = [row+dir,col+1];
            let stop: boolean = false;
            let currPath: Point[] = [];
            if(this.inBounds(up)){
                if(this.board[up[0]][up[1]]===" ") {
                    currPath.push(up);
                    moveable.push({pos:up, path:currPath});
                }
                else stop = true;
            }
            if(this.inBounds(upup) && !stop){
                if(this.board[upup[0]][upup[1]]===" "){
                    currPath.push(upup);
                    moveable.push({pos:upup, path:currPath});
                }
            }
            currPath = []
            if(this.inBounds(diag1)){
                if(this.board[diag1[0]][diag1[1]]===" "){
                    currPath.push(diag1);
                    moveable.push({pos:diag1, path:currPath});
                }
            }
            currPath = []
            if(this.inBounds(diag2)){
                if(this.board[diag2[0]][diag2[1]]===" "){
                    currPath.push(diag2);
                    moveable.push({pos:diag2, path:currPath});
                }
            }
        }else if(currPiece.toLowerCase() === "b"){
            for(let i = 0;i<8;i++){
                
            }
        }else if(currPiece.toLowerCase() === "n"){

        }else if(currPiece.toLowerCase() === "r"){

        }else if(currPiece.toLowerCase() === "q"){

        }else if(currPiece.toLowerCase() === "k"){

        }
        return moveable;
    }
      

}