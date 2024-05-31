'use client';
import 'regenerator-runtime/runtime';
import OpenAI from 'openai';
import { useEffect, useState } from 'react';
import { ChatCompletionMessageParam } from 'openai/resources';
import { searchTrainApi } from '@/api/search';
import { reserveTrainApi } from '@/api/reservation';
import Dictaphone from '@/components/speech-recognition/dictaphone';
import { parseFunctionCall } from '@/util/json';
import Visualizer from '@/components/speech-recognition/waveformgraph';
import ReservationConfirm from '@/components/reservation-confirm';
import CameraComponent from '@/components/camera';
import Image from 'next/image';
import axios from 'axios';
import { createChatCompletions, DEFAULT_MESSAGES } from '@/util/gpt';

interface CardInfo {
  card_number: string;
  cvc: string;
  expiry_date: string;
}

export default function Home() {
  // Chat GPT 응답
  const [answer, setAnswer] = useState<string | null>('');
  // 인식된 음성 스크립트
  const [finalTranscript, setFinalTranscript] = useState('');
  // 현재 사용자가 말하고 있는 음성 스크립트
  const [transcript, setTranscript] = useState('');
  // 현재 사용자가 말하고 있는지 여부
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  // 출발지
  const [departure, setDeparture] = useState<string>('');
  // 도착지
  const [destination, setDestination] = useState<string>('');
  // 출발 날짜 (yyyyMMdd)
  const [departureDate, setDepartureDate] = useState<string>('');
  // 출발시간 (hhmmss)
  const [departureTime, setDepartureTime] = useState<string>('');
  // 대화 내역
  const [messages, setMessages] =
    useState<ChatCompletionMessageParam[]>(DEFAULT_MESSAGES);
  const [currentStep, setCurrentStep] = useState<number>(1);
  // todo: isProcessing 상태 추가
  // todo: reservationConfirm 컴포넌트 props 변경(GPT search 응답)

  // OpenAI 객체 생성
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const sendGreetingMessage = async () => {
    try {
      const response = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'fable',
        input: '안녕하세요. 어디에서 어디로 가는 열차를 찾으시나요?',
        speed: 1.2,
      });

      const reader = response?.body?.getReader();
      if (reader) {
        const stream = new ReadableStream({
          start(controller) {
            function push() {
              reader.read().then(({ done, value }) => {
                if (done) {
                  controller.close();
                  return;
                }
                controller.enqueue(value);
                push();
              });
            }

            push();
          },
        });

        const audioBlob = await new Response(stream).blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      }
    } catch (error) {
      console.error('Error sending greeting message:', error);
    }
  };

  // 컴포넌트가 처음 마운트될 때 실행되는 useEffect
  useEffect(() => {
    const playGreetingMessage = async () => {
      await sendGreetingMessage();
      // audio.play();
    };

    playGreetingMessage();
  }, []);

  // Chat GPT에게 질문하는 함수
  async function askChatGpt() {
    // 인식된 음성을 대화내역에 추가
    messages.push({
      role: 'user',
      content: finalTranscript,
    });

    // Chat GPT API로 요청 보내기
    const response = await createChatCompletions(messages);
    const responseMessage = response.choices[0].message;
    setAnswer(responseMessage?.content);

    // Chat GPT의 응답이 Function Calling인 경우
    if (responseMessage.tool_calls) {
      messages.push(responseMessage);

      for (const toolCall of responseMessage.tool_calls) {
        const { functionName, parameters } = parseFunctionCall(toolCall)?.[0];

        switch (functionName) {
          case 'saveTrainRoute':
            setDeparture(parameters.departure);
            setDestination(parameters.destination);
            messages.push({
              tool_call_id: toolCall.id,
              role: 'tool',
              name: toolCall.function.name,
              content: JSON.stringify(true),
            });
            break;
          case 'saveDepartureTime':
            const year = new Date().getFullYear();
            const month =
              parameters.month !== ''
                ? parameters.month.toString().padStart(2, '0')
                : (new Date().getMonth() + 1).toString().padStart(2, '0');
            const date =
              parameters.date !== ''
                ? parameters.date.toString().padStart(2, '0')
                : new Date().getDate().toString().padStart(2, '0');

            setDepartureDate(`${year}${month}${date}`);

            const ticket = await searchTrainApi({
              date: `${year}${month}${date}`,
              time: parameters.time,
              destination: destination,
              departure: departure,
            });

            setDepartureTime(ticket.departureTime);
            messages.push({
              tool_call_id: toolCall.id,
              role: 'tool',
              name: toolCall.function.name,
              content: JSON.stringify(ticket),
            });
            break;
          case 'reserveTrain':
            const result = await reserveTrainApi({
              departure: departure,
              destination: destination,
              date: departureDate,
              time: departureTime,
            });
            messages.push({
              tool_call_id: toolCall.id,
              role: 'tool',
              name: toolCall.function.name,
              content: JSON.stringify(result),
            });
            break;
          default:
            break;
        }

        const fnResponse = await createChatCompletions(messages);
        setAnswer(fnResponse?.choices[0]?.message?.content);
      }
    }
  }

  // 사용자가 말하는 게 중단되면 Chat GPT로 API 요청을 보냄
  useEffect(() => {
    if (!isSpeaking && finalTranscript) {
      askChatGpt();
    }
  }, [isSpeaking]);

  // Text-to-Speech 기능을 활용해서 Chat GPT의 응답을 음성으로 재생
  useEffect(() => {
    async function streamResponse() {
      if (answer) {
        const response = await openai.audio.speech.create({
          model: 'tts-1',
          voice: 'fable',
          input: answer,
        });

        const reader = response?.body?.getReader();
        if (reader) {
          const stream = new ReadableStream({
            start(controller) {
              function push() {
                reader.read().then(({ done, value }) => {
                  if (done) {
                    controller.close();
                    return;
                  }
                  controller.enqueue(value);
                  push();
                });
              }

              push();
            },
          });

          const audioBlob = await new Response(stream).blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audio.playbackRate = 1.1;
          audio.play();
        }
      }
    }

    streamResponse();
  }, [answer]);

  const handleTranscriptChange = (newTranscript: string) => {
    setFinalTranscript(newTranscript);
    if (currentStep === 1 && newTranscript.trim() !== '') {
      setCurrentStep(currentStep + 1); // 다음 단계로 이동
    }
  };

  const handleSpeakingChange = (speakingStatus: boolean) => {
    setIsSpeaking(speakingStatus);
  };

  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [cardInfo, setCardInfo] = useState<CardInfo>();

  const handleCapture = (file: File) => {
    const formData = new FormData();
    formData.append('file', file, 'photo.jpg');

    axios
      .post<CardInfo>('http://localhost:8080/extract_card_info', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(response => {
        setCardInfo(response.data);
        setPhotoURL(URL.createObjectURL(file));
      })
      .catch(error => {
        console.error('Upload error', error);
      });
  };

  //

  return (
    <main>
      <button onClick={sendGreetingMessage}>재생</button>
      {/*{currentStep === 1 && <Step1_Route text={stepTexts[1]} />}*/}
      {/*{currentStep === 2 && <Step2_DateTime text={stepTexts[2]} />}*/}
      {/*{currentStep === 3 && <Step3_Reservation text={stepTexts[3]} />}*/}
      {/*{currentStep === 4 && <Step4_Payment text={stepTexts[4]} />}*/}
      {/*{currentStep === 5 && <Step5_OCR text={stepTexts[5]} />}*/}
      {/*<Loader isProcessing={isProcessing} />*/}
      <Visualizer listening={isSpeaking} />
      <Dictaphone
        // onTranscriptChange={handleTranscriptChange}
        onTranscriptChange={(newTranscript: string) =>
          handleTranscriptChange(newTranscript)
        }
        onSpeakingChange={handleSpeakingChange}
      />
      <p style={{ marginTop: '20px' }}>GPT 응답: {answer}</p>
      <ReservationConfirm
        departure={departure}
        destination={destination}
        departureTime={departureTime}
      />
    </main>
  );
}
