import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Material } from '../models/work-order.model';

interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  private endpoint = 'materials';

  constructor(private http: HttpClient) {}

  getMaterials(): Observable<Material[]> {
    return this.http.get<ApiResponse<Material[]>>(`${environment.apiUrl}/${this.endpoint}`).pipe(
      map(response => response.data),
      catchError(() => of([]))
    );
  }

  getMaterialById(id: string): Observable<Material | null> {
    return this.http.get<ApiResponse<Material>>(`${environment.apiUrl}/${this.endpoint}/${id}`).pipe(
      map(response => response.data),
      catchError(() => of(null))
    );
  }

  createMaterial(material: Partial<Material>): Observable<Material> {
    return this.http.post<ApiResponse<Material>>(`${environment.apiUrl}/${this.endpoint}`, material).pipe(
      map(response => response.data)
    );
  }

  updateMaterial(id: string, material: Partial<Material>): Observable<Material> {
    return this.http.put<ApiResponse<Material>>(`${environment.apiUrl}/${this.endpoint}/${id}`, material).pipe(
      map(response => response.data)
    );
  }

  deleteMaterial(id: string): Observable<boolean> {
    return this.http.delete<void>(`${environment.apiUrl}/${this.endpoint}/${id}`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
} 