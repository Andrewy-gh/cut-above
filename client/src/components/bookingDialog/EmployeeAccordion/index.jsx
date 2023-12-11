import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import styles from './styles.module.css';

export default function EmployeeAccordion({ children }) {
  return (
    <Accordion style={{ backgroundColor: '#393939' }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <div className={`body2 ${styles.yellow}`}>Choose an employee: </div>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
}
