import { Injectable, signal, computed } from '@angular/core';
import { WorkOrder } from '../../domains/work-order/models/work-order.model';
import { Employee } from '../../modules/hr/models/employee.model';
import { Manpower } from '../../modules/resources/models/manpower.model';
import { Equipment, EquipmentStatus, MaintenanceRecord, Assignment } from '../../modules/resources/models/equipment.model';
import { Material } from '../../modules/inventory/models/material.model';
import { ActivityLog } from '../../shared/models/activity-log.model';

export interface ResourcesState {
  equipment: Equipment[];
  maintenance: MaintenanceRecord[];
  assignments: Assignment[];
  loading: boolean;
  error: string | null;
}

export interface AppState {
  user: any; // TODO: Define User interface
  settings: any; // TODO: Define Settings interface
  notifications: any[]; // TODO: Define Notification interface
  resources: ResourcesState;
}

@Injectable({
  providedIn: 'root'
})
export class StateService {
  // Work Orders
  private workOrders = signal<WorkOrder[]>([]);
  workOrders$ = computed(() => this.workOrders());

  // Employees
  private employees = signal<Employee[]>([]);
  employees$ = computed(() => this.employees());

  // Resources
  private manpower = signal<Manpower[]>([]);
  manpower$ = computed(() => this.manpower());

  private equipment = signal<Equipment[]>([]);
  equipment$ = computed(() => this.equipment());

  private materials = signal<Material[]>([]);
  materials$ = computed(() => this.materials());

  // Activity Logs
  private activityLogs = signal<ActivityLog[]>([]);
  activityLogs$ = computed(() => this.activityLogs());

  // Loading States
  private loadingStates = signal<Record<string, boolean>>({});
  loadingStates$ = computed(() => this.loadingStates());

  // Error States
  private errorStates = signal<Record<string, string | null>>({});
  errorStates$ = computed(() => this.errorStates());

  private state = signal<AppState>({
    user: null,
    settings: {},
    notifications: [],
    resources: {
      equipment: [],
      maintenance: [],
      assignments: [],
      loading: false,
      error: null
    }
  });

  getState() {
    return this.state();
  }

  updateResourcesState(newState: Partial<ResourcesState>) {
    this.state.update(current => ({
      ...current,
      resources: {
        ...current.resources,
        ...newState
      }
    }));
  }

  setLoading(loading: boolean) {
    this.updateResourcesState({ loading });
  }

  setError(error: string | null) {
    this.updateResourcesState({ error });
  }

  updateEquipment(equipment: Equipment[]) {
    this.updateResourcesState({ equipment });
  }

  updateMaintenanceRecord(equipmentId: string, record: MaintenanceRecord) {
    const currentEquipment = this.state().resources.equipment;
    const updatedEquipment = currentEquipment.map(equip => {
      if (equip.id === equipmentId) {
        return {
          ...equip,
          maintenanceHistory: [...(equip.maintenanceHistory || []), record]
        };
      }
      return equip;
    });
    this.updateEquipment(updatedEquipment);
  }

  updateAssignment(equipmentId: string, assignment: Assignment) {
    const currentEquipment = this.state().resources.equipment;
    const updatedEquipment = currentEquipment.map(equip => {
      if (equip.id === equipmentId) {
        return {
          ...equip,
          currentAssignment: assignment
        };
      }
      return equip;
    });
    this.updateEquipment(updatedEquipment);
  }

  updateMaintenance(maintenance: MaintenanceRecord[]) {
    this.updateResourcesState({ maintenance });
  }

  updateAssignments(assignments: Assignment[]) {
    this.updateResourcesState({ assignments });
  }

  // Update work orders
  updateWorkOrders(workOrders: WorkOrder[]): void {
    this.workOrders.set(workOrders);
  }

  // Update employees
  updateEmployees(employees: Employee[]): void {
    this.employees.set(employees);
  }

  // Update manpower
  updateManpower(manpower: Manpower[]): void {
    this.manpower.set(manpower);
  }

  // Update materials
  updateMaterials(materials: Material[]): void {
    this.materials.set(materials);
  }

  // Update activity logs
  updateActivityLogs(logs: ActivityLog[]): void {
    this.activityLogs.set(logs);
  }

  // Get loading state
  isLoading(key: string): boolean {
    return this.loadingStates()[key] || false;
  }

  // Get error state
  getError(key: string): string | null {
    return this.errorStates()[key] || null;
  }

  // Clear all states
  clearAll(): void {
    this.workOrders.set([]);
    this.employees.set([]);
    this.manpower.set([]);
    this.equipment.set([]);
    this.materials.set([]);
    this.activityLogs.set([]);
    this.loadingStates.set({});
    this.errorStates.set({});
  }
} 