import { ITestCaseHookParameter } from '@cucumber/cucumber';
import { binding, before, after } from 'cucumber-tsflow';
import fetch from 'node-fetch';
const CONTRACT_TAG_PREFIX = '@contract=';

@binding([])
class TomatoHooks {
  contractServerUri = 'localhost:8090';
  isInitialized = false;

  contract?: string;

  @before()
  async initializeContract(scenario: ITestCaseHookParameter) {
    this.contract = this.getContract(scenario);

    if (this.contract) {
      this.isInitialized = true;

      const response = await fetch(`http://${this.contractServerUri}/init?__contract__script__=${this.contract}`);
      const result = await response.json();

      if (result.ok !== true) {
        throw new Error(`Something went wrong: ${result}`);
      }
    }
  }

  @after()
  async verifyContract() {
    if (!this.isInitialized) {
      return;
    }

    const response = await fetch(`http://${this.contractServerUri}/expect`);
    const result = await response.json();

    if (result.expectations?.failed > 0) {
      throw new Error(`The step failed due to contract server expectations. ${result.expectations}`);
    }
  }

  getContract(scenario: ITestCaseHookParameter) {
    const tag = scenario.pickle.tags.find((tag) => tag.name.startsWith(CONTRACT_TAG_PREFIX));

    if (tag) {
      return tag.name.substring(CONTRACT_TAG_PREFIX.length);
    }
  }
}

export = TomatoHooks;
