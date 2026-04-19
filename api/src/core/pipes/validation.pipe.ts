import {
  ArgumentMetadata,
  Injectable,
  ValidationPipe as NestValidationPipe,
} from '@nestjs/common';
import { ValidationException } from '../exceptions';

@Injectable()
export class ValidationPipe extends NestValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const messages = errors.map((err) => ({
          field: err.property,
          errors: err.constraints
            ? Object.values(err.constraints)
            : ['Invalid value'],
        }));

        return new ValidationException('Validasi gagal', messages);
      },
    });
  }

  transform(value: any, metadata: ArgumentMetadata) {
    return super.transform(value, metadata);
  }
}
