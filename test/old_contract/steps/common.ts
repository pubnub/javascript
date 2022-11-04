import { Given } from '@cucumber/cucumber';

Given('the demo keyset', function() {
  this.keyset = this.fixtures.demoKeyset;
});
  