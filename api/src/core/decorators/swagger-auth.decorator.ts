import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function SwaggerAuth(description = 'Unauthorized') {
  return applyDecorators(
    ApiBearerAuth('JWT'),
    ApiUnauthorizedResponse({
      description,
      schema: {
        properties: {
          statusCode: { type: 'number', example: 401 },
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Unauthorized' },
        },
      },
    }),
  );
}
