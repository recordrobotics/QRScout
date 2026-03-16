import { Button } from '@/components/ui/button';
import { useEvent } from '@/hooks';
import { inputSelector, updateValue, useQRScoutState } from '@/store/store';
import { useCallback, useEffect, useState } from 'react';
import { QueuedCounterInputData } from './BaseInputProps';
import { ConfigurableInputProps } from './ConfigurableInput';

// Track the globally active section for keyboard inputs (defaults to Autonomous)
let globalActiveSection = 'Autonomous';

export default function QueuedCounterInput(props: ConfigurableInputProps) {
  const data = useQRScoutState(
    inputSelector<QueuedCounterInputData>(props.section, props.code),
  );

  if (!data) {
    return <div>Invalid input</div>;
  }

  const [totalValue, setTotalValue] = useState(data.defaultValue);
  const [queueValue, setQueueValue] = useState(0);

  // Track the most recently interacted section across the app.
  useEffect(() => {
    const focusHandler = (e: MouseEvent | TouchEvent) => {
      const el = e.target as HTMLElement;
      const sectionCard = el.closest('[data-section]');
      if (sectionCard) {
        const sectionName = sectionCard.getAttribute('data-section');
        if (sectionName) {
          globalActiveSection = sectionName;
        }
      }
    };

    // We attach it globally exactly once per instance, but they just overwrite the same variable which is fast.
    window.addEventListener('click', focusHandler, true);
    window.addEventListener('touchstart', focusHandler, {
      capture: true,
      passive: true,
    });
    return () => {
      window.removeEventListener('click', focusHandler, true);
      window.removeEventListener('touchstart', focusHandler, {
        capture: true,
      } as any);
    };
  }, []);

  const resetState = useCallback(
    ({ force }: { force: boolean }) => {
      setQueueValue(0);
      if (force) {
        setTotalValue(data.defaultValue);
        return;
      }
      switch (data.formResetBehavior) {
        case 'reset':
          setTotalValue(data.defaultValue);
          return;
        case 'increment':
          setTotalValue(prev =>
            typeof prev === 'number' ? prev + data.step : 1,
          );
          return;
        case 'preserve':
          return;
        default:
          return;
      }
    },
    [data],
  );

  useEvent('resetFields', resetState);

  const handleQueueChange = useCallback(
    (increment: number) => {
      // Whenever a button is clicked explicitly, ensure this section becomes the active one
      globalActiveSection = props.section;
      setQueueValue(prev => prev + increment);
    },
    [props.section],
  );

  const pushToTotal = useCallback(() => {
    if (queueValue === 0) return;
    setTotalValue((prev: number) => {
      const newVal = prev + queueValue;
      if (data.max !== undefined && newVal > data.max) return data.max;
      if (data.min !== undefined && newVal < data.min) return data.min;
      return newVal;
    });
    setQueueValue(0);
  }, [queueValue, data.max, data.min]);

  // Keyboard support logic
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only the currently active section should process keyboard inputs
      if (props.section !== globalActiveSection) return;

      // Ignore inputs if the user is typing in a text field or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      if (e.key === 'Enter') {
        e.preventDefault();
        pushToTotal();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        setQueueValue(prev => {
          const newVal = Math.floor(Math.abs(prev) / 10);
          return prev < 0 ? -newVal : newVal;
        });
      } else if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        const digit = parseInt(e.key, 10);
        setQueueValue(prev => {
          const base = prev * 10;
          return prev < 0 ? base - digit : base + digit;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [props.section, pushToTotal]);

  useEffect(() => {
    updateValue(props.code, totalValue);
  }, [totalValue, props.code]);

  return (
    <div className="my-4 flex flex-col items-center justify-center gap-6 w-full">
      <div className="flex w-full flex-row justify-around max-w-sm">
        <div className="flex flex-col items-center">
          <span className="text-sm text-gray-500 uppercase font-bold tracking-wider">
            Queue
          </span>
          <h2 className="text-6xl font-black dark:text-white">
            {queueValue > 0 ? `+${queueValue}` : queueValue}
          </h2>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm text-gray-500 uppercase font-bold tracking-wider">
            Total
          </span>
          <h2 className="text-6xl font-black text-primary">{totalValue}</h2>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-sm px-2">
        <Button
          className="h-16 md:h-20 text-2xl font-bold bg-secondary/30 hover:bg-secondary/50"
          variant="outline"
          onClick={() => handleQueueChange(-10)}
        >
          -10
        </Button>
        <Button
          className="h-16 md:h-20 text-2xl font-bold bg-secondary/30 hover:bg-secondary/50"
          variant="outline"
          onClick={() => handleQueueChange(-5)}
        >
          -5
        </Button>
        <Button
          className="h-16 md:h-20 text-2xl font-bold bg-secondary/30 hover:bg-secondary/50"
          variant="outline"
          onClick={() => handleQueueChange(-1)}
        >
          -1
        </Button>

        <Button
          className="h-16 md:h-20 text-3xl font-bold bg-primary/10 hover:bg-primary/20 border-primary/50"
          variant="outline"
          onClick={() => handleQueueChange(1)}
        >
          +1
        </Button>
        <Button
          className="h-16 md:h-20 text-3xl font-bold bg-primary/10 hover:bg-primary/20 border-primary/50"
          variant="outline"
          onClick={() => handleQueueChange(5)}
        >
          +5
        </Button>
        <Button
          className="h-16 md:h-20 text-3xl font-bold bg-primary/10 hover:bg-primary/20 border-primary/50"
          variant="outline"
          onClick={() => handleQueueChange(10)}
        >
          +10
        </Button>
      </div>

      <Button
        className="w-full max-w-sm h-16 text-xl font-bold mt-2"
        onClick={pushToTotal}
        disabled={queueValue === 0}
      >
        Push to Total
      </Button>
    </div>
  );
}
