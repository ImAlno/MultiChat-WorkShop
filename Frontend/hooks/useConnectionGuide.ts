import * as WebBrowser from 'expo-web-browser';
import { Alert } from 'react-native';

export type StepType = 'link' | 'input' | 'instruction';

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

const DISCORD_AUTH_URL = 'https://discord.com/oauth2/authorize?client_id=1505124790019690578&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fdiscord%2Fcallback&scope=identify+guilds+guilds.members.read';
const DISCORD_BOT_URL = 'https://discord.com/oauth2/authorize?client_id=1505124790019690578&permissions=66560&integration_type=0&scope=bot+applications.commands';

export function useConnectionGuide(appName: string): ConnectionGuide {
  const handleOpenBrowser = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error('Failed to open browser:', error);
    }
  };

  const name = appName.toLowerCase();

  if (name === 'discord') {
    return {
      title: 'Connect Discord',
      subtitle: 'Complete these two steps to sync your messages.',
      steps: [
        {
          stepNumber: 1,
          title: 'Authenticate Account',
          description: 'Log in securely to verify your identity.',
          type: 'link',
          buttonText: 'Authenticate for Discord',
          onPress: () => handleOpenBrowser(DISCORD_AUTH_URL),
        },
        {
          stepNumber: 2,
          title: 'Add the Bot',
          description: 'Select which server you want to gather messages from.',
          type: 'link',
          buttonText: 'Choose what server',
          onPress: () => handleOpenBrowser(DISCORD_BOT_URL),
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
