export const ENQUIRY_KINDS = [
  'USER',
  'PROVIDER',
  'VOLUNTEER',
  'STATE_ADMIN',
  'PRODUCT',
] as const;

export type EnquiryKind = (typeof ENQUIRY_KINDS)[number];

export const ENQUIRY_NAV_ITEMS: { kind: EnquiryKind; title: string; href: string }[] = [
  { kind: 'USER', title: 'User enquiry', href: '/enquiries/user' },
  { kind: 'PROVIDER', title: 'Service provider', href: '/enquiries/provider' },
  { kind: 'VOLUNTEER', title: 'Volunteer', href: '/enquiries/volunteer' },
  { kind: 'STATE_ADMIN', title: 'State admin', href: '/enquiries/state-admin' },
  { kind: 'PRODUCT', title: 'Product enquiry', href: '/enquiries/product' },
];
