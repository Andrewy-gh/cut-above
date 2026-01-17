import DialogContent from '@mui/material/DialogContent';
import CustomDialog from '../../../components/CustomDialog';
import BookingDialogContent from '../BookingDialogContent';

import { useFilter } from '@/hooks/useFilter';
import EmployeeAccordion from '../EmployeeAccordion';
import EmployeeRadio from '../EmployeeRadio';
import EmployeeEdit from '../EmployeeEdit';

import { Slot } from '@/types';

interface BookingDialogProps {
  open: boolean;
  selection: Slot | Record<string, never>;
  handleAgree: () => void;
  handleClose: () => void;
}

export default function BookingDialog({
  open,
  selection,
  handleAgree,
  handleClose,
}: BookingDialogProps) {
  const { employee, handleEmployeeChange } = useFilter();
  let employeeOptions;
  if (!employee) {
    employeeOptions = (
      <EmployeeAccordion>
        {'available' in selection && (
          <EmployeeRadio employees={selection.available} />
        )}
      </EmployeeAccordion>
    );
  } else {
    employeeOptions = (
      <EmployeeEdit
        employee={employee}
        handleClick={() => handleEmployeeChange(undefined)}
      />
    );
  }
  return (
    <CustomDialog open={open}>
      <BookingDialogContent
        selection={selection}
        handleAgree={handleAgree}
        handleClose={handleClose}
      >
        <DialogContent>{employeeOptions}</DialogContent>
      </BookingDialogContent>
    </CustomDialog>
  );
}
