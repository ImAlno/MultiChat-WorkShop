import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useRouter } from 'expo-router';
import { useEventListener } from 'expo';

const videoSource = require('../assets/video/ChatBundleVid.mp4');

export default function LoginScreen() {
  const router = useRouter();

  const player = useVideoPlayer(videoSource);

  // Auto-navigate when video finishes
  useEventListener(player, 'playToEnd', () => {
    router.replace('/messages');
  });

  useEffect(() => {
    if (player) {
      player.loop = false;
      player.play();
    }
  }, [player]);

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
