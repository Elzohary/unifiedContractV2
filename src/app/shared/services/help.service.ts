import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface HelpTopic {
  id: string;
  title: string;
  description: string;
  category: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  icon?: string;
  actionText?: string;
  actionUrl?: string;
  tags?: string[];
  userRoles?: string[];
  priority?: 'low' | 'medium' | 'high';
  lastUpdated?: Date;
}

export interface HelpCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  order: number;
}

@Injectable({
  providedIn: 'root'
})
export class HelpService {
  private helpTopicsSubject = new BehaviorSubject<HelpTopic[]>([]);
  private helpCategoriesSubject = new BehaviorSubject<HelpCategory[]>([]);
  private isHelpModeActiveSubject = new BehaviorSubject<boolean>(false);

  public helpTopics$ = this.helpTopicsSubject.asObservable();
  public helpCategories$ = this.helpCategoriesSubject.asObservable();
  public isHelpModeActive$ = this.isHelpModeActiveSubject.asObservable();

  constructor() {
    this.loadHelpContent();
  }

  /**
   * Load help content from configuration
   */
  private loadHelpContent(): void {
    this.helpCategoriesSubject.next(HELP_CATEGORIES);
    this.helpTopicsSubject.next(HELP_TOPICS);
  }

  /**
   * Get help topic by ID
   */
  getHelpTopic(id: string): HelpTopic | undefined {
    return this.helpTopicsSubject.value.find(topic => topic.id === id);
  }

  /**
   * Get help topics by category
   */
  getHelpTopicsByCategory(category: string): HelpTopic[] {
    return this.helpTopicsSubject.value.filter(topic => topic.category === category);
  }

  /**
   * Search help topics
   */
  searchHelpTopics(query: string): HelpTopic[] {
    const searchTerm = query.toLowerCase();
    return this.helpTopicsSubject.value.filter(topic =>
      topic.title.toLowerCase().includes(searchTerm) ||
      topic.description.toLowerCase().includes(searchTerm) ||
      topic.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Toggle help mode (shows all available help topics on page)
   */
  toggleHelpMode(): void {
    this.isHelpModeActiveSubject.next(!this.isHelpModeActiveSubject.value);
  }

  /**
   * Add or update help topic (for dynamic content)
   */
  updateHelpTopic(topic: HelpTopic): void {
    const currentTopics = this.helpTopicsSubject.value;
    const index = currentTopics.findIndex(t => t.id === topic.id);
    
    if (index >= 0) {
      currentTopics[index] = topic;
    } else {
      currentTopics.push(topic);
    }
    
    this.helpTopicsSubject.next([...currentTopics]);
  }

  /**
   * Get help topics for current user role
   */
  getHelpTopicsForRole(userRole: string): HelpTopic[] {
    return this.helpTopicsSubject.value.filter(topic =>
      !topic.userRoles || topic.userRoles.length === 0 || topic.userRoles.includes(userRole)
    );
  }
}

// CENTRALIZED HELP CONTENT CONFIGURATION
// =====================================
// All help content is managed here for easy maintenance

const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: 'materials',
    name: 'Materials Management',
    description: 'Inventory, procurement, and material workflows',
    icon: 'inventory',
    order: 1
  },
  {
    id: 'work-orders',
    name: 'Work Orders',
    description: 'Work order management and tracking',
    icon: 'engineering',
    order: 2
  },
  {
    id: 'navigation',
    name: 'Navigation',
    description: 'How to navigate through the application',
    icon: 'map',
    order: 3
  },
  {
    id: 'general',
    name: 'General',
    description: 'General application features and settings',
    icon: 'help',
    order: 4
  }
];

