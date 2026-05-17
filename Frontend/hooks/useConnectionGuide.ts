import * as WebBrowser from 'expo-web-browser';
import { Alert } from 'react-native';
import * as Linking from 'expo-linking';

export type StepType = 'link' | 'input' | 'instruction' | 'custom';

export interface ConnectionStepData {
  stepNumber: number;
  title: string;
  description: string;
  type: StepType;
  buttonText?: string;
  inputPlaceholder?: string;
  onSubmitInput?: (value: string) => Promise<void>;
  onPress?: () => void;
}

interface ConnectionGuide {
  title: string;
  subtitle: string;
  steps: ConnectionStepData[];
}

const DISCORD_REDIRECT_URI = 'https://blackscreen.app';
const DISCORD_AUTH_URL = `https://discord.com/oauth2/authorize?client_id=1505124790019690578&response_type=code&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&scope=identify+guilds`;
const DISCORD_BOT_URL = 'https://discord.com/oauth2/authorize?client_id=1505124790019690578&permissions=66560&integration_type=0&scope=bot+applications.commands';

export interface ConnectionGuideOptions {
  onDiscordAuth?: (authUrl: string, redirectUri: string) => void;
}

export function useConnectionGuide(appName: string, options?: ConnectionGuideOptions): ConnectionGuide {
  const handleOpenBrowser = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error('Failed to open browser:', error);
    }
  };

  const handleDiscordAuth = async () => {
    if (options?.onDiscordAuth) {
      options.onDiscordAuth(DISCORD_AUTH_URL, DISCORD_REDIRECT_URI);
      return;
    }

    try {
      const result = await WebBrowser.openAuthSessionAsync(
        DISCORD_AUTH_URL,
        DISCORD_REDIRECT_URI
      );

      if (result.type === 'success') {
        const redirectedUrl = result.url;
        console.log('Redirect URL captured:', redirectedUrl);

        // Parse the code out of the URL
        const parsed = Linking.parse(redirectedUrl);
        const code = parsed.queryParams?.code as string | undefined;
        console.log('Auth code:', code);

        // TODO: send `code` to your backend to exchange for a token
      } else {
        console.log('Auth cancelled or failed:', result.type);
      }
    } catch (error) {
      console.error('Failed to open auth browser:', error);
    }
  };

  const name = appName.toLowerCase();

  if (name === 'discord') {
    return {
      title: 'Connect Discord',
      subtitle: 'Complete these steps to sync your server messages.',
      steps: [
        {
          stepNumber: 1,
          title: 'Authenticate Account',
          description: 'Log in securely to verify your identity.',
          type: 'link',
          buttonText: 'Authenticate for Discord',
          onPress: handleDiscordAuth,
        },
        {
          stepNumber: 2,
          title: 'Add the Bot',
          description: 'Invite the bot to your Discord server so it can fetch messages.',
          type: 'link',
          buttonText: 'Add Bot to Server',
          onPress: () => handleOpenBrowser(DISCORD_BOT_URL),
        },
        {
          stepNumber: 3,
          title: 'Choose a Guild',
          description: 'Select which server you want to gather messages from.',
          type: 'custom',
        },
        {
          stepNumber: 4,
          title: 'Choose a Channel',
          description: 'Select the text channel where messages should be synced.',
          type: 'custom',
        },
      ],
    };
  }

  return {
    title: `Connect ${appName}`,
    subtitle: `Instructions to connect your ${appName} account.`,
    steps: [],
  };
}
