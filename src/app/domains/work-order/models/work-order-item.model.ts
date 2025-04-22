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
