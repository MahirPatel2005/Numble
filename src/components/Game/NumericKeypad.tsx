import React from 'react';
import { Delete } from 'lucide-react';

interface NumericKeypadProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  maxLength: number;
  disabled?: boolean;
}

export const NumericKeypad: React.FC<NumericKeypadProps> = ({
  value,
  onChange,
  onSubmit,
  maxLength,
  disabled = false,
}) => {
  const handleDigitClick = (digit: string) => {
    if (value.length < maxLength) {
      onChange(value + digit);
    }
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
          <button
            key={digit}
            onClick={() => handleDigitClick(String(digit))}
            disabled={disabled}
            className="bg-white border-2 border-gray-300 rounded-lg p-4 text-lg font-semibold hover:bg-gray-50 disabled:opacity-50 transition"
          >
            {digit}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => handleDigitClick('0')}
          disabled={disabled}
          className="flex-1 bg-white border-2 border-gray-300 rounded-lg p-4 text-lg font-semibold hover:bg-gray-50 disabled:opacity-50 transition"
        >
          0
        </button>
        <button
          onClick={handleBackspace}
          disabled={disabled}
          className="bg-white border-2 border-gray-300 rounded-lg p-4 hover:bg-gray-50 disabled:opacity-50 transition"
        >
          <Delete size={20} />
        </button>
      </div>

      <button
        onClick={onSubmit}
        disabled={disabled || value.length === 0}
        className="w-full bg-black text-white rounded-lg p-4 text-lg font-semibold hover:bg-gray-800 disabled:opacity-50 transition"
      >
        Submit
      </button>
    </div>
  );
};
