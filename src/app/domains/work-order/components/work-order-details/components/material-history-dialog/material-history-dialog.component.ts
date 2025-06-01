import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

import { materialAssignment, SiteUsageRecord, UsageRecord } from '../../../../models/work-order.model';

export interface MaterialHistoryDialogData {
  material: materialAssignment;
  workOrderId: string;
}

interface HistoryEvent {
  date: Date | string;
  title: string;
  description: string;
  icon: string;
  color: string;
  type: 'assignment' | 'order' | 'delivery' | 'warehouse' | 'site-issue' | 'usage' | 'status-change';
  details: { [key: string]: any };
  user?: string;
  documents?: string[];
  photos?: string[];
}

@Component({
  selector: 'app-material-history-dialog',
  templateUrl: './material-history-dialog.component.html',
  styleUrls: ['./material-history-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatExpansionModule,
    MatListModule,
    MatTooltipModule
  ]
})
export class MaterialHistoryDialogComponent {
  historyEvents: HistoryEvent[] = [];
  materialName: string;
  materialType: string;
  currentStatus: string;
  
  constructor(
    private dialogRef: MatDialogRef<MaterialHistoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MaterialHistoryDialogData
  ) {
    this.materialName = this.getMaterialName();
    this.materialType = data.material.materialType;
    this.currentStatus = this.getCurrentStatus();
    this.buildHistoryTimeline();
  }
  
  private getMaterialName(): string {
    return this.data.material.purchasableMaterial?.name || 
           this.data.material.receivableMaterial?.name || 
           'Unknown Material';
  }
  
  private getCurrentStatus(): string {
    if (this.data.material.purchasableMaterial) {
      return this.data.material.purchasableMaterial.status || 'pending';
    }
    return this.data.material.receivableMaterial?.status || 'pending';
  }
  
