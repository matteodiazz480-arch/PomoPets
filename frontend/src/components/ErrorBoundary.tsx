import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { errorBoundaryStyles } from '../style';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {}

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorBoundaryStyles.container}>
          <Text style={errorBoundaryStyles.title}>¡Ups! Algo salió mal</Text>
          <Text style={errorBoundaryStyles.message}>
            Ocurrió un error inesperado al actualizar la vista. Presioná para volver a intentar.
          </Text>
          <TouchableOpacity style={errorBoundaryStyles.button} activeOpacity={0.8} onPress={this.handleReset}>
            <Text style={errorBoundaryStyles.buttonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}
