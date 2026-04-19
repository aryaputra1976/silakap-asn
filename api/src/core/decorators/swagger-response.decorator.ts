import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  getSchemaPath,
} from '@nestjs/swagger';

export function SwaggerResponse<TModel extends Type<any>>(
  model: TModel,
  description = 'Success',
) {
  return applyDecorators(
    ApiOkResponse({
      description,
      schema: {
        allOf: [
          {
            properties: {
              success: { type: 'boolean', example: true },
              timestamp: { type: 'string', example: new Date().toISOString() },
              path: { type: 'string', example: '/api/v1/example' },
              method: { type: 'string', example: 'GET' },
              data: { $ref: getSchemaPath(model) },
            },
          },
        ],
      },
    }),

    ApiBadRequestResponse({
      description: 'Bad Request',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 400 },
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed' },
          errors: { type: 'array', items: { type: 'string' } },
        },
      },
    }),

    ApiUnauthorizedResponse({
      description: 'Unauthorized',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 401 },
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Unauthorized' },
        },
      },
    }),

    ApiForbiddenResponse({
      description: 'Forbidden',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 403 },
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Forbidden' },
        },
      },
    }),

    ApiNotFoundResponse({
      description: 'Not Found',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 404 },
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Not Found' },
        },
      },
    }),

    ApiInternalServerErrorResponse({
      description: 'Internal Server Error',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 500 },
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Internal server error' },
        },
      },
    }),
  );
}
