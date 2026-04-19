import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common"
import { Observable } from "rxjs"
import { map } from "rxjs/operators"

function serializeBigInt(value: any): any {
  if (typeof value === "bigint") {
    return Number(value)
  }

  // FIX: Jangan ubah Date
  if (value instanceof Date) {
    return value.toISOString() // atau return value kalau mau tetap Date
  }

  if (Array.isArray(value)) {
    return value.map(serializeBigInt)
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, serializeBigInt(v)])
    )
  }

  return value
}


@Injectable()
export class BigIntInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => serializeBigInt(data)))
  }
}