import { cn } from "@/lib/utils";

interface MemberAvatarProps {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
};

export function MemberAvatar({
  name,
  color,
  size = "md",
  className,
}: MemberAvatarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-bold text-white",
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: color }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
