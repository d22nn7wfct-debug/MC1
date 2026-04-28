import { describe, it, expect, vi } from 'vitest';
import { getErrorMessage } from './errors';

// Простейший мок TFunction: возвращает сам ключ.
// Этого достаточно, чтобы отличить разные ветви логики.
const tMock = vi.fn((key: string) => `t(${key})`) as unknown as Parameters<
  typeof getErrorMessage
>[1];

describe('getErrorMessage', () => {
  it('возвращает перевод по известному code', () => {
    const msg = getErrorMessage(
      { status: 404, code: 'PRODUCT_NOT_FOUND', message: 'raw' },
      tMock,
    );
    expect(msg).toBe('t(errors.productNotFound)');
  });

  it('падает на message, если code неизвестен', () => {
    const msg = getErrorMessage(
      { status: 500, code: 'UNKNOWN_CODE', message: 'Boom' },
      tMock,
    );
    expect(msg).toBe('Boom');
  });

  it('падает на message, если code отсутствует', () => {
    const msg = getErrorMessage({ status: 500, message: 'Boom' }, tMock);
    expect(msg).toBe('Boom');
  });

  it('использует fallbackKey, если нет ни code, ни message', () => {
    const msg = getErrorMessage({}, tMock, 'cart.orderFailed');
    expect(msg).toBe('t(cart.orderFailed)');
  });

  it('по умолчанию fallbackKey = errors.generic', () => {
    const msg = getErrorMessage(null, tMock);
    expect(msg).toBe('t(errors.generic)');
  });

  it('обрабатывает не-объекты (string, number, undefined)', () => {
    expect(getErrorMessage('oops', tMock)).toBe('t(errors.generic)');
    expect(getErrorMessage(42, tMock)).toBe('t(errors.generic)');
    expect(getErrorMessage(undefined, tMock)).toBe('t(errors.generic)');
  });

  it('игнорирует message нестрокового типа', () => {
    const msg = getErrorMessage(
      { status: 500, message: 12345 as unknown as string },
      tMock,
      'errors.networkError',
    );
    expect(msg).toBe('t(errors.networkError)');
  });
});