  private buildHistoryTimeline(): void {
    const material = this.data.material;
    
    // Assignment Event
    this.historyEvents.push({
      date: material.assignDate,
      title: 'Material Assigned to Work Order',
      description: `${this.materialName} was assigned to work order ${material.workOrderNumber} for ${material.materialType === 'purchasable' ? 'purchase and installation' : 'client provision'}`,
      icon: 'assignment',
      color: 'primary',
      type: 'assignment',
      user: material.assignedBy,
      details: {
        'Work Order': material.workOrderNumber,
        'Assigned By': material.assignedBy,
        'Material Type': material.materialType === 'purchasable' ? 'Purchasable (To be bought)' : 'Receivable (Client provided)',
        'Purpose': 'Installation/Construction'
      }
    });
    
    if (material.purchasableMaterial) {
      const pm = material.purchasableMaterial;
      
      // Order Event
      if (pm.orderDate) {
        this.historyEvents.push({
          date: pm.orderDate,
          title: 'Purchase Order Created',
          description: `Order placed with ${pm.supplier || 'supplier'} for ${pm.quantity} ${pm.unit} of ${this.materialName}`,
          icon: 'shopping_cart',
          color: 'accent',
          type: 'order',
          details: {
            'Supplier': pm.supplier || 'Not specified',
            'Quantity Ordered': `${pm.quantity} ${pm.unit}`,
            'Unit Cost': `SAR ${pm.unitCost}`,
            'Total Cost': `SAR ${pm.totalCost}`,
            'Expected Delivery': this.formatDate(pm.deliveryDate),
            'Order Status': 'Confirmed'
          }
        });
      }
      
      // Delivery Event
      if (pm.delivery) {
        const deliveryLocation = pm.delivery.storageLocation === 'site-direct' ? 'directly to site' : 'to warehouse';
        this.historyEvents.push({
          date: pm.delivery.receivedDate,
          title: `Material Delivered ${deliveryLocation}`,
          description: `${pm.quantity} ${pm.unit} of ${this.materialName} received ${deliveryLocation} and checked by ${pm.delivery.receivedByName}`,
          icon: 'local_shipping',
          color: 'primary',
          type: 'delivery',
          user: pm.delivery.receivedByName,
          details: {
            'Delivery Location': pm.delivery.storageLocation === 'site-direct' ? 'Direct to Site' : 'Warehouse Storage',
            'Received By': pm.delivery.receivedByName,
            'Quantity Received': `${pm.quantity} ${pm.unit}`,
            'Condition': 'Good condition',
            'Invoice Status': pm.invoice ? 'Invoice uploaded' : 'Invoice pending',
            'Delivery Notes': pm.delivery.deliveryNote || 'No special notes'
          },
          documents: pm.invoice ? ['invoice.pdf'] : [],
          photos: pm.delivery.deliveryPhotos?.map(p => p.fileUrl) || []
        });
        
        // Warehouse Storage Event (only if delivered to warehouse)
        if (pm.delivery.warehouseDetails && pm.delivery.storageLocation !== 'site-direct') {
          this.historyEvents.push({
            date: pm.delivery.receivedDate,
            title: 'Stored in Warehouse',
            description: `Material stored at ${pm.delivery.warehouseDetails.warehouseName} warehouse in bin ${pm.delivery.warehouseDetails.binLocation || 'unspecified location'}`,
            icon: 'warehouse',
            color: 'primary',
            type: 'warehouse',
            details: {
              'Warehouse Name': pm.delivery.warehouseDetails.warehouseName,
              'Storage Location': pm.delivery.warehouseDetails.binLocation || 'General storage area',
              'Quantity in Storage': `${pm.quantity} ${pm.unit}`,
              'Storage Conditions': 'Standard conditions',
              'Access': 'Available for site transfer'
            }
          });
        }
      }
      
      // Site Issue Event (only if not delivered directly to site)
      if (pm.siteUsage?.issuedToSite && pm.delivery?.storageLocation !== 'site-direct') {
        this.historyEvents.push({
          date: pm.siteUsage.issuedDate || new Date(),
          title: 'Transferred from Warehouse to Site',
          description: `${pm.quantity} ${pm.unit} of material transferred from warehouse to construction site`,
          icon: 'build_circle',
          color: 'warn',
          type: 'site-issue',
          user: pm.siteUsage.receivedBySiteName,
          details: {
            'Warehouse Keeper': pm.siteUsage.releasedByName ? `${pm.siteUsage.releasedByName} (${pm.siteUsage.releasedBy})` : 'Not recorded',
            'Site Receiver': pm.siteUsage.receivedBySiteName || 'Not recorded',
            'Quantity Transferred': `${pm.quantity} ${pm.unit}`,
            'Transfer Purpose': 'Installation/Construction',
            'Transfer Method': 'Company vehicle',
            'Site Location': 'Main construction area'
          },
          photos: []
        });
      }
      
      // Add individual usage records if available
      if (pm.siteUsageRecords && pm.siteUsageRecords.length > 0) {
        pm.siteUsageRecords.forEach(record => {
          if (record.recordType === 'site-issue') {
            // Site issue record
            this.historyEvents.push({
              date: record.recordDate,
              title: 'Transferred to Site',
              description: `Material released by ${record.releasedByName} from warehouse and received by ${record.receivedBySiteName} at site`,
              icon: 'build_circle',
              color: 'warn',
              type: 'site-issue',
              user: record.receivedBySiteName,
              details: {
                'Released By (Warehouse)': `${record.releasedByName} (${record.releasedBy})`,
                'Received By (Site)': `${record.receivedBySiteName} (${record.receivedBySite})`,
                'Issue Date': this.formatDate(record.issuedDate),
                'System Record By': record.recordedByName,
                'Transfer Status': 'Completed'
              },
              photos: record.photos?.map(p => p.fileUrl) || []
            });
          } else if (record.recordType === 'usage-update') {
            // Usage update record
            this.historyEvents.push({
              date: record.recordDate,
              title: `Material Usage Update`,
              description: `Used ${record.quantityUsed} ${pm.unit} (${record.remainingQuantity} ${pm.unit} remaining)`,
              icon: 'construction',
              color: 'primary',
              type: 'usage',
              user: record.recordedByName,
              details: {
                'Quantity Used (This Update)': `${record.quantityUsed} ${pm.unit}`,
                'Total Used So Far': `${record.cumulativeQuantityUsed} ${pm.unit}`,
                'Remaining Quantity': `${record.remainingQuantity} ${pm.unit}`,
                'Usage Percentage': `${record.usagePercentage}%`,
                'Usage Notes': record.usageNotes || 'No notes provided',
                'Recorded By': record.recordedByName,
                'Record Date': this.formatDate(record.recordDate)
              },
              photos: record.photos?.map(p => p.fileUrl) || []
            });
          } else if (record.recordType === 'return') {
            // Return record
            this.historyEvents.push({
              date: record.recordDate,
              title: 'Material Returned',
              description: `${record.quantityReturned} ${pm.unit} returned to warehouse`,
              icon: 'undo',
              color: 'accent',
              type: 'usage',
              user: record.recordedByName,
              details: {
                'Quantity Returned': `${record.quantityReturned} ${pm.unit}`,
                'Recorded By': record.recordedByName,
                'Notes': record.usageNotes || 'No notes'
              },
              photos: record.photos?.map(p => p.fileUrl) || []
            });
          } else if (record.recordType === 'waste') {
            // Waste record
            this.historyEvents.push({
              date: record.recordDate,
              title: 'Material Waste Recorded',
              description: `${record.quantityWasted} ${pm.unit} recorded as waste`,
              icon: 'delete_sweep',
              color: 'warn',
              type: 'usage',
              user: record.recordedByName,
              details: {
                'Quantity Wasted': `${record.quantityWasted} ${pm.unit}`,
                'Waste Reason': record.wasteReason || 'Not specified',
                'Recorded By': record.recordedByName
              },
              photos: record.photos?.map(p => p.fileUrl) || []
            });
          }
        });
      } else if (pm.siteUsage?.actualQuantityUsed !== undefined) {
        // Legacy single usage event (for backward compatibility)
        const wasteAmount = pm.quantity - (pm.siteUsage.actualQuantityUsed || 0);
        this.historyEvents.push({
          date: pm.siteUsage.usageCompletedDate || new Date(),
          title: 'Material Installation Completed',
          description: `Installation completed with ${pm.siteUsage.actualQuantityUsed} ${pm.unit} used (${pm.siteUsage.usagePercentage}% of total)`,
          icon: 'check_circle',
          color: 'success',
          type: 'usage',
          details: {
            'Quantity Used': `${pm.siteUsage.actualQuantityUsed} ${pm.unit}`,
            'Usage Percentage': `${pm.siteUsage.usagePercentage}%`,
            'Waste/Leftover': wasteAmount > 0 ? `${wasteAmount} ${pm.unit}` : 'None',
            'Installation Quality': 'Verified and approved',
            'Usage Notes': pm.siteUsage.usageNotes || 'Installation completed as planned',
            'Completion Date': this.formatDate(pm.siteUsage.usageCompletedDate)
          },
          photos: pm.siteUsage.usagePhotos?.map(p => p.fileUrl) || []
        });
      }
    } else if (material.receivableMaterial) {
      const rm = material.receivableMaterial;
      
      // Received Event
      if (rm.receivedDate) {
        this.historyEvents.push({
          date: rm.receivedDate,
          title: 'Client Material Received',
          description: `${rm.receivedQuantity || rm.estimatedQuantity} ${rm.unit} of ${this.materialName} received from client and verified`,
          icon: 'inventory',
          color: 'primary',
          type: 'delivery',
          user: rm.receivedBy?.name,
          details: {
            'Received From': 'Client (SEC/Other)',
            'Received By': rm.receivedBy?.name || 'Not specified',
            'Employee Badge': rm.receivedBy?.badgeNumber || 'N/A',
            'Expected Quantity': `${rm.estimatedQuantity} ${rm.unit}`,
            'Actual Received': `${rm.receivedQuantity || 0} ${rm.unit}`,
            'Difference': rm.receivedQuantity !== rm.estimatedQuantity ? 
              `${Math.abs((rm.receivedQuantity || 0) - rm.estimatedQuantity)} ${rm.unit} ${(rm.receivedQuantity || 0) > rm.estimatedQuantity ? 'extra' : 'short'}` : 
              'Exact match',
            'Material Condition': 'Good condition'
          }
        });
      }
      
      // Add individual usage records if available
      if (rm.usageRecords && rm.usageRecords.length > 0) {
        rm.usageRecords.forEach(record => {
          if (record.recordType === 'usage-update') {
            // Usage update record
            this.historyEvents.push({
              date: record.recordDate,
              title: `Material Usage Update`,
              description: `Used ${record.quantityUsed} ${rm.unit} (${record.remainingQuantity} ${rm.unit} remaining)`,
              icon: 'construction',
              color: 'primary',
              type: 'usage',
              user: record.recordedByName,
              details: {
                'Quantity Used (This Update)': `${record.quantityUsed} ${rm.unit}`,
                'Total Used So Far': `${record.cumulativeQuantityUsed} ${rm.unit}`,
                'Remaining Quantity': `${record.remainingQuantity} ${rm.unit}`,
                'Usage Percentage': `${record.usagePercentage}%`,
                'Usage Notes': record.usageNotes || 'No notes provided',
                'Recorded By': record.recordedByName,
                'Record Date': this.formatDate(record.recordDate)
              },
              photos: record.photos?.map(p => p.fileUrl) || []
            });
          } else if (record.recordType === 'return-to-client') {
            // Return to client record
            this.historyEvents.push({
              date: record.recordDate,
              title: 'Material Returned to Client',
              description: `${record.quantityReturned} ${rm.unit} returned to client as extra material`,
              icon: 'assignment_return',
              color: 'accent',
              type: 'usage',
              user: record.recordedByName,
              details: {
                'Quantity Returned': `${record.quantityReturned} ${rm.unit}`,
                'Return Reason': record.returnReason || 'Extra material not needed',
                'Recorded By': record.recordedByName,
                'Return Date': this.formatDate(record.recordDate)
              },
              photos: record.photos?.map(p => p.fileUrl) || []
            });
          } else if (record.recordType === 'reserve-for-later') {
            // Reservation record
            this.historyEvents.push({
              date: record.recordDate,
              title: 'Material Reserved for Later Use',
              description: `${record.remainingQuantity} ${rm.unit} reserved for ${record.reservedForWorkOrder ? 'this work order' : 'future use'}`,
              icon: 'schedule',
              color: 'primary',
              type: 'usage',
              user: record.recordedByName,
              details: {
                'Quantity Reserved': `${record.remainingQuantity} ${rm.unit}`,
                'Reservation': record.reservedForWorkOrder ? 'Reserved for this work order only' : 'Available for any work order',
                'Notes': record.reservationNotes || 'No notes',
                'Recorded By': record.recordedByName
              },
              photos: record.photos?.map(p => p.fileUrl) || []
            });
          }
        });
      } else if (rm.status === 'used') {
        // Legacy installation event (for backward compatibility)
        this.historyEvents.push({
          date: new Date(),
          title: 'Client Material Installed',
          description: `${rm.actualQuantity || rm.estimatedQuantity} ${rm.unit} of client-provided material successfully installed`,
          icon: 'construction',
          color: 'success',
          type: 'usage',
          details: {
            'Quantity Installed': `${rm.actualQuantity || rm.estimatedQuantity} ${rm.unit}`,
            'Installation Status': 'Completed and verified',
            'Quality Check': 'Passed',
            'Client Approval': 'Pending'
          }
        });
      }
    }
    
    // Sort events by date (most recent first)
    this.historyEvents.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
  }
  
  private formatStorageLocation(location?: string): string {
    if (!location) return 'Not specified';
    return location.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
  
  formatDate(date: string | Date | undefined): string {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  getEventIcon(event: HistoryEvent): string {
    const iconMap: { [key: string]: string } = {
      'assignment': 'assignment',
      'order': 'shopping_cart',
      'delivery': 'local_shipping',
      'warehouse': 'warehouse',
      'site-issue': 'build_circle',
      'usage': 'check_circle',
      'status-change': 'update'
    };
    return iconMap[event.type] || event.icon;
  }
  
  onClose(): void {
    this.dialogRef.close();
  }
} 