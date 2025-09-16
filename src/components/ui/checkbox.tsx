import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type CheckboxProps = React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
  size?: 'xxs' | 'xs' | 'sm' | 'md';
};

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, size = 'md', ...props }, ref) => {
  const sizeClasses = size === 'xxs' ? 'h-1.5 w-1.5' : size === 'xs' ? 'h-2.5 w-2.5' : size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const iconSizeClasses = size === 'xxs' ? 'h-1 w-1' : size === 'xs' ? 'h-2 w-2' : size === 'sm' ? 'h-2.5 w-2.5' : 'h-4 w-4';
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        `peer ${sizeClasses} shrink-0 rounded-sm border border-primary ring-offset-background data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`,
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
        <Check className={iconSizeClasses} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
