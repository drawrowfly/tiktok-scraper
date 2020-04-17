/* eslint-disable no-undef */
import { generateSignature } from '.';

import SignatureData from './__mockData__/data';

describe('Signature', () => {
    it('should return a valid signature', async () => {
        expect(generateSignature(SignatureData.url, SignatureData.userAgent, SignatureData.tac)).toEqual('TYYDvAAgEBqyefxDv6.DM02GAqAABQA');
    });
});
