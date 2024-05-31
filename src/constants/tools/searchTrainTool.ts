import { ChatCompletionTool } from 'openai/src/resources/chat/completions';

export const searchTrainTool: ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'searchTrain',
    description:
      '기차 출발지, 도착지, 출발 날짜, 출발 시간을 알려주면 예매 가능한 열차를 알아봐주는 함수. ',
    parameters: {
      type: 'object',
      properties: {
        departure: {
          type: 'string',
          description: '출발지 (Departure)',
        },
        destination: {
          type: 'string',
          description: '도착지 (Destination)',
        },
        departure_year: {
          type: 'string',
          description: '출발 날짜의 연도 (format: yyyy)',
        },
        departure_month: {
          type: 'string',
          description: '출발 날짜의 월 (format: MM)',
        },
        departure_date: {
          type: 'string',
          description: '출발 날짜의 일 (format: dd)',
        },
        time: {
          type: 'string',
          description: '출발 시간 (format: hhmmss)',
        },
      },
      required: ['departure', 'destination'],
    },
  },
};
