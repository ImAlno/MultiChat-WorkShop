import { useEffect } from 'react';
import { useVideoPlayer } from 'expo-video';
import { useRouter } from 'expo-router';
import { useEventListener } from 'expo';

export function useAutoVideoPlayer(videoSource: any, targetRoute: string) {
  const router = useRouter();
  const player = useVideoPlayer(videoSource);

  useEventListener(player, 'playToEnd', () => {
    router.replace(targetRoute as any);
  });

  useEffect(() => {
    if (player) {
      player.loop = false;
      player.play();
    }
  }, [player]);

  return player;
}
