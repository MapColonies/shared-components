import _ from 'lodash';
import React from 'react';
import { easeQuadInOut } from 'd3-ease';
import { Story } from '@storybook/react/types-6-0';
import { AnimatedValuesProvider } from '../animated';
import { Box } from '../box';
import { CircularProgressBar } from './circular-progress-bar';

const story = {
  title: 'Circular Progress Bar',
  component: CircularProgressBar,
};

export default story;

const percentage = 66;

export const Default: Story = () => (
  <Box style={{ width: '200px', height: '200px' }}>
    <CircularProgressBar value={percentage} text={`${percentage}%`} />
  </Box>
);

export const StrokeWidth: Story = () => (
  <Box style={{ width: '200px', height: '200px' }}>
    <CircularProgressBar value={percentage} text={`${percentage}%`} strokeWidth={5} />
  </Box>
);

export const SquareLinecaps: Story = () => (
  <Box style={{ width: '200px', height: '200px' }}>
    <CircularProgressBar
      value={percentage}
      text={`${percentage}%`}
      styles={{ strokeLinecap: 'butt' }}
    />
  </Box>
);

export const CustomColors: Story = () => (
  <Box style={{ width: '200px', height: '200px' }}>
    <CircularProgressBar
      value={percentage}
      text={`${percentage}%`}
      styles={{
        textColor: 'red',
        pathColor: 'turquoise',
        trailColor: 'gold',
      }}
    />
  </Box>
);

export const TextSize: Story = () => (
  <Box style={{ width: '200px', height: '200px' }}>
    <CircularProgressBar
      value={percentage}
      text={`${percentage}%`}
      styles={{ textSize: '14px' }}
    />
  </Box>
);

export const Rotation: Story = () => (
  <Box style={{ width: '200px', height: '200px' }}>
    <CircularProgressBar
      value={percentage}
      text={`${percentage}%`}
      styles={{ rotation: 0.5 + (1 - percentage / 100) / 2 }}
    />
  </Box>
);

// Animation stories
export const DefaultAnimationSpeed: Story = () => (
  <Box style={{ width: '200px', height: '200px' }}>
    <AnimatedValuesProvider values={[0, 20, 40, 60, 80, 100]}>
      {
        (percentage) => (
          <CircularProgressBar value={percentage} text={`${percentage}%`} />
        )
      }
    </AnimatedValuesProvider>
  </Box>
);

export const CustomAnimationSpeed: Story = () => (
  <Box style={{ width: '200px', height: '200px' }}>
    <AnimatedValuesProvider values={[0, 20, 40, 60, 80, 100]}>
      {
        (percentage) => (
          <CircularProgressBar
            value={percentage}
            text={`${percentage}%`}
            styles={{ pathTransitionDuration: 0.15 }}
          />
        )
      }
    </AnimatedValuesProvider>
  </Box>
);

export const NoAnimationWhenReturningToZero: Story = () => (
  <Box style={{ width: '200px', height: '200px' }}>
    <AnimatedValuesProvider values={[0, 100]}>
      {
        (percentage) => (
          <CircularProgressBar
            value={percentage}
            text={`${percentage}%`}
            styles={{
              pathTransition: percentage === 0 ? 'none' : 'stroke-dashoffset 0.5s ease 0s',
            }}
          />
        )
      }
    </AnimatedValuesProvider>
  </Box>
);

// Additional Stories
export const TextAnimation: Story = () => (
  <Box style={{ width: '200px', height: '200px' }}>
    <AnimatedValuesProvider 
      valueStart={0}
      valueEnd={66}
      duration={1.4}
      easingFunction={easeQuadInOut}
      repeat
    >
      {
        (value) => {
          const roundedValue = Math.round(value);
          return (
            <CircularProgressBar
              value={value}
              text={`${roundedValue}%`}
              styles={{ pathTransition: 'none' }}
            />
          );
        }
      }
    </AnimatedValuesProvider>
  </Box>
);

