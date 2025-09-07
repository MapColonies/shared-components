import React from 'react';
import { TextField, Button } from '@map-colonies/react-core';
import { forwardRef, useEffect, useMemo, useState } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import datePickerHebrewLocale from 'date-fns/locale/he';
import moment from 'moment';
import { endOfDay, isSameDay } from 'date-fns';
import { ExtractProps } from '../typeHelpers';

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
  id: string;
  label: string;
  startDate: Date;
  endDate: Date;
}

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export const isDateRange = (date?: DateRange | Date | null): date is DateRange => {
  return typeof date !== 'undefined' && date !== null && 'startDate' in date && 'endDate' in date;
};

type DateRangePickerPropsToExclude =
  | 'selectsRange'
  | 'onChange'
  | 'customTimeInput'
  | 'timeInputLabel'
  | 'setStartDate'
  | 'setEndDate'
  | 'dropdownMode'
  | 'showYearDropdown'
  | 'showMonthDropdown'
  | 'scrollableMonthYearDropdown'

export interface ExtraDateRangePickerProps {
  locale?: 'he' | 'en';
  onChange?: (date: DateRange | Date | null, event?: React.SyntheticEvent<any>) => void;
  // withTimeRange?: boolean;
  withShortcuts?: (Shortcut | (() => Shortcut))[];
  selectsRange?: boolean;
  inputName?: string;
}

export type DateRangeFullProps = Omit<ExtractProps<typeof DatePicker>, DateRangePickerPropsToExclude> & ExtraDateRangePickerProps;
  
