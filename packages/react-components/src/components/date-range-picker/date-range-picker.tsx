import React, { useState, useEffect } from 'react';
import { isValid, isBefore } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker, KeyboardDateTimePicker } from '@material-ui/pickers';
import { ThemeProvider } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { Button, ThemeProvider as RmwcThemeProvider, useTheme } from '@map-colonies/react-core';
import { Box } from '../box';
import DEFAULTS from '../models/defaults';
import { SupportedLocales } from '../models/enums';
import { useMappedMuiTheme } from '../theme';

import './date-range-picker.css';

const CONTAINER_SPACING_FACTOR = 2;
const MARGIN_LEFT_FACTOR = 0.5;

const useStyle = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      padding: theme.spacing(CONTAINER_SPACING_FACTOR),
      alignItems: 'center',
    },
    setButton: {
      marginTop: theme.spacing(1),
    },
    margin: {
      marginLeft: theme.spacing(MARGIN_LEFT_FACTOR),
    },
  })
);

interface DateTimeRangePickerProps {
  onChange: (dateRange: { from?: Date; to?: Date }) => void;
  from?: Date;
  to?: Date;
  dateFormat?: string;
  controlsLayout?: string;
  contentWidth?: number;
  disableFuture?: boolean;
  maxDate?: string | number | Date | null | undefined;
  minDate?: string | number | Date | null | undefined;
  showTime?: boolean;
  local?: {
    setText?: string;
    startPlaceHolderText?: string;
    endPlaceHolderText?: string;
    calendarLocale?: SupportedLocales;
  };
}

export const DateTimeRangePicker: React.FC<DateTimeRangePickerProps> = (props) => {
  const classes = useStyle();
  const theme: { [key: string]: string } = useTheme();
  const themeMui = useMappedMuiTheme(theme);
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  const [dateFormat, setDateFormat] = useState<string>(DEFAULTS.DATE_RANGE_PICKER.dateFormat);

  const flexDirection = props.controlsLayout ?? DEFAULTS.DATE_RANGE_PICKER.controlsLayout;
  const disableFuture = props.disableFuture ?? DEFAULTS.DATE_RANGE_PICKER.disableFuture;
  const startPlaceHolderText = props.local?.startPlaceHolderText ?? DEFAULTS.DATE_RANGE_PICKER.local.startPlaceHolderText;
  const endPlaceHolderText = props.local?.endPlaceHolderText ?? DEFAULTS.DATE_RANGE_PICKER.local.endPlaceHolderText;
  const setText = props.local?.setText ?? DEFAULTS.DATE_RANGE_PICKER.local.setText;
  const calendarLocale = props.local?.calendarLocale ?? DEFAULTS.DATE_RANGE_PICKER.local.calendarLocale;
  const showTime = props.showTime ?? DEFAULTS.DATE_RANGE_PICKER.showTime;

  const locale = calendarLocale === SupportedLocales.HE ? he : enUS;

  useEffect(() => {
    setFrom(props.from ?? null);
  }, [props.from]);

  useEffect(() => {
    setTo(props.to ?? null);
  }, [props.to]);

  useEffect(() => {
    setDateFormat(props.dateFormat ?? DEFAULTS.DATE_RANGE_PICKER.dateFormat);
  }, [props.dateFormat]);

  const isRangeValid = Boolean(
    (isValid(from) && !to) || (isValid(to) && !from) || (from && to && isValid(from) && isValid(to) && isBefore(from, to))
  );

  const onChange = (): void => {
    props.onChange({
      from: from && isValid(from) ? from : undefined,
      to: to && isValid(to) ? to : undefined,
    });
  };

  const PickerComponent = showTime ? KeyboardDateTimePicker : KeyboardDatePicker;

  return (
    <ThemeProvider theme={themeMui}>
      <Box
        className={`${classes.container} drpContainer`}
        display="flex"
        flexDirection={flexDirection}
        width={flexDirection === 'column' ? props.contentWidth : 'unset'}
      >
        <MuiPickersUtilsProvider utils={DateFnsUtils} locale={locale}>
          <PickerComponent
            variant="inline"
            placeholder={startPlaceHolderText}
            onChange={(date): void => setFrom(date as Date)}
            value={from}
            disableFuture={disableFuture}
            format={dateFormat}
            maxDate={props.maxDate}
            minDate={props.minDate}
          />
          <PickerComponent
            variant="inline"
            placeholder={endPlaceHolderText}
            className={classes.margin}
            onChange={(date): void => setTo(date as Date)}
            value={to}
            disableFuture={disableFuture}
            format={dateFormat}
            maxDate={props.maxDate}
            minDate={props.minDate}
          />
          <RmwcThemeProvider options={theme as any}>
            <Button
              className={`${classes.setButton} ${classes.margin}`}
              raised
              // variant="outlined"
              // size="large"
              onClick={onChange}
              disabled={!isRangeValid}
            >
              {setText}
            </Button>
          </RmwcThemeProvider>
        </MuiPickersUtilsProvider>
      </Box>
    </ThemeProvider>
  );
};
