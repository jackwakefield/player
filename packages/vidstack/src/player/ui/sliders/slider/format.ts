import { createContext } from 'maverick.js';

export const sliderValueFormatContext = createContext<SliderValueFormat>(() => ({}));

export interface SliderValueFormat {
  value?(value: number): string;
  percent?(percent: number, decimalPlaces: number): string;
  time?(
    value: number,
    padHours: boolean | null,
    padMinutes: boolean | null,
    showHours: boolean,
  ): string;
}
