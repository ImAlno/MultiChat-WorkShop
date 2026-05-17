import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ConnectionStep } from '@/components/ConnectionStep';
import { useConnectionGuide } from '@/hooks/useConnectionGuide';

export default function ConnectAppScreen() {
  const { app } = useLocalSearchParams();
  const appName = typeof app === 'string' ? app : 'App';
  
  const guide = useConnectionGuide(appName);

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
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.instructionsContainer}>
          <Text style={styles.title}>{guide.title}</Text>
          <Text style={styles.subtitle}>{guide.subtitle}</Text>
          
          {guide.steps.map((step) => (
            <ConnectionStep
              key={step.stepNumber}
              stepNumber={step.stepNumber}
              title={step.title}
              description={step.description}
              type={step.type}
              buttonText={step.buttonText}
              inputPlaceholder={step.inputPlaceholder}
              onSubmitInput={step.onSubmitInput}
              onPress={step.onPress}
            />
          ))}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '400',
    color: '#1a1a1a',
    letterSpacing: 0.5,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 32,
  },
  instructionsContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    lineHeight: 24,
  },
});
