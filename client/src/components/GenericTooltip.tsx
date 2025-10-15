import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface GenericTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  delayDuration?: number;
  disableHoverableContent?: boolean;
}

const GenericTooltip: React.FC<GenericTooltipProps> = ({
  children,
  content,
  side = 'top',
  align = 'center',
  sideOffset = 4,
  delayDuration = 0,
  disableHoverableContent = false,
}) => {
  return (
    <TooltipProvider delayDuration={delayDuration} disableHoverableContent={disableHoverableContent}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex">{children}</div>
        </TooltipTrigger>
        <TooltipContent side={side} align={align} sideOffset={sideOffset}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default GenericTooltip;
