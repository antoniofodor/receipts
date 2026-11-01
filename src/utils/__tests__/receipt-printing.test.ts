import { barcodeBars, barcodeCaption } from '@/utils/barcode';
import { formatReceiptNumber } from '@/utils/format';
import { initialsOf } from '@/utils/initials';
import { formatReceiptDate } from '@/utils/receipt-date';

describe('initialsOf', () => {
  it('takes the first two letters of a single name', () => {
    expect(initialsOf('Kev')).toBe('KE');
  });

  it('takes the first letter of each of two names', () => {
    expect(initialsOf('  big dave ')).toBe('BD');
  });

  it('copes with a one-letter or empty name', () => {
    expect(initialsOf('J')).toBe('J');
    expect(initialsOf('   ')).toBe('?');
  });
});

describe('barcodeBars', () => {
  it('prints the same bars for the same seed', () => {
    expect(barcodeBars('entry-1')).toEqual(barcodeBars('entry-1'));
  });

  it('prints different bars for different seeds', () => {
    expect(barcodeBars('entry-1')).not.toEqual(barcodeBars('entry-2'));
  });

  it('uses thin, medium and thick bars with small gaps', () => {
    for (const bar of barcodeBars('trip-1')) {
      expect([1, 2, 3]).toContain(bar.width);
      expect([1, 2]).toContain(bar.gap);
    }
  });

  it('captions the barcode with two groups of four digits', () => {
    expect(barcodeCaption('trip-1')).toMatch(/^\d{4} \d{4}$/);
  });
});

describe('formatReceiptNumber', () => {
  it('prints the start of the id as a short transaction number', () => {
    expect(formatReceiptNumber('1a2b3c4d-0000-0000-0000-000000000000')).toBe('#1A2B');
  });
});

describe('formatReceiptDate', () => {
  it('prints the day, the month spelled out, the year and the time', () => {
    expect(formatReceiptDate(new Date(2026, 10, 1, 23, 41))).toBe('01 NOV 26 · 23:41');
  });

  it('pads single digits like a till', () => {
    expect(formatReceiptDate(new Date(2027, 0, 5, 7, 3))).toBe('05 JAN 27 · 07:03');
  });
});