const HELP_TOPICS: HelpTopic[] = [
  // MATERIALS MANAGEMENT HELP TOPICS
  {
    id: 'materials-hub-overview',
    title: 'Materials Management Hub',
    description: 'Central dashboard for all materials-related activities. View inventory status, work order material needs, and quick access to all material functions.',
    category: 'materials',
    position: 'bottom',
    icon: 'dashboard',
    tags: ['materials', 'dashboard', 'overview'],
    priority: 'high'
  },
  {
    id: 'inventory-dashboard-nav',
    title: 'Inventory Dashboard',
    description: 'Monitor stock levels, movements, and inventory health across all warehouse locations. Track alerts and manage stock adjustments.',
    category: 'materials',
    position: 'right',
    icon: 'inventory_2',
    actionText: 'Open Dashboard',
    actionUrl: '/materials/dashboard',
    tags: ['inventory', 'stock', 'dashboard']
  },
  {
    id: 'material-catalog-nav',
    title: 'Material Catalog',
    description: 'Manage material definitions, specifications, and properties. Add new materials and update existing material information.',
    category: 'materials',
    position: 'right',
    icon: 'library_books',
    actionText: 'Open Catalog',
    actionUrl: '/materials/catalog',
    tags: ['catalog', 'materials', 'definitions']
  },
  {
    id: 'work-order-materials-nav',
    title: 'Work Order Materials',
    description: 'Integrate materials with work orders and track material usage. View material requirements and allocation status.',
    category: 'materials',
    position: 'right',
    icon: 'engineering',
    actionText: 'Open Hub',
    actionUrl: '/materials/work-order-hub',
    tags: ['work orders', 'materials', 'integration'],
    priority: 'high'
  },
  {
    id: 'stock-adjustment-action',
    title: 'Stock Adjustment',
    description: 'Correct inventory quantities due to physical counts, damage, loss, or system errors. Maintains accurate stock levels.',
    category: 'materials',
    position: 'top',
    icon: 'tune',
    tags: ['stock', 'adjustment', 'inventory', 'correction'],
    userRoles: ['inventory-manager', 'warehouse-staff']
  },
  {
    id: 'material-requisition-action',
    title: 'Material Requisition',
    description: 'Request materials for work orders, maintenance, or general use. Includes approval workflow for high-value or critical items.',
    category: 'materials',
    position: 'top',
    icon: 'assignment',
    tags: ['requisition', 'request', 'materials', 'approval'],
    userRoles: ['project-manager', 'engineer', 'technician']
  },
  {
    id: 'add-material-action',
    title: 'Add New Material',
    description: 'Add new materials to the catalog with complete specifications, pricing, and supplier information.',
    category: 'materials',
    position: 'top',
    icon: 'add',
    tags: ['add', 'create', 'material', 'catalog'],
    userRoles: ['procurement', 'materials-manager']
  },
  {
    id: 'warehouse-management-nav',
    title: 'Warehouse Management',
    description: 'Manage warehouse locations, storage bins, transfers, and warehouse operations. Optimize storage and track movements.',
    category: 'materials',
    position: 'right',
    icon: 'warehouse',
    tags: ['warehouse', 'storage', 'bins', 'locations']
  },
  {
    id: 'purchase-orders-nav',
    title: 'Purchase Orders',
    description: 'Create and manage material procurement processes. Track supplier orders and delivery status.',
    category: 'materials',
    position: 'right',
    icon: 'shopping_cart',
    tags: ['purchase', 'procurement', 'orders', 'suppliers']
  },
  {
    id: 'stock-movements-nav',
    title: 'Stock Movements',
    description: 'Track all material movements, receipts, and issues. View detailed movement history and audit trails.',
    category: 'materials',
    position: 'right',
    icon: 'swap_horiz',
    tags: ['movements', 'tracking', 'audit', 'history']
  },

  // WORK ORDERS HELP TOPICS
  {
    id: 'work-order-materials-section',
    title: 'Work Order Materials Tab',
    description: 'View and manage materials assigned to this work order. Track material delivery status and usage.',
    category: 'work-orders',
    position: 'top',
    icon: 'inventory_2',
    tags: ['work order', 'materials', 'assignments']
  },

  // NAVIGATION HELP TOPICS
  {
    id: 'main-navigation',
    title: 'Main Navigation',
    description: 'Use the sidebar menu to navigate between different modules. Icons help identify each section quickly.',
    category: 'navigation',
    position: 'right',
    icon: 'menu',
    tags: ['navigation', 'menu', 'sidebar']
  },
  {
    id: 'breadcrumb-navigation',
    title: 'Breadcrumb Navigation',
    description: 'Track your current location and navigate back to previous pages using the breadcrumb trail.',
    category: 'navigation',
    position: 'bottom',
    icon: 'navigation',
    tags: ['breadcrumb', 'navigation', 'location']
  },

  // GENERAL HELP TOPICS
  {
    id: 'help-system',
    title: 'Help System',
    description: 'Click the help icon (?) to get contextual help for any feature. Toggle help mode to see all available help topics on the current page.',
    category: 'general',
    position: 'bottom',
    icon: 'help',
    tags: ['help', 'assistance', 'support']
  }
]; 