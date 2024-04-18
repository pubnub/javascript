import { after, binding, given, then, when } from 'cucumber-tsflow';
import { DemoKeyset } from '../shared/keysets';
import { PubNub, PubNubManager } from '../shared/pubnub';
import type { MessageEvent, PresenceEvent, StatusEvent } from 'pubnub';
import type { Change } from '../../../src/event-engine/core/change';
import { DataTable } from '@cucumber/cucumber';
import { expect } from 'chai';
import PubNubClass from '../../../lib/node/index.js';

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
  private presencePromise?: Promise<PresenceEvent>;
  private changelog: Change<any, any>[] = [];
  private configuration: any = {};

  constructor(
    private manager: PubNubManager,
    private keyset: DemoKeyset,
  ) {}

  private async testDelay(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time * 1000));
  }

  @given('the demo keyset with event engine enabled')
  givenDemoKeyset() {
    this.pubnub = this.manager.getInstance({ ...this.keyset, enableEventEngine: true });

    (this.pubnub as any).eventEngine._engine.subscribe((changelog: Change<any, any>) => {
      if (changelog.type === 'eventReceived' || changelog.type === 'invocationDispatched') {
        this.changelog.push(changelog);
      }
    });
  }

  @given('the demo keyset with Presence EE enabled')
  givenPresenceEEDemoKeyset() {
    this.configuration.enableEventEngine = true;
  }

  @when('heartbeatInterval set to {string}, timeout set to {string} and suppressLeaveEvents set to {string}')
  whenPresenceConfiguration(heartbeatInterval: string, presenceTimeout: string, suppressLeaveEvents: string) {
    this.configuration.heartbeatInterval = +heartbeatInterval;
    this.configuration.presenceTimeout = +presenceTimeout;
    this.configuration.suppressLeaveEvents = suppressLeaveEvents === 'true';
  }

  @when('I join {string}, {string}, {string} channels')
  whenJoinChannels(channelOne: string, channelTwo: string, channelThree: string) {
    this.pubnub = this.manager.getInstance({ ...this.keyset, ...this.configuration });
    (this.pubnub as any).presenceEventEngine?._engine.subscribe((changelog: Change<any, any>) => {
      if (changelog.type === 'eventReceived' || changelog.type === 'invocationDispatched') {
        this.changelog.push(changelog);
      }
    });
    this.pubnub?.subscribe({ channels: [channelOne, channelTwo, channelThree] });
  }

  @when('I join {string}, {string}, {string} channels with presence')
  whenJoinChannelsWithPresence(channelOne: string, channelTwo: string, channelThree: string) {
    this.pubnub = this.manager.getInstance({ ...this.keyset, ...this.configuration });
    (this.pubnub as any)?.presenceEventEngine?._engine.subscribe((changelog: Change<any, any>) => {
      if (changelog.type === 'eventReceived' || changelog.type === 'invocationDispatched') {
        this.changelog.push(changelog);
      }
    });

    this.statusPromise = new Promise<StatusEvent>((resolveStatus) => {
      this.presencePromise = new Promise<PresenceEvent>((resolvePresence) => {
        this.pubnub?.addListener({
          presence(presenceEvent) {
            resolvePresence(presenceEvent);
          },
          status(statusEvent) {
            resolveStatus(statusEvent);
          },
        });

        this.pubnub?.subscribe({ channels: [channelOne, channelTwo, channelThree], withPresence: true });
      });
    });
  }

  @then('I wait for getting Presence joined events', undefined, 10000)
  async thenPresenceJoinEvent() {
    const status = await this.presencePromise;
  }

  @then('I wait {string} seconds')
  async thenWait(seconds: string) {
    await this.testDelay(+seconds);
  }

  @then('I observe the following Events and Invocations of the Presence EE:')
  async thenIObservePresenceEE(dataTable: DataTable) {
    const expectedChangelog = dataTable.hashes();
    const actualChangelog: { type: string; name: string }[] = [];
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

  @then('I leave {string} and {string} channels with presence')
  async theILeave(channelOne: string, channelTwo: string) {
    await this.testDelay(0.02);
    this.pubnub?.unsubscribe({ channels: [channelOne, channelTwo] });
  }

  @given('a linear reconnection policy with {int} retries')
  givenLinearReconnectionPolicy(retries: number) {
    // @ts-ignore
    this.configuration.retryConfiguration = PubNubClass.LinearRetryPolicy({
      delay: 2,
      maximumRetry: retries,
    });
    // @ts-ignore
    this.pubnub = this.manager.getInstance({
      ...this.keyset,
      enableEventEngine: true,
      // @ts-ignore
      retryConfiguration: PubNubClass.LinearRetryPolicy({
        delay: 2,
        maximumRetry: retries,
      }),
    });

    (this.pubnub as any).eventEngine._engine.subscribe((changelog: Change<any, any>) => {
      if (changelog.type === 'eventReceived' || changelog.type === 'invocationDispatched') {
        this.changelog.push(changelog);
      }
    });
  }

  @then('I receive an error in my heartbeat response', undefined, 10000)
  async thenHeartbeatError() {
    await this.testDelay(9);
  }
  @when('I subscribe')
  async whenISubscribe() {
    this.statusPromise = new Promise<StatusEvent>((resolveStatus) => {
      this.messagePromise = new Promise<MessageEvent>((resolveMessage) => {
        this.pubnub?.addListener({
          message(messageEvent) {
            setTimeout(() => resolveMessage(messageEvent), 100);
          },
          status(statusEvent) {
            setTimeout(() => resolveStatus(statusEvent), 100);
          },
        });

        this.pubnub?.subscribe({ channels: ['test'] });
      });
    });
  }

  @when(/I subscribe with timetoken (\d*)/)
  async whenISubscribeWithTimetoken(timetoken: number) {
    this.statusPromise = new Promise<StatusEvent>((resolveStatus) => {
      this.messagePromise = new Promise<MessageEvent>((resolveMessage) => {
        this.pubnub?.addListener({
          message(messageEvent) {
            setTimeout(() => resolveMessage(messageEvent), 100);
          },
          status(statusEvent) {
            setTimeout(() => resolveStatus(statusEvent), 100);
          },
        });

        this.pubnub?.subscribe({ channels: ['test'], timetoken: timetoken });
      });
    });
  }

  @when('I publish a message')
  async whenIPublishAMessage() {
    const status = await this.statusPromise;

    expect(status?.category).to.equal('PNConnectedCategory');

    const timetoken = await this.pubnub?.publish({ channel: 'test', message: { content: 'Hello world!' } });
  }

  @then('I receive an error in my subscribe response', undefined, 10000)
  async thenIReceiveError() {
    const status = await this.statusPromise;

    expect(status?.category).to.equal('PNConnectionErrorCategory');
  }

  @then('I receive the message in my subscribe response', undefined, 10000)
  async receiveMessage() {
    const message = await this.messagePromise;
  }

  @then('I observe the following:')
  thenIObserve(dataTable: DataTable) {
    const expectedChangelog = dataTable.hashes();

    const actualChangelog: { type: string; name: string }[] = [];
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

  @then("I don't observe any Events and Invocations of the Presence EE")
  noeventInvocations() {
    const actualChangelog: { type: string; name: string }[] = [];
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
    expect(actualChangelog).to.deep.equal([]);
  }

  @after()
  dispose() {
    if (this.pubnub) {
      (this.pubnub as any).removeAllListeners();
      (this.pubnub as any).eventEngine.dispose();
    }
  }
}
