/* global describe, beforeEach, it */

import assert from 'assert';

import { APNSNotificationPayload, FCMNotificationPayload } from '../../src/core/components/push_payload';
import PubNub from '../../src/node/index';

describe('#notifications helper', () => {
  describe('payloads builder', () => {
    it('should prepare platform specific builders', () => {
      let expectedTitle = PubNub.generateUUID();
      let expectedBody = PubNub.generateUUID();

      let builder = PubNub.notificationPayload(expectedTitle, expectedBody);

      assert(builder.apns);
      assert(builder.fcm);
    });

    it('should pass title and body to builders', () => {
      let expectedTitle = PubNub.generateUUID();
      let expectedBody = PubNub.generateUUID();

      const builder = PubNub.notificationPayload(expectedTitle, expectedBody);
      const apnsPayload = builder.apns.toObject();
      const fcmPayload = builder.fcm.toObject();

      assert(apnsPayload);
      assert(apnsPayload.aps.alert);
      assert.equal(apnsPayload.aps.alert.title, expectedTitle);
      assert.equal(apnsPayload.aps.alert.body, expectedBody);
      assert(fcmPayload);
      assert(fcmPayload.notification);
      assert.equal(fcmPayload.notification.title, expectedTitle);
      assert.equal(fcmPayload.notification.body, expectedBody);
    });

    it('should pass subtitle to builders', () => {
      let expectedSubtitle = PubNub.generateUUID();

      const builder = PubNub.notificationPayload(PubNub.generateUUID(), PubNub.generateUUID());
      builder.subtitle = expectedSubtitle;
      const apnsPayload = builder.apns.toObject();
      const fcmPayload = builder.fcm.toObject();

      assert(apnsPayload);
      assert(apnsPayload.aps.alert);
      assert.equal(apnsPayload.aps.alert.subtitle, expectedSubtitle);
      assert(fcmPayload);
      assert(fcmPayload.notification);
      assert.equal(Object.keys(fcmPayload.notification).length, 2);
    });

    it('should pass badge to builders', () => {
      let expectedBadge = 11;

      let builder = PubNub.notificationPayload(PubNub.generateUUID(), PubNub.generateUUID());
      builder.badge = expectedBadge;
      const apnsPayload = builder.apns.toObject();
      const fcmPayload = builder.fcm.toObject();

      assert(apnsPayload);
      assert.equal(apnsPayload.aps.badge, expectedBadge);
      assert(fcmPayload);
      assert(fcmPayload.notification);
      assert.equal(Object.keys(fcmPayload.notification).length, 2);
    });

    it('should pass sound to builders', () => {
      let expectedSound = PubNub.generateUUID();

      let builder = PubNub.notificationPayload(PubNub.generateUUID(), PubNub.generateUUID());
      builder.sound = expectedSound;
      const apnsPayload = builder.apns.toObject();
      const fcmPayload = builder.fcm.toObject();

      assert(apnsPayload);
      assert.equal(apnsPayload.aps.sound, expectedSound);
      assert(fcmPayload);
      assert(fcmPayload.android);
      assert(fcmPayload.android.notification);
      assert.equal(fcmPayload.android.notification.sound, expectedSound);
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
          aps: { alert: { title: expectedTitle, body: expectedBody } },
        },
        pn_fcm: {
          notification: { title: expectedTitle, body: expectedBody },
        },
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
              version: 'v2',
            },
          ],
        },
        pn_fcm: {
          notification: { title: expectedTitle, body: expectedBody },
        },
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

    it('should provide payload for FCM only', () => {
      let expectedTitle = PubNub.generateUUID();
      let expectedBody = PubNub.generateUUID();
      let expectedPayload = {
        pn_fcm: {
          notification: { title: expectedTitle, body: expectedBody },
        },
      };

      let builder = PubNub.notificationPayload(expectedTitle, expectedBody);

      const result = builder.buildPayload(['fcm']);
      assert.deepEqual(result, expectedPayload);
      assert(!('pn_apns' in result));
    });

    it('should generate FCM Android notification fields in final payload', () => {
      let expectedTitle = PubNub.generateUUID();
      let expectedBody = PubNub.generateUUID();
      let expectedSound = PubNub.generateUUID();
      let expectedIcon = PubNub.generateUUID();
      let expectedTag = PubNub.generateUUID();
      let expectedPayload = {
        pn_fcm: {
          notification: { title: expectedTitle, body: expectedBody },
          android: {
            notification: { sound: expectedSound, icon: expectedIcon, tag: expectedTag },
          },
        },
      };

      let builder = PubNub.notificationPayload(expectedTitle, expectedBody);
      builder.sound = expectedSound;
      builder.fcm.icon = expectedIcon;
      builder.fcm.tag = expectedTag;

      assert.deepEqual(builder.buildPayload(['fcm']), expectedPayload);
    });

    it('should preserve FCM platform blocks in final payload', () => {
      let expectedTitle = PubNub.generateUUID();
      let expectedBody = PubNub.generateUUID();
      let expectedSound = PubNub.generateUUID();
      let expectedPayload = {
        pn_fcm: {
          notification: { title: expectedTitle, body: expectedBody },
          android: {
            priority: 'HIGH',
            notification: { sound: expectedSound },
          },
          apns: {
            headers: { 'apns-priority': '10' },
          },
          webpush: {
            headers: { Urgency: 'high' },
          },
          fcm_options: {
            analytics_label: 'campaign-a',
          },
        },
      };

      let builder = PubNub.notificationPayload(expectedTitle, expectedBody);
      builder.sound = expectedSound;
      (builder.fcm.payload.android as Record<string, unknown>).priority = 'HIGH';
      builder.fcm.payload.apns = { headers: { 'apns-priority': '10' } };
      builder.fcm.payload.webpush = { headers: { Urgency: 'high' } };
      builder.fcm.payload.fcm_options = { analytics_label: 'campaign-a' };

      assert.deepEqual(builder.buildPayload(['fcm']), expectedPayload);
    });

    it('should generate silent FCM payload with Android notification fields', () => {
      let expectedTitle = PubNub.generateUUID();
      let expectedBody = PubNub.generateUUID();
      let expectedSound = PubNub.generateUUID();
      let expectedPayload = {
        pn_fcm: {
          data: {
            title: expectedTitle,
            body: expectedBody,
            sound: expectedSound,
          },
        },
      };

      let builder = PubNub.notificationPayload(expectedTitle, expectedBody);
      builder.sound = expectedSound;
      builder.fcm.silent = true;

      assert.deepEqual(builder.buildPayload(['fcm']), expectedPayload);
    });
  });

  describe('apns builder', () => {
    let platformPayloadStorage: Record<string, any>;

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

    it("should set notification 'title' and 'body' with constructor", () => {
      let expectedTitle = PubNub.generateUUID();
      let expectedBody = PubNub.generateUUID();

      let builder = new APNSNotificationPayload(platformPayloadStorage, expectedTitle, expectedBody);

      assert(builder);
      assert.equal(platformPayloadStorage.aps.alert.title, expectedTitle);
      assert.equal(platformPayloadStorage.aps.alert.body, expectedBody);
    });

    it("should set 'subtitle'", () => {
      let expectedSubtitle = PubNub.generateUUID();

      let builder = new APNSNotificationPayload(platformPayloadStorage);
      builder.subtitle = expectedSubtitle;

      assert.equal(platformPayloadStorage.aps.alert.subtitle, expectedSubtitle);
    });

    it("should not set 'subtitle' if value is empty", () => {
      let expectedSubtitle = '';

      let builder = new APNSNotificationPayload(platformPayloadStorage);
      builder.subtitle = expectedSubtitle;

      assert(!platformPayloadStorage.aps.alert.subtitle);
    });

    it("should set 'body'", () => {
      let expectedBody = PubNub.generateUUID();

      let builder = new APNSNotificationPayload(platformPayloadStorage);
      builder.body = expectedBody;

      assert.equal(platformPayloadStorage.aps.alert.body, expectedBody);
    });

    it("should not set 'body' if value is empty", () => {
      let expectedBody = '';

      let builder = new APNSNotificationPayload(platformPayloadStorage);
      builder.body = expectedBody;

      assert(!platformPayloadStorage.aps.alert.body);
    });

    it("should set 'badge'", () => {
      let expectedBadged = 16;

      let builder = new APNSNotificationPayload(platformPayloadStorage);
      builder.badge = expectedBadged;

      assert.equal(platformPayloadStorage.aps.badge, expectedBadged);
    });

    it("should not set 'badge' if value is empty", () => {
      let builder = new APNSNotificationPayload(platformPayloadStorage);
      builder.badge = null;

      assert(!platformPayloadStorage.aps.badge);
    });

    it("should set 'sound'", () => {
      let expectedSound = PubNub.generateUUID();

      let builder = new APNSNotificationPayload(platformPayloadStorage);
      builder.sound = expectedSound;

      assert.equal(platformPayloadStorage.aps.sound, expectedSound);
    });

    it("should not set 'sound' if value is empty", () => {
      let expectedSound = '';

      let builder = new APNSNotificationPayload(platformPayloadStorage);
      builder.sound = expectedSound;

      assert(!platformPayloadStorage.aps.sound);
    });

    it('should return null when no data provided', () => {
      let builder = new APNSNotificationPayload(platformPayloadStorage);

      assert.equal(builder.toObject(), null);
    });

    it("should set 'content-available' when set silenced", () => {
      let builder = new APNSNotificationPayload(platformPayloadStorage, PubNub.generateUUID(), PubNub.generateUUID());
      builder.sound = PubNub.generateUUID();
      builder.badge = 20;
      builder.silent = true;
      const payload = builder.toObject();

      assert(payload);
      assert.equal(payload.aps['content-available'], 1);
      assert(!payload.aps.badge);
      assert(!payload.aps.sound);
      assert(!payload.aps.alert);
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
          sound: expectedSound,
        },
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
          sound: expectedSound,
        },
        pn_push: [
          {
            auth_method: 'token',
            targets: [{ environment: 'development', topic: expectedTopic }],
            version: 'v2',
          },
        ],
      };

      let builder = new APNSNotificationPayload(platformPayloadStorage, expectedTitle, expectedBody);
      builder.configurations = [{ targets: [{ topic: expectedTopic }] }];
      builder.subtitle = expectedSubtitle;
      // @ts-expect-error Intentional manual private field override.
      builder._apnsPushType = 'apns2';
      builder.badge = expectedBadge;
      builder.sound = expectedSound;

      assert.deepEqual(builder.toObject(), expectedPayload);
    });
  });

  describe('fcm builder', () => {
    let platformPayloadStorage: Record<string, any>;

    beforeEach(() => {
      platformPayloadStorage = {};
    });

    it('should set default payload structure', () => {
      let builder = new FCMNotificationPayload(platformPayloadStorage);

      assert(builder);
      assert(platformPayloadStorage.notification);
      assert(platformPayloadStorage.android);
      assert(platformPayloadStorage.android.notification);
    });


    it("should set title and body in top-level notification and badge as notification_count in android.notification", () => {
      let expectedTitle = PubNub.generateUUID();
      let expectedBody = PubNub.generateUUID();

      let builder = new FCMNotificationPayload(platformPayloadStorage, expectedTitle, expectedBody);
      builder.badge = 10;
      const payload = builder.toObject();

      assert(payload);
      // title and body should be in top-level notification
      assert.equal(payload.notification!.title, expectedTitle);
      assert.equal(payload.notification!.body, expectedBody);
      // title and body should not be duplicated in android.notification
      assert(!payload.android?.notification?.title);
      assert(!payload.android?.notification?.body);
      // badge should be set as notification_count in android.notification
      assert(payload.android);
      assert(payload.android.notification);
      assert.equal(payload.android.notification.notification_count, 10);
    });

    it("should not set 'subtitle' because it is not supported", () => {
      let expectedSubtitle = PubNub.generateUUID();

      let builder = new FCMNotificationPayload(platformPayloadStorage);
      builder.subtitle = expectedSubtitle;

      assert(!platformPayloadStorage.notification.subtitle);
    });

    it("should set 'body'", () => {
      let expectedBody = PubNub.generateUUID();

      let builder = new FCMNotificationPayload(platformPayloadStorage);
      builder.body = expectedBody;

      assert.equal(platformPayloadStorage.notification.body, expectedBody);
    });

    it("should not set 'body' if value is empty", () => {
      let expectedBody = '';

      let builder = new FCMNotificationPayload(platformPayloadStorage);
      builder.body = expectedBody;

      assert(!platformPayloadStorage.notification.body);
    });

    it("should not set 'badge' because it is not supported", () => {
      let builder = new FCMNotificationPayload(platformPayloadStorage);
      builder.badge = 30;

      assert(!platformPayloadStorage.notification.badge);
    });

    it("should set 'sound' under android.notification", () => {
      let expectedSound = PubNub.generateUUID();

      let builder = new FCMNotificationPayload(platformPayloadStorage);
      builder.sound = expectedSound;

      assert.equal(platformPayloadStorage.android.notification.sound, expectedSound);
      assert(!platformPayloadStorage.notification.sound);
    });

    it("should not set 'sound' if value is empty", () => {
      let expectedSound = '';

      let builder = new FCMNotificationPayload(platformPayloadStorage);
      builder.sound = expectedSound;

      assert(!platformPayloadStorage.android.notification.sound);
    });

    it("should set 'icon' under android.notification", () => {
      let expectedIcon = PubNub.generateUUID();

      let builder = new FCMNotificationPayload(platformPayloadStorage);
      builder.icon = expectedIcon;

      assert.equal(platformPayloadStorage.android.notification.icon, expectedIcon);
      assert(!platformPayloadStorage.notification.icon);
    });

    it("should not set 'icon' if value is empty", () => {
      let expectedIcon = '';

      let builder = new FCMNotificationPayload(platformPayloadStorage);
      builder.icon = expectedIcon;

      assert(!platformPayloadStorage.android.notification.icon);
    });

    it("should set 'tag' under android.notification", () => {
      let expectedTag = PubNub.generateUUID();

      let builder = new FCMNotificationPayload(platformPayloadStorage);
      builder.tag = expectedTag;

      assert.equal(platformPayloadStorage.android.notification.tag, expectedTag);
      assert(!platformPayloadStorage.notification.tag);
    });

    it("should not set 'tag' if value is empty", () => {
      let expectedTag = '';

      let builder = new FCMNotificationPayload(platformPayloadStorage);
      builder.tag = expectedTag;

      assert(!platformPayloadStorage.android.notification.tag);
    });

    it("should set 'image' on android.notification", () => {
      let expectedImage = 'https://example.com/image.png';

      let builder = new FCMNotificationPayload(platformPayloadStorage);
      builder.payload.android!.notification!.image = expectedImage;

      assert.equal(platformPayloadStorage.android.notification.image, expectedImage);
    });

    it('should return null when no data provided', () => {
      let builder = new FCMNotificationPayload(platformPayloadStorage);

      assert.equal(builder.toObject(), null);
    });

    it("should send data under top-level 'data' when set silenced", () => {
      let expectedTitle = PubNub.generateUUID();
      let expectedBody = PubNub.generateUUID();
      let expectedSound = PubNub.generateUUID();

      let builder = new FCMNotificationPayload(platformPayloadStorage, expectedTitle, expectedBody);
      builder.sound = expectedSound;
      builder.silent = true;
      const payload = builder.toObject();

      assert(payload);
      assert(!payload.notification);
      assert(payload.data);
      assert.equal(payload.data.title, expectedTitle);
      assert.equal(payload.data.body, expectedBody);
      assert.equal(payload.data.sound, expectedSound, 'sound should be merged into data for silent notifications');
      assert(!payload.android, 'android should not be present when only notification fields were set');
    });

    it('should return valid payload object with v1 structure', () => {
      let expectedTitle = PubNub.generateUUID();
      let expectedBody = PubNub.generateUUID();
      let expectedSound = PubNub.generateUUID();
      let expectedPayload = {
        notification: {
          title: expectedTitle,
          body: expectedBody,
        },
        android: {
          notification: {
            sound: expectedSound,
          },
        },
      };

      let builder = new FCMNotificationPayload(platformPayloadStorage, expectedTitle, expectedBody);
      builder.sound = expectedSound;

      assert.deepEqual(builder.toObject(), expectedPayload);
    });
    
    it("should not include 'sound', 'icon', or 'tag' in top-level 'notification' output", () => {
      const expectedTitle = PubNub.generateUUID();
      const expectedBody = PubNub.generateUUID();
      const expectedSound = PubNub.generateUUID();
      const expectedIcon = PubNub.generateUUID();
      const expectedTag = PubNub.generateUUID();

      let builder = new FCMNotificationPayload(platformPayloadStorage, expectedTitle, expectedBody);
      builder.sound = expectedSound;
      builder.icon = expectedIcon;
      builder.tag = expectedTag;
      const payload = builder.toObject();

      assert(payload);
      assert(payload.notification);
      assert.equal(Object.keys(payload.notification).length, 2);
      assert.equal(payload.notification.title, expectedTitle);
      assert.equal(payload.notification.body, expectedBody);
      assert(!('sound' in payload.notification));
      assert(!('icon' in payload.notification));
      assert(!('tag' in payload.notification));
      assert(payload.android);
      assert(payload.android.notification);
      assert.equal(payload.android.notification.sound, expectedSound);
      assert.equal(payload.android.notification.icon, expectedIcon);
      assert.equal(payload.android.notification.tag, expectedTag);
    });
  });
});
