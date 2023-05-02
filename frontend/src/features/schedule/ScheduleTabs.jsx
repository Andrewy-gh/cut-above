import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { selectAllSchedule, useGetScheduleQuery } from './scheduleSlice';
import Item from '../../components/Item';
import User from '../user/User';
import date from '../date/date';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useState } from 'react';

import AppointmentList from '../../components/Admin/AppointmentList';
import AppointmentBoard from '../../components/Admin/AppointmentBoard';

const ScheduleTabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
};

const ScheduleTabs = () => {
  const { isLoading, isSuccess, isError, error } = useGetScheduleQuery();
  const schedule = useSelector(selectAllSchedule);
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  let content;
  if (isLoading) {
    content = <Typography variant="body2">Loading...</Typography>;
  } else if (isSuccess) {
    content = (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            {schedule.map((sc, index) => (
              <Tab label={sc.date} key={index} />
            ))}
          </Tabs>
        </Box>
        {schedule.map((sc, index) => (
          <ScheduleTabPanel value={value} index={index} key={index}>
            <AppointmentBoard appointments={sc.appointments} />
          </ScheduleTabPanel>
        ))}
      </Box>
    );
  } else if (isError) {
    content = <Typography variant="body2">{error}</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" align="center">
        Schedule Tabs
      </Typography>
      {content}
    </Box>
  );
};

export default ScheduleTabs;
