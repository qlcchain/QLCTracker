import { FiatPipe } from './fiat.pipe';

describe('FiatPipe', () => {
  it('create an instance', () => {
    const pipe = new FiatPipe('1');
    expect(pipe).toBeTruthy();
  });
});
