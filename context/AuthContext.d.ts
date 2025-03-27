import { User as FirebaseUser } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { ReactNode } from 'react';

export interface UserType {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface UserPlanType {
  id: string;
  status: 'awaiting' | 'active' | 'cancelled' | 'expired';
  selectedAt: Timestamp;
}

export interface UserWithPlan {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    firstName?: string;
    lastName?: string;
    isActive?: boolean;
    role?: string;
    createdAt?: Timestamp;
  };
  plan: UserPlanType | null;
}

export interface LeadType {
  id: string;
  email: string;
  name: string;
  surname: string;
  company: string;
  phone: string;
  description: string;
  planId: string;
  status: string;
  createdAt: Timestamp;
}

export interface AuthResult {
  user: FirebaseUser | null;
  error: string | null;
}

export interface LogoutResult {
  success: boolean;
  error: string | null;
}

export interface PlanUpdateResult {
  success: boolean;
  error: string | null;
}

export interface InquiryResult {
  success: boolean;
  message: string;
}

export interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  userPlan: UserPlanType | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<AuthResult>;
  logout: () => Promise<LogoutResult>;
  updateUserPlan: (planId: string) => Promise<PlanUpdateResult>;
  getAllUsers: () => Promise<UserWithPlan[]>;
  updateUserPlanStatus: (userId: string, planId: string, status: string) => Promise<boolean>;
  getLeads: () => Promise<LeadType[]>;
  updateLeadStatus: (leadId: string, status: string) => Promise<boolean>;
  submitInquiry: (email: string, name: string, surname: string, company: string, phone: string, description: string, planId: string) => Promise<InquiryResult>;
}

interface AuthProviderProps {
  children: ReactNode;
}

export declare function AuthProvider(props: AuthProviderProps): JSX.Element;
export declare function useAuth(): AuthContextType;