// components/AddButton.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface AddButtonProps {
  label: string;
  href: string;
  icon?: ReactNode; // New icon prop
  className?: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "link";
}

export function AddButton({
  label,
  href,
  icon,
  className = "p-6 max-w-xs w-auto text-1xl font-semibold rounded-xl shadow-md hover:shadow-[0_4px_20px_rgba(0,0,0,0.6)] transition",
  variant = "secondary",
}: AddButtonProps) {
  return (
    <div className="flex justify-center my-4">
      <Link href={href}>
        <Button variant={variant} className={className}>
          {icon && <span className="mr-2">{icon}</span>}{" "}
          {/* Render icon if passed */}
          {label}
        </Button>
      </Link>
    </div>
  );
}
