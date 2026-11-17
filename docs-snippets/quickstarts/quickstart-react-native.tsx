/**
 * React Native quickstart examples. Each fragment sits inside a small host component with the names it expects
 * (`pubnub`, `styles` and the React Native components) in scope.
 */
import React, { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, TextInput, View } from 'react-native';

// snippet.quickstartReactNativeImport
import PubNub from 'pubnub';
// snippet.end

const styles = StyleSheet.create({ container: { flex: 1 }, input: { height: 40 } });

/** Hosts the "Initialize" fragment. The caller gets the client the fragment creates. */
export function createClient(): PubNub {
  // snippet.quickstartReactNativeInit
  const pubnub = new PubNub({
      publishKey: "demo",
      subscribeKey: "demo",
      userId: "rn-user-" + Math.floor(Math.random() * 1000)
  });
  // snippet.end
  return pubnub;
}

/** Hosts the "optional" cleanup fragment of the "Initialize" section. */
export function CleanupHost({ pubnub }: { pubnub: PubNub | null }) {
  // snippet.quickstartReactNativeCleanup
  // Example of initialization in a React component (optional)
  useEffect(() => {
      // Clean up on component unmount
      return () => {
          if (pubnub) {
              pubnub.removeAllListeners();
              pubnub.destroy();
          }
      };
  }, [pubnub]);
  // snippet.end
  return null;
}

/** Hosts the "Create a subscription" fragment. */
export function SubscribeHost({ pubnub }: { pubnub: PubNub | null }) {
  // snippet.quickstartReactNativeSubscription
  useEffect(() => {
      if (!pubnub) return;
      
      // Create a channel entity
      const channel = pubnub.channel('hello_world');
      
      // Create a subscription
      const subscription = channel.subscription({
          receivePresenceEvents: true
      });
      
      // Subscribe
      subscription.subscribe();
      
      // Clean up on unmount
      return () => {
          // First remove listeners to prevent callbacks during cleanup
          pubnub.removeAllListeners();
          
          // Then unsubscribe if needed
          if (subscription) {
              subscription.unsubscribe();
          }
          
          // Note: Only call destroy() if this component owns the pubnub instance
          // If the pubnub instance is shared, consider only removing listeners
      };
  }, [pubnub]);
  // snippet.end
  return null;
}

/** Hosts the "Publish messages" fragment. It renders the input and the button the fragment returns. */
export function PublishHost({ pubnub }: { pubnub: PubNub | null }) {
  // snippet.quickstartReactNativePublish
  // State for the input text
  const [inputText, setInputText] = useState('');

  // Function to publish a message
  const publishMessage = async () => {
      if (!inputText.trim() || !pubnub) return;
      
      try {
          const result = await pubnub.publish({
              message: {
                  text: inputText,
                  sender: pubnub.getUserId(),
                  time: new Date().toISOString()
              },
              channel: 'hello_world'
          });
          console.log("Message published with timetoken:", result.timetoken);
          setInputText(''); // Clear input after sending
      } catch (error) {
          console.error("Publish failed:", error);
          Alert.alert("Error", "Failed to send message");
      }
  };

  // In your render function
  return (
      <View style={styles.container}>
          <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              style={styles.input}
          />
          <Button title="Send" onPress={publishMessage} />
      </View>
  );
  // snippet.end
}
