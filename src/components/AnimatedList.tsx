import React, { ReactNode, Children } from 'react';
import { AnimatedContainer } from './AnimatedContainer';

interface AnimatedListProps {
  children: ReactNode[];
  staggerDelay?: number;
}

export function AnimatedList({
  children,
  staggerDelay = 50,
}: AnimatedListProps) {
  return (
    <>
      {Children.map(children, (child, index) => (
        <AnimatedContainer
          key={index}
          animation="fadeSlideUp"
          delay={index * staggerDelay}
        >
          {child}
        </AnimatedContainer>
      ))}
    </>
  );
}
