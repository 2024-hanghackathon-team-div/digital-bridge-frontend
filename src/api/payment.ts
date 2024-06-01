import axios from 'axios';
import { CardInfo } from '@/constants/types';

/**
 * 신용카드 정보를 바탕으로 결제하는 API
 * @param cardInfo
 */
export const paymentApi = async (cardInfo: CardInfo): Promise<boolean> => {
  const response = await axios.post('/api/pay', cardInfo);

  return response.data;
};
