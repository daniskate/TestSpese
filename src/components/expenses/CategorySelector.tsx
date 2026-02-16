import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import type { Category } from "@/types";

interface CategorySelectorProps {
  categories: Category[];
  value: string;
  onChange: (categoryId: string) => void;
}

export function CategorySelector({
  categories,
  value,
  onChange,
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedCategory = categories.find((c) => c.id === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {selectedCategory ? (
          <div className="flex items-center gap-2">
            <img
              src={selectedCategory.icon}
              alt={selectedCategory.name}
              className="h-6 w-6 object-contain"
            />
            <span>{selectedCategory.name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">Seleziona categoria</span>
        )}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-card shadow-lg">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => {
                onChange(category.id);
                setIsOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent ${
                value === category.id ? "bg-accent" : ""
              }`}
            >
              <img
                src={category.icon}
                alt={category.name}
                className="h-6 w-6 object-contain"
              />
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
