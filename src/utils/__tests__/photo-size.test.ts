import { feedPhotoAspectRatio, resizeToFit } from '@/utils/photo-size';

describe('resizeToFit', () => {
  it('leaves photos that already fit alone', () => {
    expect(resizeToFit(1200, 900)).toBeNull();
    expect(resizeToFit(1600, 1600)).toBeNull();
  });

  it('shrinks the longer edge of a landscape photo', () => {
    expect(resizeToFit(4032, 3024)).toEqual({ width: 1600, height: null });
  });

  it('shrinks the longer edge of a portrait photo', () => {
    expect(resizeToFit(3024, 4032)).toEqual({ width: null, height: 1600 });
  });
});

describe('feedPhotoAspectRatio', () => {
  it('keeps ordinary photos at their own shape', () => {
    expect(feedPhotoAspectRatio(1600, 1200)).toBeCloseTo(4 / 3);
  });

  it('stops tall photos and panoramas taking over the feed', () => {
    expect(feedPhotoAspectRatio(900, 1600)).toBe(3 / 4);
    expect(feedPhotoAspectRatio(4000, 1000)).toBe(16 / 9);
  });

  it('falls back to square when the size is unknown', () => {
    expect(feedPhotoAspectRatio(0, 0)).toBe(1);
  });
});
