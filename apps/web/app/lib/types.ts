export interface Merchant {
  id: string;
  name: string;
  email: string;
}

export interface AuthResult {
  merchant: Merchant;
  token: string;
}

export interface CallView {
  id: string;
  orderRef: string;
  customerName: string;
  status: string;
  outcome: string | null;
  transcripts: { speaker: string; text: string; spokenAt: string }[];
}

export interface CallSession {
  url: string;
  token: string;
  roomName: string;
}
