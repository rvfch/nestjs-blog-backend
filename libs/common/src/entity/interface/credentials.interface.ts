export interface ICredentials {
  userId?: string;
  version: number;
  lastPassword: string;
  passwordUpdatedAt: number;

  updatePassword?(password: string): void;
  updateVersion?(): void;
}
