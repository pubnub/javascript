/* global describe, beforeEach, it */

import assert from 'assert';
import PubNub from '../../src/node/index';
import { APNSNotificationPayload, MPNSNotificationPayload, FCMNotificationPayload } from '../../src/core/components/push_payload';

describe('#notifications helper', () => {
  describe('payloads builder', () => {
    it('should prepare platform specific builders', () => {
      let expectedTitle = PubNub.generateUUID();
      let expectedBody = PubNub.generateUUID();

      let builder = PubNub.notificationPayload(expectedTitle, expectedBody);

      assert(builder.apns);
      assert(builder.mpns);
      assert(builder.fcm);
    });

    it('should pass title and body to builders', () => {
      let expectedTitle = PubNub.generateUUID();
      let expectedBody = PubNub.generateUUID();

      let builder = PubNub.notificationPayload(expectedTitle, expectedBody);

      assert.equal(builder.apns.toObject().aps.alert.title, expectedTitle);
      assert.equal(builder.apns.toObject().aps.alert.body, expectedBody);
      assert.equal(builder.mpns.toObject().title, expectedTitle);
      assert.equal(builder.mpns.toObject().back_content, expectedBody);
      assert.equal(builder.fcm.toObject().notification.title, expectedTitle);
      assert.equal(builder.fcm.toObject().notification.body, expectedBody);
    });

    it('should pass subtitle to builders', () => {
      let expectedSubtitle = PubNub.generateUUID();

      let builder = PubNub.notificationPayload(PubNub.generateUUID(), PubNub.generateUUID());
      builder.subtitle = expectedSubtitle;

      assert.equal(builder.apns.toObject().aps.alert.subtitle, expectedSubtitle);
      assert.equal(builder.mpns.toObject().back_title, expectedSubtitle);
      assert.equal(Object.keys(builder.fcm.notification).length, 2);
    });

    it('should pass badge to builders', () => {
      let expectedBadge = 11;

      let builder = PubNub.notificationPayload(PubNub.generateUUID(), PubNub.generateUUID());
      builder.badge = expectedBadge;

      assert.equal(builder.apns.toObject().aps.badge, expectedBadge);
      assert.equal(builder.mpns.toObject().count, expectedBadge);
      assert.equal(Object.keys(builder.fcm.notification).length, 2);
    });

    it('should pass sound to builders', () => {
      let expectedSound = PubNub.generateUUID();

      let builder = PubNub.notificationPayload(PubNub.generateUUID(), PubNub.generateUUID());
      builder.sound = expectedSound;

      assert.equal(builder.apns.toObject().aps.sound, expectedSound);
      assert.equal(Object.keys(builder.mpns.payload).length, 2);
      assert.equal(builder.fcm.toObject().notification.sound, expectedSound);
    });

    it('should set debug flag', () => {
      let builder = PubNub.notificationPayload(PubNub.generateUUID(), PubNub.generateUUID());
      builder.debugging = true;

      assert.equal(builder.buildPayload(['apns']).pn_debug, true);
    });

    it('should provide payload for APNS and FCM', () => {
      let expectedTitle = PubNub.generateUUID();
      let expectedBody = PubNub.generateUUID();
      let expectedPayload = {
        pn_apns: {
          aps: { alert: { title: expectedTitle, body: expectedBody } }
        },
        pn_gcm: {
          notification: { title: expectedTitle, body: expectedBody }
        }
      };

      let builder = PubNub.notificationPayload(expectedTitle, expectedBody);

      assert.deepEqual(builder.buildPayload(['apns', 'fcm']), expectedPayload);
    });

    it('should provide payload for APNS2 and FCM', () => {
      let expectedTitle = PubNub.generateUUID();
      let expectedTopic = PubNub.generateUUID();
      let expectedBody = PubNub.generateUUID();
      let expectedPayload = {
        pn_apns: {
          aps: { alert: { title: expectedTitle, body: expectedBody } },
          pn_push: [
            {
              auth_method: 'token',
              targets: [{ environment: 'development', topic: expectedTopic }],
              version: 'v2'
            }
          ]
        },
        pn_gcm: {
          notification: { title: expectedTitle, body: expectedBody }
        }
      };

      let builder = PubNub.notificationPayload(expectedTitle, expectedBody);
      builder.apns.configurations = [{ targets: [{ topic: expectedTopic }] }];

      assert.deepEqual(builder.buildPayload(['apns2', 'fcm']), expectedPayload);
    });

    it('should throw ReferenceError if APNS2 configurations is missing', () => {
      let builder = PubNub.notificationPayload(PubNub.generateUUID(), PubNub.generateUUID());

      assert.throws(() => {
        builder.buildPayload(['apns2', 'fcm']);
      });
    });
  });

  describe('apns builder', () => {
    let platformPayloadStorage;

    beforeEach(() => {
      platformPayloadStorage = {};
    });

    it('should set default payload structure', () => {
      let builder = new APNSNotificationPayload(platformPayloadStorage);

      assert(builder);
      assert(platformPayloadStorage.aps);
      assert(platformPayloadStorage.aps.alert);
      assert.equal(Object.keys(platformPayloadStorage.aps).length, 1);
      assert.equal(Object.keys(platformPayloadStorage.aps.alert).length, 0);
    });

    it('should set notification \'title\' and \'body\' with constructor', () => {
      let expectedTitle = PubNub.generateUUID();
      let expectedBody = PubNub.generateUUID();

      let builder = new APNSNotificationPayload(platformPayloadStorage, expectedTitle, expectedBody);

      assert(builder);
      assert.equal(platformPayloadStorage.aps.alert.title, expectedTitle);
      assert.equal(platformPayloadStorage.aps.alert.body, expectedBody);
    });

    it('should set \'subtitle\'', () => {
      let expectedSubtitle = PubNub.generateUUID();

      let builder = new APNSNotificationPayload(platformPayloadStorage);
      builder.subtitle = expectedSubtitle;

      assert.equal(platformPayloadStorage.aps.alert.subtitle, expectedSubtitle);
    });

    it('should not set \'subtitle\' if value is empty', () => {
      let expectedSubtitle = '';

      let builder = new APNSNotificationPayload(platformPayloadStorage);
      builder.subtitle = expectedSubtitle;

      assert(!platformPayloadStorage.aps.alert.subtitle);
    });

    it('should set \'body\'', () => {
      let expectedBody = PubNub.generateUUID();

      let builder = new APNSNotificationPayload(platformPayloadStorage);
      builder.body = expectedBody;

      assert.equal(platformPayloadStorage.aps.alert.body, expectedBody);
    });

    it('should not set \'body\' if value is empty', () => {
      let expectedBody = '';

      let builder = new APNSNotificationPayload(platformPayloadStorage);
      builder.body = expectedBody;

      assert(!platformPayloadStorage.aps.alert.body);
    });

    it('should set \'badge\'', () => {
      let expectedBadged = 16;

      let builder = new APNSNotificationPayload(platformPayloadStorage);
      builder.badge = expectedBadged;

      assert.equal(platformPayloadStorage.aps.badge, expectedBadged);
    });

    it('should not set \'badge\' if value is empty', () => {
      let builder = new APNSNotificationPayload(platformPayloadStorage);
      builder.badge = null;

      assert(!platformPayloadStorage.aps.badge);
    });

    it('should set \'sound\'', () => {
      let expectedSound = PubNub.generateUUID();

      let builder = new APNSNotificationPayload(platformPayloadStorage);
      builder.sound = expectedSound;

      assert.equal(platformPayloadStorage.aps.sound, expectedSound);
    });

    it('should not set \'sound\' if value is empty', () => {
      let expectedSound = '';

      let builder = new APNSNotificationPayload(platformPayloadStorage);
      builder.sound = expectedSound;

      assert(!platformPayloadStorage.aps.sound);
    });

    it('should return null when no data provided', () => {
      let builder = new APNSNotificationPayload(platformPayloadStorage);

      assert.equal(builder.toObject(), null);
    });

    it('should set \'content-available\' when set silenced', () => {
      let builder = new APNSNotificationPayload(platformPayloadStorage, PubNub.generateUUID(), PubNub.generateUUID());
      builder.sound = PubNub.generateUUID();
      builder.badge = 20;
      builder.silent = true;

      assert.equal(builder.toObject().aps['content-available'], 1);
      assert(!builder.toObject().aps.badge);
      assert(!builder.toObject().aps.sound);
      assert(!builder.toObject().aps.alert);
    });

    it('should return valid payload object', () => {
      let expectedSubtitle = PubNub.generateUUID();
      let expectedTitle = PubNub.generateUUID();
      let expectedSound = PubNub.generateUUID();
      let expectedBody = PubNub.generateUUID();
      let expectedBadge = 26;
      let expectedPayload = {
        aps: {
          alert: { title: expectedTitle, subtitle: expectedSubtitle, body: expectedBody },
          badge: expectedBadge,
          sound: expectedSound
        }
      };

      let builder = new APNSNotificationPayload(platformPayloadStorage, expectedTitle, expectedBody);
      builder.subtitle = expectedSubtitle;
      builder.badge = expectedBadge;
      builder.sound = expectedSound;

      assert.deepEqual(builder.toObject(), expectedPayload);
    });

    it('should return valid payload for APNS over HTTP/2', () => {
      let expectedSubtitle = PubNub.generateUUID();
      let expectedTitle = PubNub.generateUUID();
      let expectedSound = PubNub.generateUUID();
      let expectedTopic = PubNub.generateUUID();
      let expectedBody = PubNub.generateUUID();
      let expectedBadge = 26;
      let expectedPayload = {
        aps: {
          alert: { title: expectedTitle, subtitle: expectedSubtitle, body: expectedBody },
          badge: expectedBadge,
          sound: expectedSound
        },
        pn_push: [
          {
            auth_method: 'token',
            targets: [{ environment: 'development', topic: expectedTopic }],
            version: 'v2'
          }
        ]
      };

      let builder = new APNSNotificationPayload(platformPayloadStorage, expectedTitle, expectedBody);
      builder.configurations = [{ targets: [{ topic: expectedTopic }] }];
      builder.subtitle = expectedSubtitle;
      builder._apnsPushType = 'apns2';
      builder.badge = expectedBadge;
      builder.sound = expectedSound;

      assert.deepEqual(builder.toObject(), expectedPayload);
    });
  });

  describe('mpns builder', () => {
    let platformPayloadStorage;

    beforeEach(() => {
      platformPayloadStorage = {};
    });

    it('should set notification \'title\' and \'body\' with constructor', () => {
      let expectedTitle = PubNub.generateUUID();
      let expectedBody = PubNub.generateUUID();

      let builder = new MPNSNotificationPayload(platformPayloadStorage, expectedTitle, expectedBody);

      assert(builder);
      assert.equal(platformPayloadStorage.title, expectedTitle);
      assert.equal(platformPayloadStorage.back_content, expectedBody);
    });

    it('should set \'back_title\' when \'subtitle\' passed', () => {
      let expectedSubtitle = PubNub.generateUUID();

      let builder = new MPNSNotificationPayload(platformPayloadStorage);
      builder.subtitle = expectedSubtitle;

      assert.equal(platformPayloadStorage.back_title, expectedSubtitle);
    });

    it('should set \'back_title\'', () => {
      let expectedBackTitle = PubNub.generateUUID();

      let builder = new MPNSNotificationPayload(platformPayloadStorage);
      builder.backTitle = expectedBackTitle;

      assert.equal(platformPayloadStorage.back_title, expectedBackTitle);
    });

    it('should not set \'back_title\' if value is empty', () => {
      let expectedBackTitle = '';

      let builder = new MPNSNotificationPayload(platformPayloadStorage);
      builder.backTitle = expectedBackTitle;

      assert(!platformPayloadStorage.back_title);
    });

    it('should set \'back_content\' when \'body\' passed', () => {
      let expectedBody = PubNub.generateUUID();

      let builder = new MPNSNotificationPayload(platformPayloadStorage);
      builder.body = expectedBody;

      assert.equal(platformPayloadStorage.back_content, expectedBody);
    });

    it('should set \'back_content\' ', () => {
      let expectedBackContent = PubNub.generateUUID();

      let builder = new MPNSNotificationPayload(platformPayloadStorage);
      builder.backContent = expectedBackContent;

      assert.equal(platformPayloadStorage.back_content, expectedBackContent);
    });

    it('should not set \'back_content\' if value is empty', () => {
      let expectedBackContent = '';

      let builder = new MPNSNotificationPayload(platformPayloadStorage);
      builder.backContent = expectedBackContent;

      assert(!platformPayloadStorage.back_content);
    });

    it('should set \'count\' when \'badge\' passed', () => {
      let expectedBadge = 26;

      let builder = new MPNSNotificationPayload(platformPayloadStorage);
      builder.badge = expectedBadge;

      assert.equal(platformPayloadStorage.count, expectedBadge);
    });

    it('should set \'count\' ', () => {
      let expectedCount = 26;

      let builder = new MPNSNotificationPayload(platformPayloadStorage);
      builder.count = expectedCount;

      assert.equal(platformPayloadStorage.count, expectedCount);
    });

    it('should not set \'count\' if value is empty', () => {
      let builder = new MPNSNotificationPayload(platformPayloadStorage);
      builder.count = null;

      assert(!platformPayloadStorage.count);
    });

    it('should return null when no data provided', () => {
      let builder = new MPNSNotificationPayload(platformPayloadStorage);

      assert.equal(builder.toObject(), null);
    });

    it('should return valid payload object', () => {
      let expectedSubtitle = PubNub.generateUUID();
      let expectedTitle = PubNub.generateUUID();
      let expectedBody = PubNub.generateUUID();
      let expectedCount = 26;
      let expectedPayload = {
        type: 'flip',
        title: expectedTitle,
        back_title: expectedSubtitle,
        back_content: expectedBody,
        count: expectedCount
      };

      let builder = new MPNSNotificationPayload(platformPayloadStorage, expectedTitle, expectedBody);
      builder.subtitle = expectedSubtitle;
      builder.count = expectedCount;
      builder.type = 'flip';

      assert.deepEqual(builder.toObject(), expectedPayload);
    });
  });

  describe('fcm builder', () => {
    let platformPayloadStorage;

    beforeEach(() => {
      platformPayloadStorage = {};
    });

    it('should set default payload structure', () => {
      let builder = new FCMNotificationPayload(platformPayloadStorage);

      assert(builder);
      assert(platformPayloadStorage.notification);
      assert(platformPayloadStorage.data);
    });

    it('should set notification \'title\' and \'body\' with constructor', () => {
      let expectedTitle = PubNub.generateUUID();
      let expectedBody = PubNub.generateUUID();

      let builder = new FCMNotificationPayload(platformPayloadStorage, expectedTitle, expectedBody);

      assert(builder);
      assert.equal(platformPayloadStorage.notification.title, expectedTitle);
      assert.equal(platformPayloadStorage.notification.body, expectedBody);
    });

    it('should not set \'subtitle\' because it is not supported', () => {
      let expectedSubtitle = PubNub.generateUUID();

      let builder = new FCMNotificationPayload(platformPayloadStorage);
      builder.subtitle = expectedSubtitle;

      assert.equal(Object.keys(platformPayloadStorage.notification).length, 0);
    });

    it('should set \'body\'', () => {
      let expectedBody = PubNub.generateUUID();

      let builder = new FCMNotificationPayload(platformPayloadStorage);
      builder.body = expectedBody;

      assert.equal(platformPayloadStorage.notification.body, expectedBody);
    });

    it('should not set \'body\' if value is empty', () => {
      let expectedBody = '';

      let builder = new FCMNotificationPayload(platformPayloadStorage);
      builder.body = expectedBody;

      assert(!platformPayloadStorage.notification.body);
    });

    it('should not set \'badge\' because it is not supported', () => {
      let builder = new FCMNotificationPayload(platformPayloadStorage);
      builder.badge = 30;

      assert.equal(Object.keys(platformPayloadStorage.notification).length, 0);
    });

    it('should set \'sound\'', () => {
      let expectedSound = PubNub.generateUUID();

      let builder = new FCMNotificationPayload(platformPayloadStorage);
      builder.sound = expectedSound;

      assert.equal(platformPayloadStorage.notification.sound, expectedSound);
    });

    it('should not set \'sound\' if value is empty', () => {
      let expectedSound = '';

      let builder = new FCMNotificationPayload(platformPayloadStorage);
      builder.sound = expectedSound;

      assert(!platformPayloadStorage.notification.sound);
    });

    it('should set \'icon\'', () => {
      let expectedIcon = PubNub.generateUUID();

      let builder = new FCMNotificationPayload(platformPayloadStorage);
      builder.icon = expectedIcon;

      assert.equal(platformPayloadStorage.notification.icon, expectedIcon);
    });

    it('should not set \'icon\' if value is empty', () => {
      let expectedIcon = '';

      let builder = new FCMNotificationPayload(platformPayloadStorage);
      builder.icon = expectedIcon;

      assert(!platformPayloadStorage.notification.icon);
    });

    it('should set \'tag\'', () => {
      let expectedTag = PubNub.generateUUID();

      let builder = new FCMNotificationPayload(platformPayloadStorage);
      builder.tag = expectedTag;

      assert.equal(platformPayloadStorage.notification.tag, expectedTag);
    });

    it('should not set \'tag\' if value is empty', () => {
      let expectedTag = '';

      let builder = new FCMNotificationPayload(platformPayloadStorage);
      builder.tag = expectedTag;

      assert(!platformPayloadStorage.notification.tag);
    });

    it('should return null when no data provided', () => {
      let builder = new FCMNotificationPayload(platformPayloadStorage);

      assert.equal(builder.toObject(), null);
    });

    it('should move \'notification\' under \'data\' when set silenced', () => {
      let expectedTitle = PubNub.generateUUID();
      let expectedBody = PubNub.generateUUID();
      let expectedSound = PubNub.generateUUID();
      let expectedNotification = {
        title: expectedTitle,
        body: expectedBody,
        sound: expectedSound
      };

      let builder = new FCMNotificationPayload(platformPayloadStorage, expectedTitle, expectedBody);
      builder.sound = expectedSound;
      builder.silent = true;

      assert(!builder.toObject().notification);
      assert.deepEqual(builder.toObject().data.notification, expectedNotification);
    });

    it('should return valid payload object', () => {
      let expectedTitle = PubNub.generateUUID();
      let expectedBody = PubNub.generateUUID();
      let expectedSound = PubNub.generateUUID();
      let expectedPayload = {
        notification: {
          title: expectedTitle,
          body: expectedBody,
          sound: expectedSound
        }
      };

      let builder = new FCMNotificationPayload(platformPayloadStorage, expectedTitle, expectedBody);
      builder.sound = expectedSound;

      assert.deepEqual(builder.toObject(), expectedPayload);
    });
  });
});
