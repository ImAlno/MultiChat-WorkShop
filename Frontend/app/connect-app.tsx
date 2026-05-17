import { StyleSheet, View, Text } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

export default function ConnectAppScreen() {
  const { app } = useLocalSearchParams();
  const appName = typeof app === 'string' ? app : 'App';

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
      
      <View style={styles.content}>
        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>Guide coming soon</Text>
        </View>
        <Text style={styles.description}>
          Instructions to connect your {appName} account will appear here.
        </Text>
      </View>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  placeholderBox: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 32,
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '400',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
