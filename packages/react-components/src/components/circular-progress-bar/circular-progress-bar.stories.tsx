import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import { Box } from '../box';
import { ChangingProgressProvider } from './changing-progress-provider';
import { CircularProgressBar, buildStyles } from './circular-progress-bar';

const story = {
  title: 'Circular Progress Bar',
  component: CircularProgressBar,
};

const percentage = 66;

export default story;

export const Default: Story = () => {
  return (
    <Box style={{ width: '200px', height: '200px' }}>
      <CircularProgressBar value={percentage} text={`${percentage}%`} />
    </Box>
  );
};

export const StrokeWidth: Story = () => {
  return (
    <Box style={{ width: '200px', height: '200px' }}>
      <CircularProgressBar value={percentage} text={`${percentage}%`} strokeWidth={5} />
    </Box>
  );
};

export const SquareLinecaps: Story = () => {
  return (
    <Box style={{ width: '200px', height: '200px' }}>
      <CircularProgressBar
        value={percentage}
        text={`${percentage}%`}
        styles={buildStyles({ strokeLinecap: 'butt' })}
      />
    </Box>
  );
};

export const CustomColors: Story = () => {
  return (
    <Box style={{ width: '200px', height: '200px' }}>
      <CircularProgressBar
        value={percentage}
        text={`${percentage}%`}
        styles={buildStyles({
          textColor: 'red',
          pathColor: 'turquoise',
          trailColor: 'gold',
        })}
      />
    </Box>
  );
};

export const TextSize: Story = () => {
  return (
    <Box style={{ width: '200px', height: '200px' }}>
      <CircularProgressBar
        value={percentage}
        text={`${percentage}%`}
        styles={buildStyles({ textSize: '14px' })}
      />
    </Box>
  );
};

export const Rotation: Story = () => {
  return (
    <Box style={{ width: '200px', height: '200px' }}>
      <CircularProgressBar
        value={percentage}
        text={`${percentage}%`}
        styles={buildStyles({ rotation: 0.5 + (1 - percentage / 100) / 2 })}
      />
    </Box>
  );
};

// Animation stories
export const DefaultAnimationSpeed: Story = () => {
  return (
    <Box style={{ width: '200px', height: '200px' }}>
      <ChangingProgressProvider values={[0, 20, 40, 60, 80, 100]}>
        {(percentage) => (
          <CircularProgressBar value={percentage} text={`${percentage}%`} />
        )}
      </ChangingProgressProvider>
    </Box>
  );
};

export const CustomAnimationSpeed: Story = () => {
  return (
    <Box style={{ width: '200px', height: '200px' }}>
      <ChangingProgressProvider values={[0, 20, 40, 60, 80, 100]}>
        {(percentage) => (
          <CircularProgressBar
            value={percentage}
            text={`${percentage}%`}
            styles={buildStyles({ pathTransitionDuration: 0.15 })}
          />
        )}
      </ChangingProgressProvider>
    </Box>
  );
};

export const NoAnimationWhenReturningToZero: Story = () => {
  return (
    <Box style={{ width: '200px', height: '200px' }}>
      <ChangingProgressProvider values={[0, 100]}>
        {(percentage) => (
          <CircularProgressBar
            value={percentage}
            text={`${percentage}%`}
            styles={buildStyles({
              pathTransition: percentage === 0 ? 'none' : 'stroke-dashoffset 0.5s ease 0s',
            })}
          />
        )}
      </ChangingProgressProvider>
    </Box>
  );
};
