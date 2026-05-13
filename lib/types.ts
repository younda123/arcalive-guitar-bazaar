export type DeliveryMethod = "shipping" | "direct" | "negotiable";

export type ItemStatus =
  | "pending"
  | "approved"
  | "selected"
  | "completed"
  | "hidden"
  | "deleted";

export type Item = {
  id: string;
  title: string;
  description: string;
  condition: string;
  imageUrl?: string;
  imageUrls: string[];
  deliveryMethod: DeliveryMethod;
  status: ItemStatus;
  donorContact: string;
  selectedByWinnerId?: string;
  createdAt: string;
  updatedAt: string;
};

export type Winner = {
  id: string;
  name: string;
  rank: number;
  code: string;
  canSelect: boolean;
  selectedItemId?: string;
  createdAt: string;
  updatedAt: string;
};

export type Store = {
  items: Item[];
  winners: Winner[];
};
