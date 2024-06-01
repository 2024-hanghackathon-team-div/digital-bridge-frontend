import styled from '@emotion/styled';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

const ReservationsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px auto 0;
  width: 500px;
  height: 300px;
  padding: 10px;
  background-color: #dfe0f3;
  border-radius: 10px;
`;

const ReservationDateWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 10px;
`;

const Reservation = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 40%;
  height: 80%;
  padding: 10px;
  background-color: #fffbfe;
  border-radius: 10px;
  p {
    margin: 10px 0;
    font-size: 24px;
    span {
      font-weight: bold;
    }
  }
`;

interface Props {
  departure: string;
  destination: string;
  departureTime: string;
  destinationTime: string;
  departureDate: string;
}

const ReservationConfirm = ({
  departure,
  destination,
  departureTime,
  departureDate,
  destinationTime,
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
    <div hidden={!parsedDepartureDate}>
      <ReservationDateWrapper>
        {/* <ReservationDateWrapper> */}
        {parsedDepartureDate
          ? `${parsedDepartureDate.month}월 ${parsedDepartureDate.date}일`
          : ''}
      </ReservationDateWrapper>
      <ReservationsContainer>
        <Reservation>
          <p>
            출발지 <span>{departure}</span>
          </p>
          <p>
            출발 시간 <span>{parseTimeString(departureTime)}</span>
          </p>
        </Reservation>
        <TrendingFlatIcon
          style={{ fontSize: '48px', fontWeight: 'bold', color: 'white' }}
        />
        <Reservation>
          <p>
            도착지 <span>{destination}</span>
          </p>
          <p>
            도착 시간 <span>{parseTimeString(destinationTime)}</span>
          </p>
        </Reservation>
      </ReservationsContainer>
    </div>
  );
};

const parseTimeString = (time: string) => {
  const hour = time.slice(0, 2);
  const minute = time.slice(2, 4);
  return `${hour}시 ${minute}분`;
};

export default ReservationConfirm;
