import { tools } from '@/constants/tools';
import { ChatCompletionMessageParam } from 'openai/resources';
import OpenAI from 'openai';

export const GPT_MODEL_ID = 'ft:gpt-3.5-turbo-1106:personal::9VBQg0NH';

// OpenAI 객체 생성
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const createChatCompletions = async (
  messages: ChatCompletionMessageParam[],
) => {
  return await openai.chat.completions.create({
    messages: messages,
    model: GPT_MODEL_ID,
    tools: tools,
    temperature: 0.1,
  });
};

const AVAILABLE_KTX_STATIONS = [
  '가남',
  '감곡장호원',
  '강릉',
  '경산',
  '경주',
  '계룡',
  '곡성',
  '공주',
  '광명',
  '광주송정',
  '구례구',
  '구포',
  '김제',
  '김천',
  '구미',
  '나주',
  '남원',
  '논산',
  '단양',
  '대전',
  '덕소',
  '동대구',
  '동탄',
  '동해',
  '둔내',
  '마산',
  '만종',
  '목포',
  '묵호',
  '물금',
  '밀양',
  '부발',
  '부산',
  '상봉',
  '서대구',
  '서대전',
  '서울',
  '서원주',
  '수서',
  '수원',
  '순천',
  '안동',
  '앙성온천',
  '양평',
  '여수엑스포',
  '여천',
  '영등포',
  '영주',
  '오송',
  '용산',
  '울산',
  '원주',
  '익산',
  '장성',
  '전주',
  '정동진',
  '정읍',
  '제천',
  '진부',
  '진영',
  '진주',
  '창원',
  '창원중앙',
  '천안아산',
  '청량리',
  '충주',
  '판교',
  '평창',
  '평택지제',
  '포항',
  '풍기',
  '행신',
  '횡성',
];

const INIT_SYSTEM = `You are an assistant designed to help users book train tickets. Users will always input in Korean, and therefore, your responses should also be in Korean. The conversation is conducted via voice, so avoid including text that is difficult to pronounce. The majority of the service users are expected to be older, so please use honorific language in your responses. The booking process consists of six stages. You need to determine which stage the user input corresponds to and call the appropriate function for that stage. Here are the details of each stage:

Stage 1: Save Departure and Destination
- If the user input clearly specifies the departure and destination locations, call the saveTrainRoute function to save these locations.
- The departure and destination should both be limited to Korean KTX train stations. Available KTX stations are as follows: ${AVAILABLE_KTX_STATIONS.join(', ')}. If the user input does not match any of the stations, ask for the station name again.
- If the user input repeatly does not match any of the stations, ask again for the maximum 5 times, and end the chat if the user input still does not match any of the stations.
- In this stage, you should provide a response for Stage 2, asking the user for the departure date and time.

Stage 2: Save Departure Date and Time, and search for available train.
- Now is ${new Date().toISOString()} in ISO format.
- If the user input clearly specifies the departure date and time, call the saveDepartureTime function to save this information.
- saveDepartureTime function saves departure date and time provided as user input, and search for available train.
- In this stage, you should provide a response for Stage 3, which is the list of available trains for saved departure, destination and date.
- If there is no available train, end session.

Stage 3: Reserve Train
- After the user provides the departure date and time in Stage 2, call the reserveTrain function to search for available trains.
- reserveTrain requset to reservation server. If response include reservation info, inform user that reservation succeeded.
- Based on the user's response, proceed to Stage 4 or ask for the departure date and time again.
- In this stage, you should provide a response for Stage 4, asking the user whether they want to proceed with the payment.

Stage 4: Process Payment
- After Stage 3, ask the user if they want to proceed with the payment. Based on their response, call the goToPaymentPage function to process the payment.
- If goToPaymentPage is called, the conversation session ends.

Additional Instructions:
- If the user asks what you can do, respond that you can help with booking train tickets.
- If the user asks questions unrelated to train booking, politely respond that you only assist with booking train tickets. If the unrelated questions persist, suggest ending the chat.
- Ensure to handle each stage appropriately and always respond in polite Korean, considering the older age group of the users.
- The user can ask to end the conversation at any time, triggering the cancelChat function.`;

export const DEFAULT_MESSAGES: ChatCompletionMessageParam[] = [
  {
    role: 'system',
    content: INIT_SYSTEM,
  },
  {
    role: 'assistant',
    content: '안녕하세요. 어디에서 어디로 가는 열차를 찾으시나요?',
  },
];
