import styled from '@emotion/styled';

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

function Step1_Route({ text }: { text: string[] }) {
  return (
    <Container>
      <TextBox>
        {text.map((line, index) => (
          <Text key={index}>{line}</Text>
        ))}
      </TextBox>
    </Container>
  );
}

export default Step1_Route;
