import { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Modal, SafeAreaView, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ConnectionStep } from '@/components/ConnectionStep';
import { useConnectionGuide } from '@/hooks/useConnectionGuide';
import { WebView } from 'react-native-webview';

export default function ConnectAppScreen() {
  const { app, code, guild_id } = useLocalSearchParams();
  const appName = typeof app === 'string' ? app : 'App';
  const router = useRouter();

  const [authSession, setAuthSession] = useState<{ url: string; redirectUri: string } | null>(null);

  const guide = useConnectionGuide(appName, {
    onDiscordAuth: (authUrl, redirectUri) => {
      setAuthSession({ url: authUrl, redirectUri });
    },
  });

  const isStep1Completed = !!code || !!guild_id;
  const isStep2Completed = !!guild_id;

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
              />
            );
          })}

          {/* Premium Success Card shown when all steps are completed */}
          {isStep2Completed && (
            <View style={styles.successCard}>
              <View style={styles.successHeader}>
                <View style={styles.successIconCircle}>
                  <Ionicons name="checkmark-circle" size={28} color="#2ecc71" />
                </View>
                <View style={styles.successHeaderText}>
                  <Text style={styles.successTitle}>Connection Successful!</Text>
                  <Text style={styles.successSubtitle}>Your Discord server messages will now start syncing.</Text>
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
});
