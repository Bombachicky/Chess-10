import { useHistory } from 'react-router-dom';
import MainMenu from './MainMenu';
import Button from './Button';
import { useEffect } from "react";
import { connectAndWait, disconnect } from "../connection";


function Waiting() {
    const history = useHistory();

    const goBackToMainMenu = () => {
        history.push('/');  // Navigate back to main menu. Change the route as per your app's routing.
    };

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
                <Button onClick={goBackToMainMenu}>Back to Menu</Button>

            </MainMenu>

        </>
    )
}

export default Waiting