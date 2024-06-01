import axios from 'axios';
import {
  SearchTrainRequestBody,
  SearchTrainResponse,
  TicketInfo,
} from '@/constants/types';

/**
 * 예매 가능한 열차를 조회하는 함수
 * @param data
 */
export const searchTrainApi = async (
  data: SearchTrainRequestBody,
): Promise<TicketInfo | undefined> => {
  const response = await axios.post<SearchTrainResponse[]>('api/search', data);

  if (!response.data || response.data.length === 0) {
    return undefined;
  }

  const t = response.data[0];

  return {
    departure: t.dep_name,
    destination: t.arr_name,
    departureDate: t.dep_date,
    departureTime: t.dep_time,
    price: t.reserve_possible_name,
  };
};
