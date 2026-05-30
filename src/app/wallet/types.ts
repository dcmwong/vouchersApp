export interface FamilyMember {
  id: string;
  name: string;
  color: string;
}

export interface Brand {
  id: string;
  name: string;
  color: string | null;
  tag: string | null;
  loyaltyScheme: string | null;
}

export interface Voucher {
  id: string;
  brand: string | null;
  brandId: string;
  currentValue: string | null;
  value: string | null;
  owner: string;
  isLoyalty: boolean;
  active: boolean;
  url: string | null;
  refId: string | null;
}

export interface HydratedVoucher extends Voucher {
  color: string;
  tag: string;
  loyaltyScheme: string | null;
}
