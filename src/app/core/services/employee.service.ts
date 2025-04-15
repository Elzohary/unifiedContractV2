import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, first } from 'rxjs/operators';
import { 
  Employee, 
  EmployeeRequest, 
  AttendanceRecord, 
  Warning, 
  SickLeave, 
  EmployeeChange, 
  Announcement,
  Certificate,
  Identification,
  EmployeeCost,
  WorkExperience,
  UserRole,
  PermissionLevel
} from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private employeesSubject = new BehaviorSubject<Employee[]>([]);
  private requestsSubject = new BehaviorSubject<EmployeeRequest[]>([]);
  private attendanceSubject = new BehaviorSubject<AttendanceRecord[]>([]);
  private warningsSubject = new BehaviorSubject<Warning[]>([]);
  private sickLeavesSubject = new BehaviorSubject<SickLeave[]>([]);
  private changesSubject = new BehaviorSubject<EmployeeChange[]>([]);
  private announcementsSubject = new BehaviorSubject<Announcement[]>([]);
  private rolesSubject = new BehaviorSubject<UserRole[]>([]);

  // Mock user IDs for testing
  private mockEmployees: Employee[] = this.generateMockEmployees();

  constructor() {
    // Initialize with mock data
    this.employeesSubject.next(this.mockEmployees);
    this.requestsSubject.next(this.generateMockRequests());
    this.attendanceSubject.next(this.generateMockAttendance());
    this.warningsSubject.next(this.generateMockWarnings());
    this.sickLeavesSubject.next(this.generateMockSickLeaves());
    this.changesSubject.next(this.generateMockChanges());
    this.announcementsSubject.next(this.generateMockAnnouncements());
    this.rolesSubject.next(this.generateMockRoles());
  }

  // Employee CRUD operations
  getEmployees(): Observable<Employee[]> {
    return this.employeesSubject.asObservable();
  }

  getEmployeeById(id: string): Observable<Employee | undefined> {
    return this.getEmployees().pipe(
      map(employees => employees.find(employee => employee.id === id))
    );
  }

  getEmployeesByManager(managerId: string): Observable<Employee[]> {
    return this.getEmployees().pipe(
      map(employees => employees.filter(employee => 
        employee.directManager && employee.directManager.id === managerId
      ))
    );
  }

  getCurrentUserEmployee(): Observable<Employee> {
    // In a real app, this would get the employee record for the current logged-in user
    // For now, we'll return a mock employee
    return of(this.mockEmployees[0]);
  }

  addEmployee(employee: Employee): Observable<Employee> {
    const currentEmployees = this.employeesSubject.value;
    
    // Generate a new ID
    const newEmployee = {
      ...employee,
      id: `emp${currentEmployees.length + 1}`
    };
    
    const updatedEmployees = [...currentEmployees, newEmployee];
    this.employeesSubject.next(updatedEmployees);
    
    // Log the change
    this.logEmployeeChange({
      id: `chg${this.changesSubject.value.length + 1}`,
      employeeId: newEmployee.id,
      field: 'new_employee',
      oldValue: null,
      newValue: newEmployee,
      changedBy: this.mockEmployees[0], // Assuming current user
      changeDate: new Date()
    });
    
    return of(newEmployee);
  }

  updateEmployee(employee: Employee): Observable<Employee> {
    const currentEmployees = this.employeesSubject.value;
    const existingEmployee = currentEmployees.find(emp => emp.id === employee.id);
    
    if (!existingEmployee) {
      return throwError(() => new Error('Employee not found'));
    }
    
    // Log changes for each changed field
    Object.keys(employee).forEach(key => {
      if (key !== 'id' && JSON.stringify(employee[key as keyof Employee]) !== 
          JSON.stringify(existingEmployee[key as keyof Employee])) {
        this.logEmployeeChange({
          id: `chg${this.changesSubject.value.length + 1}`,
          employeeId: employee.id,
          field: key,
          oldValue: existingEmployee[key as keyof Employee],
          newValue: employee[key as keyof Employee],
          changedBy: this.mockEmployees[0], // Assuming current user
          changeDate: new Date()
        });
      }
    });
    
    const updatedEmployees = currentEmployees.map(emp => 
      emp.id === employee.id ? { ...emp, ...employee } : emp
    );
    
    this.employeesSubject.next(updatedEmployees);
    return of(employee);
  }

  deleteEmployee(id: string): Observable<boolean> {
    const currentEmployees = this.employeesSubject.value;
    const existingEmployee = currentEmployees.find(emp => emp.id === id);
    
    if (!existingEmployee) {
      return throwError(() => new Error('Employee not found'));
    }
    
    const updatedEmployees = currentEmployees.filter(emp => emp.id !== id);
    this.employeesSubject.next(updatedEmployees);
    
    // Log the deletion
    this.logEmployeeChange({
      id: `chg${this.changesSubject.value.length + 1}`,
      employeeId: id,
      field: 'delete_employee',
      oldValue: existingEmployee,
      newValue: null,
      changedBy: this.mockEmployees[0], // Assuming current user
      changeDate: new Date()
    });
    
    return of(true);
  }

  // Request operations
  getRequests(): Observable<EmployeeRequest[]> {
    return this.requestsSubject.asObservable();
  }

  getRequestsByEmployee(employeeId: string): Observable<EmployeeRequest[]> {
    return this.getRequests().pipe(
      map(requests => requests.filter(request => 
        request.employee.id === employeeId
      ))
    );
  }

  getRequestsAssignedToEmployee(employeeId: string): Observable<EmployeeRequest[]> {
    return this.getRequests().pipe(
      map(requests => requests.filter(request => 
        request.responseBy && request.responseBy.id === employeeId
      ))
    );
  }

  addRequest(request: EmployeeRequest): Observable<EmployeeRequest> {
    const currentRequests = this.requestsSubject.value;
    
    // Generate a new ID
    const newRequest = {
      ...request,
      id: `req${currentRequests.length + 1}`,
      requestDate: new Date(),
      status: 'pending' as const
    };
    
    const updatedRequests = [...currentRequests, newRequest];
    this.requestsSubject.next(updatedRequests);
    
    return of(newRequest);
  }

  updateRequest(request: EmployeeRequest): Observable<EmployeeRequest> {
    const currentRequests = this.requestsSubject.value;
    const existingRequest = currentRequests.find(req => req.id === request.id);
    
    if (!existingRequest) {
      return throwError(() => new Error('Request not found'));
    }
    
    const updatedRequests = currentRequests.map(req => 
      req.id === request.id ? { ...req, ...request } : req
    );
    
    this.requestsSubject.next(updatedRequests);
    return of(request);
  }

  // Attendance operations
  getAttendance(): Observable<AttendanceRecord[]> {
    return this.attendanceSubject.asObservable();
  }

  getAttendanceByEmployee(employeeId: string): Observable<AttendanceRecord[]> {
    return this.getAttendance().pipe(
      map(records => records.filter(record => 
        record.employee.id === employeeId
      ))
    );
  }

  addAttendanceRecord(record: AttendanceRecord): Observable<AttendanceRecord> {
    const currentRecords = this.attendanceSubject.value;
    const updatedRecords = [...currentRecords, record];
    this.attendanceSubject.next(updatedRecords);
    return of(record);
  }

  // Warning operations
  getWarnings(): Observable<Warning[]> {
    return this.warningsSubject.asObservable();
  }

  getWarningsByEmployee(employeeId: string): Observable<Warning[]> {
    return this.getWarnings().pipe(
      map(warnings => warnings.filter(warning => 
        warning.issuedBy.id === employeeId
      ))
    );
  }

  addWarning(warning: Warning): Observable<Warning> {
    const currentWarnings = this.warningsSubject.value;
    
    // Generate a new ID
    const newWarning = {
      ...warning,
      id: `warn${currentWarnings.length + 1}`,
      issueDate: new Date()
    };
    
    const updatedWarnings = [...currentWarnings, newWarning];
    this.warningsSubject.next(updatedWarnings);
    
    return of(newWarning);
  }

  // Sick Leave operations
  getSickLeaves(): Observable<SickLeave[]> {
    return this.sickLeavesSubject.asObservable();
  }

  getSickLeavesByEmployee(employeeId: string): Observable<SickLeave[]> {
    return this.getSickLeaves().pipe(
      map(leaves => leaves.filter(leave => 
        leave.approvedBy?.id === employeeId
      ))
    );
  }

  addSickLeave(leave: SickLeave): Observable<SickLeave> {
    const currentLeaves = this.sickLeavesSubject.value;
    
    // Generate a new ID
    const newLeave = {
      ...leave,
      id: `sick${currentLeaves.length + 1}`
    };
    
    const updatedLeaves = [...currentLeaves, newLeave];
    this.sickLeavesSubject.next(updatedLeaves);
    
    return of(newLeave);
  }

  // Employee Changes (Audit Log)
  getChanges(): Observable<EmployeeChange[]> {
    return this.changesSubject.asObservable();
  }

  getChangesByEmployee(employeeId: string): Observable<EmployeeChange[]> {
    return this.getChanges().pipe(
      map(changes => changes.filter(change => 
        change.employeeId === employeeId
      ))
    );
  }

  logEmployeeChange(change: EmployeeChange): void {
    const currentChanges = this.changesSubject.value;
    const updatedChanges = [...currentChanges, change];
    this.changesSubject.next(updatedChanges);
  }

  // Announcements
  getAnnouncements(): Observable<Announcement[]> {
    return this.announcementsSubject.asObservable();
  }

  getActiveAnnouncements(): Observable<Announcement[]> {
    const today = new Date();
    return this.getAnnouncements().pipe(
      map(announcements => announcements.filter(announcement => 
        !announcement.expiryDate || new Date(announcement.expiryDate) > today
      ))
    );
  }

  addAnnouncement(announcement: Announcement): Observable<Announcement> {
    const currentAnnouncements = this.announcementsSubject.value;
    
    // Generate a new ID
    const newAnnouncement = {
      ...announcement,
      id: `ann${currentAnnouncements.length + 1}`,
      createdDate: new Date()
    };
    
    const updatedAnnouncements = [...currentAnnouncements, newAnnouncement];
    this.announcementsSubject.next(updatedAnnouncements);
    
    return of(newAnnouncement);
  }

  // User Roles
  getRoles(): Observable<UserRole[]> {
    return this.rolesSubject.asObservable();
  }

  // Mock data generators
  private generateMockEmployees(): Employee[] {
    // Create a few employees for demo purposes
    const manager: Partial<Employee> = {
      id: 'emp1',
      name: 'Ahmed Al-Mansour',
      photo: 'assets/images/employees/manager.jpg',
      jobTitle: 'HR Director',
      badgeNumber: 'B001',
      workLocation: 'Riyadh HQ',
      homeAddress: '123 King Fahd Road, Riyadh',
      homeType: 'company',
      companyPhone: '+966 11 234 5678',
      personalPhone: '+966 50 123 4567',
      iqamaNumber: 'IQ1234567',
      age: 45,
      nationality: 'Saudi Arabia',
      workTimeRatio: 98,
      monthlyHours: 176,
      avgLateMinutes: 2,
      joinDate: new Date('2015-01-15'),
      currentProject: 'HR Operations',
      sickLeaveCounter: 2,
      offDays: 15,
      user: {
        id: 'user1',
        name: 'Ahmed Al-Mansour',
        email: 'ahmed@example.com'
      }
    };

    const employee1: Partial<Employee> = {
      id: 'emp2',
      name: 'Mohammad Al-Farsi',
      photo: 'assets/images/employees/employee1.jpg',
      jobTitle: 'Senior Site Engineer',
      badgeNumber: 'B002',
      workLocation: 'Jeddah Project Site',
      homeAddress: '456 Palms Avenue, Jeddah',
      homeType: 'company',
      companyPhone: '+966 12 345 6789',
      personalPhone: '+966 55 234 5678',
      iqamaNumber: 'IQ2345678',
      age: 35,
      nationality: 'Egypt',
      directManager: manager as Employee,
      workTimeRatio: 95,
      monthlyHours: 180,
      avgLateMinutes: 5,
      joinDate: new Date('2018-03-10'),
      currentProject: 'Jeddah Tower Construction',
      sickLeaveCounter: 1,
      offDays: 10,
      user: {
        id: 'user2',
        name: 'Mohammad Al-Farsi',
        email: 'mohammad@example.com'
      }
    };

    const employee2: Partial<Employee> = {
      id: 'emp3',
      name: 'Fatima Al-Zahrani',
      photo: 'assets/images/employees/employee2.jpg',
      jobTitle: 'HR Specialist',
      badgeNumber: 'B003',
      workLocation: 'Riyadh HQ',
      homeAddress: '789 Olaya Street, Riyadh',
      homeType: 'personal',
      companyPhone: '+966 11 345 6789',
      personalPhone: '+966 54 345 6789',
      iqamaNumber: 'IQ3456789',
      age: 32,
      nationality: 'Saudi Arabia',
      directManager: manager as Employee,
      workTimeRatio: 97,
      monthlyHours: 160,
      avgLateMinutes: 3,
      joinDate: new Date('2019-06-20'),
      currentProject: 'Employee Onboarding Process',
      sickLeaveCounter: 0,
      offDays: 18,
      user: {
        id: 'user3',
        name: 'Fatima Al-Zahrani',
        email: 'fatima@example.com'
      }
    };

    const employee3: Partial<Employee> = {
      id: 'emp4',
      name: 'Khalid Al-Otaibi',
      photo: 'assets/images/employees/employee3.jpg',
      jobTitle: 'Project Manager',
      badgeNumber: 'B004',
      workLocation: 'Dammam Site',
      homeAddress: '321 Gulf Road, Dammam',
      homeType: 'company',
      companyPhone: '+966 13 456 7890',
      personalPhone: '+966 56 456 7890',
      iqamaNumber: 'IQ4567890',
      age: 40,
      nationality: 'Saudi Arabia',
      directManager: manager as Employee,
      workTimeRatio: 99,
      monthlyHours: 190,
      avgLateMinutes: 1,
      joinDate: new Date('2017-09-05'),
      currentProject: 'Dammam Port Expansion',
      sickLeaveCounter: 3,
      offDays: 12,
      user: {
        id: 'user4',
        name: 'Khalid Al-Otaibi',
        email: 'khalid@example.com'
      }
    };

    // Create mock data for each employee
    const employees = [
      manager, 
      employee1, 
      employee2, 
      employee3
    ] as Employee[];

    // Add managed employees to manager
    manager.managedEmployees = [employee1, employee2, employee3] as Employee[];

    // Add mock data for other properties
    employees.forEach(employee => {
      employee.attendance = [];
      employee.assignedTasks = [];
      employee.certificates = [];
      employee.pastExperience = [];
      employee.sentRequests = [];
      employee.identifications = [];
      employee.warnings = [];
      employee.sickLeaves = [];
      employee.cost = this.generateMockEmployeeCost(employee);
      
      if (employee.id === 'emp1') {
        employee.receivedRequests = [];
      }
    });

    return employees;
  }

  private generateMockEmployeeCost(employee: Employee): EmployeeCost {
    // Generate random costs based on job title
    const isManager = employee.jobTitle.toLowerCase().includes('director') || 
                      employee.jobTitle.toLowerCase().includes('manager');
    const isSpecialist = employee.jobTitle.toLowerCase().includes('specialist') ||
                         employee.jobTitle.toLowerCase().includes('engineer');
    
    const baseSalary = isManager ? 25000 : (isSpecialist ? 15000 : 8000);
    
    return {
      salary: baseSalary,
      homeAllowance: employee.homeType === 'company' ? 5000 : 0,
      iqamaFees: employee.nationality !== 'Saudi Arabia' ? 2000 : 0,
      drivingLicenseFees: 500,
      insuranceFees: 2500,
      carAllowance: isManager ? 3000 : (isSpecialist ? 1500 : 0),
      simCardFees: 200,
      certificatesFees: isSpecialist ? 1000 : 0,
      otherCosts: [],
      totalCost: 0 // Will be calculated after other costs are set
    };
  }

  private generateMockRequests(): EmployeeRequest[] {
    const requests: EmployeeRequest[] = [];
    const employees = this.mockEmployees;
    const today = new Date();
    
    // Types of requests
    const requestTypes: ('vacation' | 'sickLeave' | 'remote' | 'permission' | 'resignation' | 'other')[] = 
      ['vacation', 'sickLeave', 'remote', 'permission', 'other'];
    
    // Statuses
    const statuses: ('pending' | 'approved' | 'rejected')[] = ['pending', 'approved', 'rejected'];
    
    // Generate random requests for each employee
    for (const employee of employees) {
      const numRequests = Math.floor(Math.random() * 5) + 1;
      
      for (let i = 0; i < numRequests; i++) {
        const requestDate = new Date(today);
        requestDate.setDate(requestDate.getDate() - Math.floor(Math.random() * 30));
        
        const startDate = new Date(requestDate);
        startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 10) + 1);
        
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 5) + 1);
        
        const type = requestTypes[Math.floor(Math.random() * requestTypes.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        let responseDate = null;
        let responseBy = null;
        let responseNotes = '';
        
        if (status !== 'pending') {
          responseDate = new Date(requestDate);
          responseDate.setDate(responseDate.getDate() + Math.floor(Math.random() * 3) + 1);
          responseBy = employees[0]; // Manager
          responseNotes = status === 'approved' ? 'Approved by manager' : 'Rejected due to scheduling conflicts';
        }
        
        requests.push({
          id: `req-${employee.id}-${requestDate.getTime()}`,
          employee: employee,
          type: type,
          requestDate: requestDate,
          startDate: startDate,
          endDate: endDate,
          reason: type === 'vacation' ? 'Annual leave for family vacation' :
                  type === 'sickLeave' ? 'Not feeling well, need rest' :
                  type === 'remote' ? 'Working from home due to transportation issues' :
                  type === 'permission' ? 'Need to attend a personal appointment' :
                  'Other reason',
          details: 'Additional details for the request',
          status: status,
          responseDate: responseDate,
          responseBy: responseBy,
          responseNotes: responseNotes
        });
      }
    }
    
    return requests;
  }

  private generateMockAttendance(): AttendanceRecord[] {
    const records: AttendanceRecord[] = [];
    const employees = this.mockEmployees;
    const today = new Date();
    
    // Generate 30 days of attendance for each employee
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      for (const employee of employees) {
        // Skip weekends
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 5 || dayOfWeek === 6) continue; // Friday and Saturday
        
        // Randomize attendance status
        const rand = Math.random();
        let status: 'present' | 'absent' | 'late' | 'halfDay' | 'vacation' | 'sickLeave' | 'remote';
        let checkIn = '08:00';
        let checkOut = '17:00';
        let lateMinutes = 0;
        let totalHours: string | number = '9.0';
        
        if (rand < 0.7) {
          status = 'present';
        } else if (rand < 0.8) {
          status = 'late';
          const lateBy = Math.floor(Math.random() * 60) + 5;
          lateMinutes = lateBy;
          const hours = Math.floor(lateBy / 60) + 8;
          const mins = lateBy % 60;
          checkIn = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
          totalHours = (9 - (lateBy / 60)).toFixed(1);
        } else if (rand < 0.85) {
          status = 'halfDay';
          checkOut = '12:00';
          totalHours = '4.0';
        } else if (rand < 0.9) {
          status = 'vacation';
          checkIn = 'N/A';
          checkOut = 'N/A';
          totalHours = '0';
        } else if (rand < 0.95) {
          status = 'sickLeave';
          checkIn = 'N/A';
          checkOut = 'N/A';
          totalHours = '0';
        } else {
          status = 'remote';
          totalHours = '8.0';
        }
        
        records.push({
          id: `att-${employee.id}-${date.toISOString().split('T')[0]}`,
          employee: employee,
          date: date,
          checkIn: checkIn,
          checkOut: checkOut,
          status: status,
          lateMinutes: lateMinutes,
          totalHours: totalHours,
          notes: status === 'sickLeave' ? 'Medical certificate submitted' : 
                 status === 'vacation' ? 'Annual leave' : 
                 status === 'remote' ? 'Working from home' : ''
        });
      }
    }
    
    return records;
  }

  private generateMockWarnings(): Warning[] {
    const employees = this.employeesSubject.value;
    if (employees.length < 2) return [];

    return [
      {
        id: `warn1-${employees[1].id}`,
        title: 'Late Arrival Warning',
        description: 'Consistent late arrivals in past month',
        issueDate: new Date('2023-04-15'),
        issuedBy: employees[0],
        severity: 'minor',
        acknowledgement: {
          acknowledged: true,
          date: new Date('2023-04-16'),
          comments: 'I will improve my punctuality'
        }
      },
      {
        id: `warn2-${employees[3].id}`,
        title: 'Safety Protocol Violation',
        description: 'Failed to wear proper PPE on site',
        issueDate: new Date('2023-05-20'),
        issuedBy: employees[0],
        severity: 'moderate',
        acknowledgement: {
          acknowledged: true,
          date: new Date('2023-05-21')
        }
      }
    ];
  }

  private generateMockSickLeaves(): SickLeave[] {
    const employees = this.employeesSubject.value;
    if (employees.length < 2) return [];

    return [
      {
        id: `sick1-${employees[2].id}`,
        startDate: new Date('2023-03-10'),
        endDate: new Date('2023-03-12'),
        reason: 'Flu',
        approved: true,
        approvedBy: employees[0]
      },
      {
        id: `sick2-${employees[1].id}`,
        startDate: new Date('2023-06-05'),
        endDate: new Date('2023-06-05'),
        reason: 'Migraine',
        approved: true,
        approvedBy: employees[0]
      }
    ];
  }

  private generateMockChanges(): EmployeeChange[] {
    const employees = this.employeesSubject.value;
    if (employees.length < 2) return [];

    return [
      {
        id: 'chg1',
        employeeId: employees[1].id,
        field: 'jobTitle',
        oldValue: 'Site Engineer',
        newValue: 'Senior Site Engineer',
        changedBy: employees[0],
        changeDate: new Date('2023-01-15'),
        approvedBy: employees[0],
        approvalDate: new Date('2023-01-15')
      },
      {
        id: 'chg2',
        employeeId: employees[2].id,
        field: 'salary',
        oldValue: 12000,
        newValue: 15000,
        changedBy: employees[0],
        changeDate: new Date('2023-02-01'),
        reason: 'Annual salary review',
        approvedBy: employees[0],
        approvalDate: new Date('2023-02-01')
      }
    ];
  }

  private generateMockAnnouncements(): Announcement[] {
    const employees = this.employeesSubject.value;
    if (employees.length < 1) return [];

    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 1);

    return [
      {
        id: 'ann1',
        title: 'Company Picnic',
        content: 'Annual company picnic will be held on July 15th at Al Khobar Corniche. Families are welcome!',
        createdBy: employees[0],
        createdDate: new Date('2023-06-15'),
        expiryDate: new Date('2023-07-16'),
        priority: 'medium'
      },
      {
        id: 'ann2',
        title: 'New Health Insurance Provider',
        content: 'We are switching to a new health insurance provider starting August 1st. Please submit your documents by July 20th.',
        createdBy: employees[0],
        createdDate: new Date('2023-06-20'),
        expiryDate: futureDate,
        priority: 'high'
      }
    ];
  }

  private generateMockRoles(): UserRole[] {
    return [
      {
        id: 'role1',
        name: 'HR Admin',
        description: 'Full access to all HR functions',
        permissions: {
          employees: PermissionLevel.ADMIN,
          attendance: PermissionLevel.ADMIN,
          requests: PermissionLevel.ADMIN,
          warnings: PermissionLevel.ADMIN,
          reports: PermissionLevel.ADMIN,
          settings: PermissionLevel.ADMIN,
          costs: PermissionLevel.ADMIN
        },
        createdDate: new Date('2023-01-01')
      },
      {
        id: 'role2',
        name: 'HR Specialist',
        description: 'Can manage employee records and process requests',
        permissions: {
          employees: PermissionLevel.EDIT,
          attendance: PermissionLevel.EDIT,
          requests: PermissionLevel.APPROVE,
          warnings: PermissionLevel.EDIT,
          reports: PermissionLevel.VIEW,
          settings: PermissionLevel.NONE,
          costs: PermissionLevel.VIEW
        },
        createdDate: new Date('2023-01-01')
      },
      {
        id: 'role3',
        name: 'Department Manager',
        description: 'Can approve requests and view department employees',
        permissions: {
          employees: PermissionLevel.VIEW,
          attendance: PermissionLevel.VIEW,
          requests: PermissionLevel.APPROVE,
          warnings: PermissionLevel.EDIT,
          reports: PermissionLevel.VIEW,
          settings: PermissionLevel.NONE,
          costs: PermissionLevel.NONE
        },
        createdDate: new Date('2023-01-01')
      },
      {
        id: 'role4',
        name: 'Employee',
        description: 'Basic employee access',
        permissions: {
          employees: PermissionLevel.NONE,
          attendance: PermissionLevel.VIEW,
          requests: PermissionLevel.VIEW,
          warnings: PermissionLevel.VIEW,
          reports: PermissionLevel.NONE,
          settings: PermissionLevel.NONE,
          costs: PermissionLevel.NONE
        },
        createdDate: new Date('2023-01-01')
      }
    ];
  }

  getEmployeeAttendance(employeeId: string, startDate?: string, endDate?: string): Observable<AttendanceRecord[]> {
    return this.getAttendanceByEmployee(employeeId).pipe(
      map(records => {
        if (!startDate || !endDate) {
          return records;
        }
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return records.filter(record => {
          const recordDate = new Date(record.date);
          return recordDate >= start && recordDate <= end;
        });
      })
    );
  }

  getAttendanceRecords(startDate?: string, endDate?: string): Observable<AttendanceRecord[]> {
    return this.getAttendance().pipe(
      map(records => {
        if (!startDate || !endDate) {
          return records;
        }
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return records.filter(record => {
          const recordDate = new Date(record.date);
          return recordDate >= start && recordDate <= end;
        });
      })
    );
  }

  getEmployeeRequests(employeeId: string): Observable<EmployeeRequest[]> {
    return this.getRequestsByEmployee(employeeId);
  }

  addEmployeeRequest(employeeId: string, request: EmployeeRequest): Observable<EmployeeRequest> {
    // Generate a unique ID for the new request
    request.id = Math.random().toString(36).substring(2, 15);
    
    // Get the current requests
    return this.getRequests().pipe(
      first(),
      map(requests => {
        // Add the new request
        const updatedRequests = [...requests, request];
        this.requestsSubject.next(updatedRequests);
        return request;
      })
    );
  }

  updateEmployeeRequest(employeeId: string, request: EmployeeRequest): Observable<EmployeeRequest> {
    return this.getRequests().pipe(
      first(),
      map(requests => {
        // Find and update the request
        const index = requests.findIndex(r => r.id === request.id);
        if (index === -1) {
          throw new Error(`Request with ID ${request.id} not found`);
        }
        
        const updatedRequests = [...requests];
        updatedRequests[index] = request;
        this.requestsSubject.next(updatedRequests);
        
        return request;
      })
    );
  }

  deleteEmployeeRequest(employeeId: string, requestId: string): Observable<boolean> {
    return this.getRequests().pipe(
      first(),
      map(requests => {
        // Find and remove the request
        const index = requests.findIndex(r => r.id === requestId);
        if (index === -1) {
          throw new Error(`Request with ID ${requestId} not found`);
        }
        
        const updatedRequests = [...requests];
        updatedRequests.splice(index, 1);
        this.requestsSubject.next(updatedRequests);
        
        return true;
      })
    );
  }

  addEmployeeAttendance(employeeId: string, record: AttendanceRecord): Observable<AttendanceRecord> {
    // Generate a unique ID for the new attendance record
    record.id = Math.random().toString(36).substring(2, 15);
    
    // Get the current attendance records
    return this.getAttendance().pipe(
      first(),
      map(records => {
        // Add the new record
        const updatedRecords = [...records, record];
        this.attendanceSubject.next(updatedRecords);
        return record;
      })
    );
  }

  updateEmployeeAttendance(employeeId: string, record: AttendanceRecord): Observable<AttendanceRecord> {
    return this.getAttendance().pipe(
      first(),
      map(records => {
        // Find and update the record
        const index = records.findIndex(r => r.id === record.id);
        if (index === -1) {
          throw new Error(`Attendance record with ID ${record.id} not found`);
        }
        
        const updatedRecords = [...records];
        updatedRecords[index] = record;
        this.attendanceSubject.next(updatedRecords);
        
        return record;
      })
    );
  }

  deleteEmployeeAttendance(employeeId: string, recordId: string): Observable<boolean> {
    return this.getAttendance().pipe(
      first(),
      map(records => {
        // Find and remove the record
        const index = records.findIndex(r => r.id === recordId);
        if (index === -1) {
          throw new Error(`Attendance record with ID ${recordId} not found`);
        }
        
        const updatedRecords = [...records];
        updatedRecords.splice(index, 1);
        this.attendanceSubject.next(updatedRecords);
        
        return true;
      })
    );
  }
} 