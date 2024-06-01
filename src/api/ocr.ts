import axios from 'axios';
import { CardInfo } from '@/constants/types';

/**
 * 카드 사진으로부터 카드 정보를 읽어오는 API
 * @param blob: Blob
 */
export const readCardInfoApi = async (blob: Blob): Promise<CardInfo> => {
  const formData = new FormData();
  formData.append('file', blob, 'card.jpg');

  const response = await axios.post<CardInfo>(
    '/api/extract_card_info',
    formData,
  );

  return response.data;
};
