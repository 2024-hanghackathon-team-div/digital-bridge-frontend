import { ChatCompletionTool } from "openai/src/resources/chat/completions";

export const reserveTrainTool: ChatCompletionTool = {
  type: "function",
  function: {
    name: "reserveTrain",
    description:
      "searchTrain 결과 조회된 기차를 사용자가 기차를 예매해달라고 하면 예매해주는 함수",
    parameters: {
      type: "object",
      properties: {
        departure: {
          type: "string",
          description: "출발지",
        },
        destination: {
          type: "string",
          description: "도착지",
        },
        date: {
          type: "string",
          description: "출발 날짜 (format: yyyyMMdd)",
        },
        time: {
          type: "string",
          description: "출발 시간 (format: hhmmss)",
        },
      },
      required: ["departure", "destination"],
    },
  },
};
