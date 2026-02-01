import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import styles from './styles.module.css';

interface EmployeeAccordionProps {
  children: React.ReactNode;
}

export default function EmployeeAccordion({
  children,
}: EmployeeAccordionProps) {
  return (
    <Accordion
      style={{ backgroundColor: '#393939' }}
      slotProps={{ heading: { component: 'h3' } }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <span className={`body2 ${styles.yellow}`}>Choose an employee:</span>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
}
