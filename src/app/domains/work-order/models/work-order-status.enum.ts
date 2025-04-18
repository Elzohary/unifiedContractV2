export enum WorkOrderStatus {
  // Basic statuses
  Pending = 'pending',
  InProgress = 'in-progress',
  Completed = 'completed',
  Cancelled = 'cancelled',
  OnHold = 'on-hold',
  
  // Extended statuses
  UpdatedAlreadyUDSProblem = 'Updated already UDS-problem',
  ReadyForCompleteCertificateWithRequirement = 'Ready to complete certificate with requirement',
  ReadyForUpdatingUDISProblem = 'Ready for updating UDS problem',
  UpdatedAlreadyNeedRTIOnly = 'Updated already need RTI only',
  UnderCheckingAndSignatures = 'Under checking and signatures',
  PaidWithVAT = 'Paid with VAT',
  UpdatedAlreadyRTIAndReceivingInProcess = 'Updated already RTI-receiving in process',
  NeedDP = 'need DP',
  ReadyForCheckingNeedPrepareDocuments = 'Ready for checking need prepare documents',
  UpdatedAlreadyEngSectionForApproval = 'Updated already Engr. section for approval',
  WaitingShutdown = 'Waiting Shutdown',
  InProgressForPermission = 'In progress for permission',
  CancelWorkOrder = 'Cancel work-order',
  NeedReplacementEquipment = 'Need replacement equipment',
  WaitingFinancial = 'Waiting financial',
  ReadyForChecking = 'Ready for checking',
  ClosedWithMustakhlasNeed1stApproval = 'Closed with mustakhlas need 1st approval',
  NeedMustakhlasWithoutRequirements = 'Need mustakhlas without requirements',
  UpdatedAlreadyNeedReceivingMaterialsOnly = 'Updated already need receiving materials only',
  CompleteCertificateNeed2ndApproval = 'Complete certificate need 2nd approval',
  ClosedWithMustakhlasNeed2ndApproval = 'Closed with mustakhlas need 2nd approval',
  MaterialsReceivedNeed155 = 'Materials received need 155',
  ReadyForCompleteCertificateWithoutRequirement = 'Ready for complete certificate without requirement',
  ClosedWithMustakhlasNeed1stApprovalNeedReturnScSrap = 'Closed with mustakhlas need 1st approval return scrap'
} 

// Display names for statuses can be provided via a mapping function or object if needed
/* 
UPDATED ALREADY "UDS PROBLEM"
READY FOR COMPLETE CERTIFICATE WITH REQUIRMENT
READY FOR UPDATING " UDIS PROBLEM "
UPDATED ALREADY " NEED RTI ONLY
Under checking and Signatures by Inspectors
PAID WITH VAT 15%
UPDATED ALREADY "RTI & RECEIVING IN PROCESS
NEED D.P
READY FOR CHECKING "NEED TO PREPARE THE FILE AND THE DOCUMENTS"
UPDATED ALREADY "ENG SECTION  FOR APPROVAL
Waiting shutdown
In Progress for permission
CANCEL WORK ORDER
NEED  REPLACMENT EQUIPMENT
3-WAITING FINANCIAL
READY FOR CHECKING
IN PROGRESS
CLOSED WITH MUSTAKHLAS NEED 1ST APPROVAL
NEED MUSTAKHLAS  WITHOUT REQUIRMENTS
UPDATED ALREADY "  NEED RECEIVING MATERIALS ONLY
COMPLETE CERTIFICATE NEED 2ND APPROVAL
CLOSED WITH MUSTAKHLAS NEED 2ND APPROVAL
MATERIALS RECEIVED  : NEED  155
READY FOR COMPLETE CERTIFICATE WITHOUT REQUIRMENT
CLOSED WITH MUSTAKHLAS NEED 1ST APPROVAL  NEED TO RETURN SCRAP


*/