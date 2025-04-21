export interface Iitem {
  id: string;
  itemNumber: string;
  lineType: 'Description' | 'Breakdown';
  shortDescription: string;
  longDescription: string;
  UOM: string;
  currency: string;
  paymentType:string;
  managementArea:string;
}
