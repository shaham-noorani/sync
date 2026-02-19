import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center bg-dark-900 px-6">
          <Text className="text-2xl font-bold text-dark-50 mb-2">
            Something went wrong
          </Text>
          <Text className="text-dark-300 text-center mb-6">
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity
            className="bg-amber-500 rounded-xl px-6 py-3"
            onPress={this.handleReset}
          >
            <Text className="text-dark-900 font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
