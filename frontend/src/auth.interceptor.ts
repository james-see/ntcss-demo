import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  // Basic auth credentials for Elytron ApplicationRealm
  // In production, this would come from a login form
  private username = 'admin';
  private password = 'admin123!';

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only add auth header for API calls to WildFly backend
    if (req.url.includes('/warehouse/rest/api/') && !req.url.includes('/health')) {
      const authHeader = 'Basic ' + btoa(this.username + ':' + this.password);
      const authReq = req.clone({
        setHeaders: { Authorization: authHeader }
      });
      return next.handle(authReq);
    }
    return next.handle(req);
  }
}