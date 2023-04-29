import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineDot from '@mui/lab/TimelineDot';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import HotelIcon from '@mui/icons-material/Hotel';
import RepeatIcon from '@mui/icons-material/Repeat';
import Typography from '@mui/material/Typography';
import Item from '../Item';
import User from '../../features/user/User';
import date from '../../features/date/date';
import CheckInAppointment from './CheckInAppointment';

const AppointmentItem = ({ appointment }) => {
  return (
    <TimelineItem>
      <TimelineOppositeContent
        sx={{ m: 'auto 0' }}
        align="right"
        variant="body2"
        color="text.secondary"
      >
        <Typography variant="body1" component="div">
          {date.time(appointment.start)}
        </Typography>
      </TimelineOppositeContent>
      <TimelineSeparator>
        <TimelineConnector />
        <TimelineDot>
          <FastfoodIcon />
        </TimelineDot>
        <TimelineConnector />
      </TimelineSeparator>
      <TimelineContent sx={{ py: '12px', px: 2 }}>
        <CheckInAppointment appointment={appointment} />
        {/* <Item>
          <Typography variant="body1" component="div">
            <User userId={appointment.client} />
          </Typography>
          <Typography variant="body1" component="div">
            {appointment.service}
          </Typography>
        </Item> */}
      </TimelineContent>
    </TimelineItem>
  );
};

export default AppointmentItem;
