import styled from '@emotion/styled';

const TranscriptBox = ({ content }: { content: string }) => {
  const splitted = linebreak(content);
  return (
    <Wrapper>
      {splitted.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </Wrapper>
  );
};

const linebreak = (content: string) => {
  const lineEndRegex = /([.!?]|\r\n|\r|\n)/g;
  return content
    .split(lineEndRegex)
    .reduce((acc: string[], part, index, array) => {
      if (lineEndRegex.test(part) && index !== array.length - 1) {
        acc[acc.length - 1] += part;
      } else {
        acc.push(part);
      }
      return acc;
    }, []);
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  text-align: center;
  font-size: 40px;
  font-weight: bold;
  white-space: normal;
  word-wrap: break-word;
  padding: 30px 20px;
`;

export default TranscriptBox;
