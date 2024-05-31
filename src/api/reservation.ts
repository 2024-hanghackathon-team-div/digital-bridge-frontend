import axios from 'axios';
import {
  ReserveTrainRequestBody,
  ReserveTrainResponse,
} from '@/constants/types';

/**
 * 열차를 예매하는 함수
 * @param data
 */
export const reserveTrainApi = async (data: ReserveTrainRequestBody) => {
  const response = await axios.post<ReserveTrainResponse>(
    '/api/reservation',
    data,
  );

  return response.data.price;
};
