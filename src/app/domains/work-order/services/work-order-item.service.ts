import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Iitem } from '../models/work-order-item.model';

@Injectable({
  providedIn: 'root'
})
export class WorkOrderItemService {
  private mockItems: Iitem[] = [
    {
      id: '1',
      itemNumber: 'WOI-001',
      lineType: 'Description',
      shortDescription: 'Concrete Mix',
      longDescription: 'Concrete Mix - Grade 30 for foundation work',
      UOM: 'm³',
      currency: 'SAR',
      paymentType: 'Fixed Price',
      managementArea: 'Western Region'
    },
    {
      id: '2',
      itemNumber: 'WOI-002',
      lineType: 'Description',
      shortDescription: 'Steel Bars',
      longDescription: 'Steel Reinforcement Bars - 12mm for structural support',
      UOM: 'ton',
      currency: 'SAR',
      paymentType: 'Fixed Price',
      managementArea: 'Western Region'
    },
    {
      id: '3',
      itemNumber: 'WOI-003',
      lineType: 'Description',
      shortDescription: 'Electrical Wiring',
      longDescription: 'Electrical Wiring - 2.5mm² for power distribution',
      UOM: 'm',
      currency: 'SAR',
      paymentType: 'Fixed Price',
      managementArea: 'Western Region'
    },
    {
      id: '4',
      itemNumber: 'WOI-004',
      lineType: 'Description',
      shortDescription: 'PVC Pipes',
      longDescription: 'PVC Pipes - 50mm for plumbing installation',
      UOM: 'm',
      currency: 'SAR',
      paymentType: 'Fixed Price',
      managementArea: 'Western Region'
    },
    {
      id: '5',
      itemNumber: 'WOI-005',
      lineType: 'Description',
      shortDescription: 'Interior Paint',
      longDescription: 'Paint - Interior White for wall finishing',
      UOM: 'L',
      currency: 'SAR',
      paymentType: 'Fixed Price',
      managementArea: 'Western Region'
    }
  ];

  constructor(private http: HttpClient) {}

  getItems(): Observable<Iitem[]> {
    return of(this.mockItems);
  }

  getItemById(id: string): Observable<Iitem | null> {
    const item = this.mockItems.find(item => item.id === id);
    return of(item || null);
  }

  createItem(item: Partial<Iitem>): Observable<Iitem> {
    const newItem: Iitem = {
      ...item,
      id: (this.mockItems.length + 1).toString()
    } as Iitem;
    this.mockItems.push(newItem);
    return of(newItem);
  }

  updateItem(id: string, item: Partial<Iitem>): Observable<Iitem> {
    const index = this.mockItems.findIndex(i => i.id === id);
    if (index !== -1) {
      this.mockItems[index] = {
        ...this.mockItems[index],
        ...item
      };
      return of(this.mockItems[index]);
    }
    return of({} as Iitem);
  }

  deleteItem(id: string): Observable<boolean> {
    const index = this.mockItems.findIndex(item => item.id === id);
    if (index !== -1) {
      this.mockItems.splice(index, 1);
      return of(true);
    }
    return of(false);
  }
}
