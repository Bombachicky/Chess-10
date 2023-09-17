import styled from 'styled-components';

const PieceDiv = styled.div`

position: absolute;
left: 0;
top: 50%;
translate: 0 -50%;
z-index: 2;

`;
export const PieceSelect = ({piece, promoteTo}) => {
    
    const border = "cursor-pointer transition duration-300 ease-in-out border border-black hover:border-red-500 border-4";
    return(
        <>
            <PieceDiv>
                <div className = "pl-32">
                        <img className = {border} 
                             src="https://upload.wikimedia.org/wikipedia/commons/2/28/Chess_nlt60.png" 
                             onClick={() => promoteTo(piece, 'knight', 'n')}
                        />
                        <img className = {border} 
                             src="https://upload.wikimedia.org/wikipedia/commons/9/9b/Chess_blt60.png" 
                             onClick={() => promoteTo(piece, 'bishop', 'b')}
                        />
                        <img className = {border} 
                             src="https://upload.wikimedia.org/wikipedia/commons/4/49/Chess_qlt60.png" 
                             onClick={() => promoteTo(piece, 'queen', 'q')}
                        />
                        <img className = {border} 
                             src="https://upload.wikimedia.org/wikipedia/commons/5/5c/Chess_rlt60.png" 
                             onClick={() => promoteTo(piece, 'rook', 'r')}
                        />
                </div>
            </PieceDiv>
        </>
    );
}

export default PieceSelect;