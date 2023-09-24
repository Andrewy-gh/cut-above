import { useSelector } from 'react-redux';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { selectEmployee } from '../../features/filterSlice';
import { selectEmployeeById } from '../../features/employeeSlice';

export default function EmployeeAccordion({ children }) {
  // const employeeId = useSelector(selectEmployee);
  // const employee = useSelector((state) =>
  //   selectEmployeeById(state, employeeId)
  // );
  return (
    <Accordion style={{ backgroundColor: '#393939' }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Choose an employee: </Typography>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
}
