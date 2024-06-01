import styled from '@emotion/styled';
import CameraComponent from '@/components/camera';
import { readCardInfoApi } from '@/api/ocr';
import { paymentApi } from '@/api/payment';
import { useState } from 'react';
import Loader from '@/components/loading';

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

function Step5_OCR() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [process, setProcess] = useState<'ocr' | 'payment'>('ocr');

  // 신용카드 사진을 찍으면 OCR로 데이터를 읽어온 다음 결제 API로 전송
  const handleCapture = async (blob: Blob) => {
    setIsLoading(true);
    const cardInfo = await readCardInfoApi(blob);
    cardInfo.card_number = cardInfo.card_number.replaceAll(' ', '');
    setProcess('payment');
    return await paymentApi(cardInfo);
    setIsLoading(false);
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
