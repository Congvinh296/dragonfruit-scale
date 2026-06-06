export type ProductType =
  | 'EXPORT'
  | 'REJECT';

export interface WeightItem {
  id: string;
  kg: number;
  type: ProductType;
  createdAt: number;
}