export type SortOption = {
    value: string
    label: string
  }


export interface SortByComponentProps {
  onChange?: (sortOption: SortOption) => void;
  initialValue?: string;
  className?: string;
}