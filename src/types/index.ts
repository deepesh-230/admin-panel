export type EnquiryStatus = 'NEW' | 'CONTACTED' | 'CLOSED';

export interface Enquiry {
  id: string;
  sNo: number;
  kind?: string;
  category: string;
  subCategory: string;
  product: string;
  name: string | null;
  email: string;
  date: string;
  createdBy: string;
  status?: EnquiryStatus;
  providerId?: string | null;
  stateId?: string | null;
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
