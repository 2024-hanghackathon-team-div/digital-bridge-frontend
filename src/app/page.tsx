"use client";
import OpenAI from "openai";
import { useEffect, useState } from "react";
import { ChatCompletionMessageParam } from "openai/resources";
import { tools } from "@/constants/tools";
import { searchTrainApi } from "@/api/search";
import { reserveTrainApi } from "@/api/reservation";
import Dictaphone from "@/components/speech-recognition/dictaphone";
import { parseFunctionCall } from "@/util/json";

export default function Home() {
  // Chat GPT 응답
  const [answer, setAnswer] = useState<string | null>("");
  // 인식된 음성 스크립트
  const [transcript, setTranscript] = useState("");
  // 현재 사용자가 말하고 있는지 여부
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  // 출발지
  const [departure, setDeparture] = useState<string>("");
  // 도착지
  const [destination, setDestination] = useState<string>("");
  // 출발 날짜 (yyyyMMdd)
  const [departureDate, setDepartureDate] = useState<string>("");
  // 출발시간 (hhmmss)
  const [departureTime, setDepartureTime] = useState<string>("");
  // 대화 내역
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([
    {
      role: "system",
      content:
        "너는 기차역의 열차표 예매 창구에서 근무하는 직원이야. 답변은 한국말로 해줘. 답변은 존댓말로 하되, 되도록이면 짧게 해줘. 그리고 자연스러운 대화체로 대답해줘. 열차를 예매할 때 필요한 정보는 출발지, 도착지, 출발 날짜, 출발 시간 이렇게 네 가지야. 너는 먼저 손님에게 출발지와 도착지를 물어봐. 그 다음에 출발 날짜와 출발 시간을 물어봐.",
    },
    {
      role: "assistant",
      content: "안녕하세요. 어디에서 어디로 가는 열차를 찾으시나요?",
    },
  ]);

  // OpenAI 객체 생성
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  // Chat GPT에게 질문하는 함수
  async function askChatGpt() {
    // 인식된 음성을 대화내역에 추가
    messages.push({
      role: "user",
      content: transcript,
    });

    // Chat GPT API로 요청 보내기
    const response = await openai.chat.completions.create({
      messages: messages,
      // model: "gpt-3.5-turbo-0613",
      model: "ft:gpt-3.5-turbo-1106:personal::9UqlkDsv",
      tools: tools,
    });

    const responseMessage = response.choices[0].message;
    setAnswer(responseMessage?.content);

    // Chat GPT의 응답이 Function Calling인 경우
    if (responseMessage.tool_calls) {
      messages.push(responseMessage);

      for (const toolCall of responseMessage.tool_calls) {
        const { functionName, parameters } = parseFunctionCall(toolCall)?.[0];

        console.log("functionName: ", functionName);
        console.log("parameters: ", parameters);

        if (functionName === "saveTrainRoute") {
          setDeparture(parameters.departure);
          setDestination(parameters.destination);

          messages.push({
            tool_call_id: toolCall.id,
            role: "tool",
            name: toolCall.function.name,
            content: JSON.stringify(true),
          });

          const response2 = await openai.chat.completions.create({
            messages: messages,
            // model: "gpt-3.5-turbo",
            model: "ft:gpt-3.5-turbo-1106:personal::9UqlkDsv",

            tools: tools,
          });

          setAnswer(response2?.choices[0]?.message?.content);
        }

        if (functionName === "saveDepartureTime") {
          console.log(parameters.month, parameters.date);
          const year = new Date().getFullYear();
          const month =
            parameters.month !== ""
              ? parameters.month.toString().padStart(2, "0")
              : (new Date().getMonth() + 1).toString().padStart(2, "0");
          const date =
            parameters.date !== ""
              ? parameters.date.toString().padStart(2, "0")
              : new Date().getDate().toString().padStart(2, "0");

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
            role: "tool",
            name: toolCall.function.name,
            content: JSON.stringify(ticket),
          });

          const response2 = await openai.chat.completions.create({
            messages: messages,
            // model: "gpt-3.5-turbo",
            model: "ft:gpt-3.5-turbo-1106:personal::9UqlkDsv",

            tools: tools,
          });

          setAnswer(response2?.choices[0]?.message?.content);
        }

        if (toolCall.function.name === "searchTrain") {
          const parsed = JSON.parse(toolCall.function.arguments);
          console.log("searchTrain", parsed);
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

          if (typeof result !== "string") {
            setDepartureTime(result.departureTime);
          }

          messages.push({
            tool_call_id: toolCall.id,
            role: "tool",
            name: toolCall.function.name,
            content: JSON.stringify(result),
          });

          const response2 = await openai.chat.completions.create({
            messages: messages,
            // model: "gpt-3.5-turbo",
            model: "ft:gpt-3.5-turbo-1106:personal::9UqlkDsv",

            tools: tools,
          });

          setAnswer(response2?.choices[0]?.message?.content);
        }

        if (functionName === "reserveTrain") {
          const parsed = JSON.parse(toolCall.function.arguments);
          console.log("reserveTrain", parsed);

          const result = await reserveTrainApi({
            departure: departure,
            destination: destination,
            date: departureDate,
            time: departureTime,
          });

          messages.push({
            tool_call_id: toolCall.id,
            role: "tool",
            name: toolCall.function.name,
            content: JSON.stringify(result),
          });

          const response2 = await openai.chat.completions.create({
            messages: messages,
            // model: "gpt-3.5-turbo",
            model: "ft:gpt-3.5-turbo-1106:personal::9UqlkDsv",

            tools: tools,
          });

          setAnswer(response2?.choices[0]?.message?.content);
        }
      }
    }
  }

  // 사용자가 말하는 게 중단되면 Chat GPT로 API 요청을 보냄
  useEffect(() => {
    if (!isSpeaking && transcript) {
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
    setTranscript(newTranscript);
  };

  const handleSpeakingChange = (speakingStatus: boolean) => {
    setIsSpeaking(speakingStatus);
  };

  return (
    <main>
      {/*<Dictaphone*/}
      {/*  onTranscriptChange={handleTranscriptChange}*/}
      {/*  onSpeakingChange={handleSpeakingChange}*/}
      {/*/>*/}
      <input
        type="text"
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
      />
      <button onClick={askChatGpt}>질문하기</button>
      <p style={{ marginTop: "20px" }}>응답: {answer}</p>
      <p>출발지: {departure}</p>
      <p>도착지: {destination}</p>
    </main>
  );
}
