import { Button } from "@/components/ui/button";

interface TimeFilterProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function TimeFilter({ activeFilter, onFilterChange }: TimeFilterProps) {
  const filters = [
    { label: "7 jours", value: "7d" },
    { label: "30 jours", value: "30d" },
    { label: "90 jours", value: "90d" },
    { label: "1 an", value: "1y" },
  ];

  return (
    <div className="flex gap-2">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={activeFilter === filter.value ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(filter.value)}
          className={
            activeFilter === filter.value 
              ? "bg-primary text-primary-foreground" 
              : "border-border text-muted-foreground hover:text-foreground"
          }
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}