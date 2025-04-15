import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string, params?: HttpParams): Observable<ApiResponse<T>> {
    if (environment.useMockData) {
      return this.simulateApiCall<T>(endpoint, 'GET', params);
    }
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, { params })
      .pipe(
        retry(3),
        catchError(this.handleError)
      );
  }

  post<T>(endpoint: string, body: any): Observable<ApiResponse<T>> {
    if (environment.useMockData) {
      return this.simulateApiCall<T>(endpoint, 'POST', body);
    }
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  put<T>(endpoint: string, body: any): Observable<ApiResponse<T>> {
    if (environment.useMockData) {
      return this.simulateApiCall<T>(endpoint, 'PUT', body);
    }
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  delete<T>(endpoint: string): Observable<ApiResponse<T>> {
    if (environment.useMockData) {
      return this.simulateApiCall<T>(endpoint, 'DELETE');
    }
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  private simulateApiCall<T>(endpoint: string, method: string, data?: any): Observable<ApiResponse<T>> {
    return new Observable<ApiResponse<T>>(subscriber => {
      setTimeout(() => {
        const response: ApiResponse<T> = {
          data: {} as T,
          message: 'Mock data response',
          status: 200,
          timestamp: new Date().toISOString()
        };
        subscriber.next(response);
        subscriber.complete();
      }, environment.mockDataDelay);
    });
  }
} 