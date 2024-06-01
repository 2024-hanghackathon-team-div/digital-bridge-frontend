import React, { useRef, useState, useEffect } from 'react';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import SpeechRecognition from 'react-speech-recognition';

interface CameraComponentProps {
  onCapture: (blob: Blob) => void;
}

const CameraComponent: React.FC<CameraComponentProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          device => device.kind === 'videoinput',
        );
        setDevices(videoDevices);

        // 후면 카메라 장치를 자동으로 선택
        const backCamera = videoDevices.find(device =>
          device.label.toLowerCase().includes('back'),
        );
        setSelectedDeviceId(
          backCamera ? backCamera.deviceId : videoDevices[0]?.deviceId,
        );
      } catch (error) {
        console.error('Error getting media devices', error);
      }
    };

    const startCamera = async (deviceId?: string) => {
      try {
        if (videoRef.current) {
          const constraints = {
            video: {
              deviceId: deviceId ? { exact: deviceId } : undefined,
            },
          };
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (error) {
        console.error('Error accessing the camera', error);
      }
    };

    getDevices();
    startCamera();
  }, []);

  const capturePhoto = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.drawImage(
          videoRef.current,
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height,
        );
        canvasRef.current.toBlob(blob => {
          if (blob) {
            onCapture(blob);
          }
        }, 'image/jpeg');
      }
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 'auto',
        gap: '20px',
      }}
    >
      <video
        ref={videoRef}
        style={{ width: '100%', height: 'auto', transform: 'scaleX(-1)' }}
      />
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
        width='640'
        height='480'
      />
      <CameraAltIcon
        onClick={capturePhoto}
        sx={{
          fontSize: 50,
          color: 'white',
          cursor: 'pointer',
          backgroundColor: 'black',
          borderRadius: '50%',
          padding: '10px',
        }}
      />
    </div>
  );
};

export default CameraComponent;
