export type UserRole = 
  | "administrator" 
  | "admin" 
  | "operations_manager" 
  | "cleaner" 
  | "maintenance" 
  | "owner";
export interface SystemUser {
  id: string;
  name: string;
  username?: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  active: boolean;
  telegramPin?: string;
  telegramChatId?: string;
}
