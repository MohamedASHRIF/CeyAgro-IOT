// components/AddButton.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface AddButtonProps {
  label: string;
  href: string;
  icon?: ReactNode; 
  className?: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "link";  //passes styles from the ShadCN button
}

export function AddButton({
  label,
  href,
  icon,
  className = "p-5 max-w-xs w-auto text-md font-semibold rounded-xl shadow-md transition hover:shadow-lg",
  variant = "secondary",
}: AddButtonProps) {
  return (
    <div className="flex justify-center my-4">
      <Link href={href}>
        <Button variant={variant} className={className}>
          {icon && <span className="mr-2">{icon}</span>}
          {label}
        </Button>
      </Link>
    </div>
  );
}
