import MainMenu from './MainMenu';

function Waiting() {

    return (
        <>
            <MainMenu>
                {/* <span className='loadingss'>Waiting For Players! </span> */}
                <div className="bouncing-text">
                    <div className="waiting">Waiting</div>
                    <div className="for">For</div>
                    <div className="players">Players</div>
                    <div className="dot-1">.</div>
                    <div className="dot-2">.</div>
                    <div className="dot-3">.</div>
                    <div className="shadow"></div>
                    <div className="shadow-two"></div>
                </div>
            </MainMenu>

        </>
    )
}

export default Waiting