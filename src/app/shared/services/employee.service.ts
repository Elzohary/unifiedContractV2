import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
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
    return of(this.mockEmployees[0]).pipe(delay(500));
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
    
    return of(newEmployee).pipe(delay(500));
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
    return of(employee).pipe(delay(500));
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
    
    return of(true).pipe(delay(500));
  }

  // Request operations
  getRequests(): Observable<EmployeeRequest[]> {
    return this.requestsSubject.asObservable();
  }

  getRequestsByEmployee(employeeId: string): Observable<EmployeeRequest[]> {
    return this.getRequests().pipe(
      map(requests => requests.filter(request => 
        request.requestedBy.id === employeeId
      ))
    );
  }

  getRequestsAssignedToEmployee(employeeId: string): Observable<EmployeeRequest[]> {
    return this.getRequests().pipe(
      map(requests => requests.filter(request => 
        request.assignedTo && request.assignedTo.id === employeeId
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
    
    return of(newRequest).pipe(delay(500));
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
    return of(request).pipe(delay(500));
  }

  // Attendance operations
  getAttendanceRecords(): Observable<AttendanceRecord[]> {
    return this.attendanceSubject.asObservable();
  }

  getAttendanceByEmployee(employeeId: string): Observable<AttendanceRecord[]> {
    return this.getAttendanceRecords().pipe(
      map(records => records.filter(record => 
        record.id.startsWith(`${employeeId}-`)
      ))
    );
  }

  addAttendanceRecord(record: AttendanceRecord): Observable<AttendanceRecord> {
    const currentRecords = this.attendanceSubject.value;
    const updatedRecords = [...currentRecords, record];
    this.attendanceSubject.next(updatedRecords);
    return of(record).pipe(delay(500));
  }

  // Warning operations
  getWarnings(): Observable<Warning[]> {
    return this.warningsSubject.asObservable();
  }

  getWarningsByEmployee(employeeId: string): Observable<Warning[]> {
    return this.getWarnings().pipe(
      map(warnings => warnings.filter(warning => 
        warning.id.includes(employeeId)
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
    
    return of(newWarning).pipe(delay(500));
  }

  // Sick Leave operations
  getSickLeaves(): Observable<SickLeave[]> {
    return this.sickLeavesSubject.asObservable();
  }

  getSickLeavesByEmployee(employeeId: string): Observable<SickLeave[]> {
    return this.getSickLeaves().pipe(
      map(leaves => leaves.filter(leave => 
        leave.id.includes(employeeId)
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
    
    return of(newLeave).pipe(delay(500));
  }

  // Employee Changes (Audit Log)
  getEmployeeChanges(): Observable<EmployeeChange[]> {
    return this.changesSubject.asObservable();
  }

  getEmployeeChangesByEmployee(employeeId: string): Observable<EmployeeChange[]> {
    return this.getEmployeeChanges().pipe(
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
    const now = new Date();
    return this.getAnnouncements().pipe(
      map(announcements => announcements.filter(announcement => 
        !announcement.expiryDate || announcement.expiryDate > now
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
    
    return of(newAnnouncement).pipe(delay(500));
  }

  // User Roles
  getUserRoles(): Observable<UserRole[]> {
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
    const employees = this.employeesSubject.value;
    if (employees.length < 2) return [];

    return [
      {
        id: 'req1',
        type: 'vacation',
        title: 'Annual Leave Request',
        description: 'Request for annual leave for family vacation',
        requestDate: new Date('2023-05-01'),
        startDate: new Date('2023-06-15'),
        endDate: new Date('2023-06-30'),
        status: 'approved',
        requestedBy: employees[1],
        assignedTo: employees[0],
        approvedBy: employees[0],
        approvalDate: new Date('2023-05-05'),
        comments: []
      },
      {
        id: 'req2',
        type: 'sick-leave',
        title: 'Sick Leave Request',
        description: 'Not feeling well, need a day off',
        requestDate: new Date('2023-07-10'),
        startDate: new Date('2023-07-11'),
        endDate: new Date('2023-07-11'),
        status: 'pending',
        requestedBy: employees[2],
        assignedTo: employees[0],
        comments: []
      },
      {
        id: 'req3',
        type: 'equipment',
        title: 'New Laptop Request',
        description: 'Current laptop is slow and affecting productivity',
        requestDate: new Date('2023-06-20'),
        status: 'rejected',
        requestedBy: employees[3],
        assignedTo: employees[0],
        approvedBy: employees[0],
        approvalDate: new Date('2023-06-25'),
        comments: [
          {
            id: 'cmt1',
            content: 'Budget constraints, please try again next quarter',
            createdBy: employees[0],
            createdDate: new Date('2023-06-25'),
            isPrivate: false
          }
        ]
      }
    ];
  }

  private generateMockAttendance(): AttendanceRecord[] {
    const employees = this.employeesSubject.value;
    const records: AttendanceRecord[] = [];

    // Generate 10 days of attendance for each employee
    employees.forEach(employee => {
      for (let i = 0; i < 10; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Skip weekends (Friday and Saturday in Saudi Arabia)
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 5 || dayOfWeek === 6) continue;
        
        const isLate = Math.random() < 0.2; // 20% chance of being late
        const lateMinutes = isLate ? Math.floor(Math.random() * 30) + 1 : 0;
        
        const checkIn = new Date(date);
        checkIn.setHours(8, lateMinutes, 0, 0);
        
        const checkOut = new Date(date);
        checkOut.setHours(17, 0, 0, 0);
        
        const workHours = 9 - (lateMinutes / 60);
        
        records.push({
          id: `${employee.id}-${date.toISOString().split('T')[0]}`,
          date,
          checkIn,
          checkOut,
          status: isLate ? 'late' : 'present',
          lateMinutes: isLate ? lateMinutes : 0,
          workHours
        });
      }
    });

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
} 