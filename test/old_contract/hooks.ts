import { Before, After, AfterStep, ITestCaseHookParameter } from '@cucumber/cucumber';
import * as http from 'http';
const mockServerScriptFileTagPrefix = '@contract=';

/**
 * this is run before each scenario
 *
 * check if scenario tag includes a script file
 * call init endpoint on mock server
 */
Before(async function (scenario: ITestCaseHookParameter) {
  let scriptFile = checkMockServerScriptFile(scenario);

  if (scriptFile) {
    return new Promise<void>((resolve) => {
      http.get(`http://${this.settings.contractServer}/init?__contract__script__=${scriptFile}`, () => {
        resolve();
      });
    });
  }
});

After(async function (scenario: ITestCaseHookParameter) {
  let scriptFile = checkMockServerScriptFile(scenario);

  this.stopPubnub();

  if (scriptFile && this.settings.checkContractExpectations) {
    const contractResult = await this.checkContract();

    if (contractResult?.expectations?.pending?.length !== 0 || contractResult?.expectations?.failed?.length !== 0) {
      console.log('Contract Expectations', contractResult?.expectations);
      throw new Error(`The scenario failed due to contract server expectations [${scenario.pickle.name}]`);
    }
  }
});

AfterStep(async function (scenario: ITestCaseHookParameter) {
  let scriptFile = checkMockServerScriptFile(scenario);

  if (scriptFile && this.settings.checkContractExpectations) {
    const contractResult = await this.checkContract();

    if (contractResult?.expectations?.failed?.length !== 0) {
      throw new Error('The step failed due to contract server expectations.');
    }
  }
});

function checkMockServerScriptFile(scenario: ITestCaseHookParameter) {
  let mockServerFileName: string | undefined;

  for (const tag of scenario.pickle.tags) {
    if (tag.name.indexOf(mockServerScriptFileTagPrefix) === 0) {
      mockServerFileName = tag.name.substring(mockServerScriptFileTagPrefix.length);
    }
  }

  return mockServerFileName;
}
