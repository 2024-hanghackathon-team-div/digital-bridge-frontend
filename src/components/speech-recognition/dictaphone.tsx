"use client";
import React, { useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

interface Props {
  onTranscriptChange: (transcript: string) => void;
  onSpeakingChange: (status: boolean) => void;
}

const Dictaphone = ({ onTranscriptChange, onSpeakingChange }: Props) => {
  const { finalTranscript, listening } = useSpeechRecognition();

  // 인식된 음성
  useEffect(() => {
    onTranscriptChange(finalTranscript);
  }, [onTranscriptChange, finalTranscript]);

  // 현재 사용자가 말하고 있는지 여부
  useEffect(() => {
    onSpeakingChange(listening);
  }, [onSpeakingChange, listening]);

  return (
    <div>
      <button onClick={() => SpeechRecognition.startListening()}>
        {listening ? "음성 인식 중..." : "말하기"}
      </button>
      {/*<button onClick={SpeechRecognition.stopListening}>Stop</button>*/}
      <p>질문: {finalTranscript}</p>
    </div>
  );
};
export default Dictaphone;
