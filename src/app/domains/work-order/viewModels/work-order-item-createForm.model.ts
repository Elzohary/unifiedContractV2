export interface workOrderItemCreateFormViewModel {
  itemNumber: string;
  shortDescription: string;
  UOM: string;
  currency: string;
  unitPrice: number;
  managementArea:string;
  estimatedQuantity: number;
  estimatedPrice: number;
  estimatedPriceWithVAT: number;
}
