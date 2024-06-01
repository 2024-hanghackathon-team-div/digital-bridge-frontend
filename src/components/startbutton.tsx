import { Box, Typography, Button } from '@mui/material';

const StartButton = ({ onClick }: { onClick: () => void | Promise<void> }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '700px',
        margin: '0 auto',
        textAlign: 'center',
      }}
    >
      <Typography variant='h4' gutterBottom>
        KTX 예매 도우미
      </Typography>
      <Button
        onClick={onClick}
        sx={{
          width: '33%',
          background: 'linear-gradient(to right, #6a11cb, #2575fc)',
          color: 'white',
          padding: '10px 20px',
          fontSize: '1.2rem',
          '&:hover': {
            background: 'linear-gradient(to right, #5a0ea4, #1e5dbc)',
          },
          borderRadius: '15px',
        }}
      >
        시작하기
      </Button>
    </Box>
  );
};

export default StartButton;
