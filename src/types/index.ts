export type EnquiryStatus = 'NEW' | 'CONTACTED' | 'CLOSED';

export type EnquiryKind = 'USER' | 'PROVIDER' | 'VOLUNTEER' | 'STATE_ADMIN' | 'PRODUCT';

export interface Enquiry {
  id: string;
  sNo: number;
  kind?: EnquiryKind | string;
  category: string;
  subCategory: string;
  product: string;
  name: string | null;
  email: string;
  phone?: string | null;
  message?: string | null;
  date: string;
  createdBy: string;
  status?: EnquiryStatus;
  providerId?: string | null;
  stateId?: string | null;
  marketplaceProductId?: string | null;
  adminFlag?: 'READ' | 'ACTIVE' | 'DELETE';
  provider?: { id: string; name: string; stateId?: string } | null;
  state?: { id: string; name: string; code: string | null } | null;
}

export interface Listing {
  id: string;
  sNo: number;
  category: string;
  subCategory: string;
  product: string;
  email: string;
  image: string;
  createdBy: string;
  date: string;
  status: boolean;
}
