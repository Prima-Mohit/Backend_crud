import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        // Log the error to the console
        console.error('Error intercepted:', err);

        // Handle known HTTP exceptions
        if (err instanceof HttpException) {
          return throwError(() => err);
        }

        // Handle other known errors (e.g., database errors)
        if (err.code === 'ER_DUP_ENTRY') {
          // MySQL duplicate entry error
          return throwError(
            () => new HttpException('Duplicate entry detected.', 409), // Conflict HTTP status code
          );
        }

        // Default to Internal Server Error for unhandled cases
        return throwError(
          () =>
            new InternalServerErrorException(
              'An unexpected error occurred. Please try again later.',
            ),
        );
      }),
    );
  }
}
