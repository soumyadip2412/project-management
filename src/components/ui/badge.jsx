import { cva } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors", {
  variants: {
    variant: {
      default: "border-transparent bg-primary text-primary-foreground",
      secondary: "border-transparent bg-secondary text-secondary-foreground",
      outline: "text-foreground",
      success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
      warning: "border-amber-500/20 bg-amber-500/10 text-amber-300",
      danger: "border-red-500/20 bg-red-500/10 text-red-300",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}