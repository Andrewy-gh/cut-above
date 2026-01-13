import DialogContent from '@mui/material/DialogContent';
import CustomDialog from '../../../components/CustomDialog';
import BookingDialogContent from '../BookingDialogContent';

// @ts-expect-error TS(2307): Cannot find module '@/hooks/useFilter' or its corr... Remove this comment to see the full error message
import { useFilter } from '@/hooks/useFilter';
import EmployeeAccordion from '../EmployeeAccordion';
import EmployeeRadio from '../EmployeeRadio';
import EmployeeEdit from '../EmployeeEdit';

// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from 'prop-types';

// @ts-expect-error TS(2307): Cannot find module '@/utils/propTypes' or its corr... Remove this comment to see the full error message
import { selectionPropType } from '@/utils/propTypes';

export default function BookingDialog({
  open,
  selection,
  handleAgree,
  handleClose
}: any) {
  const { employee, handleEmployeeChange } = useFilter();
  let employeeOptions;
  if (employee === 'any') {
    employeeOptions = (
      <EmployeeAccordion>
        <EmployeeRadio employees={selection.available} />
      </EmployeeAccordion>
    );
  } else {
    employeeOptions = (
      <EmployeeEdit
        employee={employee}
        handleClick={() => handleEmployeeChange('any')}
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

BookingDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  selection: selectionPropType,
  handleAgree: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
};
