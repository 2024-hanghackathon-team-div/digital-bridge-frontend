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
  padding: 40px 0px;
`;

interface Props {
  transcript: string;
  listening: boolean;
  onClick: () => void | Promise<void>;
  disabled: boolean;
}

export const Dictaphone = ({
  transcript,
  listening,
  onClick,
  disabled,
}: Props) => {
  return (
    <ButtonBox>
      <MicIcon
        onClick={disabled ? undefined : onClick}
        sx={{
          fontSize: 50,
          color: 'white',
          cursor: 'pointer',
          backgroundColor: disabled ? 'gray' : 'black',
          borderRadius: '50%',
          padding: '10px',
        }}
      />
      <p>{listening ? '음성 인식 중...' : '말하기'}</p>
    </ButtonBox>
  );
};

export default Dictaphone;
