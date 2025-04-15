import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError, finalize } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { StateService } from '../../../core/services/state.service';
import { Employee, EmployeeRole, EmployeeStatus } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private endpoint = 'employees';

  constructor(
    private apiService: ApiService,
    private stateService: StateService
  ) {}

  getAllEmployees(): Observable<Employee[]> {
    this.stateService.setLoading('employees', true);
    this.stateService.setError('employees', null);

    return this.apiService.get<Employee[]>(this.endpoint).pipe(
      map(response => {
        this.stateService.updateEmployees(response.data);
        return response.data;
      }),
      catchError(error => {
        this.stateService.setError('employees', error.message);
        return of([]);
      }),
      finalize(() => {
        this.stateService.setLoading('employees', false);
      })
    );
  }

  getEmployeeById(id: string): Observable<Employee | null> {
    this.stateService.setLoading('employee', true);
    this.stateService.setError('employee', null);

    return this.apiService.get<Employee>(`${this.endpoint}/${id}`).pipe(
      map(response => response.data),
      catchError(error => {
        this.stateService.setError('employee', error.message);
        return of(null);
      }),
      finalize(() => {
        this.stateService.setLoading('employee', false);
      })
    );
  }

  createEmployee(employee: Partial<Employee>): Observable<Employee | null> {
    this.stateService.setLoading('employee', true);
    this.stateService.setError('employee', null);

    return this.apiService.post<Employee>(this.endpoint, employee).pipe(
      map(response => {
        const newEmployee = response.data;
        const currentEmployees = this.stateService.employees$();
        this.stateService.updateEmployees([...currentEmployees, newEmployee]);
        return newEmployee;
      }),
      catchError(error => {
        this.stateService.setError('employee', error.message);
        return of(null);
      }),
      finalize(() => {
        this.stateService.setLoading('employee', false);
      })
    );
  }

  updateEmployee(id: string, employee: Partial<Employee>): Observable<Employee | null> {
    this.stateService.setLoading('employee', true);
    this.stateService.setError('employee', null);

    return this.apiService.put<Employee>(`${this.endpoint}/${id}`, employee).pipe(
      map(response => {
        const updatedEmployee = response.data;
        const currentEmployees = this.stateService.employees$();
        const updatedEmployees = currentEmployees.map(emp => 
          emp.id === id ? updatedEmployee : emp
        );
        this.stateService.updateEmployees(updatedEmployees);
        return updatedEmployee;
      }),
      catchError(error => {
        this.stateService.setError('employee', error.message);
        return of(null);
      }),
      finalize(() => {
        this.stateService.setLoading('employee', false);
      })
    );
  }

  deleteEmployee(id: string): Observable<boolean> {
    this.stateService.setLoading('employee', true);
    this.stateService.setError('employee', null);

    return this.apiService.delete<Employee>(`${this.endpoint}/${id}`).pipe(
      map(() => {
        const currentEmployees = this.stateService.employees$();
        const updatedEmployees = currentEmployees.filter(emp => emp.id !== id);
        this.stateService.updateEmployees(updatedEmployees);
        return true;
      }),
      catchError(error => {
        this.stateService.setError('employee', error.message);
        return of(false);
      }),
      finalize(() => {
        this.stateService.setLoading('employee', false);
      })
    );
  }

  updateEmployeeRole(id: string, role: EmployeeRole): Observable<Employee | null> {
    return this.updateEmployee(id, { role });
  }

  updateEmployeeStatus(id: string, status: EmployeeStatus): Observable<Employee | null> {
    return this.updateEmployee(id, { status });
  }

  getEmployeesByDepartment(department: string): Observable<Employee[]> {
    this.stateService.setLoading('employees', true);
    this.stateService.setError('employees', null);

    return this.apiService.get<Employee[]>(`${this.endpoint}/department/${department}`).pipe(
      map(response => response.data),
      catchError(error => {
        this.stateService.setError('employees', error.message);
        return of([]);
      }),
      finalize(() => {
        this.stateService.setLoading('employees', false);
      })
    );
  }

  getEmployeesByRole(role: EmployeeRole): Observable<Employee[]> {
    this.stateService.setLoading('employees', true);
    this.stateService.setError('employees', null);

    return this.apiService.get<Employee[]>(`${this.endpoint}/role/${role}`).pipe(
      map(response => response.data),
      catchError(error => {
        this.stateService.setError('employees', error.message);
        return of([]);
      }),
      finalize(() => {
        this.stateService.setLoading('employees', false);
      })
    );
  }
} 