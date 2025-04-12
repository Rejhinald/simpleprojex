import { SortOption } from "@/types/sort";

export const statuses: SortOption[] = [
  {
    value: "name-ascending",
    label: "Name (A-Z)",
  },
  {
    value: "name-descending",
    label: "Name (Z-A)",
  },
  {
    value: "date-ascending",
    label: "Date (Oldest First)",
  },
  {
    value: "date-descending",
    label: "Date (Newest First)",
  },
];
