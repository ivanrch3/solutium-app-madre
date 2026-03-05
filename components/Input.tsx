import React from 'react';
import { THEME_CLASSES } from '../constants';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  helperText, 
  className = '', 
  id,
  ...props 
}) => {
  const inputId = id || props.name || label.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <div className="mb-4 w-full">
      <label 
        htmlFor={inputId} 
        className={THEME_CLASSES.input.label}
      >
        {label}
      </label>
      <input
        id={inputId}
        className={`
            ${THEME_CLASSES.input.base} 
            ${error ? THEME_CLASSES.input.error : 'border-slate-200 focus:border-solutium-blue'}
            ${className}
        `}
        {...props}
      />
      {error && (
          <p className="mt-1 text-xs text-red-500 flex items-center animate-fadeIn">
              <span className="mr-1">⚠️</span> {error}
          </p>
      )}
      {!error && helperText && (
          <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  );
};