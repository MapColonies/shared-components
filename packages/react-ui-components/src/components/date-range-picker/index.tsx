import { forwardRef, useEffect, useMemo, useState } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import datePickerHebrewLocale from 'date-fns/locale/he';
import moment from 'moment';
import { ExtractProps } from '../typeHelpers';
import { TextField } from '../textfield';
import { Button } from '../button';

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

interface Shortcut {
  id: string,
  label: string,
  startDate: Date,
  endDate: Date
}

export interface DateRangePickerProps extends Omit<OriginalPickerProps & TimeRangeInputProps, 'onChange' | 'customTimeInput' | 'timeInputLabel'> {
  locale?: 'he' | 'en';
  onChange?: (date: Date | [Date | null, Date | null] | null, event?: React.SyntheticEvent<any>) => void;
  withTimeRange?: boolean;
  withShortcuts?: (Shortcut | (() => Shortcut))[];
}

interface ShortcutsProps {
  setStartDate?: (startDate: Date | null) => void;
  setEndDate?: (endDate: Date | null) => void;
  shortcuts: (Shortcut | (() => Shortcut))[]
}

export const TimeRangeInput: React.FC<TimeRangeInputProps> = ({
  endDate,
  startDate,
  setEndDate = () => {},
  setStartDate = () => {},
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

const CustomInput = forwardRef<HTMLInputElement, React.HTMLProps<HTMLInputElement>>(({ value, onClick, ...props }, ref) => (
  <TextField className="dateRangeCustomInput" disabled onClick={onClick} ref={ref} value={value as string} {...props} />
));

const ShortcutsContainer: React.FC<ShortcutsProps> = ({ setStartDate = () => {}, setEndDate = () => {}, shortcuts }) => {
  const [shortcutSelectedId, setShortcutSelectedId] = useState<string>();

  return (
    <div className="shortcutsContainer">
      {shortcuts.map((shortcutOrFunction, i) => {
        const shortcut = shortcutOrFunction instanceof Function ? shortcutOrFunction() : shortcutOrFunction;
        const handleShortcutClick: React.MouseEventHandler<HTMLButtonElement> = () => {
          setStartDate(shortcut.startDate);
          setEndDate(shortcut.endDate);
          setShortcutSelectedId(shortcut.id);
        };

        return (
          <Button className={`shortcut ${shortcutSelectedId === shortcut.id ? 'selected' : ''}`} key={shortcut.id + i} onClick={handleShortcutClick} unelevated ripple={false} outlined>
            {shortcut.label}
          </Button>
        );
      })}
    </div>
  );
}

export const DateRangePicker: React.FC<DateRangePickerProps> = (props) => {

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
    onChange,
    withTimeRange,
    withShortcuts,
    locale = 'en',
  } = props;

  useEffect(() => {
    if (locale === 'he') {
      // Register external locale hebrew data from date-fns.
      registerLocale('he', datePickerHebrewLocale);
    }
  }, [locale]);

  const containerClassName = useMemo(() => {
    let className = locale === 'he' ? 'pickerContainer-rtl' : 'pickerContainer';
    if(withShortcuts) {
      className += ' pickerContainer-withShortcuts'
    }

    return className;
  }, [locale, withShortcuts]) 

  return (
    <div className={containerClassName} style={{ direction: locale === 'he' ? 'rtl' : 'ltr' }}>
      <DatePicker
        {...props}
        monthsShown={props.monthsShown ?? 2}
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
        customInput={<CustomInput />}
        showTimeInput={!!withShortcuts}
        timeInputLabel=""
        customTimeInput={withShortcuts && <ShortcutsContainer shortcuts={withShortcuts} setEndDate={setEndDate} setStartDate={setStartDate} />}
      >
        {setEndDate && setStartDate && selectsRange && withTimeRange && (
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
    </div>
  );
};
