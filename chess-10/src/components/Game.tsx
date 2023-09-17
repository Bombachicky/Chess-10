import { useCallback, useRef, useState } from "react";
import { useHistory } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { RenderPiece, Renderer } from "../renderer";
import { loadAllAssets } from "../renderer/assets";
import PieceSelect  from "../components/PieceSelect";
import { connection } from "../connection";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: #111;
`;

const Canvas = styled.canvas`
  height: 100vh;
  width: 100vw;
  background-color: #111;
`;

let isWhite: boolean;
export function setRole(isWhite_: boolean) {
  isWhite = isWhite_;
}

const Game = () => {
  const history = useHistory();

  if (connection === undefined) {
    history.push("/");
  }

  let [renderer, setRenderer] = useState<Renderer>();
  let [pieceToPromote, setPieceToPromote] = useState<RenderPiece | undefined>();

  let iteration = 0;
  const onCanvasChange = useCallback(async (canvas: HTMLCanvasElement | null) => {
    iteration += 1;

    if (canvas === null) {
      return;
    }

    const myIteration = iteration;

    await loadAllAssets();

    const renderer = new Renderer();
    setRenderer(renderer);

    await renderer.initializeRenderer(canvas, isWhite, setPieceToPromote);

    let previousTickTime: number | undefined;
    let lag: number = 0;
    
    const TICK_DURATION = 1 / 60;
    
    function forceTick() {
      const now = performance.now() / 1000;
      if (previousTickTime === undefined) {
        previousTickTime = now;
        return;
      }
    
      lag += now - previousTickTime;
      previousTickTime = now;
    
      const numTicks = Math.floor(lag / TICK_DURATION);
      lag %= TICK_DURATION;
      if (numTicks > 5) {
        console.warn(`Running ${numTicks} ticks behind`);
      }
      else {
        for (let i = 0; i < numTicks; ++i) {
          renderer.processEffects();
        }
      }
    }
    function tick() {
      if (iteration !== myIteration)
        return;
      requestAnimationFrame(tick);
      forceTick();
      renderer.render();
    }

    tick();
  }, []);

  return (
    <Container>
      <Canvas ref={onCanvasChange} />
      {pieceToPromote ? <PieceSelect piece={pieceToPromote} promoteTo={renderer.promote.bind(renderer)}/> : undefined}
    </Container>
  );
};

export default Game;

