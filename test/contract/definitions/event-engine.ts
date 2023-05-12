import { after, binding, given, then, when } from 'cucumber-tsflow';
import { DemoKeyset } from '../shared/keysets';
import { PubNub, PubNubManager } from '../shared/pubnub';
import type { MessageEvent, StatusEvent } from 'pubnub';
import type { Change } from '../../../src/event-engine/core/change';
import { DataTable } from '@cucumber/cucumber';
import { expect } from 'chai';

function logChangelog(changelog: Change<any, any>) {
  switch (changelog.type) {
    case 'engineStarted':
      console.log(`START ${changelog.state.label}`);
      return;
    case 'transitionDone':
      console.log(`${changelog.fromState.label} ===> ${changelog.toState.label}`);
      return;
    case 'invocationDispatched':
      console.log(
        `◊ ${changelog.invocation.type} ${changelog.invocation.type === 'CANCEL' ? changelog.invocation.payload : ''}`,
      );
      return;
    case 'eventReceived':
      console.log(`! ${changelog.event.type}`);
      return;
  }
}

@binding([PubNubManager, DemoKeyset])
class EventEngineSteps {
  private pubnub?: PubNub;

  private messagePromise?: Promise<MessageEvent>;
  private statusPromise?: Promise<StatusEvent>;
  private changelog: Change<any, any>[] = [];

  constructor(private manager: PubNubManager, private keyset: DemoKeyset) {}

  @given('the demo keyset with event engine enabled')
  givenDemoKeyset() {
    this.pubnub = this.manager.getInstance({ ...this.keyset, enableSubscribeBeta: true });

    (this.pubnub as any).eventEngine._engine.subscribe((changelog: Change<any, any>) => {
      // logChangelog(changelog);
      if (changelog.type === 'eventReceived' || changelog.type === 'invocationDispatched') {
        this.changelog.push(changelog);
      }
    });
  }

  @given('a linear reconnection policy with {int} retries')
  givenLinearReconnectionPolicy(retries: number) {
    // TODO
  }

  @when('I subscribe')
  async whenISubscribe() {
    this.statusPromise = new Promise<StatusEvent>((resolveStatus) => {
      this.messagePromise = new Promise<MessageEvent>((resolveMessage) => {
        this.pubnub?.addListener({
          message(messageEvent) {
            resolveMessage(messageEvent);
          },
          status(statusEvent) {
            resolveStatus(statusEvent);
          },
        });

        this.pubnub?.subscribe({ channels: ['test'] });
      });
    });
  }

  @when('I publish a message')
  async whenIPublishAMessage() {
    const status = await this.statusPromise;

    expect(status?.category).to.equal('PNConnectedCategory');

    const timetoken = await this.pubnub?.publish({ channel: 'test', message: { content: 'Hello world!' } });
  }

  @then('I receive an error')
  async thenIReceiveError() {
    const status = await this.statusPromise;

    expect(status?.category).to.equal('PNNetworkIssuesCategory');
  }

  @then('I receive the message in my subscribe response')
  async receiveMessage() {
    const message = await this.messagePromise;
  }

  @then('I observe the following:')
  thenIObserve(dataTable: DataTable) {
    const expectedChangelog = dataTable.hashes();

    const actualChangelog = [];
    for (const entry of this.changelog) {
      if (entry.type === 'eventReceived') {
        actualChangelog.push({ type: 'event', name: entry.event.type });
      } else if (entry.type === 'invocationDispatched') {
        actualChangelog.push({
          type: 'invocation',
          name: `${entry.invocation.type}${entry.invocation.type === 'CANCEL' ? `_${entry.invocation.payload}` : ''}`,
        });
      }
    }

    expect(actualChangelog).to.deep.equal(expectedChangelog);
  }

  @after()
  dispose() {
    (this.pubnub as any).removeAllListeners();
    (this.pubnub as any).eventEngine.dispose();
  }
}
