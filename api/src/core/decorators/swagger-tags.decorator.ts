import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

/**
 * Auto-generate Swagger tags based on controller name.
 * 
 * Usage:
 *   @SwaggerTag()
 *   export class UserController {}
 * 
 * Or override:
 *   @SwaggerTag('Custom Tag')
 */
export function SwaggerTag(tagName?: string): ClassDecorator {
  return (target: any) => {
    const name =
      tagName ||
      target.name.replace(/Controller$/, '').replace(/([a-z])([A-Z])/g, '$1 $2');

    return applyDecorators(ApiTags(name), SetMetadata('swaggerTag', name))(
      target,
    );
  };
}
