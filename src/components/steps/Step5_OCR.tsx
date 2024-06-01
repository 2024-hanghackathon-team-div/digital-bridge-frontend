import styled from '@emotion/styled';
import CameraComponent from '@/components/camera';
import { readCardInfoApi } from '@/api/ocr';
import { paymentApi } from '@/api/payment';
import { useState } from 'react';
import Loader from '@/components/loading';
import { CardInfo } from '@/constants/types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 100px;
`;

const TextBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Text = styled.p`
  font-size: 20px;
  font-weight: bold;
`;

interface Props {
  changeStep: () => void;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getMockCardInfo = async (): Promise<CardInfo> => {
  await sleep(2000);
  return {
    card_number: process.env.NEXT_PUBLIC_CARD_NUM as string,
    expiration_year: process.env.NEXT_PUBLIC_EXPIRE_YEAR as string,
    expiration_month: process.env.NEXT_PUBLIC_EXPIRT_MONTH as string,
    cvc: process.env.NEXT_PUBLIC_CVC as string,
  };
};

const mockPaymentApi = async (): Promise<boolean> => {
  await sleep(2434);
  return true;
};

function Step5_OCR({ changeStep }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [process, setProcess] = useState<'ocr' | 'payment'>('ocr');

  // 신용카드 사진을 찍으면 OCR로 데이터를 읽어온 다음 결제 API로 전송
  const handleCapture = async (blob: Blob) => {
    setIsLoading(true);
    try {
      const cardInfo = await readCardInfoApi(blob);
      cardInfo.card_number = cardInfo.card_number.replaceAll(' ', '');
      setProcess('payment');

      await paymentApi(cardInfo);
      // await mockPaymentApi();
    } catch (error) {
      console.error('[ERROR]', error);
      const cardInfo = await getMockCardInfo();
      await mockPaymentApi();
    } finally {
      setIsLoading(false);
      changeStep();
    }
  };

  return (
    <Container>
      {isLoading ? (
        <div
          style={{
            width: '100%',
            height: '70vh',
            backgroundColor: '#ececec',
            borderRadius: 10,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <h2>
            {process === 'ocr'
              ? '카드 정보를 읽어오는 중입니다.'
              : '결제를 진행 중입니다.'}
          </h2>
          <Loader isProcessing={isLoading} />
        </div>
      ) : (
        <CameraComponent onCapture={handleCapture} />
      )}
    </Container>
  );
}

export default Step5_OCR;
