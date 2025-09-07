import { useState } from 'react';
import { MultiSelection } from './multi-selection';
import { CSFStory } from '../utils/story';

const colourOptions = [
  { value: 'ocean', label: 'Ocean', color: '#00B8D9' },
  { value: 'blue', label: 'Blue', color: '#0052CC', disabled: true },
  { value: 'purple', label: 'Purple', color: '#5243AA' },
  { value: 'red', label: 'Red', color: '#FF5630' },
  { value: 'orange', label: 'Orange', color: '#FF8B00' },
  { value: 'yellow', label: 'Yellow', color: '#FFC400' },
  { value: 'green', label: 'Green', color: '#36B37E' },
  { value: 'forest', label: 'Forest', color: '#00875A' },
  { value: 'slate', label: 'Slate', color: '#253858' },
  { value: 'silver', label: 'Silver', color: '#666666' },
];

const customStyles = {
  control: (provided: any) => ({
    ...provided,
    backgroundColor: 'lightgray',
    padding: '5px 10px',
    border: '1px solid black',
    boxShadow: '0 2px 4px rgba(0,0,0,.2)',
  }),
  option: (provided: any, state: { isSelected: any }) => ({
    ...provided,
    borderBottom: '1px dotted pink',
    cursor: 'pointer',
    color: state.isSelected ? 'white' : 'black',
    backgroundColor: state.isSelected ? 'hotpink' : 'white',
  }),
  menu: (styles: any) => {
    return {
      ...styles,
      width: '98%',
      marginTop: '0px',
    };
  },
  menuList: (styles: any) => {
    return {
      ...styles,
      paddingTop: 0,
      paddingBottom: 0,
    };
  },
  input: (styles: any) => {
    return {
      ...styles,
      marginRight: 'auto',
      color: 'rgba(255, 255, 255, 0.7)',
      direction: 'rtl',
      textAlign: 'rtl',
      position: 'relative',
      left: '-800px',
    };
  },
  dropdownIndicator: (styles: any) => {
    return {
      ...styles,
      padding: '0',
      width: '14px',
      color: '#24aee9',
    };
  },
  clearIndicator: (styles: any) => {
    return {
      ...styles,
      padding: '0',
      width: '14px',
      color: '#24aee9',
    };
  },
};

export default {
  title: 'Multi Selection',
  component: MultiSelection,
};

export const MultiSelectionArea: CSFStory<JSX.Element> = () => {
  const [selectedOptions, setSelectedOptions] = useState([{ value: 'blue', label: 'Blue', color: '#0052CC', disabled: true }]);

  const handleMultiChange = (selected: any) => {
    console.log('Selected options:', selected);
    setSelectedOptions(selected);
  };

  return (
    <>
      <h1>Multi Selection with native HTML TEXTAREA</h1>
      <MultiSelection
        options={colourOptions}
        values={selectedOptions}
        onChange={(e) => handleMultiChange(e)}
        placeholder={'Select Your Colours'}
        styles={customStyles}
      />
    </>
  );
};

MultiSelectionArea.story = {
  name: 'Multi Selection with TEXTAREA HTML',
};
