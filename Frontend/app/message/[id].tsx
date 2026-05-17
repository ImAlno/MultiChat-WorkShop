import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { AppAvatar } from '@/components/AppAvatar';

export default function MessageDetailsScreen() {
  const { sender, text, time, appName } = useLocalSearchParams();
  const app = typeof appName === 'string' ? appName : '';

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: '',
        }}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <AppAvatar appName={app} size={28} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.sender}>{sender}</Text>
            <View style={styles.metaData}>
              <Text style={styles.appBadge}>{appName}</Text>
              <Text style={styles.time}>{time}</Text>
            </View>
          </View>
        </View>

        <View style={styles.messageBody}>
          <Text style={styles.text}>{text}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTextContainer: {
    flex: 1,
  },
  sender: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  metaData: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appBadge: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
    overflow: 'hidden',
  },
  time: {
    fontSize: 14,
    color: '#999',
    fontWeight: '400',
  },
  messageBody: {
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 18,
    color: '#333',
    fontWeight: '400',
    lineHeight: 28,
    letterSpacing: 0.3,
  },
});
