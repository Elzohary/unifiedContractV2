import { 
  Directive, 
  Input, 
  OnInit, 
  OnDestroy, 
  ElementRef, 
  HostListener,
  ViewContainerRef,
  ComponentRef,
  Renderer2
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

// Services and Components
import { HelpService, HelpTopic } from '../services/help.service';
import { HelpOverlayComponent } from '../components/help-overlay/help-overlay.component';

@Directive({
  selector: '[appHelp]',
  standalone: true
})
export class HelpDirective implements OnInit, OnDestroy {
  @Input('appHelp') helpId!: string;
  @Input('helpTrigger') trigger: 'click' | 'hover' | 'focus' = 'click';
  @Input('helpDelay') delay = 500; // for hover trigger
  @Input('helpDisabled') disabled = false;

  private helpTopic: HelpTopic | undefined;
  private overlayRef: ComponentRef<HelpOverlayComponent> | null = null;
  private hoverTimeout: any;
  private destroy$ = new Subject<void>();
  private helpIcon: HTMLElement | null = null;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private viewContainer: ViewContainerRef,
    private helpService: HelpService
  ) {}

  ngOnInit(): void {
    if (!this.helpId) {
      console.warn('HelpDirective: helpId is required');
      return;
    }

    // Get help topic from service
    this.helpTopic = this.helpService.getHelpTopic(this.helpId);
    
    if (!this.helpTopic) {
      console.warn(`HelpDirective: Help topic '${this.helpId}' not found`);
      return;
    }

    // Add help indicator
    this.addHelpIndicator();

    // Listen for help mode changes
    this.helpService.isHelpModeActive$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isActive => {
        if (this.helpIcon) {
          this.renderer.setStyle(
            this.helpIcon, 
            'display', 
            isActive ? 'inline-flex' : 'none'
          );
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
    
    this.closeHelp();
    this.removeHelpIndicator();
  }

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    if (this.disabled || this.trigger !== 'click') return;
    
    event.stopPropagation();
    this.showHelp();
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (this.disabled || this.trigger !== 'hover') return;
    
    this.hoverTimeout = setTimeout(() => {
      this.showHelp();
    }, this.delay);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (this.trigger !== 'hover') return;
    
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
    
    // Close help after a short delay to allow user to interact with overlay
    setTimeout(() => {
      this.closeHelp();
    }, 300);
  }

  @HostListener('focus')
  onFocus(): void {
    if (this.disabled || this.trigger !== 'focus') return;
    this.showHelp();
  }

  @HostListener('blur')
  onBlur(): void {
    if (this.trigger !== 'focus') return;
    this.closeHelp();
  }

  private addHelpIndicator(): void {
    const element = this.elementRef.nativeElement;
    
    // Create help icon
    this.helpIcon = this.renderer.createElement('mat-icon');
    this.renderer.addClass(this.helpIcon, 'help-indicator');
    this.renderer.setProperty(this.helpIcon, 'textContent', 'help');
    
    // Style the help icon
    this.renderer.setStyle(this.helpIcon, 'font-size', '16px');
    this.renderer.setStyle(this.helpIcon, 'width', '16px');
    this.renderer.setStyle(this.helpIcon, 'height', '16px');
    this.renderer.setStyle(this.helpIcon, 'color', '#1976d2');
    this.renderer.setStyle(this.helpIcon, 'cursor', 'pointer');
    this.renderer.setStyle(this.helpIcon, 'margin-left', '4px');
    this.renderer.setStyle(this.helpIcon, 'display', 'none'); // Initially hidden
    this.renderer.setStyle(this.helpIcon, 'align-items', 'center');
    this.renderer.setStyle(this.helpIcon, 'justify-content', 'center');
    this.renderer.setStyle(this.helpIcon, 'opacity', '0.7');
    this.renderer.setStyle(this.helpIcon, 'transition', 'opacity 0.2s ease');
    
    // Add hover effect
    this.renderer.listen(this.helpIcon, 'mouseenter', () => {
      this.renderer.setStyle(this.helpIcon, 'opacity', '1');
    });
    
    this.renderer.listen(this.helpIcon, 'mouseleave', () => {
      this.renderer.setStyle(this.helpIcon, 'opacity', '0.7');
    });

    // Add click listener
    this.renderer.listen(this.helpIcon, 'click', (event: Event) => {
      event.stopPropagation();
      this.showHelp();
    });

    // Position the help icon
    const parentElement = element.parentElement;
    if (parentElement) {
      // If parent has relative positioning, add icon as sibling
      const computedStyle = window.getComputedStyle(parentElement);
      if (computedStyle.position === 'relative' || computedStyle.display === 'flex') {
        this.renderer.appendChild(parentElement, this.helpIcon);
      } else {
        // Wrap element and add icon
        const wrapper = this.renderer.createElement('div');
        this.renderer.setStyle(wrapper, 'display', 'inline-flex');
        this.renderer.setStyle(wrapper, 'align-items', 'center');
        this.renderer.setStyle(wrapper, 'gap', '4px');
        
        this.renderer.insertBefore(parentElement, wrapper, element);
        this.renderer.appendChild(wrapper, element);
        this.renderer.appendChild(wrapper, this.helpIcon);
      }
    }
  }

  private removeHelpIndicator(): void {
    if (this.helpIcon) {
      this.renderer.removeChild(this.helpIcon.parentElement, this.helpIcon);
      this.helpIcon = null;
    }
  }

  private showHelp(): void {
    if (!this.helpTopic || this.overlayRef) return;

    // Create overlay component
    this.overlayRef = this.viewContainer.createComponent(HelpOverlayComponent);
    
    // Set inputs
    this.overlayRef.instance.topic = this.helpTopic;
    this.overlayRef.instance.isVisible = true;
    
    // Listen for close event
    this.overlayRef.instance.close$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.closeHelp();
      });

    // Append to body for proper positioning
    document.body.appendChild(this.overlayRef.location.nativeElement);
  }

  private closeHelp(): void {
    if (this.overlayRef) {
      this.overlayRef.instance.isVisible = false;
      
      // Remove after animation
      setTimeout(() => {
        if (this.overlayRef) {
          document.body.removeChild(this.overlayRef.location.nativeElement);
          this.overlayRef.destroy();
          this.overlayRef = null;
        }
      }, 300);
    }
  }
} 