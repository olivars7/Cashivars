import React from 'react';

// Extend JSX so TypeScript accepts <ion-icon> as a valid element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ion-icon': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        name?: string;
        size?: string;
        color?: string;
      };
    }
  }
}

interface IonIconProps {
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  'aria-hidden'?: boolean | 'true' | 'false';
}

export default function IonIcon({ name, size = 20, className, style, ...rest }: IonIconProps) {
  return (
    <ion-icon
      name={name}
      style={{ fontSize: `${size}px`, display: 'block', ...style }}
      className={className}
      {...(rest as Record<string, unknown>)}
    />
  );
}
