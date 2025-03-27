import React, { useState } from 'react';
import Select, { components, GroupBase, OptionProps, StylesConfig } from 'react-select';
import { Input, ThemeProvider } from '@material-ui/core';
import { Checkbox, useTheme } from '@map-colonies/react-core';
import { useMappedMuiTheme } from '../theme';

export type MultiSelectOption = {
  value: string;
  label: string;
  color?: string;
  disabled?: boolean;
};

interface IPropsMultiSelection {
  options: MultiSelectOption[];
  values?: MultiSelectOption[];
  onChange?: (data: any) => void;
  placeholder?: string;
  styles?: StylesConfig<unknown, false, GroupBase<unknown>>;
}

const Option: React.FC<OptionProps> = (props) => {
  return (
    <components.Option {...props}>
      <Checkbox label={props.label} checked={props.isSelected} />
    </components.Option>
  );
};

const SelectWrapped = (props: any) => {
  const { styles } = props;

  return <Select isMulti components={{ Option }} styles={styles} isClearable hideSelectedOptions={false} closeMenuOnSelect={false} {...props} />;
};

export const MultiSelection = (props: IPropsMultiSelection) => {
  const { values, options, onChange, placeholder, styles } = props;
  const theme: { [key: string]: string } = useTheme();
  const themeMui = useMappedMuiTheme(theme);
  const [value, setValue] = useState(values);

  const handleChange = (data: any) => {
    setValue(data);
    onChange && onChange(data);
  };

  return (
    <ThemeProvider theme={themeMui}>
      <Input
        multiline
        fullWidth
        disableUnderline
        inputComponent={SelectWrapped}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        id="react-select-single"
        inputProps={{
          styles,
          options,
        }}
      />
    </ThemeProvider>
  );
};

export default MultiSelection;
