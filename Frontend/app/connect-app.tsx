import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Modal, SafeAreaView, ActivityIndicator, Platform, Image } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ConnectionStep } from '@/components/ConnectionStep';
import { useConnectionGuide } from '@/hooks/useConnectionGuide';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';

export default function ConnectAppScreen() {
  const { app, code, guild_id } = useLocalSearchParams();
  const appName = typeof app === 'string' ? app : 'App';
  const router = useRouter();

  const [authSession, setAuthSession] = useState<{ url: string; redirectUri: string } | null>(null);

  // Backend connection states
  const [isConnecting, setIsConnecting] = useState(false);
  const [backendData, setBackendData] = useState<any>(null);
  const [connectError, setConnectError] = useState<string | null>(null);

  const guide = useConnectionGuide(appName, {
    onDiscordAuth: (authUrl, redirectUri) => {
      setAuthSession({ url: authUrl, redirectUri });
    },
  });

  // Automatically trigger backend code exchange when the code parameter is populated
  useEffect(() => {
    if (code) {
      handleExchangeCode(code as string);
    }
  }, [code]);

  const handleExchangeCode = async (authCode: string) => {
    setIsConnecting(true);
    setConnectError(null);
    try {
      // Resolve backend URL dynamically.
      // In Expo Go, hostUri contains the IP of the development machine (e.g. "192.168.1.135:8081").
      // We extract the IP and target port 3000 where our backend server is running.
      let baseUrl = 'http://localhost:3000';
      const hostUri = Constants.expoConfig?.hostUri;
      if (hostUri) {
        const ip = hostUri.split(':')[0];
        if (ip) {
          baseUrl = `http://${ip}:3000`;
        }
      } else if (Platform.OS === 'android') {
        // Fallback for standalone Android emulator
        baseUrl = 'http://10.0.2.2:3000';
      }

      console.log(`Sending OAuth code to backend at: ${baseUrl}`);
      const response = await fetch(`${baseUrl}/auth/discord/callback?code=${encodeURIComponent(authCode)}`);
      
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Successfully connected to backend! Data:', data);
      setBackendData(data);
    } catch (err: any) {
      console.error('Failed to exchange code with backend:', err);
      setConnectError(err.message || 'Failed to connect to the backend server.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Dynamic step connection states
  const [selectedGuildId, setSelectedGuildId] = useState<string | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [channels, setChannels] = useState<any[]>([]);
  const [isFetchingChannels, setIsFetchingChannels] = useState(false);
  const [channelsError, setChannelsError] = useState<string | null>(null);
  
  const [fetchedMessages, setFetchedMessages] = useState<any[]>([]);
  const [isFetchingMessages, setIsFetchingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  // Automatically trigger backend code exchange when the code parameter is populated
  useEffect(() => {
    if (guild_id) {
      setSelectedGuildId(guild_id as string);
    }
  }, [guild_id]);

  const fetchChannels = async (guildId: string) => {
    setIsFetchingChannels(true);
    setChannelsError(null);
    setChannels([]);
    setSelectedChannelId(null);
    setFetchedMessages([]);
    try {
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

      console.log(`Fetching channels for guild ${guildId} from backend...`);
      const response = await fetch(`${baseUrl}/guilds/${guildId}/channels`);
      
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Channels fetched successfully:', data.channels);
      setChannels(data.channels || []);
    } catch (err: any) {
      console.error('Failed to fetch channels:', err);
      setChannelsError(err.message || 'Failed to fetch channels from the server.');
    } finally {
      setIsFetchingChannels(false);
    }
  };

  useEffect(() => {
    if (selectedGuildId) {
      fetchChannels(selectedGuildId);
    }
  }, [selectedGuildId]);

  const fetchMessages = async (channelId: string) => {
    setIsFetchingMessages(true);
    setMessagesError(null);
    setFetchedMessages([]);
    try {
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

      console.log(`Fetching messages for channel ${channelId} from backend...`);
      const response = await fetch(`${baseUrl}/channels/${channelId}/messages?limit=100`);
      
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Messages fetched successfully:', data.messages);
      setFetchedMessages(data.messages || []);
    } catch (err: any) {
      console.error('Failed to fetch messages:', err);
      setMessagesError(err.message || 'Failed to fetch messages from the server.');
    } finally {
      setIsFetchingMessages(false);
    }
  };

  useEffect(() => {
    if (selectedChannelId) {
      fetchMessages(selectedChannelId);
    }
  }, [selectedChannelId]);

  const isStep1Completed = !!backendData;
  const isStep2Completed = !!guild_id || !!selectedGuildId;
  const isStep3Completed = !!selectedGuildId;
  const isStep4Completed = !!selectedChannelId && fetchedMessages.length > 0;

  const renderGuildSelector = () => {
    if (!isStep1Completed || !backendData || !backendData.guilds) {
      return (
        <View style={styles.selectorPlaceholder}>
          <Text style={styles.selectorPlaceholderText}>Complete Step 1 to unlock server selection.</Text>
        </View>
      );
    }

    const guildsList = backendData.guilds;

    return (
      <View style={styles.selectorContainer}>
        {guildsList.length === 0 ? (
          <Text style={styles.noDataText}>No servers found on your Discord account.</Text>
        ) : (
          <View style={styles.guildsList}>
            {guildsList.map((guild: any) => {
              const isSelected = selectedGuildId === guild.id;
              // Discord Guild Icon URL
              const iconUrl = guild.icon 
                ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
                : null;

              return (
                <Pressable
                  key={guild.id}
                  style={({ pressed }) => [
                    styles.guildItem,
                    isSelected && styles.guildItemSelected,
                    pressed && styles.guildItemPressed,
                  ]}
                  onPress={() => setSelectedGuildId(guild.id)}
                >
                  {iconUrl ? (
                    <Image source={{ uri: iconUrl }} style={styles.guildIcon} />
                  ) : (
                    <View style={styles.guildIconPlaceholder}>
                      <Text style={styles.guildIconPlaceholderText}>
                        {guild.name.charAt(0)}
                      </Text>
                    </View>
                  )}
                  <Text 
                    style={[styles.guildName, isSelected && styles.guildNameSelected]}
                    numberOfLines={1}
                  >
                    {guild.name}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color="#2ecc71" style={styles.checkIcon} />
                  )}
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  const renderChannelSelector = () => {
    if (!selectedGuildId) {
      return (
        <View style={styles.selectorPlaceholder}>
          <Text style={styles.selectorPlaceholderText}>Select a server in Step 3 to unlock channel selection.</Text>
        </View>
      );
    }

    if (isFetchingChannels) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#5865F2" size="small" />
          <Text style={styles.loadingText}>Fetching text channels from server...</Text>
        </View>
      );
    }

    if (channelsError) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color="#e74c3c" />
          <Text style={styles.errorText}>{channelsError}</Text>
          <Pressable 
            style={styles.inlineRetryButton}
            onPress={() => fetchChannels(selectedGuildId)}
          >
            <Text style={styles.inlineRetryButtonText}>Retry</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.selectorContainer}>
        {channels.length === 0 ? (
          <View style={styles.emptyChannelsContainer}>
            <Ionicons name="information-circle" size={24} color="#f39c12" />
            <Text style={styles.noDataText}>
              No text channels found. Make sure you completed Step 2 and authorized the bot on this server!
            </Text>
          </View>
        ) : (
          <View style={styles.channelsList}>
            {channels.map((channel: any) => {
              const isSelected = selectedChannelId === channel.id;

              return (
                <Pressable
                  key={channel.id}
                  style={({ pressed }) => [
                    styles.channelItem,
                    isSelected && styles.channelItemSelected,
                    pressed && styles.channelItemPressed,
                  ]}
                  onPress={() => setSelectedChannelId(channel.id)}
                >
                  <Text style={[styles.channelHash, isSelected && styles.channelHashSelected]}>#</Text>
                  <Text 
                    style={[styles.channelName, isSelected && styles.channelNameSelected]}
                    numberOfLines={1}
                  >
                    {channel.name}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color="#2ecc71" style={styles.checkIcon} />
                  )}
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Message Fetching Status & Real-time Preview */}
        {isFetchingMessages && (
          <View style={styles.channelLoadingContainer}>
            <ActivityIndicator color="#5865F2" size="small" />
            <Text style={styles.channelLoadingText}>Testing connection and fetching messages...</Text>
          </View>
        )}

        {messagesError && (
          <View style={[styles.errorContainer, { marginTop: 12 }]}>
            <Ionicons name="alert-circle" size={20} color="#e74c3c" />
            <Text style={styles.errorText}>{messagesError}</Text>
          </View>
        )}

        {fetchedMessages.length > 0 && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Connection Test: Successful!</Text>
            <Text style={styles.previewSubtitle}>Latest messages from channel:</Text>
            
            <View style={styles.previewList}>
              {fetchedMessages.slice(0, 3).map((msg: any) => (
                <View key={msg.id} style={styles.previewItem}>
                  <Text style={styles.previewAuthor}>{msg.author?.username || 'User'}:</Text>
                  <Text style={styles.previewText} numberOfLines={1}>{msg.content || '(Empty message)'}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: '',
          headerTitleStyle: styles.headerTitle,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#fff' },
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.instructionsContainer}>
          <Text style={styles.title}>{guide.title}</Text>
          <Text style={styles.subtitle}>{guide.subtitle}</Text>

          {guide.steps.map((step) => {
            // Determine if this specific step is completed
            let isCompleted = false;
            if (step.stepNumber === 1) isCompleted = isStep1Completed;
            if (step.stepNumber === 2) isCompleted = isStep2Completed;
            if (step.stepNumber === 3) isCompleted = isStep3Completed;
            if (step.stepNumber === 4) isCompleted = isStep4Completed;

            return (
              <ConnectionStep
                key={step.stepNumber}
                stepNumber={step.stepNumber}
                title={step.title}
                description={step.description}
                type={step.type}
                buttonText={step.buttonText}
                inputPlaceholder={step.inputPlaceholder}
                onSubmitInput={step.onSubmitInput}
                onPress={step.onPress}
                isCompleted={isCompleted}
              >
                {step.stepNumber === 3 && renderGuildSelector()}
                {step.stepNumber === 4 && renderChannelSelector()}
              </ConnectionStep>
            );
          })}

          {/* Premium Connection Status & Feedback Cards */}
          {isConnecting && (
            <View style={styles.statusCard}>
              <ActivityIndicator color="#5865F2" size="small" style={styles.statusIcon} />
              <Text style={styles.statusText}>Exchanging code with backend...</Text>
            </View>
          )}

          {connectError && (
            <View style={[styles.statusCard, styles.statusCardError]}>
              <Ionicons name="alert-circle" size={24} color="#e74c3c" style={styles.statusIcon} />
              <View style={styles.statusContent}>
                <Text style={styles.statusTitleError}>Backend Connection Error</Text>
                <Text style={styles.statusTextError}>{connectError}</Text>
              </View>
              <Pressable 
                onPress={() => code && handleExchangeCode(code as string)}
                style={({ pressed }) => [
                  styles.retryButton,
                  pressed && styles.retryButtonPressed
                ]}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </Pressable>
            </View>
          )}

          {backendData && (
            <View style={[styles.statusCard, styles.statusCardSuccess]}>
              {backendData.user?.avatar ? (
                <Image 
                  source={{ uri: `https://cdn.discordapp.com/avatars/${backendData.user.id}/${backendData.user.avatar}.png` }} 
                  style={styles.discordAvatar} 
                />
              ) : (
                <View style={styles.discordAvatarPlaceholder}>
                  <Ionicons name="person" size={20} color="#5865F2" />
                </View>
              )}
              <View style={styles.statusContent}>
                <Text style={styles.statusTitleSuccess}>Connected to Discord</Text>
                <Text style={styles.statusTextSuccess}>
                  Logged in as <Text style={{ fontWeight: '600' }}>{backendData.user?.username || 'User'}</Text>
                </Text>
              </View>
              <Ionicons name="checkmark-circle" size={24} color="#2ecc71" />
            </View>
          )}

          {/* Premium Success Card shown when all steps are completed */}
          {isStep4Completed && (
            <View style={styles.successCard}>
              <View style={styles.successHeader}>
                <View style={styles.successIconCircle}>
                  <Ionicons name="checkmark-circle" size={28} color="#2ecc71" />
                </View>
                <View style={styles.successHeaderText}>
                  <Text style={styles.successTitle}>Connection Successful!</Text>
                  <Text style={styles.successSubtitle}>
                    Successfully synced #{channels.find(c => c.id === selectedChannelId)?.name || 'channel'} messages!
                  </Text>
                </View>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.successButton,
                  pressed && styles.successButtonPressed
                ]}
                onPress={() => router.replace('/messages')}
              >
                <Text style={styles.successButtonText}>Go to Messages</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      {/* WebView Authentication Modal */}
      <Modal
        visible={authSession !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAuthSession(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable
              onPress={() => setAuthSession(null)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#1a1a1a" />
            </Pressable>
            <Text style={styles.modalTitle}>Connect Discord</Text>
            <View style={{ width: 40 }} />
          </View>

          {authSession && (
            <WebView
              source={{ uri: authSession.url }}
              style={styles.webview}
              startInLoadingState={true}
              renderLoading={() => (
                <ActivityIndicator
                  color="#5865F2"
                  size="large"
                  style={styles.webviewLoader}
                />
              )}
              onNavigationStateChange={(navState) => {
                console.log('WebView Navigated to:', navState.url);
                if (navState.url.startsWith(authSession.redirectUri)) {
                  try {
                    const match = navState.url.match(/[?&]code=([^&#]+)/);
                    if (match) {
                      const codeParam = decodeURIComponent(match[1]);
                      console.log('Captured Discord OAuth code:', codeParam);
                      router.setParams({ code: codeParam });
                    }
                  } catch (e) {
                    console.error('Failed to parse redirect URL:', e);
                  }
                  setAuthSession(null);
                }
              }}
            />
          )}
        </SafeAreaView>
      </Modal>
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
  scrollContent: {
    flexGrow: 1,
    padding: 32,
  },
  instructionsContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    lineHeight: 24,
  },
  successCard: {
    marginTop: 8,
    backgroundColor: '#fafdfb',
    borderWidth: 1,
    borderColor: '#d1f2db',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#2ecc71',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  successIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e8f7ed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  successHeaderText: {
    flex: 1,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2ecc71',
    marginBottom: 4,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  successButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  successButtonPressed: {
    backgroundColor: '#27ae60',
  },
  successButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  webview: {
    flex: 1,
  },
  webviewLoader: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f8fa',
    borderWidth: 1,
    borderColor: '#e1e4e8',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  statusCardError: {
    backgroundColor: '#fff5f5',
    borderColor: '#ffe3e3',
  },
  statusCardSuccess: {
    backgroundColor: '#f4faf6',
    borderColor: '#e1f5e8',
  },
  statusIcon: {
    marginRight: 4,
  },
  statusContent: {
    flex: 1,
  },
  statusText: {
    fontSize: 15,
    color: '#24292e',
    fontWeight: '500',
  },
  statusTitleError: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e74c3c',
    marginBottom: 2,
  },
  statusTextError: {
    fontSize: 13,
    color: '#c0392b',
    lineHeight: 18,
  },
  statusTitleSuccess: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2ecc71',
    marginBottom: 2,
  },
  statusTextSuccess: {
    fontSize: 13,
    color: '#27ae60',
  },
  retryButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  retryButtonPressed: {
    opacity: 0.8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  discordAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5865F2',
  },
  discordAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8ebfd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorContainer: {
    marginTop: 16,
  },
  selectorPlaceholder: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#eaeaea',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorPlaceholderText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 12,
  },
  guildsList: {
    gap: 12,
  },
  guildItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#eaeaea',
    borderRadius: 16,
    padding: 12,
  },
  guildItemSelected: {
    borderColor: '#5865F2',
    backgroundColor: '#f4f5fe',
  },
  guildItemPressed: {
    opacity: 0.8,
  },
  guildIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  guildIconPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#5865F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  guildIconPlaceholderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  guildName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  guildNameSelected: {
    color: '#5865F2',
    fontWeight: '600',
  },
  checkIcon: {
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    marginTop: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3f3',
    borderWidth: 1,
    borderColor: '#ffe5e5',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    marginTop: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#c0392b',
  },
  inlineRetryButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  inlineRetryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyChannelsContainer: {
    backgroundColor: '#fffdf6',
    borderWidth: 1,
    borderColor: '#fef5d1',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  channelsList: {
    gap: 10,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#eaeaea',
    borderRadius: 12,
    padding: 12,
  },
  channelItemSelected: {
    borderColor: '#5865F2',
    backgroundColor: '#f4f5fe',
  },
  channelItemPressed: {
    opacity: 0.8,
  },
  channelName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  channelNameSelected: {
    color: '#5865F2',
    fontWeight: '600',
  },
  channelLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 8,
  },
  channelLoadingText: {
    fontSize: 13,
    color: '#666',
  },
  previewContainer: {
    marginTop: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 16,
    padding: 16,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2ecc71',
    marginBottom: 4,
  },
  previewSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  previewList: {
    gap: 8,
  },
  previewItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f1f3f5',
    borderRadius: 8,
    padding: 10,
    gap: 6,
  },
  previewAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: '#495057',
  },
  previewText: {
    flex: 1,
    fontSize: 13,
    color: '#495057',
  },
  channelHash: {
    fontSize: 18,
    fontWeight: '600',
    color: '#888',
    marginRight: 8,
  },
  channelHashSelected: {
    color: '#5865F2',
  },
});
