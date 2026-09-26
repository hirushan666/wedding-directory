import { SanitizePayloadInterceptor } from './sanitize-payload.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('SanitizePayloadInterceptor', () => {
  let interceptor: SanitizePayloadInterceptor;

  beforeEach(() => {
    interceptor = new SanitizePayloadInterceptor();
  });

  it('sanitizes strings in HTTP request body while leaving passwords untouched', (done) => {
    const mockRequest = {
      body: {
        name: '  <b>John</b> Doe\0  ',
        password: '  SecretPassword!@#$  ',
        nested: {
          comment: 'Text\u200Bwith\u202EbadUnicode',
        },
      },
    };

    const mockContext = {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    const mockHandler: CallHandler = {
      handle: () => of('result'),
    };

    interceptor.intercept(mockContext, mockHandler).subscribe({
      next: () => {
        expect(mockRequest.body.name).toBe('<b>John</b> Doe');
        // Password preserves whitespaces and symbols
        expect(mockRequest.body.password).toBe('  SecretPassword!@#$  ');
        // Bad unicode stripped
        expect(mockRequest.body.nested.comment).toBe('TextwithbadUnicode');
        done();
      },
    });
  });

  it('caps extremely long payload strings to the hard ceiling', (done) => {
    const hugeString = 'x'.repeat(12000);
    const mockRequest = {
      body: {
        message: hugeString,
      },
    };

    const mockContext = {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    const mockHandler: CallHandler = {
      handle: () => of('result'),
    };

    interceptor.intercept(mockContext, mockHandler).subscribe({
      next: () => {
        expect(mockRequest.body.message.length).toBe(10000);
        done();
      },
    });
  });
});
