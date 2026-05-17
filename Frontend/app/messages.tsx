import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Pressable, ActivityIndicator, Platform } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppAvatar } from '@/components/AppAvatar';
import Constants from 'expo-constants';

export default function MessagesScreen() {
  const router = useRouter();
  const { channel_id } = useLocalSearchParams();

  const [messagesList, setMessagesList] = useState<any[]>([]);
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
      setMessagesList([]);
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
      ) : !channel_id ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="chatbubbles-outline" size={48} color="#5865F2" />
          </View>
          <Text style={styles.emptyTitle}>No synced messages yet</Text>
          <Text style={styles.emptySubtitle}>
            Connect your Discord server to start reading and syncing messages in real-time.
          </Text>
          <Pressable 
            style={({ pressed }) => [
              styles.connectButton,
              pressed && styles.connectButtonPressed
            ]} 
            onPress={() => router.push('/add-app')}
          >
            <Text style={styles.connectButtonText}>Connect Discord Channel</Text>
          </Pressable>
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#fff',
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#f4f5fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  connectButton: {
    backgroundColor: '#5865F2',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: '#5865F2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  connectButtonPressed: {
    backgroundColor: '#4752C4',
    opacity: 0.9,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
