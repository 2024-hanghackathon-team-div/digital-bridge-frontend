import axios from 'axios';
import {
  CustomReserveTrainResponse,
  ReserveTrainRequestBody,
  ReserveTrainResponse,
} from '@/constants/types';

/**
 * 열차를 예매하는 함수
 * @param data
 */
export const reserveTrainApi = async (
  data: ReserveTrainRequestBody,
): Promise<CustomReserveTrainResponse> => {
  const response = await axios.post<ReserveTrainResponse>(
    'api/reservation',
    data,
  );

  return { status: '열차 예매 성공', price: response.data.price };
};
