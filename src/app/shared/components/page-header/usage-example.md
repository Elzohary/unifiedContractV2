# Page Header Component Usage

## Import

```typescript
import { PageHeaderComponent, PageHeaderAction, PageHeaderConfig } from 'src/app/shared/components/page-header';
```

## Basic Usage (Individual Properties)

### Component Setup

```typescript
@Component({
  selector: 'app-your-component',
  standalone: true,
  imports: [
    PageHeaderComponent,
    // other imports
  ],
  templateUrl: './your-component.component.html',
})
export class YourComponent {
  pageTitle = 'Work Orders';
  
  headerActions: PageHeaderAction[] = [
    {
      label: 'New Work Order',
      icon: 'add',
      color: 'primary',
      variant: 'raised',
      callback: 'createNewWorkOrder'
    }
  ];

  onHeaderAction(actionCallback: string): void {
    if (actionCallback === 'createNewWorkOrder') {
      this.createNewWorkOrder();
    }
  }

  createNewWorkOrder(): void {
    // Implementation
  }
}
```

### Template

```html
<app-page-header
  [title]="pageTitle"
  [subtitle]="'Optional subtitle text'"
  [actions]="headerActions"
  (actionClick)="onHeaderAction($event)">
</app-page-header>
```

## Advanced Usage (Config Object)

### Component Setup

```typescript
@Component({
  selector: 'app-your-component',
  standalone: true,
  imports: [
    PageHeaderComponent,
    // other imports
  ],
  templateUrl: './your-component.component.html',
})
export class YourComponent {
  headerConfig: PageHeaderConfig = {
    title: 'Work Orders',
    subtitle: 'Manage your work orders',
    actions: [
      {
        label: 'New Work Order',
        icon: 'add',
        color: 'primary',
        variant: 'raised',
        callback: 'createNewWorkOrder'
      },
      {
        label: 'Export',
        icon: 'download',
        variant: 'stroked',
        callback: 'exportData',
        visible: this.hasExportPermission
      },
      {
        label: 'Print',
        icon: 'print',
        variant: 'flat',
        callback: 'printList'
      }
    ]
  };

  onHeaderAction(actionCallback: string): void {
    switch (actionCallback) {
      case 'createNewWorkOrder':
        this.createNewWorkOrder();
        break;
      case 'exportData':
        this.exportData();
        break;
      case 'printList':
        this.printList();
        break;
    }
  }

  // Action implementations...
}
```

### Template

```html
<app-page-header
  [config]="headerConfig"
  (actionClick)="onHeaderAction($event)">
</app-page-header>
```

## Dynamic Configuration

You can also update the configuration dynamically:

```typescript
updateHeaderConfig(): void {
  this.headerConfig = {
    ...this.headerConfig,
    subtitle: `Last updated: ${new Date().toLocaleString()}`,
    actions: [
      ...this.headerConfig.actions,
      {
        label: 'Refresh',
        icon: 'refresh',
        callback: 'refreshData'
      }
    ]
  };
}
```

## Advanced usage with multiple actions

```typescript
headerActions: PageHeaderAction[] = [
  {
    label: 'View Details',
    icon: 'visibility',
    variant: 'stroked',
    callback: 'viewDetails'
  },
  {
    label: 'Edit',
    icon: 'edit',
    color: 'accent',
    variant: 'raised',
    callback: 'editItem'
  },
  {
    label: 'Delete',
    icon: 'delete',
    color: 'warn',
    variant: 'flat',
    callback: 'deleteItem',
    visible: hasDeletePermission // can be conditionally hidden
  },
  {
    label: '',
    icon: 'more_vert',
    variant: 'icon',
    callback: 'openMenu'
  }
];
``` 
