// 型定義ファイル - sun-nippo

export type Role = 'ADMIN' | 'MANAGER' | 'SALES';

export type VisitPurpose = 'REGULAR' | 'NEW_BUSINESS' | 'COMPLAINT' | 'PROPOSAL' | 'OTHER';

export type OrderStatus = 'ESTIMATE' | 'ORDERED' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';

export type PaymentMethod = 'CASH' | 'CREDIT' | 'DEFERRED';

export type ReportStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export type TemplateType = 'DAILY_REPORT' | 'VISIT' | 'PHRASE';

// ユーザー
export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  employeeId?: string;
  phone?: string;
  department?: string;
  profileImage?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 店舗
export interface Store {
  id: string;
  name: string;
  nameKana?: string;
  storeCode?: string;
  postalCode?: string;
  address: string;
  phone?: string;
  businessType?: string;
  contactPerson?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 商品
export interface Product {
  id: string;
  productCode: string;
  name: string;
  category?: string;
  unitPrice: number;
  unit: string;
  description?: string;
  barcode?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 訪問記録
export interface Visit {
  id: string;
  userId: string;
  storeId: string;
  visitDate: Date;
  startTime: Date;
  endTime?: Date;
  purpose: VisitPurpose;
  content?: string;
  proposedProducts?: any;
  expectedOrderAmount?: number;
  nextVisitDate?: Date;
  latitude?: number;
  longitude?: number;
  createdAt: Date;
  updatedAt: Date;
}

// 受注
export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  storeId: string;
  visitId?: string;
  orderDate: Date;
  status: OrderStatus;
  subtotal: number;
  discountRate: number;
  discountAmount: number;
  totalAmount: number;
  deliveryDate?: Date;
  deliveryAddress?: string;
  deliveryNote?: string;
  paymentMethod?: PaymentMethod;
  paymentDueDate?: Date;
  invoiceNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
}

// 受注明細
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

// 日報
export interface DailyReport {
  id: string;
  userId: string;
  reportDate: Date;
  status: ReportStatus;
  workStartTime?: Date;
  workEndTime?: Date;
  travelDistance?: number;
  travelExpense?: number;
  visitCount: number;
  orderCount: number;
  totalSales: number;
  newBusinessCount: number;
  achievements?: string;
  reflections?: string;
  tomorrowPlan?: string;
  specialNotes?: string;
  submittedAt?: Date;
  approvedById?: string;
  approvedAt?: Date;
  rejectedReason?: string;
  createdAt: Date;
  updatedAt: Date;
  attachments?: ReportAttachment[];
}

// 日報添付ファイル
export interface ReportAttachment {
  id: string;
  reportId: string;
  fileUrl: string;
  fileName: string;
  fileType?: string;
  fileSize?: number;
  createdAt: Date;
}

// テンプレート
export interface Template {
  id: string;
  userId: string;
  name: string;
  type: TemplateType;
  content: string;
  isShared: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 通知
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  content?: string;
  relatedId?: string;
  relatedType?: string;
  isRead: boolean;
  createdAt: Date;
}

// API Request/Response types

// 訪問記録作成
export interface CreateVisitRequest {
  storeId: string;
  visitDate: string;
  startTime: string;
  endTime?: string;
  purpose: VisitPurpose;
  content?: string;
  proposedProducts?: any;
  expectedOrderAmount?: number;
  nextVisitDate?: string;
  latitude?: number;
  longitude?: number;
}

// 受注作成
export interface CreateOrderRequest {
  storeId: string;
  visitId?: string;
  orderDate: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
  discountRate?: number;
  discountAmount?: number;
  deliveryDate?: string;
  deliveryAddress?: string;
  deliveryNote?: string;
  paymentMethod?: PaymentMethod;
  paymentDueDate?: string;
}

// 日報作成
export interface CreateDailyReportRequest {
  reportDate: string;
  workStartTime?: string;
  workEndTime?: string;
  travelDistance?: number;
  travelExpense?: number;
  achievements?: string;
  reflections?: string;
  tomorrowPlan?: string;
  specialNotes?: string;
}

// ページネーション
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
