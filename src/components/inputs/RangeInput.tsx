import { useEvent } from '@/hooks';
import { inputSelector, updateValue, useQRScoutState } from '@/store/store';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Slider } from '../ui/slider';
import { RangeInputData } from './BaseInputProps';
import { ConfigurableInputProps } from './ConfigurableInput';

export default function RangeInput(props: ConfigurableInputProps) {
  const data = useQRScoutState(
    inputSelector<RangeInputData>(props.section, props.code),
  );

  if (!data) {
    return <div>Invalid input</div>;
  }

  const isEnabled = useQRScoutState(state => {
    if (!data.dependsOn) return true;
    const depField = state.fieldValues.find(
      f => f.code === data.dependsOn?.code,
    );
    return depField?.value === data.dependsOn?.value;
  });

  const [value, setValue] = useState(data.defaultValue);

  const resetState = useCallback(
    ({ force }: { force: boolean }) => {
      if (force) {
        setValue(data.defaultValue);
        return;
      }
      switch (data.formResetBehavior) {
        case 'reset':
          setValue(data.defaultValue);
          return;
        case 'increment':
          setValue(prev => (typeof prev === 'number' ? prev + data.step : 1));
          return;
        case 'preserve':
          return;
        default:
          return;
      }
    },
    [data.defaultValue],
  );

  useEvent('resetFields', resetState);

  const handleChange = useCallback((value: number[]) => {
    setValue(value[0]);
  }, []);

  useEffect(() => {
    if (props.code === 'defSkill' && value === 0) {
      updateValue(props.code, 'Did not Defense');
    } else {
      updateValue(props.code, value);
    }
  }, [value, props.code]);

  const displayValue = useMemo(() => {
    if (props.code === 'defSkill') {
      return value === 0 ? 'Did not Defense' : `Defense skill: ${value}`;
    }
    return value;
  }, [value, props.code]);

  return (
    <div className="flex flex-col items-center gap-2 p-2">
      <span
        className={`capitalize text-2xl ${
          isEnabled
            ? 'text-secondary-foreground'
            : 'text-secondary-foreground/50'
        }`}
      >
        {displayValue}
      </span>
      <Slider
        className={`w-full py-2 px-1 ${isEnabled ? '' : 'opacity-50'}`}
        min={data.min}
        max={data.max}
        step={data.step}
        value={[typeof value === 'number' ? value : 0]}
        id={data.title}
        onValueChange={handleChange}
        disabled={!isEnabled}
      />
    </div>
  );
}
