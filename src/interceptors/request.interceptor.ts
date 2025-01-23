import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class RequestInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    console.log(`Incoming Request: ${request.method} ${request.url}`);
    console.log('Headers:', request.headers);
    console.log('Body:', request.body);

    // Proceed to the next handler
    return next.handle();
  }
}