interface ShortcutsProps {
  setStartDate?: (startDate: Date | null) => void;
  setEndDate?: (endDate: Date | null) => void;
  onShortcut?: (shortcutRange: DateRange) => void;
  shortcuts: (Shortcut | (() => Shortcut))[];
  dateRange: DateRange;
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

const CustomInput = forwardRef<HTMLInputElement, React.HTMLProps<HTMLInputElement> & { onInputClick?: () => void }>(
  ({ value, onClick, onInputClick: clickSideEffect, ...props }, ref) => (
    <TextField
      {...props}
      className="dateRangeCustomInput"
      readOnly
      onClick={(e) => {
        onClick?.(e);
        clickSideEffect?.();
      }}
      ref={ref}
      value={value as string}
    />
  )
);

const ShortcutsContainer: React.FC<ShortcutsProps> = ({ setStartDate = () => {}, setEndDate = () => {}, shortcuts, dateRange, onShortcut }) => {
  const [shortcutSelectedId, setShortcutSelectedId] = useState<string>();
  const shortcutsList = useMemo(
    () => shortcuts.map((shortcutOrFunction) => (shortcutOrFunction instanceof Function ? shortcutOrFunction() : shortcutOrFunction)),
    [shortcuts]
  );

  useEffect(() => {
    for (const shortcut of shortcutsList) {
      const isSelectedRangeAsShortcut =
        dateRange.startDate &&
        dateRange.endDate &&
        isSameDay(shortcut.startDate, dateRange.startDate) &&
        isSameDay(shortcut.endDate, dateRange.endDate);

      if (shortcutSelectedId) {
        if (shortcut.id === shortcutSelectedId) {
          if (!isSelectedRangeAsShortcut) {
            setShortcutSelectedId(undefined);
          }
        }
      } else if (isSelectedRangeAsShortcut) {
        setShortcutSelectedId(shortcut.id);
      }
    }
  }, [dateRange, shortcutSelectedId, shortcutsList]);

  return (
    <div className="shortcutsContainer">
      {shortcutsList.map((shortcut, i) => {
        const handleShortcutClick: React.MouseEventHandler<HTMLButtonElement> = () => {
          setStartDate(shortcut.startDate);
          setEndDate(shortcut.endDate);
        };

        return (
          <Button
            type="button"
            className={`shortcut ${shortcutSelectedId === shortcut.id ? 'selected' : ''}`}
            key={shortcut.id + i}
            onClick={(e) => {
              handleShortcutClick(e);
              onShortcut?.({startDate: shortcut.startDate, endDate: shortcut.endDate});
            }}
            // unelevated
            // ripple={false}
            outlined
          >
            {shortcut.label}
          </Button>
        );
      })}
    </div>
  );
};

export const DateRangePicker = React.forwardRef<DatePicker, DateRangeFullProps>((
  props,
  ref
) => {
  const {
    // Time range input props
    // endTimeInputClassName,
    // endTimeLabel,
    // endTimeWrapperClassName,
    // timeRangeInputsWrapperClassName,
    // startTimeInputClassName,
    // startTimeLabel,
    // startTimeWrapperClassName,
    // ---------------
    calendarClassName,
    dayClassName,
    monthClassName,
    selectsRange,
    onChange,
    inputName,
    showMonthYearDropdown,
    // withTimeRange,
    withShortcuts,
    locale = 'en',
  } = props;

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false)
  const date: DateRange | Date | null = selectsRange ? { startDate, endDate } : startDate;

  useEffect(() => {
    if (locale === 'he') {
      // Register external locale hebrew data from date-fns.
      registerLocale('he', datePickerHebrewLocale);
    }
  }, [locale]);

  useEffect(() => {
    if(props.startDate?.toString() !== startDate?.toString()) {
      setStartDate(props.startDate as Date);
    }
    
    if(props.endDate?.toString() !== endDate?.toString()) {
      setEndDate(props.endDate as Date);
    }
    
  }, [props.startDate, props.endDate, startDate, endDate]);


  const containerClassName = useMemo(() => {
    let className = 'pickerContainer' + (locale === 'he' ? ' pickerContainer-rtl' : '');
    
    if (withShortcuts && selectsRange) {
      className += ' pickerContainer-withShortcuts';
    }

    return className;
  }, [locale, withShortcuts, selectsRange]);

  const monthsYearsDropdown = showMonthYearDropdown ? {
    showMonthDropdown: true,
    showYearDropdown: true,
    dropdownMode: "select" as any
  } : {};
  
  return (
      <div className={containerClassName} style={{ direction: locale === 'he' ? 'rtl' : 'ltr' }}>
        <DatePicker
          {...props}
          ref={ref}
          onClickOutside={() => setCalendarOpen(false)}
          open={calendarOpen}
          startDate={isDateRange(date) ? startDate : undefined}
          selected={startDate}
          endDate={isDateRange(date) ? endDate : undefined}
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
          onChange={(newDate, event) => {
            if (Array.isArray(newDate)) {
              const [start, end] = newDate;
              setStartDate(start);
              setEndDate(end);
              
              // endDate should be at 23:59:999.. instead of 00:00:00
              onChange?.({ startDate: start, endDate: end ? endOfDay(end) : end }, event);
            } else {
              setStartDate(newDate);
              onChange?.(newDate, event);
            }
          }}
          customInput={<CustomInput name={inputName} onInputClick={()=> {
            setCalendarOpen(true)
          }} />}
          showTimeInput={!!(withShortcuts && selectsRange)}
          timeInputLabel=""
          customTimeInput={
            withShortcuts &&
            isDateRange(date) && <ShortcutsContainer onShortcut={(shortcutPicked) => {
              onChange?.(shortcutPicked);
              setCalendarOpen(false)
            }} shortcuts={withShortcuts} setEndDate={setEndDate} setStartDate={setStartDate} dateRange={date} />
          }
          // We don't want it, just use it as our own
          showMonthYearDropdown={undefined}
          {...monthsYearsDropdown}

        >
          {/* selectsRange && withTimeRange && isDateRange(date) && (
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
          ) */}
        </DatePicker>
      </div>
  );
}) as React.ForwardRefExoticComponent<DateRangeFullProps>;
