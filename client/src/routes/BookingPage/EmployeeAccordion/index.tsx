import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// @ts-expect-error TS(2307): Cannot find module './styles.module.css' or its co... Remove this comment to see the full error message
import styles from './styles.module.css';

// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from 'prop-types';

export default function EmployeeAccordion({
  children
}: any) {
  return (
    <Accordion style={{ backgroundColor: '#393939' }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <div className={`body2 ${styles.yellow}`}>Choose an employee: </div>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
}

EmployeeAccordion.propTypes = {
  children: PropTypes.object,
};
