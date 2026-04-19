import * as fs from 'fs';

export class FileHelper {
  static exists(path: string): boolean {
    return fs.existsSync(path);
  }

  static read(path: string): string {
    return fs.readFileSync(path, 'utf8');
  }

  static write(path: string, data: string): void {
    fs.writeFileSync(path, data);
  }
}
