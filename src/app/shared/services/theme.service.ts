import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ThemeMode = 'light-theme' | 'dark-theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // LocalStorage key to save theme preference
  private readonly THEME_KEY = 'app-theme-preference';
  // Default theme
  private readonly DEFAULT_THEME: ThemeMode = 'light-theme';
  // Check if we're in a browser environment
  private readonly isBrowser: boolean;

  // BehaviorSubject to track current theme
  private themeSubject = new BehaviorSubject<ThemeMode>(this.DEFAULT_THEME);

  // Observable to subscribe to theme changes
  public theme$: Observable<ThemeMode> = this.themeSubject.asObservable();

  // Readable signal for reactive components
  public currentTheme = signal<ThemeMode>(this.DEFAULT_THEME);

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Initialize theme (only call after isBrowser is set)
    const initialTheme = this.getInitialTheme();
    this.currentTheme.set(initialTheme);
    this.themeSubject.next(initialTheme);

    // Apply initial theme
    if (this.isBrowser) {
      this.applyTheme(this.currentTheme());
      // Listen to system preference changes
      this.listenToSystemPreference();
    }
  }

  /**
   * Toggle between light and dark themes
   */
  public toggleTheme(): void {
    const newTheme = this.currentTheme() === 'light-theme' ? 'dark-theme' : 'light-theme';
    this.setTheme(newTheme);
  }

  /**
   * Set a specific theme
   */
  public setTheme(theme: ThemeMode): void {
    // Update storage (browser-only)
    if (this.isBrowser) {
      try {
        localStorage.setItem(this.THEME_KEY, theme);
      } catch (e) {
        console.warn('Failed to save theme preference to localStorage:', e);
      }

      // Apply theme to document
      this.applyTheme(theme);
    }

    // Update subject
    this.themeSubject.next(theme);

    // Update signal
    this.currentTheme.set(theme);
  }

  /**
   * Check if dark theme is active
   */
  public isDarkTheme(): boolean {
    return this.currentTheme() === 'dark-theme';
  }

  /**
   * Apply theme to document body
   */
  private applyTheme(theme: ThemeMode): void {
    if (this.isBrowser) {
      // Remove both theme classes first
      this.document.body.classList.remove('light-theme', 'dark-theme');

      // Add the current theme class
      this.document.body.classList.add(theme);

      // Toggle the Material theme stylesheets
      this.toggleThemeStylesheets(theme === 'dark-theme');

      // Remove any overlay elements that might have been added
      const overlays = this.document.querySelectorAll('.theme-overlay');
      overlays.forEach(overlay => overlay.remove());
    }
  }

  /**
   * Toggle between light and dark Material theme stylesheets
   */
  private toggleThemeStylesheets(isDark: boolean): void {
    if (!this.isBrowser) return;

    // Find the theme stylesheets by ID
    const darkThemeLink = this.document.getElementById('dark-theme') as HTMLLinkElement;

    // Toggle the dark theme
    if (darkThemeLink) {
      darkThemeLink.disabled = !isDark;
    }
  }

  /**
   * Get initial theme from storage or system preference
   */
  private getInitialTheme(): ThemeMode {
    if (!this.isBrowser) {
      return this.DEFAULT_THEME;
    }

    try {
      // Check localStorage
      const savedTheme = localStorage.getItem(this.THEME_KEY) as ThemeMode;
      if (savedTheme && (savedTheme === 'light-theme' || savedTheme === 'dark-theme')) {
        return savedTheme;
      }

      // Check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark-theme';
      }
    } catch (e) {
      console.warn('Failed to read theme preference:', e);
    }

    return this.DEFAULT_THEME;
  }

  /**
   * Listen to system preference changes
   */
  private listenToSystemPreference(): void {
    if (!this.isBrowser) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Add event listener
    mediaQuery.addEventListener('change', (e) => {
      // Only update if no theme is saved in localStorage
      try {
        if (!localStorage.getItem(this.THEME_KEY)) {
          this.setTheme(e.matches ? 'dark-theme' : 'light-theme');
        }
      } catch (e) {
        console.warn('Failed to handle system theme change:', e);
      }
    });
  }
}
