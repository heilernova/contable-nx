export class Session {
  public readonly username: string;
  public readonly sub: string
  public readonly role: 'admin' | 'user';
  public readonly permissions: string[];

  constructor(data: {
    username: string,
    sub: string,
    role: 'admin' | 'user',
    permissions: string[]
  }) {
    this.username = data.username;
    this.sub = data.sub;
    this.role = data.role;
    this.permissions = data.permissions;
  }

  public toJSON() {
    return {
      username: this.username,
      sub: this.sub,
      role: this.role,
      permissions: this.permissions
    };
  }
}