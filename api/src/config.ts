export class Config {
  static readonly PORT = "PORT";
  static readonly JWT_SECRET = "JWT_SECRET";
  static readonly DEFAULT_ADMIN_PASSWORD: string = "DEFAULT_ADMIN_PASSWORD";
  static readonly DEFAULT_ADMIN_EMAIL: string = "DEFAULT_ADMIN_EMAIL";
  static readonly SESSION_SECRET: string = "SESSION_SECRET";
  static get(key: string): string | undefined {
    return process.env[key];
  }
  static getOr(key: string, defaultValue: string): string {
    return process.env[key] ?? defaultValue;
  }
  static getOrThrow(key: string): string {
    const value = process.env[key];
    if (value === undefined) {
      throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
  }
}