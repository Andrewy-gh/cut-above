import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import styles from './styles.module.css';

interface EmployeeAccordionProps {
  children: React.ReactNode;
}

const accordionSx = {
  background: 'linear-gradient(145deg, #1a1a1a 0%, #1f1f1f 100%)',
  border: '1px solid #2a2a2a',
  borderRadius: '0.625rem !important',
  boxShadow: 'none',
  '&:before': { display: 'none' },
  '&.Mui-expanded': { margin: 0 },
  '& .MuiAccordionSummary-root': {
    fontFamily: 'Nobile, sans-serif',
    color: '#629aa4',
    minHeight: '44px',
    '&.Mui-expanded': { minHeight: '44px' },
  },
  '& .MuiAccordionSummary-content': { margin: '10px 0' },
  '& .MuiAccordionSummary-expandIconWrapper': { color: '#629aa4' },
  '& .MuiAccordionDetails-root': {
    borderTop: '1px solid #2a2a2a',
    paddingTop: '1rem',
  },
};

export default function EmployeeAccordion({
  children,
}: EmployeeAccordionProps) {
  return (
    <Accordion sx={accordionSx} slotProps={{ heading: { component: 'h3' } }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <span className={styles.accordion_label}>
          Choose a barber
        </span>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
}
