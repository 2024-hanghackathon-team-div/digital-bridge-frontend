'use client';
import React, { useEffect } from 'react';
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';
import styled from '@emotion/styled';
import MicIcon from '@mui/icons-material/Mic';

const ButtonBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
`;

interface Props {
  onTranscriptChange: (transcript: string) => void;
  onSpeakingChange: (status: boolean) => void;
}

const Dictaphone = ({ onTranscriptChange, onSpeakingChange }: Props) => {
  const { finalTranscript, transcript, listening } = useSpeechRecognition();

  // 인식된 음성
  useEffect(() => {
    onTranscriptChange(finalTranscript);
  }, [onTranscriptChange, finalTranscript]);

  // 현재 사용자가 말하고 있는지 여부
  useEffect(() => {
    onSpeakingChange(listening);
  }, [onSpeakingChange, listening]);

  return (
    <ButtonBox>
      <MicIcon
        onClick={() => SpeechRecognition.startListening()}
        sx={{
          fontSize: 50,
          color: 'white',
          cursor: 'pointer',
          backgroundColor: 'black',
          borderRadius: '50%',
          padding: '10px',
        }}
      />
      <p>{listening ? '음성 인식 중...' : '말하기'}</p>
      <p>{transcript}</p>
    </ButtonBox>
  );
};
export default Dictaphone;
