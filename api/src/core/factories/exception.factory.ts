import { BadRequestException, ValidationError } from '@nestjs/common';

export const validationExceptionFactory = (errors: ValidationError[]) => {
  const formattedErrors = errors.map((err) => ({
    field: err.property,
    errors: extractConstraints(err),
  }));

  return new BadRequestException({
    statusCode: 400,
    success: false,
    message: 'Validation failed',
    errors: formattedErrors,
  });
};

// Rekursif untuk nested DTO
function extractConstraints(error: ValidationError): string[] {
  if (error.constraints) {
    return Object.values(error.constraints);
  }

  if (error.children && error.children.length > 0) {
    return error.children.flatMap((child) => extractConstraints(child));
  }

  return ['Invalid value'];
}
