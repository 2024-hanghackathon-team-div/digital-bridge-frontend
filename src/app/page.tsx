'use client';
import 'regenerator-runtime/runtime';
import OpenAI from 'openai';
import { useEffect, useState } from 'react';
import { ChatCompletionMessageParam } from 'openai/resources';
import { tools } from '@/constants/tools';
import { searchTrainApi } from '@/api/search';
import { reserveTrainApi } from '@/api/reservation';
import Dictaphone from '@/components/speech-recognition/dictaphone';
import { parseFunctionCall } from '@/util/json';
import Step1_DepartureDestination from '@/components/steps/Step1_DepartureDestination';
import Step2_DateTime from '@/components/steps/Step2_DateTime';
import Step3_Reservation from '@/components/steps/Step3_Reservation';
import Step4_Payment from '@/components/steps/Step4_Payment';
import Step5_OCR from '@/components/steps/Step5_OCR';
import Visualizer from '@/components/speech-recognition/waveformgraph';
import ReservationConfirm from '@/components/reservation-confirm';
import CameraComponent from '@/components/camera';
import Image from 'next/image';
import axios from 'axios';

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
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([
    {
      role: 'system',
      content:
        '너는 기차역의 열차표 예매 창구에서 근무하는 직원이야. 답변은 한국말로 해줘. 답변은 존댓말로 하되, 되도록이면 짧게 해줘. 그리고 자연스러운 대화체로 대답해줘. 열차를 예매할 때 필요한 정보는 출발지, 도착지, 출발 날짜, 출발 시간 이렇게 네 가지야. 너는 먼저 손님에게 출발지와 도착지를 물어봐. 그 다음에 출발 날짜와 출발 시간을 물어봐.',
    },
    {
      role: 'assistant',
      content: '안녕하세요. 어디에서 어디로 가는 열차를 찾으시나요?',
    },
  ]);
  const [currentStep, setCurrentStep] = useState<number>(1);
  // todo: isProcessing 상태 추가
  // todo: reservationConfirm 컴포넌트 props 변경(GPT search 응답)

  const stepTexts = {
    1: [
      '안녕하세요.',
      '어디에서 어디로 가는 열차를 찾으시나요?',
      '아래의 마이크 버튼을 누르고 말씀해주세요.',
    ],
    2: ['언제 출발하는 기차를 원하세요?'],
    3: ['10시 30분에 출발하는 기차가 있어요.', '이 기차로 예매해드릴까요?'],
    4: ['열차표 예매를 성공했어요.', '구매하시겠나요?'],
    5: ['결제를 위해 카드 뒷 면 사진을 찍어주세요.'],
  };

  // OpenAI 객체 생성
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  // 컴포넌트가 처음 마운트될 때 실행되는 useEffect
  useEffect(() => {
    // "안녕하세요" 메시지를 대화 내역에 추가
    const greetingMessage = {
      role: 'user',
      content: '안녕하세요.',
    };

    // 메시지를 대화 내역에 추가하고 Chat GPT에게 요청을 보냄
    const sendGreetingMessage = async () => {
      // 대화 내역에 메시지 추가
      messages.push(greetingMessage);

      // Chat GPT에게 요청 보내기
      const response = await openai.chat.completions.create({
        messages: messages,
        model: 'ft:gpt-3.5-turbo-1106:personal::9UqlkDsv',
        tools: tools,
      });
    };

    // 안녕하세요 메시지를 보내는 함수 호출
    sendGreetingMessage();
  }, []); // 처음 한 번만 실행되도록 빈 배열을 useEffect의 두 번째 인자로 전달

  // Chat GPT에게 질문하는 함수
  async function askChatGpt() {
    // 인식된 음성을 대화내역에 추가
    messages.push({
      role: 'user',
      content: finalTranscript,
    });

    // Chat GPT API로 요청 보내기
    const response = await openai.chat.completions.create({
      messages: messages,
      // model: "gpt-3.5-turbo-0613",
      model: 'ft:gpt-3.5-turbo-1106:personal::9UqlkDsv',
      tools: tools,
    });

    const responseMessage = response.choices[0].message;
    setAnswer(responseMessage?.content);

    // Chat GPT의 응답이 Function Calling인 경우
    if (responseMessage.tool_calls) {
      messages.push(responseMessage);

      for (const toolCall of responseMessage.tool_calls) {
        const { functionName, parameters } = parseFunctionCall(toolCall)?.[0];

        console.log('functionName: ', functionName);
        console.log('parameters: ', parameters);

        if (functionName === 'saveTrainRoute') {
          setDeparture(parameters.departure);
          setDestination(parameters.destination);

          messages.push({
            tool_call_id: toolCall.id,
            role: 'tool',
            name: toolCall.function.name,
            content: JSON.stringify(true),
          });

          const response2 = await openai.chat.completions.create({
            messages: messages,
            // model: "gpt-3.5-turbo",
            model: 'ft:gpt-3.5-turbo-1106:personal::9UqlkDsv',

            tools: tools,
          });

          setAnswer(response2?.choices[0]?.message?.content);
        }

        if (functionName === 'saveDepartureTime') {
          console.log(parameters.month, parameters.date);
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
          setDepartureTime(parameters.time);

          console.log(
            year + month + date,
            parameters.time,
            destination,
            departure,
          );

          const ticket = await searchTrainApi({
            date: `${year}${month}${date}`,
            time: parameters.time,
            destination: destination,
            departure: departure,
          });

          messages.push({
            tool_call_id: toolCall.id,
            role: 'tool',
            name: toolCall.function.name,
            content: JSON.stringify(ticket),
          });

          const response2 = await openai.chat.completions.create({
            messages: messages,
            // model: "gpt-3.5-turbo",
            model: 'ft:gpt-3.5-turbo-1106:personal::9UqlkDsv',

            tools: tools,
          });

          setAnswer(response2?.choices[0]?.message?.content);
        }

        if (toolCall.function.name === 'searchTrain') {
          const parsed = JSON.parse(toolCall.function.arguments);
          console.log('searchTrain', parsed);
          const year = new Date().getFullYear();
          const month = parsed.departure_month ?? new Date().getMonth();
          const date = parsed.departure_date ?? new Date().getDate();
          setDeparture(parsed.departure);
          setDestination(parsed.destination);
          setDepartureDate(year + month + date);

          const result = await searchTrainApi({
            departure: parsed.departure,
            destination: parsed.destination,
            date: year + month + date,
            time: parsed.time,
          });

          if (typeof result !== 'string') {
            setDepartureTime(result.departureTime);
          }

          messages.push({
            tool_call_id: toolCall.id,
            role: 'tool',
            name: toolCall.function.name,
            content: JSON.stringify(result),
          });

          const response2 = await openai.chat.completions.create({
            messages: messages,
            // model: "gpt-3.5-turbo",
            model: 'ft:gpt-3.5-turbo-1106:personal::9UqlkDsv',

            tools: tools,
          });

          setAnswer(response2?.choices[0]?.message?.content);
        }

        if (functionName === 'reserveTrain') {
          const parsed = JSON.parse(toolCall.function.arguments);
          console.log('reserveTrain', parsed);

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

          const response2 = await openai.chat.completions.create({
            messages: messages,
            // model: "gpt-3.5-turbo",
            model: 'ft:gpt-3.5-turbo-1106:personal::9UqlkDsv',

            tools: tools,
          });

          setAnswer(response2?.choices[0]?.message?.content);
        }
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
  // useEffect(() => {
  //   async function streamResponse() {
  //     if (answer) {
  //       const response = await openai.audio.speech.create({
  //         model: "tts-1",
  //         voice: "fable",
  //         input: answer,
  //       });
  //
  //       const reader = response?.body?.getReader();
  //       if (reader) {
  //         const stream = new ReadableStream({
  //           start(controller) {
  //             function push() {
  //               reader.read().then(({ done, value }) => {
  //                 if (done) {
  //                   controller.close();
  //                   return;
  //                 }
  //                 controller.enqueue(value);
  //                 push();
  //               });
  //             }
  //
  //             push();
  //           },
  //         });
  //
  //         const audioBlob = await new Response(stream).blob();
  //         const audioUrl = URL.createObjectURL(audioBlob);
  //         const audio = new Audio(audioUrl);
  //         audio.playbackRate = 1.1;
  //         audio.play();
  //       }
  //     }
  //   }
  //
  //   streamResponse();
  // }, [answer]);

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
      .post<CardInfo>('/api/extract_card_info', formData, {
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

    return (
      <main>
        {currentStep === 1 && (
          <Step1_DepartureDestination text={stepTexts[1]} />
        )}
        {currentStep === 2 && <Step2_DateTime text={stepTexts[2]} />}
        {currentStep === 3 && <Step3_Reservation text={stepTexts[3]} />}
        {currentStep === 4 && <Step4_Payment text={stepTexts[4]} />}
        {currentStep === 5 && <Step5_OCR text={stepTexts[5]} />}
        {/* <Loader isProcessing={isProcessing} /> */}
        <Visualizer listening={isSpeaking} />
        <Dictaphone
          // onTranscriptChange={handleTranscriptChange}
          onTranscriptChange={(newTranscript: string) =>
            handleTranscriptChange(newTranscript)
          }
          onSpeakingChange={handleSpeakingChange}
        />
        <p style={{ marginTop: '20px' }}>응답: {answer}</p>
        <ReservationConfirm
          departure={departure}
          destination={destination}
          departureTime={departureTime}
        />
        <div>
          <h1>Capture and Upload Photo</h1>
          <CameraComponent onCapture={handleCapture} />
          {photoURL && (
            <div>
              <h2>Captured Photo:</h2>
              <p>신용카드 번호: {cardInfo?.card_number}</p>
              <p>CVC: {cardInfo?.cvc}</p>
              <p>유효기간: {cardInfo?.expiry_date}</p>
              <Image
                src={photoURL}
                alt='Captured'
                style={{ width: '30%', height: 'auto' }}
              />
            </div>
          )}
        </div>
      </main>
    );
  };
}
