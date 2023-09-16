import { useHistory } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

const glitch = keyframes`
  0%, 12%, 15%, 52%, 55%, 82%, 85%, 100% { opacity: 1; transform: scaleX(1) scaleY(1) }  
  13% { opacity: .8; transform: scaleY(2); color: #0ff }
  53% { opacity: .8; transform: scaleX(.7);  color: #f0f }
  83% { opacity: .8; transform: rotate(-10deg); color: #ff0 }
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: #111;
`;

const GameOverContainer = styled.div`
  --animation: glitch; /* glitch, hue, fade, shrink */
  --speed: 2s;
  --easing: linear;

  padding: 1em;
  font-family: 'Press Start 2P', Arial, sans-serif;
  text-transform: uppercase;
  text-align: center;
  color: #2f99ff;
  text-shadow: 0px 2px #255fcc;
  animation: ${glitch} var(--speed) infinite var(--easing);

  h1 {
    font-size: 3em;
  }
`;

const GameOver = () => {
    const history = useHistory();

  const navigateToMainMenu = () => {
    history.push('/');
  };

  const navigateToLobby = () => {
    history.push('/select-lobby');
  }

  return (
    <Container>
      <GameOverContainer>
        
        <div className = "flex flex-col gap-y-6">
        <h1>Game Over</h1>
            <span className="hover:cursor-pointer" onClick={navigateToMainMenu}>Back to Main Menu</span>
            <span className="hover:cursor-pointer" onClick={navigateToLobby}>Back to Lobby</span>
        </div>
      </GameOverContainer>
    </Container>
  );
};

export default GameOver;

