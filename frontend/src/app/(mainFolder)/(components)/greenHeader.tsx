import { FC } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface DropdownItem {
  name: string;
  onClick: () => void;
}

interface MenuItem {
  name: string;
  onClick?: () => void;
  isActive?: boolean;
  isDropdown?: boolean;
  dropdownItems?: DropdownItem[];
  route?: string; 
}

interface GreenHeaderProps {
  title: string;
  menuItems: MenuItem[];
}

const GreenHeader: FC<GreenHeaderProps> = ({ title, menuItems }) => {
  return (
    <header className="flex items-center justify-between px-4 h-9 shadow-xl bg-background">
      {/* Mobile Title */}
      <div className="md:hidden">
        <h1 className="text-xl font-semibold text-black">{title}</h1>
      </div>

      {/* Desktop Menu */}
      <nav className="hidden md:flex items-center space-x-4 mx-auto">
        {menuItems.map((item) => {
          if (item.isDropdown && item.dropdownItems) {
            return (
              <DropdownMenu key={item.name}>
                <DropdownMenuTrigger asChild>
                  <Button className="rounded-none text-black text-md">
                    {item.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="rounded-none">
                  {item.dropdownItems.map((subItem) => (
                    <DropdownMenuItem
                      key={subItem.name}
                      onClick={subItem.onClick}
                      className="cursor-pointer"
                    >
                      {subItem.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }

          return (
            <Button
              key={item.name}
              variant="ghost"
              onClick={item.onClick}
              className={`rounded-none text-black text-md font-medium ${
                item.isActive
                  ? "bg-teal-400 hover:bg-teal-400"
                  : "hover:bg-gray-200"
              }`}
            >
              {item.name}
            </Button>
          );
        })}
      </nav>

      {/* Mobile Dropdown Menu */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-none"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5 text-black" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white text-black rounded-none">
            {menuItems.map((item) =>
              item.isDropdown && item.dropdownItems
                ? item.dropdownItems.map((subItem) => (
                    <DropdownMenuItem
                      key={subItem.name}
                      onClick={subItem.onClick}
                    >
                      {subItem.name}
                    </DropdownMenuItem>
                  ))
                : [
                    <DropdownMenuItem
                      key={item.name}
                      onClick={item.onClick}
                      className={item.isActive ? "bg-gray-100" : ""}
                    >
                      {item.name}
                    </DropdownMenuItem>,
                  ]
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default GreenHeader;
