import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground p-4 rounded-xl border shadow-sm",
        className,
      )}
      {...props}
    />
  );
}
