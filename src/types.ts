import { Timestamp } from 'firebase/firestore';

export interface Product {
  id: string;
  name: string;
  description?: string;
  userId: string;
  userEmail: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Step {
  id: string;
  name: string;
  description?: string;
  ingredient?: string;
  color?: string;
  order: number;
}
