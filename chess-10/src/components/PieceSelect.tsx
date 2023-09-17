
const PieceSelect = () => {
    const border = "border-solid border-2 border-black z-[2]";
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