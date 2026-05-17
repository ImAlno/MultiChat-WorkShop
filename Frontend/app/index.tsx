import { StyleSheet, View } from 'react-native';
import { VideoView } from 'expo-video';
import { useAutoVideoPlayer } from '@/hooks/useAutoVideoPlayer';

const videoSource = require('../assets/videos/ChatBundleVid.mp4');

export default function LoginScreen() {
  const player = useAutoVideoPlayer(videoSource, '/messages');

  return (
    <View style={styles.container}>
      <VideoView
        style={styles.video}
        player={player}
        fullscreenOptions={{ enable: false }}
        allowsPictureInPicture={false}
        nativeControls={false}
        contentFit="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
});
