import { NO_WEAR, receiptWear } from '@/utils/receipt-wear';

const ids = Array.from({ length: 400 }, (_, index) => `entry-${index}`);

describe('receiptWear', () => {
  it('gives a receipt the same wear every time', () => {
    expect(receiptWear('entry-42', 'full')).toEqual(receiptWear('entry-42', 'full'));
  });

  it('runs the fold crease somewhere different on different receipts', () => {
    const creases = new Set(ids.map((id) => receiptWear(id, 'full').creaseAt));
    expect(creases.size).toBeGreaterThan(10);
  });

  it('tapes about half the receipts', () => {
    const taped = ids.filter((id) => receiptWear(id, 'full').taped).length / ids.length;
    expect(taped).toBeGreaterThan(0.35);
    expect(taped).toBeLessThan(0.65);
  });

  it('leaves the shared picture clean', () => {
    expect(receiptWear('entry-42', 'none')).toEqual(NO_WEAR);
  });
});
