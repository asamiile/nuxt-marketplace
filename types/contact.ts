export interface Contact {
  id: number;
  created_at: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: '未対応' | '対応中' | '対応済み';
}
