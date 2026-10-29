import { describe, expect, it } from 'vitest';
import { isCaution, mergeCautions, splitCautions } from '../src/lib/cautions';

describe('Red flags vs Cautions', () => {
  it('keeps genuine fraud indicators under Red flags', () => {
    const flags = [
      'The sender demands secrecy and threatens account closure within an hour.',
      'Payment details changed compared with the previous invoice.',
      'The caller claims to be your bank but asks for your full PIN.',
    ];
    const { indicators, cautions } = splitCautions(flags);
    expect(indicators).toEqual(flags);
    expect(cautions).toEqual([]);
  });

  it('moves identity uncertainty to Cautions', () => {
    expect(isCaution('Cannot confirm the sender identity from this message.')).toBe(true);
    expect(isCaution('The payee name looks like a nickname.')).toBe(true);
  });

  it('moves input limits to Cautions', () => {
    expect(isCaution('Context is very brief, so this check is limited.')).toBe(true);
    expect(isCaution('Very short message, so this check is limited.')).toBe(true);
  });

  it('moves method limits to Cautions', () => {
    expect(isCaution('Wire transfers are hard to reverse once sent.')).toBe(true);
    expect(isCaution('Zelle payments are hard to reverse.')).toBe(true);
  });

  it('moves photo limits to Cautions', () => {
    expect(isCaution('The photo is a tight crop, so nearby tamper signs cannot be checked.')).toBe(
      true,
    );
  });

  it('splits a mixed list so Red flags can show "None."', () => {
    const flags = [
      'The photo is a tight crop, so nearby tamper signs cannot be checked.',
      'Wire transfers are hard to reverse once sent.',
    ];
    const { indicators, cautions } = splitCautions(flags);
    expect(indicators).toEqual([]);
    expect(cautions).toEqual(flags);
  });

  it('merges engine and derived cautions without duplicates', () => {
    const engine = ['Wire transfers are hard to reverse once sent.'];
    const derived = [
      'Wire transfers are hard to reverse once sent.',
      'Context is very brief, so this check is limited.',
    ];
    expect(mergeCautions(engine, derived)).toEqual([
      'Wire transfers are hard to reverse once sent.',
      'Context is very brief, so this check is limited.',
    ]);
  });
});
