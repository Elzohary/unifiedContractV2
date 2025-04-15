import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
import { routes } from './app/app-routing.module';
import { mockInterceptor } from './app/core/interceptors/mock.interceptor';
import { importProvidersFrom } from '@angular/core';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';

// Add error handling for uncaught errors
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
});

// Add error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Bootstrap the application
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([mockInterceptor])
    ),
    provideAnimations(),
    importProvidersFrom(
      MatNativeDateModule,
      MatSnackBarModule,
      MatDialogModule
    )
  ]
}).catch((err) => {
  console.error('Error bootstrapping application:', err);
  // Display a user-friendly error message
  const errorElement = document.createElement('div');
  errorElement.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    padding: 20px;
    background-color: #f44336;
    color: white;
    text-align: center;
    z-index: 9999;
  `;
  errorElement.textContent = 'An error occurred while loading the application. Please try refreshing the page.';
  document.body.appendChild(errorElement);
});
