import { useState } from 'react';
import { StyleSheet, View, Text, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ConnectionStepProps {
  stepNumber: string | number;
  title: string;
  description: string;
  type: 'link' | 'input' | 'instruction' | 'custom';
  buttonText?: string;
  onPress?: () => void;
  inputPlaceholder?: string;
  onSubmitInput?: (value: string) => Promise<void>;
  isCompleted?: boolean;
  children?: React.ReactNode;
}

export function ConnectionStep({
  stepNumber,
  title,
  description,
  type,
  buttonText = 'Submit',
  onPress,
  inputPlaceholder,
  onSubmitInput,
  isCompleted = false,
  children,
}: ConnectionStepProps) {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (onSubmitInput) {
      setIsLoading(true);
      try {
        await onSubmitInput(inputValue);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <View style={[styles.stepContainer, isCompleted && styles.stepContainerCompleted]}>
      <View style={styles.stepHeader}>
        <View style={[styles.stepBadge, isCompleted && styles.stepBadgeCompleted]}>
          {isCompleted ? (
            <Ionicons name="checkmark" size={14} color="#fff" />
          ) : (
            <Text style={styles.stepBadgeText}>{stepNumber}</Text>
          )}
        </View>
        <Text style={[styles.stepTitle, isCompleted && styles.stepTitleCompleted]}>{title}</Text>
      </View>
      <Text style={styles.stepDescription}>{description}</Text>

      {type === 'link' && onPress && (
        <Pressable 
          style={({ pressed }) => [
            styles.button,
            isCompleted && styles.buttonCompleted,
            pressed && !isCompleted && styles.buttonPressed
          ]} 
          onPress={isCompleted ? undefined : onPress}
          disabled={isCompleted}
        >
          <Text style={[styles.buttonText, isCompleted && styles.buttonTextCompleted]}>
            {isCompleted ? 'Completed ✓' : buttonText}
          </Text>
        </Pressable>
      )}

      {type === 'input' && onSubmitInput && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder={inputPlaceholder}
            placeholderTextColor="#999"
            value={inputValue}
            onChangeText={setInputValue}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
          <Pressable 
            style={({ pressed }) => [
              styles.button, 
              styles.inputButton,
              pressed && styles.buttonPressed,
              isLoading && styles.buttonDisabled
            ]} 
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={[styles.buttonText, styles.inputButtonText]}>{buttonText}</Text>
            )}
          </Pressable>
        </View>
      )}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    marginBottom: 32,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  stepDescription: {
    fontSize: 15,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  inputContainer: {
    gap: 16,
  },
  textInput: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a1a1a',
  },
  button: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  inputButton: {
    backgroundColor: '#1a1a1a',
    borderColor: '#1a1a1a',
  },
  buttonPressed: {
    backgroundColor: '#ebebeb',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  inputButtonText: {
    color: '#fff',
  },
  stepContainerCompleted: {
    borderColor: '#e8f7ed',
    backgroundColor: '#fafdfb',
  },
  stepBadgeCompleted: {
    backgroundColor: '#2ecc71',
  },
  stepTitleCompleted: {
    color: '#2ecc71',
    fontWeight: '600',
  },
  buttonCompleted: {
    backgroundColor: '#e8f7ed',
    borderColor: '#d1f2db',
  },
  buttonTextCompleted: {
    color: '#2ecc71',
    fontWeight: '600',
  },
});
