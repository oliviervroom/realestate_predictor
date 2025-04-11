import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible-none focus-visible-1 focus-visible-ring disabled-events-none disabled-50 [&_svg]-events-none [&_svg]-4 [&_svg]-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover-destructive/90",
        outline: "border border-input bg-background shadow-sm hover-accent hover-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover-secondary/80",
        ghost: "hover-accent hover-accent-foreground",
        link: "text-primary underline-offset-4 hover",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };