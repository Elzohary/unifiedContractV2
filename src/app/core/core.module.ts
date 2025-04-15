import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

// Import core services
import { EmployeeService } from './services/employee.service';
import { CacheService } from './services/cache.service';
import { DataRepositoryService } from './services/data-repository.service';

// Import services that should be singletons
// import { AuthService } from './services/auth.service';
// import { HttpErrorInterceptor } from './interceptors/http-error.interceptor';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [
    // Services that should be singletons
    EmployeeService,
    CacheService,
    DataRepositoryService
    // { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true }
  ],
  exports: [
    // Modules that should be available everywhere
    HttpClientModule
  ]
})
export class CoreModule {
  // Prevent reimporting the CoreModule
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only.');
    }
  }
}
