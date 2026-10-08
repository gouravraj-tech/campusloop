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
    <div className="flex flex-col gap-3 rounded-[1.4rem] border border-border/70 bg-card/90 p-3 shadow-[0_16px_38px_-28px_oklch(0.25_0.06_278_/_55%)] sm:p-4 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search listings or ISBN"
          className="h-11 rounded-xl border-border/70 bg-background pl-10 shadow-none focus-visible:bg-card"
        />
      </div>

      <Select value={category} onValueChange={(value) => onCategoryChange(value ?? "All")}>
        <SelectTrigger className="h-11 w-full rounded-xl border-border/70 bg-background shadow-none md:max-w-48">
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
        <SelectTrigger className="h-11 w-full rounded-xl border-border/70 bg-background shadow-none md:max-w-48">
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
