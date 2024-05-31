import { ChatCompletionTool } from "openai/src/resources/chat/completions";
import { searchTrainTool } from "@/constants/tools/searchTrainTool";
import { reserveTrainTool } from "@/constants/tools/reserveTrainTool";
import { saveTrainRouteTool } from "@/constants/tools/saveTrainRouteTool";
import { saveDepartureTimeTool } from "@/constants/tools/saveDepartureTimeTool";

/**
 * TODO: 함수 호출 단계 세분화 필요
 *
 * ex)
 *   step1: 출발지, 도착지 state 값을 셋팅하는 함수
 *   step2: 출발 날짜, 출발시간 state 값을 셋팅하는 함수
 *   step3:  예매 가능한 열차를 알아봐주는 함수.
 *   step4: 예매 API 요청 보내는 함수
 *   step5: 신용카드 인식 카메라로 사진찍고 OCR API 요청 보내는 함수
 *   step6: 생년월일이랑 카드 비밀번호 앞 두 자리 물어보는 함수
 *   step7: 결제 API 요청 보내는 함수
 */

export const tools: Array<ChatCompletionTool> = [
  saveTrainRouteTool,
  saveDepartureTimeTool,
  // searchTrainTool,
  reserveTrainTool,
];