export const ArbitraryContent: Story = () => (
  <Box style={{ width: '200px', height: '200px' }}>
    <CircularProgressBar value={66}>
      <img
        style={{ width: 40, marginTop: -5 }}
        src="https://i.imgur.com/b9NyUGm.png"
        alt="doge"
      />
      <Box style={{ fontSize: 12, marginTop: -5 }}>
        <strong>66%</strong> mate
      </Box>
    </CircularProgressBar>
  </Box>
);

export const MultipleOverlappingPaths: Story = () => (
  <Box style={{ width: '200px', height: '200px' }}>
    <CircularProgressBar
      value={80}
      styles={{
        pathColor: '#F00',
        trailColor: '#EEE',
        strokeLinecap: 'butt',
      }}
    >
      <CircularProgressBar
        value={70}
        styles={{
          trailColor: 'transparent',
          strokeLinecap: 'butt',
        }}
      />
    </CircularProgressBar>
  </Box>
);

export const MultipleConcentricPaths: Story = () => (
  <Box style={{ width: '200px', height: '200px' }}>
    <CircularProgressBar
      value={75}
      strokeWidth={8}
      styles={{
        pathColor: '#F00',
        trailColor: 'transparent',
      }}
    >
      <Box style={{ width: '84%' }}>
        <CircularProgressBar
          value={70}
          styles={{
            trailColor: 'transparent',
          }}
        />
      </Box>
    </CircularProgressBar>
  </Box>
);

export const Background: Story = () => (
  <Box style={{ width: '200px', height: '200px' }}>
    <CircularProgressBar
      value={percentage}
      text={`${percentage}%`}
      background
      backgroundPadding={6}
      styles={{
        backgroundColor: '#3E98C7',
        textColor: '#FFF',
        pathColor: '#FFF',
        trailColor: 'transparent',
      }}
    />
  </Box>
);

export const Counterclockwise: Story = () => (
  <Box style={{ width: '200px', height: '200px' }}>
    <CircularProgressBar
      value={percentage}
      text={`${percentage}%`}
      counterClockwise
    />
  </Box>
);

export const PieChart: Story = () => (
  <Box style={{ width: '200px', height: '200px' }}>
    <CircularProgressBar
      value={percentage}
      strokeWidth={50}
      styles={{ strokeLinecap: 'butt' }}
    />
  </Box>
);

interface SeparatorProps {
  turns: number;
  style?: React.CSSProperties;
}
const Separator: React.FC<SeparatorProps> = ({ turns, style }) => {
  return (
    <Box
      style={{
        position: "absolute",
        height: "100%",
        transform: `rotate(${turns}turn)`,
      }}
    >
      <Box style={style} />
    </Box>
  );
};
interface RadialSeparatorsProps {
  count: number;
  style?: React.CSSProperties;
}
const RadialSeparators: React.FC<RadialSeparatorsProps> = ({ count, style }) => {
  const turns = 1 / count;
  return (
    <>
      {
        _.range(count).map((index) => (
          <Separator key={index} turns={index * turns} style={style} />
        ))
      }
    </>
  );
};
export const ProgressBarWithSeparators: Story = () => (
  <Box style={{ width: '200px', height: '200px' }}>
    <CircularProgressBar
      value={80}
      text={`${80}%`}
      strokeWidth={10}
      styles={{ strokeLinecap: 'butt' }}
    >
      <RadialSeparators
        count={12}
        style={{
          background: '#FFF',
          width: '2px',
          height: `${10}%`,
        }}
      />
    </CircularProgressBar>
  </Box>
);

export const DashboardSpeedometer: Story = () => (
  <Box style={{ width: '200px', height: '200px' }}>
    <AnimatedValuesProvider values={[0, 20, 80]}>
      {
        (value) => (
          <CircularProgressBar
            value={value}
            text={`${value}%`}
            circleRatio={0.75}
            styles={{
              rotation: 1 / 2 + 1 / 8,
              strokeLinecap: 'butt',
              trailColor: '#EEE',
            }}
          />
        )
      }
    </AnimatedValuesProvider>
  </Box>
);
