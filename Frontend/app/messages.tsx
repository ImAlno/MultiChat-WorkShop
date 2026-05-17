import { StyleSheet, View, Text, FlatList, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppAvatar } from '@/components/AppAvatar';

// Dummy data for messages
const MESSAGES = [
  { id: '1', app: 'Discord', sender: 'Alice', text: 'Hey, are we still meeting later?', time: '10:42 AM' },
  { id: '2', app: 'Discord', sender: 'Bob', text: 'Just pushed the new update.', time: '09:15 AM' },
  { id: '3', app: 'Discord', sender: 'Charlie', text: 'Let me know what you think of the design.', time: 'Yesterday' },
  { id: '4', app: 'Discord', sender: 'David', text: 'This is a very long message that takes up multiple lines. I want to tell you all about the new features we just released today. First of all, the design is super clean and intentional. Secondly, we fixed all the bugs from last week! Let me know if you want to hop on a call to discuss the remaining items for this sprint.', time: 'Monday' },
];

export default function MessagesScreen() {
  const router = useRouter();

  const renderItem = ({ item }: { item: typeof MESSAGES[0] }) => (
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

      <FlatList
        data={MESSAGES}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
});
