import { ChatCompletionTool } from "openai/src/resources/chat/completions";

export const saveTrainRouteTool: ChatCompletionTool = {
  type: "function",
  function: {
    name: "saveTrainRoute",
    description: "기차 출발지와 도착지 정보를 저장하는 함수",
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
      },
      required: ["departure", "destination"],
    },
  },
};
