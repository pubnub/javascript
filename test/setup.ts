import chaiAsPromised from 'chai-as-promised';
import chaiNock from 'chai-nock';
import chai from 'chai';

chai.use(chaiAsPromised);
chai.use(chaiNock);

process.env.NODE_ENV = 'test';
