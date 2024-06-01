import styled from '@emotion/styled';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

const ReservationsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  width: 200px;
  height: 100px;
  padding: 10px;
  background-color: #d8cee2;
  border-radius: 10px;
`;

const Reservation = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 80%;
  padding: 10px;
  background-color: #fffbfe;
  border-radius: 10px;
`;

const ReservationDateWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 200px;
  padding: 10px;
`;

interface Props {
  departure: string;
  destination: string;
  departureTime: string;
  departureDate: string;
}

const ReservationConfirm = ({
  departure,
  destination,
  departureTime,
  departureDate,
}: Props) => {
  const getParsedDepartureDate = (departureDate: string) => {
    if (!departureDate) {
      return undefined;
    }
    return {
      month: departureDate.slice(4, 6),
      date: departureDate.slice(6, 8),
    };
  };
  const parsedDepartureDate = getParsedDepartureDate(departureDate);
  return (
    <>
      <ReservationDateWrapper hidden={!parsedDepartureDate}>
        {parsedDepartureDate
          ? `${parsedDepartureDate.month}월 ${parsedDepartureDate.date}일`
          : ''}
      </ReservationDateWrapper>
      <ReservationsContainer>
        <Reservation>
          <p>출발지 {departure}</p>
          <p>출발 시간 {departureTime}</p>
        </Reservation>
        <TrendingFlatIcon />
        <Reservation>
          <p>도착지 {destination}</p>
          <p>도착 시간 {departureTime}</p>
        </Reservation>
      </ReservationsContainer>
    </>
  );
};

export default ReservationConfirm;
