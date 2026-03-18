import dayjs from 'dayjs';

import DatePicker from '@/components/DatePickers/DatePicker';
import EmployeeSelect from '../EmployeeSelect';
import ServiceSelect from '../ServiceSelect';
import AvailableTimes from '../AvailableTimes';

import { useFilter } from '@/hooks/useFilter';
import { getCurrentDateTime, getOneMonthFromCurrent } from '@/utils/date';
import { Slot } from '@/types';
import type { Employee } from '@/features/employeeSlice';

import styles from './styles.module.css';

interface BookingFormProps {
  handleOpen: (data: Slot | Record<string, never>) => void;
  employee: Employee | undefined;
  timeSlots: Slot[];
}

export default function BookingForm({
  handleOpen,
  employee,
  timeSlots,
}: BookingFormProps) {
  const { date, handleDateChange } = useFilter();
  return (
    <>
      <div className={styles.container}>
        <div className={styles.field_group}>
          <span className={styles.section_label}>Barber</span>
          <EmployeeSelect />
        </div>

        <div className={styles.section_divider} />

        <div className={styles.field_group}>
          <span className={styles.section_label}>Service</span>
          <ServiceSelect />
        </div>

        <div className={styles.section_divider} />

        <div className={styles.field_group}>
          <span className={styles.section_label}>Date</span>
          <div className={styles.date_wrapper}>
            <DatePicker
              date={dayjs(date)}
              handleDateChange={handleDateChange}
              minDate={getCurrentDateTime()}
              maxDate={getOneMonthFromCurrent()}
            />
          </div>
        </div>
      </div>
      <AvailableTimes
        timeSlots={timeSlots}
        openDialog={handleOpen}
        employee={employee}
      />
    </>
  );
}
