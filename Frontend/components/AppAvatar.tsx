import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AppAvatarProps {
  appName: string;
  size?: number;
}

const getAppIcon = (appName: string) => {
  switch (appName?.toLowerCase()) {
    case 'discord': return 'logo-discord';
    case 'slack': return 'logo-slack';
    case 'twitter': return 'logo-twitter';
    default: return 'chatbubble-outline';
  }
};

const getAppColor = (appName: string) => {
  switch (appName?.toLowerCase()) {
    case 'discord': return '#5865F2';
    case 'slack': return '#4A154B';
    case 'twitter': return '#1DA1F2';
    default: return '#666';
  }
};

export function AppAvatar({ appName, size = 24 }: AppAvatarProps) {
  const containerSize = size * 2;
  const borderRadius = containerSize / 2;

  return (
    <View style={[
      styles.avatar,
      { width: containerSize, height: containerSize, borderRadius }
    ]}>
      <Ionicons name={getAppIcon(appName) as any} size={size} color={getAppColor(appName)} />
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
});
