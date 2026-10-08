import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, CONDITIONS } from "@/lib/constants";

export type FilterBarProps = {
  search: string;
  category: string;
  condition: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onConditionChange: (value: string) => void;
};

export function FilterBar({ search, category, condition, onSearchChange, onCategoryChange, onConditionChange }: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search listings or ISBN"
          className="pl-9"
        />
      </div>

      <Select value={category} onValueChange={(value) => onCategoryChange(value ?? "All")}>
        <SelectTrigger className="w-full md:max-w-48">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All</SelectItem>
          {CATEGORIES.map((item) => (
            <SelectItem key={item} value={item}>{item}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={condition} onValueChange={(value) => onConditionChange(value ?? "All")}>
        <SelectTrigger className="w-full md:max-w-48">
          <SelectValue placeholder="Condition" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All</SelectItem>
          {CONDITIONS.map((item) => (
            <SelectItem key={item} value={item}>{item}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
