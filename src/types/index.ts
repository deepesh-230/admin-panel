export interface Enquiry {
  id: string;
  sNo: number;
  category: string;
  subCategory: string;
  product: string;
  name: string | null;
  email: string;
  date: string;
  createdBy: string;
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
