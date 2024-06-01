import { useEffect, useRef } from 'react';
import styled from '@emotion/styled';

interface Props {
  listening: boolean;
}

const CanvasContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 150px;
`;

const Visualizer: React.FC<Props> = ({ listening }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (listening) {
      startVisualizer();
    } else {
      stopVisualizer();
    }
  }, [listening]);

  const startVisualizer = async () => {
    if (!canvasRef.current) return;

    console.log('Starting visualizer...');
    audioContextRef.current = new AudioContext();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = audioContextRef.current.createMediaStreamSource(stream);
    analyserRef.current = audioContextRef.current.createAnalyser();
    source.connect(analyserRef.current);

    analyserRef.current.fftSize = 256;
    const bufferLength = analyserRef.current.frequencyBinCount;
    dataArrayRef.current = new Uint8Array(bufferLength);

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');

    const draw = () => {
      if (!canvasCtx || !analyserRef.current || !dataArrayRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      // Create a gradient
      const gradient = canvasCtx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, 'pink');
      gradient.addColorStop(1, 'blue');

      canvasCtx.fillStyle = gradient;

      const barWidth = (canvas.width / bufferLength) * 0.8;
      const halfHeight = canvas.height / 2;
      const halfWidth = canvas.width / 2;
      const barGap = 4;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight =
          (dataArrayRef.current[i] / 2) * (bufferLength / (bufferLength + i));

        // Draw bars symmetrically around the center with gap
        canvasCtx.fillRect(
          halfWidth - (i + 1) * (barWidth + barGap),
          halfHeight - barHeight / 2,
          barWidth,
          barHeight,
        );
        canvasCtx.fillRect(
          halfWidth + i * (barWidth + barGap),
          halfHeight - barHeight / 2,
          barWidth,
          barHeight,
        );
      }

      animationIdRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  const stopVisualizer = () => {
    console.log('Stopping visualizer...');
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  return (
    <CanvasContainer>
      <canvas
        ref={canvasRef}
        width='600'
        height='200'
        style={{
          display: listening ? 'block' : 'none',
        }}
      />
    </CanvasContainer>
  );
};

export default Visualizer;
