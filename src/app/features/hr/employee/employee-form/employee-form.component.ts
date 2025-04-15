import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Employee, Certificate, WorkExperience, Identification, EmployeeUser } from '../../../../core/models/employee.model';
import { DataRepositoryService } from '../../../../core/services/data-repository.service';
import { EmployeeService } from '../../../../core/services/employee.service';
import { finalize, first, catchError, of } from 'rxjs';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatStepperModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatChipsModule,
    MatDividerModule,
    MatTabsModule,
    MatExpansionModule,
    RouterModule
  ],
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss']
})
export class EmployeeFormComponent implements OnInit {
  employeeForm!: FormGroup;
  isEditMode = false;
  employeeId: string | null = null;
  isLoading = false;
  hasError = false;
  errorMessage = '';
  
  // Dropdown options
  homeTypes = [
    { value: 'company', label: 'Company Provided' },
    { value: 'personal', label: 'Personal' }
  ];
  
  nationalityOptions = [
    'Saudi Arabian', 'Egyptian', 'Indian', 'Pakistani', 'Filipino', 
    'Bangladeshi', 'Jordanian', 'Syrian', 'Yemeni', 'Sudanese',
    'Lebanese', 'Palestinian', 'Turkish', 'Other'
  ];
  
  workLocationOptions = [
    'Riyadh HQ', 'Jeddah Office', 'Dammam Office', 'Remote', 'Client Site'
  ];
  
  identificationTypes = [
    { value: 'passport', label: 'Passport' },
    { value: 'id-card', label: 'ID Card' },
    { value: 'driver-license', label: 'Driver License' },
    { value: 'iqama', label: 'Iqama' },
    { value: 'other', label: 'Other' }
  ];

  constructor(
    private fb: FormBuilder,
    private dataRepository: DataRepositoryService,
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    
    // Check if we're in edit mode
    this.route.paramMap.subscribe(params => {
      this.employeeId = params.get('id');
      
      if (this.employeeId) {
        this.isEditMode = true;
        this.loadEmployeeData(this.employeeId);
      }
    });
  }
  
