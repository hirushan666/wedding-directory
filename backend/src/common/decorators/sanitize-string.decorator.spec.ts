import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SanitizeString } from './sanitize-string.decorator';

class TestDto {
  @SanitizeString({ maxLength: 50, minLength: 2 })
  title: string;

  @SanitizeString({ maxLength: 100, allowMultiline: true })
  bio: string;

  @SanitizeString({ maxLength: 20, optional: true })
  tag?: string;
}

describe('SanitizeString Decorator', () => {
  it('cleanses HTML, null bytes, and trims whitespace upon transformation', () => {
    const raw = {
      title: '  <b>Hello</b> World\0\x07  ',
      bio: 'Line 1\n\n\n\nLine 2',
      tag: '  cool  ',
    };

    const instance = plainToInstance(TestDto, raw);

    expect(instance.title).toBe('Hello World');
    expect(instance.bio).toBe('Line 1\n\nLine 2');
    expect(instance.tag).toBe('cool');
  });

  it('removes zero-width and RTL override characters', () => {
    const raw = {
      title: 'Valid\u200BName\u202E',
      bio: 'Safe description',
    };

    const instance = plainToInstance(TestDto, raw);
    expect(instance.title).toBe('ValidName');
  });

  it('fails validation when length exceeds maxLength', async () => {
    const raw = {
      title: 'a'.repeat(60), // max is 50
      bio: 'Short bio',
    };

    const instance = plainToInstance(TestDto, raw);
    const errors = await validate(instance);

    expect(errors.length).toBeGreaterThan(0);
    const titleError = errors.find((e) => e.property === 'title');
    expect(titleError).toBeDefined();
    expect(titleError?.constraints?.maxLength).toContain('50 characters');
  });

  it('fails validation when length is below minLength', async () => {
    const raw = {
      title: 'a', // min is 2
      bio: 'Short bio',
    };

    const instance = plainToInstance(TestDto, raw);
    const errors = await validate(instance);

    const titleError = errors.find((e) => e.property === 'title');
    expect(titleError).toBeDefined();
    expect(titleError?.constraints?.minLength).toContain('2 characters');
  });

  it('allows optional fields to be omitted', async () => {
    const raw = {
      title: 'Valid Title',
      bio: 'Valid bio',
    };

    const instance = plainToInstance(TestDto, raw);
    const errors = await validate(instance);
    expect(errors.length).toBe(0);
  });
});
