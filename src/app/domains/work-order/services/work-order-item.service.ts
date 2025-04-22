import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
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
      unitPrice: 100,
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
      unitPrice: 120,
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
      unitPrice: 1250,
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
      unitPrice: 300,
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
      unitPrice: 710,
      paymentType: 'Fixed Price',
      managementArea: 'Western Region'
    },
    {
      id: '6',
      itemNumber: 'WOI-005',
      lineType: 'Description',
      shortDescription: 'Interior Paint',
      longDescription: 'Paint - Interior White for wall finishing',
      UOM: 'L',
      currency: 'SAR',
      unitPrice: 582,
      paymentType: 'Fixed Price',
      managementArea: 'Eastern Region'
    }
  ];

  // Subject to notify subscribers when items change
  private itemsSubject = new BehaviorSubject<Iitem[]>(this.mockItems);
  items$ = this.itemsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getItems(): Observable<Iitem[]> {
    return this.items$;
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
    this.itemsSubject.next(this.mockItems);
    return of(newItem);
  }

  updateItem(id: string, item: Partial<Iitem>): Observable<Iitem> {
    const index = this.mockItems.findIndex(i => i.id === id);
    if (index !== -1) {
      this.mockItems[index] = {
        ...this.mockItems[index],
        ...item
      };
      this.itemsSubject.next(this.mockItems);
      return of(this.mockItems[index]);
    }
    return of({} as Iitem);
  }

  deleteItem(id: string): Observable<boolean> {
    const index = this.mockItems.findIndex(item => item.id === id);
    if (index !== -1) {
      this.mockItems.splice(index, 1);
      this.itemsSubject.next(this.mockItems);
      return of(true);
    }
    return of(false);
  }

  // Create items from a work order
  createItemsFromWorkOrder(workOrderItems: any[], workOrderId: string): Observable<Iitem[]> {
    if (!workOrderItems || workOrderItems.length === 0) {
      return of([]);
    }

    const newItems: Iitem[] = [];

    workOrderItems.forEach((workOrderItem, index) => {
      // Create a new item based on the work order item
      const newItem: Iitem = {
        id: (this.mockItems.length + index + 1).toString(),
        itemNumber: `WOI-${workOrderId}-${String(index + 1).padStart(3, '0')}`,
        lineType: 'Description',
        shortDescription: workOrderItem.name || `Item ${index + 1}`,
        longDescription: workOrderItem.description || '',
        UOM: workOrderItem.uom || '',
        currency: workOrderItem.currency || 'SAR',
        paymentType: workOrderItem.paymentType || 'Fixed Price',
        managementArea: workOrderItem.managementArea || '',
        unitPrice: workOrderItem.unitPrice || 0
      };

      this.mockItems.push(newItem);
      newItems.push(newItem);
    });

    // Notify subscribers of the changes
    this.itemsSubject.next(this.mockItems);

    return of(newItems);
  }
}
