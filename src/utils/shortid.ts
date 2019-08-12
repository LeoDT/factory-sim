import shortid from 'shortid';

export function generateShortId(): string {
  return shortid.generate();
}
