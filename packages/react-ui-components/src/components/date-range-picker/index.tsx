import { useEffect } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import datePickerHebrewLocale from 'date-fns/locale/he';
import moment from 'moment';
import { ExtractProps } from '../typeHelpers';
import { TextField } from '../textfield';

type OriginalPickerProps = ExtractProps<typeof DatePicker>;

export interface TimeRangeInputProps {
  setStartDate?: (startDate: Date | null) => void;
  setEndDate?: (endDate: Date | null) => void;
  startDate?: Date | null;
  endDate?: Date | null;
  timeRangeInputsWrapperClassName?: string;
  startTimeWrapperClassName?: string;
  endTimeWrapperClassName?: string;
  startTimeInputClassName?: string;
  endTimeInputClassName?: string;
  startTimeLabel?: string;
  endTimeLabel?: string;
}

export interface DateRangePickerProps extends Omit<OriginalPickerProps & TimeRangeInputProps, 'onChange'> {
  locale?: 'he' | 'en';
  onChange?: (date: Date | [Date | null, Date | null] | null, event?: React.SyntheticEvent<any>) => void;
}

export const TimeRangeInput: React.FC<TimeRangeInputProps> = ({
  setEndDate = () => {},
  setStartDate = () => {},
  endDate,
  startDate,
  endTimeInputClassName = '',
  endTimeLabel = '',
  endTimeWrapperClassName = '',
  timeRangeInputsWrapperClassName = '',
  startTimeInputClassName = '',
  startTimeLabel = '',
  startTimeWrapperClassName = '',
}) => {
  return (
    <div className={`timeRangeWrapper ${timeRangeInputsWrapperClassName}`}>
      <div className={`startTimeWrapper ${startTimeWrapperClassName}`}>
        <TextField
          label={startTimeLabel}
          disabled={startDate === null}
          className={`timeRangeInput ${startTimeInputClassName}`}
          name="start-time"
          type={'time'}
          value={moment(startDate).format('HH:mm')}
          onChange={(e) => {
            const dateStartMoment = moment(startDate);
            const startTime = moment(e.currentTarget.value, 'HH:mm');
            const withTime = dateStartMoment.set({
              hours: startTime.get('hours'),
              minutes: startTime.get('minutes'),
            });
            setStartDate(withTime.toDate());
          }}
        />
      </div>

      <div className={`endTimeWrapper ${endTimeWrapperClassName}`}>
        <TextField
          label={endTimeLabel}
          disabled={endDate === null}
          className={`timeRangeInput ${endTimeInputClassName}`}
          name="end-time"
          type={'time'}
          value={moment(endDate).format('HH:mm')}
          onChange={(e) => {
            const dateEndMoment = moment(endDate);
            const endTime = moment(e.currentTarget.value, 'HH:mm');
            const withTime = dateEndMoment.set({
              hours: endTime.get('hours'),
              minutes: endTime.get('minutes'),
            });
            setEndDate(withTime.toDate());
          }}
        />
      </div>
    </div>
  );
};

export const DateRangePicker: React.FC<DateRangePickerProps> = (props) => {
  useEffect(() => {
    if (props.locale === 'he') {
      // Register external locale hebrew data from date-fns.
      registerLocale('he', datePickerHebrewLocale);
    }
  }, [props.locale]);

  const {
    // Time range input props
    endTimeInputClassName,
    endTimeLabel,
    endTimeWrapperClassName,
    timeRangeInputsWrapperClassName,
    startTimeInputClassName,
    startTimeLabel,
    startTimeWrapperClassName,
    calendarClassName,
    // ---------------
    dayClassName,
    monthClassName,
    setStartDate,
    setEndDate,
    endDate,
    startDate,
    selectsRange,
    onChange
  } = props;

  return (
    <DatePicker
      {...props}
      calendarClassName={`pickerCalendar ${calendarClassName}`}
      weekDayClassName={(date) => {
        return `pickerWeek ${dayClassName?.(date) ?? ''}`;
      }}
      dayClassName={(date) => {
        return `pickerDay ${dayClassName?.(date) ?? ''}`;
      }}
      monthClassName={(date) => {
        return `pickerMonth ${monthClassName?.(date) ?? ''}`;
      }}
      onChange={(date, event) => {
        if (date) {
          if (Array.isArray(date) && setStartDate && setEndDate) {
            const [start, end] = date;
            setStartDate(start);
            setEndDate(end);
          }
        }

        onChange?.(date, event);
      }}
    >
      {setEndDate && setStartDate && selectsRange && (
        <TimeRangeInput
          timeRangeInputsWrapperClassName={timeRangeInputsWrapperClassName}
          startTimeWrapperClassName={startTimeWrapperClassName}
          endTimeWrapperClassName={endTimeWrapperClassName}
          startTimeInputClassName={startTimeInputClassName}
          endTimeInputClassName={endTimeInputClassName}
          endTimeLabel={endTimeLabel}
          startTimeLabel={startTimeLabel}
          endDate={endDate}
          startDate={startDate}
          setEndDate={setEndDate}
          setStartDate={setStartDate}
        />
      )}
    </DatePicker>
  );
};
