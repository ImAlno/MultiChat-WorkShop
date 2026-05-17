import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Pressable, ActivityIndicator, Platform } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppAvatar } from '@/components/AppAvatar';
import Constants from 'expo-constants';

// Dummy/fallback data for messages if no connection has been set up yet
const FALLBACK_MESSAGES = [
  { id: '1', app: 'Discord', sender: 'Alice', text: 'Hey, are we still meeting later?', time: '10:42 AM' },
  { id: '2', app: 'Discord', sender: 'Bob', text: 'Just pushed the new update.', time: '09:15 AM' },
  { id: '3', app: 'Discord', sender: 'Charlie', text: 'Let me know what you think of the design.', time: 'Yesterday' },
  { id: '4', app: 'Discord', sender: 'David', text: 'This is a very long message that takes up multiple lines. I want to tell you all about the new features we just released today. First of all, the design is super clean and intentional. Secondly, we fixed all the bugs from last week! Let me know if you want to hop on a call to discuss the remaining items for this sprint.', time: 'Monday' },
];

export default function MessagesScreen() {
  const router = useRouter();
  const { channel_id } = useLocalSearchParams();

  const [messagesList, setMessagesList] = useState<any[]>(FALLBACK_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatTime = (isoString: string) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      const now = new Date();
      
      // Today
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      // Yesterday
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      }
      
      // Earlier this week / month
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (e) {
      return 'Just now';
    }
  };

  const fetchChannelMessages = async (channelId: string, showLoader = true) => {
    if (showLoader) setIsLoading(true);
    setError(null);
    try {
      // Resolve backend URL dynamically.
      let baseUrl = 'http://localhost:3000';
      const hostUri = Constants.expoConfig?.hostUri;
      if (hostUri) {
        const ip = hostUri.split(':')[0];
        if (ip) {
          baseUrl = `http://${ip}:3000`;
        }
      } else if (Platform.OS === 'android') {
        baseUrl = 'http://10.0.2.2:3000';
      }

      console.log(`[MessagesScreen] Fetching messages from channel: ${channelId} at ${baseUrl}`);
      const response = await fetch(`${baseUrl}/channels/${channelId}/messages?limit=100`);
      
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Dynamic mapping of Discord properties
      const formatted = (data.messages || []).map((msg: any) => ({
        id: msg.id,
        app: 'Discord',
        sender: msg.author_username || msg.author?.username || 'Unknown User',
        text: msg.content || '',
        time: formatTime(msg.timestamp),
      }));

      setMessagesList(formatted);
    } catch (err: any) {
      console.error('[MessagesScreen] Failed to fetch synced messages:', err);
      setError(err.message || 'Failed to load synced messages.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (channel_id) {
      fetchChannelMessages(channel_id as string);
    } else {
      // If no channel is connected yet, display illustrative fallback list
      setMessagesList(FALLBACK_MESSAGES);
    }
  }, [channel_id]);

  const handleRefresh = () => {
    if (channel_id) {
      setRefreshing(true);
      fetchChannelMessages(channel_id as string, false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <Pressable 
      style={({ pressed }) => [
        styles.messageItem,
        pressed && { backgroundColor: '#f9f9f9' }
      ]}
      onPress={() => router.push({
        pathname: '/message/[id]',
        params: { 
          id: item.id,
          sender: item.sender,
          time: item.time,
          text: item.text,
          appName: item.app,
        }
      })}
    >
      <AppAvatar appName={item.app} size={24} />
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.sender}>{item.sender}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Text style={styles.text} numberOfLines={2}>{item.text}</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Messages',
          headerTitleStyle: styles.headerTitle,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#fff' },
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/add-app')}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && { opacity: 0.5 }
              ]}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="add" size={24} color="#1a1a1a" />
              </View>
            </Pressable>
          ),
        }}
      />

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator color="#5865F2" size="large" />
          <Text style={styles.loadingText}>Syncing Discord messages...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={48} color="#e74c3c" />
          <Text style={styles.errorText}>{error}</Text>
          {channel_id && (
            <Pressable 
              style={styles.retryButton} 
              onPress={() => fetchChannelMessages(channel_id as string)}
            >
              <Text style={styles.retryButtonText}>Retry Sync</Text>
            </Pressable>
          )}
        </View>
      ) : !channel_id && messagesList === FALLBACK_MESSAGES ? (
        <View style={styles.container}>
          {/* Informative connection banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={20} color="#5865F2" style={{ marginRight: 8 }} />
            <Text style={styles.infoBannerText}>
              Viewing demo list. Tap '+' to connect a real Discord channel!
            </Text>
          </View>
          <FlatList
            data={messagesList}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      ) : (
        <FlatList
          data={messagesList}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshing={refreshing}
          onRefresh={channel_id ? handleRefresh : undefined}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '400',
    color: '#1a1a1a',
    letterSpacing: 0.5,
  },
  headerButton: {
    marginRight: 16,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingVertical: 12,
  },
  messageItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sender: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  time: {
    fontSize: 12,
    color: '#999',
    fontWeight: '400',
  },
  text: {
    fontSize: 15,
    color: '#666',
    fontWeight: '400',
    lineHeight: 20,
  },
  separator: {
    height: 1,
    backgroundColor: '#f5f5f5',
    marginLeft: 84,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    marginTop: 16,
    fontSize: 14,
    color: '#c0392b',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#5865F2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f3ff',
    padding: 12,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbe2ff',
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#5865F2',
    fontWeight: '500',
  },
});
