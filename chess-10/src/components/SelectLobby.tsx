/* eslint-disable @typescript-eslint/no-unused-vars */
import styled, { css } from 'styled-components';
import { keyframes } from 'styled-components';
import MainMenu from './MainMenu';
import { useHistory } from 'react-router-dom';
import Button from './Button';
// Span Props Type
interface SpanProps {
  type: 'first' | 'second';
}

// Keyframes for slide-down animation
const slideDown = keyframes`
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
`;

// Styled-components
const Figure = styled.figure`
  width: 200px;
  height: 60px;
  cursor: pointer;
  perspective: 500px;
`;

const Div = styled.div`
  height: 100%;
  transform-style: preserve-3d;
  transition: 0.25s;

  ${Figure}:hover & {
    transform: rotateX(-90deg);
  }
`;

// Styled component for the title header
const TitleHeader = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  display: flex;
  justify-content: center;
  width: 100%;
  text-align: center;
  padding: 16px;
  animation: ${slideDown} .5s ease-in-out;
`;

const BackButton = styled.button`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  background: #fff;
  color: #000;
  border: none;
  cursor: pointer;
`;

const Span = styled.span<SpanProps>`
  width: 100%;
  height: 100%;
  position: absolute;
  box-sizing: border-box;
  border: 5px solid #fff;
  font-family: 'Source Sans Pro', sans-serif;
  line-height: 50px;
  font-size: 17pt;
  text-align: center;
  text-transform: uppercase;

  ${props => {
    if (props.type === 'first') {
      return css`
        color: #fff;
        transform: translate3d(0, 0, 30px);
      `;
    }

    if (props.type === 'second') {
      return css`
        color: #8A2A52;
        background: #fff;
        transform: rotateX(90deg) translate3d(0, 0, 30px);
      `;
    }
  }}
`;

const Body = styled.div` // changed from styled.body
  margin: 0;
  animation: ${slideDown} 1s ease-in-out;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-rows: 1fr 1fr;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 128px;
`;

const LobbyCard: React.FC = () => {
  return (
    <Body>
      <Figure>
        <Div>
          <Span type="first">Username</Span>
          <Span type="second">Join Games</Span>
        </Div>
      </Figure>
    </Body>
  );
};

const SelectLobby = () => {

  const history = useHistory();

  const goBackToMainMenu = () => {
    history.push('/');  // Navigate back to main menu. Change the route as per your app's routing.
  };

  return (
    <MainMenu>
      <TitleHeader>
        <h1>Select Lobby</h1>
      </TitleHeader>
      <GridContainer>
        
      </GridContainer>

      <Button onClick={goBackToMainMenu}>Back to Menu</Button>
      {/* <BackButton onClick={goBackToMainMenu}>Back to Menu</BackButton>  Back button */}
    </MainMenu>
  );
};

export default SelectLobby;
