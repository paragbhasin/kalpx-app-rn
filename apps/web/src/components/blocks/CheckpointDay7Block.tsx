import React from 'react';
import { CycleReflectionBlock } from './CycleReflectionBlock';

interface Props {
  block?: Record<string, any>;
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

export function CheckpointDay7Block(props: Props) {
  return <CycleReflectionBlock {...props} day={7} />;
}
