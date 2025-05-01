'use client'; // Ensure the component is treated as a client component

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Define the types for User
interface User {
  id: string;
  name: string;
}

interface UserSelectProps {
  users: User[];
  onSelect: (userId: string) => void;
}

export default function UserSelect({ users, onSelect }: UserSelectProps) {
  return (
    <div className="space-y-2">
      <Label className="bg-green-300 px-2 py-2 rounded text-Black inline-block text-sm">
        Select a user
      </Label>
      <Select onValueChange={onSelect}>
        <SelectTrigger className="w-full  bg-gray-400">
          <SelectValue placeholder="Choose a user" />
        </SelectTrigger>
        <SelectContent className="bg-gray-300">
          {users.map((user) => (
            <SelectItem key={`${user.id}-${user.name}`} value={user.id}>
              {user.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
