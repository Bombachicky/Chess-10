import { useCallback, useRef } from "react";
import { useHistory } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { Renderer } from "../renderer";
import { loadAllAssets } from "../renderer/assets";

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

const Game = () => {
  const history = useHistory();

  let iteration = 0;
  const onCanvasChange = useCallback(async (canvas: HTMLCanvasElement | null) => {
    iteration += 1;

    if (canvas === null) {
      return;
    }

    // const ws = new WebSocket(
    //   (window.location.protocol === "https:" ? "wss://" : "ws://")
    //   + window.location.host
    //   + "/play"
    // );

    const myIteration = iteration;

    await loadAllAssets();

    const renderer = new Renderer();

    await renderer.initializeRenderer(canvas);

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
    </Container>
  );
};

export default Game;

