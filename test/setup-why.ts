/* global after */
import whyIsNodeRunning from 'why-is-node-running';
import wtf from 'wtfnode';
import nock from 'nock';

after(function () {
  nock.enableNetConnect();
  nock.restore();
  setTimeout(() => {
    // whyIsNodeRunning();
    wtf.dump();
  }, 1000);
});
