
export const PieceSelect = () => {
    const border = "cursor-pointer transition duration-300 ease-in-out border border-black hover:border-red-500 border-4";
    return(
        <>
            <div>
                <div className = "pl-32">
                        <img className = {border} src="https://upload.wikimedia.org/wikipedia/commons/2/28/Chess_nlt60.png"/>
                        <img className = {border} src="https://upload.wikimedia.org/wikipedia/commons/9/9b/Chess_blt60.png"/>
                        <img className = {border} src="https://upload.wikimedia.org/wikipedia/commons/4/49/Chess_qlt60.png"/>
                        <img className = {border} src="https://upload.wikimedia.org/wikipedia/commons/5/5c/Chess_rlt60.png"/>
                </div>
            </div>
        </>
    );
}

export default PieceSelect;