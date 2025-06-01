import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export interface UploadedDocument {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedDate: Date;
  uploadedBy: string;
  entityType: 'work-order' | 'material' | 'invoice' | 'photo';
  entityId: string;
  metadata?: any;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private mockDocuments: UploadedDocument[] = [];

  constructor() {}

  /**
   * Upload a file and associate it with an entity
   */
  uploadFile(
    file: File,
    entityType: 'work-order' | 'material' | 'invoice' | 'photo',
    entityId: string,
    metadata?: any
  ): Observable<UploadedDocument> {
    // In a real app, this would upload to a server
    // For now, we'll create a mock URL using data URI
    return new Observable<UploadedDocument>(observer => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const document: UploadedDocument = {
          id: `doc_${Date.now()}`,
          fileName: file.name,
          fileUrl: e.target?.result as string, // In real app, this would be a server URL
          fileType: file.type,
          fileSize: file.size,
          uploadedDate: new Date(),
          uploadedBy: 'Current User', // TODO: Get from auth service
          entityType,
          entityId,
          metadata
        };
        
        this.mockDocuments.push(document);
        
        // Simulate upload delay
        setTimeout(() => {
          observer.next(document);
          observer.complete();
        }, 1000);
      };
      
      reader.onerror = () => {
        observer.error(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  /**
   * Upload multiple files
   */
  uploadMultipleFiles(
    files: File[],
    entityType: 'work-order' | 'material' | 'invoice' | 'photo',
    entityId: string,
    metadata?: any
  ): Observable<UploadedDocument[]> {
    const uploadPromises = files.map(file => 
      this.uploadFile(file, entityType, entityId, metadata).toPromise()
    );
    
    return new Observable<UploadedDocument[]>(observer => {
      Promise.all(uploadPromises)
        .then(documents => {
          observer.next(documents.filter(doc => doc !== undefined) as UploadedDocument[]);
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  /**
   * Get documents for a specific entity
   */
  getDocumentsByEntity(entityType: string, entityId: string): Observable<UploadedDocument[]> {
    const documents = this.mockDocuments.filter(
      doc => doc.entityType === entityType && doc.entityId === entityId
    );
    return of(documents).pipe(delay(500));
  }

  /**
   * Get all documents for a work order (including related materials, invoices, etc.)
   */
  getWorkOrderDocuments(workOrderId: string): Observable<UploadedDocument[]> {
    const documents = this.mockDocuments.filter(
      doc => doc.entityId === workOrderId || 
             (doc.metadata && doc.metadata.workOrderId === workOrderId)
    );
    return of(documents).pipe(delay(500));
  }

  /**
   * Delete a document
   */
  deleteDocument(documentId: string): Observable<boolean> {
    const index = this.mockDocuments.findIndex(doc => doc.id === documentId);
    if (index > -1) {
      this.mockDocuments.splice(index, 1);
      return of(true).pipe(delay(500));
    }
    return of(false);
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File, allowedTypes?: string[], maxSizeMB?: number): { valid: boolean; error?: string } {
    // Check file type
    if (allowedTypes && allowedTypes.length > 0) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const isValidType = allowedTypes.some(type => {
        if (type.includes('*')) {
          const [mainType] = type.split('/');
          return file.type.startsWith(mainType);
        }
        return file.type === type || fileExtension === type;
      });
      
      if (!isValidType) {
        return { valid: false, error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}` };
      }
    }
    
    // Check file size
    if (maxSizeMB) {
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
      }
    }
    
    return { valid: true };
  }
} 