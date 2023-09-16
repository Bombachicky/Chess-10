/* eslint-disable @typescript-eslint/no-explicit-any */
// Importing necessary React hooks and Three.js
import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

// Importing the Vanta.js birds effect. Ignoring TypeScript errors for this line.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import BIRDS from 'vanta/dist/vanta.globe.min';
import Username from './Username';
import styled from 'styled-components';

const MainMenuHeader = styled.div`
  position: absolute;
  top: 20%;
  left: 0;
  z-index: 2;
  display: flex;
  justify-content: center;
  width: 100%;
  text-align: center;
  padding: 16px;
`;

// Defining the MyComponent function component
const MainMenu = (props: any) => {
  // Creating a state variable to hold the Vanta effect object
  const [vantaEffect, setVantaEffect] = useState<any>(null);

  // Creating a ref to hold the DOM element where the Vanta effect will be rendered
  const myRef = useRef<HTMLDivElement>(null);

  // Using the useEffect hook to run side-effects
  useEffect(() => {
    // Making the THREE object global so that Vanta can access it
    window.THREE = THREE;

    // Checking whether the Vanta effect is initialized and if the ref is attached to a DOM element
    if (!vantaEffect && myRef.current) {
      // If not, initializing the Vanta effect and storing the returned object in the state
      setVantaEffect(BIRDS({
        el: myRef.current
      }));
    }

    // Returning a cleanup function to run when the component is unmounted
    return () => {
      // Destroying the Vanta effect to free up resources
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]); // Dependency array. The effect will re-run if vantaEffect changes.

  // Rendering a full-screen div using Tailwind CSS classes.
  // The Vanta effect will be applied to this div.
  return (
    <>
      <div ref={myRef} className="relative w-screen h-screen z-[0]">
        {props.children ? (
          <>
            <div className="absolute inset-0 z-[1] flex justify-center items-center text-white">
              {props.children}
            </div>
          </>
        ) : (
          <>
            <MainMenuHeader>
              <h1 className="text-white">Chess 10</h1>
            </MainMenuHeader>
            <div className="absolute inset-0 z-[1] flex justify-center items-center text-white">
              <Username />
            </div>
          </>
        )}
      </div>
    </>
  );

}

// Exporting the Menu for use in other parts of the application
export default MainMenu;

