// App.tsx

// Imports
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PubNub from 'pubnub';

// Types for the messages
type ChatMessage = {
  text: string;
  sender?: string;
  time?: string;
};

type MessageItem = {
  id: string;
  message: ChatMessage;
};

// Main App Component
export default function App() {
  // State variables
  const [pubnub, setPubnub] = useState<PubNub | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Reference to the FlatList for auto-scrolling
  const flatListRef = useRef<FlatList>(null);

  // Initialize PubNub on component mount
  useEffect(() => {
    // Create a new PubNub instance
    const pubnubInstance = new PubNub({
      publishKey: "demo",
      subscribeKey: "demo",
      userId: "rn-user-" + Math.floor(Math.random() * 1000)
    });
    
    // Add listener to handle events
    pubnubInstance.addListener({
      // Message handler - called when a message is received
      message: function(event) {
        setMessages(messages => [
          ...messages, 
          { 
            id: event.timetoken || Date.now().toString(),
            message: event.message as ChatMessage
          }
        ]);
        
        // Auto-scroll to bottom when new messages arrive
        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }, 100);
      },
      
      // Presence handler - called for join/leave events
      presence: function(event) {
        console.log("Presence event:", event);
        // Skip interval events and your own events
        if (event.action === 'interval' || event.uuid === pubnubInstance.getUserId()) return;
        if (event.action === 'join') {
          // Someone joined the channel
          Alert.alert("User Joined", `${event.uuid} joined the chat`);
        } else if (event.action === 'leave' || event.action === 'timeout') {
          // Someone left the channel
          Alert.alert("User Left", `${event.uuid} left the chat`);
        }
      },
      
      // Status handler - called for connection status changes
      status: function(event) {
        console.log("Status event:", event);
        if (event.category === "PNConnectedCategory") {
          setIsConnected(true);
          setIsLoading(false);
          console.log("Connected to PubNub!");
        } else if (event.category === "PNNetworkIssuesCategory") {
          setIsConnected(false);
          console.log("Connection lost. Attempting to reconnect...");
        } else if (event.category === "PNReconnectedCategory") {
          setIsConnected(true);
          console.log("Reconnected to PubNub!");
        }
      }
    });
    
    // Create a channel entity and subscription
    const channel = pubnubInstance.channel('hello_world');
    const subscription = channel.subscription({
      receivePresenceEvents: true
    });
    
    // Subscribe to the channel
    subscription.subscribe();
    
    // Update state with PubNub instance
    setPubnub(pubnubInstance);
    
    // Clean up on component unmount
    return () => {
      pubnubInstance.removeAllListeners();
      pubnubInstance.destroy();
      console.log("Cleaned up PubNub connection");
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // Function to publish a message
  const publishMessage = async () => {
    // Don't send empty messages or if not connected
    if (!inputText.trim() || !pubnub || !isConnected) return;
    
    try {
      // Create message object
      const messageObject: ChatMessage = {
        text: inputText,
        sender: pubnub.getUserId(),
        time: new Date().toISOString()
      };
      
      // Publish to PubNub
      const result = await pubnub.publish({
        message: messageObject,
        channel: 'hello_world'
      });
      
      console.log("Message published with timetoken:", result.timetoken);
      
      // Clear input after successful send
      setInputText('');
    } catch (error) {
      console.error("Publish failed:", error);
      Alert.alert(
        "Message Failed", 
        "Could not send your message. Please try again."
      );
    }
  };

  // Render a message item for the FlatList
  const renderMessageItem = ({ item }: { item: MessageItem }) => {
    const isCurrentUser = item.message.sender === pubnub?.getUserId();
    const messageTime = item.message.time 
      ? new Date(item.message.time).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }) 
      : '';
      
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.sentMessage : styles.receivedMessage
      ]}>
        <Text style={styles.senderText}>
          {isCurrentUser ? 'You' : (item.message.sender || 'User')}
        </Text>
        <Text style={styles.messageText}>{item.message.text}</Text>
        <Text style={styles.timeText}>{messageTime}</Text>
      </View>
    );
  };

  // Main component render
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {isLoading ? (
        // Loading screen
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4b0082" />
          <Text style={styles.loadingText}>Connecting to PubNub...</Text>
        </View>
      ) : (
        // Chat UI
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>PubNub Chat</Text>
            <View style={[
              styles.connectionIndicator,
              isConnected ? styles.connected : styles.disconnected
            ]} />
          </View>
          
          {/* Messages List */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() => 
              flatListRef.current?.scrollToEnd({ animated: false })
            }
          />
          
          {/* Input Area */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              placeholderTextColor="#aaa"
              returnKeyType="send"
              onSubmitEditing={publishMessage}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || !isConnected) && styles.sendButtonDisabled
              ]}
              onPress={publishMessage}
              disabled={!inputText.trim() || !isConnected}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

// Component styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  connectionIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  connected: {
    backgroundColor: '#4CAF50',
  },
  disconnected: {
    backgroundColor: '#F44336',
  },
  messagesList: {
    flex: 1,
    padding: 8,
  },
  messagesContent: {
    paddingBottom: 8,
  },
  messageContainer: {
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    borderBottomRightRadius: 4,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  senderText: {
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 4,
    color: '#333',
  },
  messageText: {
    fontSize: 15,
    color: '#333',
  },
  timeText: {
    fontSize: 11,
    color: '#999',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginRight: 8,
    backgroundColor: '#fff',
    color: '#333',
  },
  sendButton: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#4b0082',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#B39DDB',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
