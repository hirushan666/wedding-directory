import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';

const HARD_SAFETY_CEILING = 10000;

const SENSITIVE_KEY_REGEX = /(password|token|secret|signature|hash)/i;

/**
 * Global NestJS Interceptor that traverses incoming request payloads (both REST and GraphQL),
 * stripping NULL bytes and dangerous control characters, and capping string length at a hard ceiling.
 * Sensitive keys (passwords, tokens) are preserved intact.
 */
@Injectable()
export class SanitizePayloadInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const contextType = context.getType<string>();

    if (contextType === 'http') {
      const req = context.switchToHttp().getRequest();
      if (req && req.body && typeof req.body === 'object') {
        req.body = this.deepSanitize(req.body);
      }
    } else if (contextType === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      const args = gqlContext.getArgs();
      if (args && typeof args === 'object') {
        this.deepSanitize(args);
      }
    }

    return next.handle();
  }

  private deepSanitize(target: any, keyName = ''): any {
    if (target === null || target === undefined) return target;

    // Do NOT alter password / token / secret strings
    if (keyName && SENSITIVE_KEY_REGEX.test(keyName)) {
      if (typeof target === 'string' && target.length > 1024) {
        // Safe cap for tokens/passwords to prevent bcrypt DoS
        return target.slice(0, 1024);
      }
      return target;
    }

    if (typeof target === 'string') {
      // 1. Remove NULL bytes (\0) and control characters
      let cleaned = target.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
      // 2. Remove zero-width spaces, RTL/LTR overrides
      cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF\u202A-\u202E]/g, '');

      // 3. Enforce hard safety ceiling
      if (cleaned.length > HARD_SAFETY_CEILING) {
        cleaned = cleaned.slice(0, HARD_SAFETY_CEILING);
      }

      return cleaned.trim();
    }

    if (Array.isArray(target)) {
      for (let i = 0; i < target.length; i++) {
        target[i] = this.deepSanitize(target[i], keyName);
      }
      return target;
    }

    if (typeof target === 'object') {
      for (const key of Object.keys(target)) {
        target[key] = this.deepSanitize(target[key], key);
      }
      return target;
    }

    return target;
  }
}
