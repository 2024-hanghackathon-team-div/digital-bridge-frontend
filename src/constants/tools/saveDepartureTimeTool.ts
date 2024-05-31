import { ChatCompletionTool } from "openai/src/resources/chat/completions";

export const saveDepartureTimeTool: ChatCompletionTool = {
  type: "function",
  function: {
    name: "saveDepartureTime",
    description: "기차 출발 날짜와 출발 시간을 저장하는 함수",
    parameters: {
      type: "object",
      properties: {
        month: {
          type: "string",
          description: "출발 날짜의 월 (format: MM)",
        },
        date: {
          type: "string",
          description: "출발 날짜의 일 (format: dd)",
        },
        time: {
          type: "string",
          description: "출발 시간 (format: hhmmss)",
        },
      },
      required: ["time"],
    },
  },
};
