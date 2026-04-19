import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export function SwaggerPaginated<TModel extends Type<any>>(
  model: TModel,
  description = 'Paginated list response',
) {
  return applyDecorators(
    ApiOkResponse({
      description,
      schema: {
        properties: {
          success: { type: 'boolean', example: true },
          timestamp: { type: 'string', example: new Date().toISOString() },
          path: { type: 'string', example: '/api/v1/users' },
          method: { type: 'string', example: 'GET' },
          meta: {
            type: 'object',
            properties: {
              page: { type: 'number', example: 1 },
              limit: { type: 'number', example: 10 },
              total: { type: 'number', example: 125 },
              lastPage: { type: 'number', example: 13 },
            },
          },
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(model) },
          },
        },
      },
    }),
  );
}
