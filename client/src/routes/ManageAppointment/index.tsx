import { useNavigate } from 'react-router';

import ApptTitle from '@/components/ApptCard/ApptTitle';
import ButtonDialog from '@/components/ButtonDialog';
import CustomDialogContent from '@/components/CustomDialogContent';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  useCancelManagedAppointmentMutation,
  useGetManagedAppointmentQuery,
} from '@/features/appointments/apptApiSlice';
import { useAppointmentAccessToken } from '@/hooks/useAppointmentAccessToken';
import { useDialog } from '@/hooks/useDialog';
import { useNotification } from '@/hooks/useNotification';
import styles from '@/routes/AppointmentPage/styles.module.css';

const createModifyDialog = (
  service: string,
  person: string,
  date: string,
  start: string
) => ({
  button: 'Modify',
  title: `Are you sure you want to modify your ${service}?`,
  content: `With ${person} on ${date} at ${start}?`,
});

const createCancelDialog = (
  service: string,
  person: string,
  date: string,
  start: string
) => ({
  button: 'Cancel',
  title: `Are you sure you want to cancel your ${service}?`,
  content: `With ${person} on ${date} at ${start}?`,
});

export default function ManageAppointmentPage() {
  const navigate = useNavigate();
  const token = useAppointmentAccessToken();
  const { handleSuccess, handleError } = useNotification();
  const modifyDialog = useDialog();
  const cancelDialog = useDialog();
  const [cancelAppointment] = useCancelManagedAppointmentMutation();
  const { data: appointment, isLoading } = useGetManagedAppointmentQuery(token, {
    enabled: token != null,
  });

  if (!token) {
    throw new Error('Appointment access link is invalid or has expired.');
  }

  if (isLoading || !appointment) {
    return <LoadingSpinner />;
  }

  const contactName =
    appointment.employee && typeof appointment.employee !== 'string'
      ? appointment.employee.firstName
      : 'your barber';

  const handleBeginRescheduling = () => {
    navigate(`/manage-appointment/reschedule?token=${encodeURIComponent(token)}`);
  };

  const handleCancel = async () => {
    try {
      const cancelledAppointment = await cancelAppointment({ token });
      if (cancelledAppointment.success) {
        handleSuccess(cancelledAppointment.message);
        navigate('/cancellation');
      }
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <>
      <h4 className="text-center">Manage Your Appointment</h4>
      <div className="container-lg">
        <div className={styles.appointment_card}>
          <div className={styles.flex_col}>
            <div>
              <ApptTitle appointment={appointment} />
              <div>{contactName}</div>
            </div>
          </div>
          <div className={styles.gap_4}>
            <div className="grow-0">
              <ButtonDialog
                buttonText="Modify"
                open={modifyDialog.open}
                handleOpen={modifyDialog.handleOpen}
                handleClose={modifyDialog.handleClose}
              >
                <CustomDialogContent
                  dialog={createModifyDialog(
                    appointment.service,
                    contactName,
                    appointment.date ?? '',
                    appointment.start
                  )}
                  handleAgree={handleBeginRescheduling}
                  handleClose={modifyDialog.handleClose}
                />
              </ButtonDialog>
            </div>
            <div className="grow-0">
              <ButtonDialog
                buttonText="Cancel"
                open={cancelDialog.open}
                handleOpen={cancelDialog.handleOpen}
                handleClose={cancelDialog.handleClose}
              >
                <CustomDialogContent
                  dialog={createCancelDialog(
                    appointment.service,
                    contactName,
                    appointment.date ?? '',
                    appointment.start
                  )}
                  handleAgree={handleCancel}
                  handleClose={cancelDialog.handleClose}
                />
              </ButtonDialog>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
