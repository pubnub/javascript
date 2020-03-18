/* global describe, it */

import assert from 'assert';
import CborReader from 'cbor-sync';

import Cbor from '../../src/cbor/common';

describe('cbor', () => {
  it('should decode token', () => {
    const cbor = new Cbor(CborReader.decode, (base64String) => new Buffer.from(base64String, 'base64'));
    let token = 'p0F2AkF0Gl043rhDdHRsCkNyZXOkRGNoYW6hZnNlY3JldAFDZ3JwoEN1c3KgQ3NwY6BDcGF0pERjaGFuoENncnCgQ3VzcqBDc3BjoERtZXRhoENzaWdYIGOAeTyWGJI-blahPGD9TuKlaW1YQgiB4uR_edmfq-61';

    let decodedToken = cbor.decodeToken(token);

    assert(typeof decodedToken === 'object', 'decoded token object should be returned');

    assert(decodedToken.v === 2, 'token should have correct v');
    assert(decodedToken.t === 1564008120, 'token should have correct t');
    assert(decodedToken.ttl === 10, 'token should have correct ttl');

    assert(typeof decodedToken.res === 'object', 'token should have res');
    assert(typeof decodedToken.res.chan, 'token should have res/chan');
    assert(typeof decodedToken.res.grp, 'token should have res/grp');
    assert(typeof decodedToken.res.usr, 'token should have res/usr');
    assert(typeof decodedToken.res.spc, 'token should have res/spc');

    // contains permission for one channel

    assert(decodedToken.res.chan.secret === 1, 'token should have permissions for res/chan/secret of 1');

    assert(typeof decodedToken.pat, 'token should have pat');
    assert(typeof decodedToken.pat.chan, 'token should have pat/chan');
    assert(typeof decodedToken.pat.grp, 'token should have pat/grp');
    assert(typeof decodedToken.pat.usr, 'token should have pat/usr');
    assert(typeof decodedToken.pat.spc, 'token should have pat/spc');

    assert(typeof decodedToken.meta === 'object', 'token should have meta');

    assert(decodedToken.sig instanceof Buffer, 'token should have sig as a Buffer');
  });
});
