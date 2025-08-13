import React from 'react';

export const Logo = ({ className }: { className?: string }) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M16 3L4 9.99999L16 17L28 10L16 3Z"
      className="fill-cyan-500 dark:fill-cyan-400"
    />
    <path
      d="M4 17L16 24L28 17L16 31L4 17Z"
      className="fill-blue-600 dark:fill-blue-500"
    />
    <path
      d="M28 10V17L16 24V17L28 10Z"
      className="fill-blue-500 dark:fill-blue-400"
    />
    <path
      d="M4 10V17L16 24V17L4 10Z"
      className="fill-cyan-400 dark:fill-cyan-300"
    />
  </svg>
);
