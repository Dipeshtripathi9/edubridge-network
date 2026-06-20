import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: true;
  data: T;
}

/**
 * Wraps successful responses in a consistent envelope. If a handler already
 * returns an object with a `meta` field (e.g. pagination), it is preserved.
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((payload) => {
        if (payload && typeof payload === 'object' && 'data' in payload && 'meta' in payload) {
          return { success: true, ...(payload as object) } as ApiResponse<T>;
        }
        return { success: true, data: payload as T };
      }),
    );
  }
}
