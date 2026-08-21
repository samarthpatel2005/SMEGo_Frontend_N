// types/client.d.ts

// Interface for the structure of a Client object
export interface Client {
  _id: string;
  organization: string;
  name: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  companyName?: string;
  clientType: 'individual' | 'business';
  status: 'active' | 'inactive' | 'lead';
  tags?: string[];
  notes?: string;
  totalInvoices?: number;
  totalRevenue?: number;
  lastInvoiceDate?: Date;
  lastPaymentDate?: Date;
  createdBy: {
    _id: string;
    name: string;
    fullName?: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
    fullName?: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  displayName?: string;
  clientId?: string;
}

// Interface for the pagination information returned from the API
export interface Pagination {
  total: number;
  pages: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Interface for the API response when fetching a list of clients
export interface GetClientsResponse {
  success: boolean;
  data: Client[];
  pagination: Pagination;
}

// Interface for query parameters for fetching clients
export interface ClientQueryParams {
  page?: number;
  limit?: number;
  status?: 'active' | 'inactive' | 'lead';
  clientType?: 'individual' | 'business';
  search?: string;
  sort?: string;
}
