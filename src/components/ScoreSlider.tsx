import * as SliderPrimitive from '@radix-ui/react-slider';
import React from 'react';

interface ScoreSliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  max?: number;
  min?: number;
  step?: number;
  large?: boolean;
}

export function ScoreSlider({ label, value, onChange, max = 10, min = 1, step = 1, large = false }: ScoreSliderProps) {
  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-end">
        <label className="text-sm font-medium text-muted-foreground tracking-wide">{label}</label>
        <span className={`font-serif text-primary leading-none ${large ? 'text-4xl' : 'text-2xl'}`}>{value}</span>
      </div>
      <SliderPrimitive.Root
        className="relative flex w-full touch-none select-none items-center py-2"
        value={[value]}
        max={max}
        step={step}
        min={min}
        onValueChange={(vals) => onChange(vals[0])}
        data-testid={`slider-${label.toLowerCase()}`}
      >
        <SliderPrimitive.Track className={`relative w-full grow overflow-hidden rounded-full bg-muted ${large ? 'h-3' : 'h-2'}`}>
          <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-primary/60 to-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className={`block rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-[0_0_10px_rgba(212,154,90,0.3)] cursor-grab active:cursor-grabbing ${large ? 'h-8 w-8' : 'h-6 w-6'}`} />
      </SliderPrimitive.Root>
      <div className="flex justify-between text-[10px] text-muted-foreground/60 font-medium tracking-widest">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
