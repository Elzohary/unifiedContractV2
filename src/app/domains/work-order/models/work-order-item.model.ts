export interface Iitem {
  id: string;
  itemNumber: string;
  lineType: 'Description' | 'Breakdown';
  shortDescription: string;
  longDescription: string;
  UOM: string;
  currency: string;
  unitPrice: number;
  paymentType:string;
  managementArea:string;
}

export interface estimatedItemsPricesDetails {
  totalEstimatedPrice: number;
  EstimationVAT: number;
  totalEstimatedPriceWithVAT: number;
  partialPaymentTotalEstimated: number;
  partialPaymentVAT: number;
  partialPaymentTotalEstimatedWithVAT: number;
}

export interface actualItemsPricesDetails {
  totalActualPrice: number;
  actualVAT: number;
  totalActualPriceWithVAT: number;
  partialPaymentTotalActual: number;
  partialPaymentVAT: number;
  partialPaymentTotalActualWithVAT: number;
}

export interface finalItemsPricesDetails {
  totalFinalPrice: number;
  finalVAT: number;
  totalFinalPriceWithVAT: number;
  partialPaymentTotalFinal: number;
  partialPaymentFinalVAT: number;
  partialPaymentTotalFinalWithVAT: number;
}