  initializeForm(): void {
    this.employeeForm = this.fb.group({
      personalInfo: this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        age: [null, [Validators.required, Validators.min(18), Validators.max(70)]],
        nationality: ['', Validators.required],
        photo: [''],
        homeAddress: ['', Validators.required],
        homeType: ['personal', Validators.required],
        companyPhone: [''],
        personalPhone: ['', Validators.required],
        iqamaNumber: ['']
      }),
      
      employmentInfo: this.fb.group({
        jobTitle: ['', Validators.required],
        badgeNumber: ['', Validators.required],
        workLocation: ['', Validators.required],
        joinDate: [new Date(), Validators.required],
        currentProject: [''],
        monthlyHours: [160, [Validators.required, Validators.min(1)]],
        directManagerId: [''],
        offDays: [21, [Validators.required, Validators.min(0)]]
      }),
      
      userAccount: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        role: ['employee', Validators.required]
      }),
      
      certificates: this.fb.array([]),
      
      identifications: this.fb.array([]),
      
      workExperience: this.fb.array([])
    });
  }
  
  loadEmployeeData(id: string): void {
    this.isLoading = true;
    this.hasError = false;
    
    this.dataRepository.getEmployeeById(id)
      .pipe(
        first(),
        catchError(err => {
          this.hasError = true;
          this.errorMessage = `Failed to load employee data: ${err.message || 'Unknown error'}`;
          return of(undefined);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(employee => {
        if (employee) {
          this.populateForm(employee);
        } else if (!this.hasError) {
          this.hasError = true;
          this.errorMessage = 'Employee not found';
        }
      });
  }
  
  populateForm(employee: Employee): void {
    // Update personal info
    const personalInfo = this.employeeForm.get('personalInfo');
    if (personalInfo) {
      personalInfo.patchValue({
        name: employee.name,
        age: employee.age,
        nationality: employee.nationality,
        photo: employee.photo,
        homeAddress: employee.homeAddress,
        homeType: employee.homeType,
        companyPhone: employee.companyPhone,
        personalPhone: employee.personalPhone,
        iqamaNumber: employee.iqamaNumber
      });
    }
    
    // Update employment info
    const employmentInfo = this.employeeForm.get('employmentInfo');
    if (employmentInfo) {
      employmentInfo.patchValue({
        jobTitle: employee.jobTitle,
        badgeNumber: employee.badgeNumber,
        workLocation: employee.workLocation,
        joinDate: new Date(employee.joinDate),
        currentProject: employee.currentProject || '',
        monthlyHours: employee.monthlyHours,
        directManagerId: employee.directManager?.id || '',
        offDays: employee.offDays
      });
    }
    
    // Update user account
    const userAccount = this.employeeForm.get('userAccount');
    if (userAccount && employee.user) {
      userAccount.patchValue({
        email: employee.user.email,
        role: employee.user.role || 'employee'
      });
    }
    
    // Clear and repopulate certificates
    this.certificates.clear();
    if (employee.certificates && employee.certificates.length > 0) {
      employee.certificates.forEach(cert => {
        this.certificates.push(this.createCertificateFormGroup(cert));
      });
    }
    
    // Clear and repopulate identifications
    this.identifications.clear();
    if (employee.identifications && employee.identifications.length > 0) {
      employee.identifications.forEach(id => {
        this.identifications.push(this.createIdentificationFormGroup(id));
      });
    }
    
    // Clear and repopulate work experience
    this.workExperience.clear();
    if (employee.pastExperience && employee.pastExperience.length > 0) {
      employee.pastExperience.forEach(exp => {
        this.workExperience.push(this.createWorkExperienceFormGroup(exp));
      });
    }
  }
  
  // Getters for form controls
  get certificates() {
    return this.employeeForm.get('certificates') as FormArray;
  }
  
  get identifications() {
    return this.employeeForm.get('identifications') as FormArray;
  }
  
  get workExperience() {
    return this.employeeForm.get('workExperience') as FormArray;
  }
  
  // Form group creators
  createCertificateFormGroup(cert?: Certificate): FormGroup {
    return this.fb.group({
      id: [cert?.id || ''],
      name: [cert?.name || '', Validators.required],
      issuer: [cert?.issuer || '', Validators.required],
      issueDate: [cert?.issueDate ? new Date(cert.issueDate) : new Date(), Validators.required],
      expiryDate: [cert?.expiryDate ? new Date(cert.expiryDate) : null],
      documentUrl: [cert?.documentUrl || ''],
      verified: [cert?.verified || false]
    });
  }
  
  createIdentificationFormGroup(id?: Identification): FormGroup {
    return this.fb.group({
      id: [id?.id || ''],
      type: [id?.type || 'passport', Validators.required],
      number: [id?.number || '', Validators.required],
      issueDate: [id?.issueDate ? new Date(id.issueDate) : new Date(), Validators.required],
      expiryDate: [id?.expiryDate ? new Date(id.expiryDate) : new Date(), Validators.required],
      issuingCountry: [id?.issuingCountry || 'Saudi Arabia', Validators.required],
      documentUrl: [id?.documentUrl || '']
    });
  }
  
  createWorkExperienceFormGroup(exp?: WorkExperience): FormGroup {
    return this.fb.group({
      id: [exp?.id || ''],
      company: [exp?.company || '', Validators.required],
      position: [exp?.position || '', Validators.required],
      startDate: [exp?.startDate ? new Date(exp.startDate) : new Date(), Validators.required],
      endDate: [exp?.endDate ? new Date(exp.endDate) : null],
      description: [exp?.description || ''],
      referenceName: [exp?.referenceName || ''],
      referenceContact: [exp?.referenceContact || '']
    });
  }
  
  // Add form array items
  addCertificate(): void {
    this.certificates.push(this.createCertificateFormGroup());
  }
  
  addIdentification(): void {
    this.identifications.push(this.createIdentificationFormGroup());
  }
  
  addWorkExperience(): void {
    this.workExperience.push(this.createWorkExperienceFormGroup());
  }
  
  // Remove form array items
  removeCertificate(index: number): void {
    this.certificates.removeAt(index);
  }
  
  removeIdentification(index: number): void {
    this.identifications.removeAt(index);
  }
  
  removeWorkExperience(index: number): void {
    this.workExperience.removeAt(index);
  }
  
  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.markFormGroupTouched(this.employeeForm);
      this.snackBar.open('Please fill in all required fields correctly', 'Close', { duration: 3000 });
      return;
    }
    
    this.isLoading = true;
    
    const formValues = this.employeeForm.value;
    const employeeData = this.prepareEmployeeData(formValues);
    
    // Call the appropriate service method based on mode
    const operation = this.isEditMode
      ? this.employeeService.updateEmployee(employeeData)
      : this.employeeService.addEmployee(employeeData);
    
    operation.pipe(
      first(),
      catchError(err => {
        this.snackBar.open(`Error: ${err.message || 'Unknown error'}`, 'Close', { duration: 5000 });
        return of(null);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(result => {
      if (result) {
        // Success
        const message = this.isEditMode
          ? 'Employee updated successfully'
          : 'Employee added successfully';
        
        this.snackBar.open(message, 'Close', { duration: 3000 });
        
        // Navigate back to the appropriate page
        if (this.isEditMode) {
          this.router.navigate(['/hr/employees', result.id]);
        } else {
          this.router.navigate(['/hr/employees']);
        }
      }
    });
  }
  
  prepareEmployeeData(formValues: any): Employee {
    const personalInfo = formValues.personalInfo;
    const employmentInfo = formValues.employmentInfo;
    const userAccount = formValues.userAccount;
    
    // Create a user object
    const user: EmployeeUser = {
      id: this.isEditMode && this.employeeId ? `usr-${this.employeeId}` : '',
      name: personalInfo.name,
      email: userAccount.email,
      role: userAccount.role
    };
    
    // Build the employee object
    const employee: Employee = {
      id: this.isEditMode && this.employeeId ? this.employeeId : '',
      name: personalInfo.name,
      age: personalInfo.age,
      nationality: personalInfo.nationality,
      photo: personalInfo.photo || 'assets/images/default-avatar.png',
      homeAddress: personalInfo.homeAddress,
      homeType: personalInfo.homeType,
      companyPhone: personalInfo.companyPhone,
      personalPhone: personalInfo.personalPhone,
      iqamaNumber: personalInfo.iqamaNumber,
      jobTitle: employmentInfo.jobTitle,
      badgeNumber: employmentInfo.badgeNumber,
      workLocation: employmentInfo.workLocation,
      joinDate: employmentInfo.joinDate,
      currentProject: employmentInfo.currentProject,
      monthlyHours: employmentInfo.monthlyHours,
      directManager: undefined, // Will be set by the service if manager ID is provided
      managedEmployees: [],
      offDays: employmentInfo.offDays,
      workTimeRatio: 0, // Will be calculated by the service
      avgLateMinutes: 0, // Will be calculated by the service
      sickLeaveCounter: 0, // Will be initialized by the service
      certificates: this.mapFormArrayToModel(formValues.certificates),
      identifications: this.mapFormArrayToModel(formValues.identifications),
      pastExperience: this.mapFormArrayToModel(formValues.workExperience),
      attendance: [],
      assignedTasks: [],
      sentRequests: [],
      warnings: [],
      sickLeaves: [],
      user: user,
      cv: { id: '', name: '', type: '', url: '', uploadDate: new Date(), uploadedBy: {} as Employee, size: 0 },
      cost: {
        salary: 0,
        homeAllowance: 0,
        iqamaFees: 0,
        drivingLicenseFees: 0,
        insuranceFees: 0,
        carAllowance: 0,
        simCardFees: 0,
        certificatesFees: 0,
        otherCosts: [],
        totalCost: 0
      }
    };
    
    return employee;
  }
  
  mapFormArrayToModel<T>(formArray: any[]): T[] {
    return formArray ? formArray.map(item => ({ ...item })) : [];
  }
  
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        for (let i = 0; i < control.length; i++) {
          if (control.at(i) instanceof FormGroup) {
            this.markFormGroupTouched(control.at(i) as FormGroup);
          } else {
            control.at(i).markAsTouched();
          }
        }
      } else {
        control.markAsTouched();
      }
    });
  }
  
  cancel(): void {
    if (this.isEditMode && this.employeeId) {
      this.router.navigate(['/hr/employees', this.employeeId]);
    } else {
      this.router.navigate(['/hr/employees']);
    }
  }
} 