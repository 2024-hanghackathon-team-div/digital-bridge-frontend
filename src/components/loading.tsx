import React, { useEffect, useRef } from 'react';
import styled from '@emotion/styled';

interface Props {
  isProcessing: boolean;
}

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 200px;
  height: 200px;
  margin: 0 auto;
  position: relative;
`;

const Dot = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(45deg, pink, blue);
  position: absolute;
  animation: grow 1s infinite ease-in-out, colorChange 2s infinite alternate;

  @keyframes grow {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.5);
    }
  }

  @keyframes colorChange {
    0% {
      background: pink;
    }
    100% {
      background: #7171ce;
    }
  }
`;

const Loader: React.FC<Props> = ({ isProcessing }) => {
  const dotsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (isProcessing) {
      startAnimation();
    } else {
      stopAnimation();
    }
  }, [isProcessing]);

  const startAnimation = () => {
    if (dotsRef.current.length > 0) {
      dotsRef.current.forEach((dot, index) => {
        dot.style.animationDelay = `${index * 0.2}s`;
      });
    }
  };

  const stopAnimation = () => {
    if (dotsRef.current.length > 0) {
      dotsRef.current.forEach(dot => {
        dot.style.animationDelay = '0s';
      });
    }
  };

  return (
    <LoaderContainer>
      {[...Array(4)].map((_, index) => (
        <Dot
          key={index}
          ref={(el) => {
            if (el && !dotsRef.current.includes(el)) {
              dotsRef.current[index] = el;
            }
          }}
          style={{
            left: `${index * 60}px`,
          }}
        />
      ))}
    </LoaderContainer>
  );
};

export default Loader;
