import { StyleSheet, View, Text, Pressable, FlatList } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const APPS = [
  { id: '1', name: 'Discord', icon: 'logo-discord', color: '#5865F2' },
  { id: '2', name: '', icon: null, color: '#f0f0f0' },
  { id: '3', name: '', icon: null, color: '#f0f0f0' },
  { id: '4', name: '', icon: null, color: '#f0f0f0' },
  { id: '5', name: '', icon: null, color: '#f0f0f0' },
  { id: '6', name: '', icon: null, color: '#f0f0f0' },
];

export default function AddAppScreen() {
  const router = useRouter();

  const renderItem = ({ item }: { item: typeof APPS[0] }) => (
    <Pressable 
      style={({ pressed }) => [
        styles.appItem,
        pressed && { opacity: 0.7 }
      ]}
      onPress={() => item.name ? router.push(`/connect-app?app=${item.name}`) : null}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        {item.icon && <Ionicons name={item.icon as any} size={32} color="#fff" />}
      </View>
      <Text style={styles.appName}>{item.name || ' '}</Text>
    </Pressable>
  );

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
      
      <Text style={styles.prompt}>Select an app to connect</Text>
      
      <FlatList
        data={APPS}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        numColumns={3}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.gridRow}
      />
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
  prompt: {
    fontSize: 16,
    color: '#666',
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  gridContent: {
    paddingHorizontal: 24,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  appItem: {
    alignItems: 'center',
    width: '30%',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
});
