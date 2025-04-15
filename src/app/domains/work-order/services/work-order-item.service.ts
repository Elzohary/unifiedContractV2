import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { workOrderItem } from '../models/work-order.model';

interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

@Injectable({
  providedIn: 'root'
})
export class WorkOrderItemService {
  private endpoint = 'work-order-items';

  constructor(private http: HttpClient) {}

  getItems(): Observable<workOrderItem[]> {
    return this.http.get<ApiResponse<workOrderItem[]>>(`${environment.apiUrl}/${this.endpoint}`).pipe(
      map(response => response.data),
      catchError(() => of([]))
    );
  }

  getItemById(id: string): Observable<workOrderItem | null> {
    return this.http.get<ApiResponse<workOrderItem>>(`${environment.apiUrl}/${this.endpoint}/${id}`).pipe(
      map(response => response.data),
      catchError(() => of(null))
    );
  }

  createItem(item: Partial<workOrderItem>): Observable<workOrderItem> {
    return this.http.post<ApiResponse<workOrderItem>>(`${environment.apiUrl}/${this.endpoint}`, item).pipe(
      map(response => response.data)
    );
  }

  updateItem(id: string, item: Partial<workOrderItem>): Observable<workOrderItem> {
    return this.http.put<ApiResponse<workOrderItem>>(`${environment.apiUrl}/${this.endpoint}/${id}`, item).pipe(
      map(response => response.data)
    );
  }

  deleteItem(id: string): Observable<boolean> {
    return this.http.delete<void>(`${environment.apiUrl}/${this.endpoint}/${id}`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
} 