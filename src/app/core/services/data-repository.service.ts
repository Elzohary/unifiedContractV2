import { Injectable } from '@angular/core';
import { Observable, of, catchError, map, tap, BehaviorSubject, shareReplay, forkJoin, switchMap, throwError, combineLatest, finalize, first, share } from 'rxjs';
import { CacheService } from './cache.service';
import { EmployeeService } from './employee.service';
import { 
  Employee, 
  EmployeeRequest, 
  AttendanceRecord, 
  Warning, 
  SickLeave, 
  Announcement 
} from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class DataRepositoryService {
  private dataLoadingSubject = new BehaviorSubject<boolean>(false);
  
  // Expose an observable to track loading state across the app
  public dataLoading$ = this.dataLoadingSubject.asObservable();
  
  // Caching durations in milliseconds
  private CACHE_DURATIONS = {
    EMPLOYEES: 5 * 60 * 1000, // 5 minutes
    REQUESTS: 2 * 60 * 1000,  // 2 minutes 
    ATTENDANCE: 5 * 60 * 1000, // 5 minutes
    WARNINGS: 5 * 60 * 1000,  // 5 minutes
    ANNOUNCEMENTS: 10 * 60 * 1000, // 10 minutes
    OTHER: 2 * 60 * 1000     // 2 minutes for other data
  };

  constructor(
    private cacheService: CacheService,
    private employeeService: EmployeeService
  ) {}

  private updateLastLoaded(dataType: string): void {
    // This method updates the timestamp for when data was last loaded
    console.log(`Data type ${dataType} last loaded at: ${new Date().toLocaleString()}`);
  }

  /**
   * Get employees with caching
   */
  getEmployees(): Observable<Employee[]> {
    const cacheKey = 'employees';
    const cachedData = this.cacheService.get<Employee[]>(cacheKey);
    
    // Start by setting loading state to true
    this.dataLoadingSubject.next(true);
    
    if (cachedData) {
      // Return cached data but ensure loading state is managed
      setTimeout(() => this.dataLoadingSubject.next(false), 10);
      return of(cachedData);
    }
    
    return this.employeeService.getEmployees().pipe(
      tap(employees => {
        this.cacheService.set(cacheKey, employees, this.CACHE_DURATIONS.EMPLOYEES);
        this.dataLoadingSubject.next(false);
      }),
      catchError(error => {
        this.dataLoadingSubject.next(false);
        console.error('Error fetching employees', error);
        return of([]);
      }),
      // Share the same result to multiple subscribers
      shareReplay(1)
    );
  }

  /**
   * Get employee by ID with caching
   */
  getEmployeeById(id: string): Observable<Employee | undefined> {
    const cacheKey = `employee_${id}`;
    const cachedData = this.cacheService.get<Employee>(cacheKey);
    
    // Start by setting loading state to true
    this.dataLoadingSubject.next(true);
    
    if (cachedData) {
      // Return cached data but ensure loading state is managed
      setTimeout(() => this.dataLoadingSubject.next(false), 10);
      return of(cachedData);
    }
    
    return this.employeeService.getEmployeeById(id).pipe(
      tap(employee => {
        if (employee) {
          this.cacheService.set(cacheKey, employee, this.CACHE_DURATIONS.EMPLOYEES);
        }
        this.dataLoadingSubject.next(false);
      }),
      catchError(error => {
        this.dataLoadingSubject.next(false);
        console.error(`Error fetching employee ${id}`, error);
        return of(undefined);
      }),
      shareReplay(1)
    );
  }

  /**
   * Get employee with all related data in a single call
   */
  getEmployeeWithRelatedData(id: string): Observable<{
    employee: Employee | undefined,
    attendance: AttendanceRecord[],
    requests: EmployeeRequest[],
    warnings: Warning[]
  }> {
    console.log(`Repository: Getting employee data for ${id}`);
    const cacheKey = `employee_full_${id}`;
    const cachedData = this.cacheService.get<any>(cacheKey);
    
    // Start by setting loading state to true
    this.dataLoadingSubject.next(true);
    
    if (cachedData) {
      console.log(`Repository: Using cached data for ${id}`);
      // Return cached data immediately and ensure loading state is reset
      this.dataLoadingSubject.next(false);
      return of(cachedData);
    }
    
    console.log(`Repository: No cache found for ${id}, fetching data`);
    
    // First, get the employee by ID - complete immediately with first()
    return this.employeeService.getEmployeeById(id).pipe(
      // Use first() to ensure it completes
      first(),
      // Switch to the combined data stream
      switchMap(employee => {
        if (!employee) {
          console.error(`Repository: Employee ${id} not found`);
          this.dataLoadingSubject.next(false);
          return of({
            employee: undefined,
            attendance: [] as AttendanceRecord[],
            requests: [] as EmployeeRequest[],
            warnings: [] as Warning[]
          });
        }
        
        console.log(`Repository: Employee ${id} found, loading related data`);
        
        // Create Observables for each data type
        const attendance$ = this.employeeService.getAttendanceByEmployee(id).pipe(
          first(),
          catchError(error => {
            console.error(`Repository: Error loading attendance: ${error}`);
            return of([] as AttendanceRecord[]);
          })
        );
        
        const requests$ = this.employeeService.getRequestsByEmployee(id).pipe(
          first(),
          catchError(error => {
            console.error(`Repository: Error loading requests: ${error}`);
            return of([] as EmployeeRequest[]);
          })
        );
        
        const warnings$ = this.employeeService.getWarningsByEmployee(id).pipe(
          first(),
          catchError(error => {
            console.error(`Repository: Error loading warnings: ${error}`);
            return of([] as Warning[]);
          })
        );
        
        // Combine all data streams and complete with a single emission
        return forkJoin({
          employee: of(employee),
          attendance: attendance$,
          requests: requests$,
          warnings: warnings$
        }).pipe(
          tap(data => {
            console.log(`Repository: All data loaded for ${id}, caching results`);
            this.cacheService.set(cacheKey, data, this.CACHE_DURATIONS.EMPLOYEES);
            this.dataLoadingSubject.next(false);
          }),
          // Ensure it completes even if there's an error
          catchError(error => {
            console.error(`Repository: Error combining data for ${id}: ${error}`);
            this.dataLoadingSubject.next(false);
            return of({
              employee,
              attendance: [] as AttendanceRecord[],
              requests: [] as EmployeeRequest[],
              warnings: [] as Warning[]
            });
          })
        );
      }),
      // Share the result with multiple subscribers
      // Don't use shareReplay here as it can cause issues when the source doesn't complete
      // Use a regular share() which is enough for our purposes
      share()
    );
  }

  /**
   * Get attendance records by employee with caching
   */
  getAttendanceByEmployee(employeeId: string): Observable<AttendanceRecord[]> {
    // Implementation depends on your backend API
    return this.employeeService.getAttendanceByEmployee(employeeId).pipe(
      tap(() => this.updateLastLoaded('attendance'))
    );
  }

  getAttendanceRecords(startDate?: string, endDate?: string): Observable<AttendanceRecord[]> {
    // Implementation depends on your backend API
    return this.employeeService.getAttendanceRecords(startDate, endDate).pipe(
      tap(() => this.updateLastLoaded('attendance'))
    );
  }

  /**
   * Get requests by employee with caching
   */
  getRequestsByEmployee(employeeId: string): Observable<EmployeeRequest[]> {
    const cacheKey = `requests_${employeeId}`;
    const cachedData = this.cacheService.get<EmployeeRequest[]>(cacheKey);
    
    if (cachedData) {
      return of(cachedData);
    }
    
    return this.employeeService.getRequestsByEmployee(employeeId).pipe(
      tap(requests => {
        this.cacheService.set(cacheKey, requests, this.CACHE_DURATIONS.REQUESTS);
      }),
      catchError(error => {
        console.error(`Error fetching requests for employee ${employeeId}`, error);
        return of([]);
      }),
      shareReplay(1)
    );
  }

  /**
   * Get warnings by employee with caching
   */
  getWarningsByEmployee(employeeId: string): Observable<Warning[]> {
    const cacheKey = `warnings_${employeeId}`;
    const cachedData = this.cacheService.get<Warning[]>(cacheKey);
    
    if (cachedData) {
      return of(cachedData);
    }
    
    return this.employeeService.getWarningsByEmployee(employeeId).pipe(
      tap(warnings => {
        this.cacheService.set(cacheKey, warnings, this.CACHE_DURATIONS.WARNINGS);
      }),
      catchError(error => {
        console.error(`Error fetching warnings for employee ${employeeId}`, error);
        return of([]);
      }),
      shareReplay(1)
    );
  }

  /**
   * Get active announcements with caching
   */
  getActiveAnnouncements(): Observable<Announcement[]> {
    const cacheKey = 'active_announcements';
    const cachedData = this.cacheService.get<Announcement[]>(cacheKey);
    
    if (cachedData) {
      return of(cachedData);
    }
    
    return this.employeeService.getActiveAnnouncements().pipe(
      tap(announcements => {
        this.cacheService.set(cacheKey, announcements, this.CACHE_DURATIONS.ANNOUNCEMENTS);
      }),
      catchError(error => {
        console.error('Error fetching announcements', error);
        return of([]);
      }),
      shareReplay(1)
    );
  }

  /**
   * Clear cache when data is updated
   */
  invalidateCache(type: 'employees' | 'employee' | 'attendance' | 'requests' | 'warnings' | 'announcements', id?: string): void {
    switch (type) {
      case 'employees':
        this.cacheService.clear('employees');
        this.cacheService.clear('employee_');
        break;
      case 'employee':
        if (id) {
          this.cacheService.remove(`employee_${id}`);
          this.cacheService.remove(`employee_full_${id}`);
        }
        this.cacheService.remove('employees');
        break;
      case 'attendance':
        if (id) {
          this.cacheService.remove(`attendance_${id}`);
          this.cacheService.remove(`employee_full_${id}`);
        }
        break;
      case 'requests':
        if (id) {
          this.cacheService.remove(`requests_${id}`);
          this.cacheService.remove(`employee_full_${id}`);
        }
        break;
      case 'warnings':
        if (id) {
          this.cacheService.remove(`warnings_${id}`);
          this.cacheService.remove(`employee_full_${id}`);
        }
        break;
      case 'announcements':
        this.cacheService.remove('active_announcements');
        break;
    }
  }
} 