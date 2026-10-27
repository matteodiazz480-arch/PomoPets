import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type Props = {
  visible: boolean;
  onClose?: () => void;
  align?: 'center' | 'bottom';
  children: React.ReactNode;
  overlayChildren?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

export default function BlurredModal({
  visible,
  onClose,
  align = 'center',
  children,
  overlayChildren,
  contentStyle,
}: Props) {
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.92)).current;
  const cardTranslateY = useRef(new Animated.Value(align === 'bottom' ? 36 : 18)).current;

  useEffect(() => {
    if (visible) {
      backdropOpacity.setValue(0);
      cardScale.setValue(0.92);
      cardTranslateY.setValue(align === 'bottom' ? 36 : 18);

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
          toValue: 1,
          friction: 7,
          tension: 170,
          useNativeDriver: true,
        }),
        Animated.spring(cardTranslateY, {
          toValue: 0,
          friction: 7,
          tension: 170,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, align, backdropOpacity, cardScale, cardTranslateY]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={[styles.container, align === 'bottom' ? styles.alignBottom : styles.alignCenter]}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View
            style={[
              styles.backdrop,
              { opacity: backdropOpacity },
            ]}
          />
        </TouchableWithoutFeedback>

        {overlayChildren}

        <Animated.View
          style={[
            styles.contentWrap,
            align === 'bottom' ? styles.contentBottom : styles.contentCenter,
            contentStyle,
            {
              opacity: backdropOpacity,
              transform: [{ translateY: cardTranslateY }, { scale: cardScale }],
            },
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  alignCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alignBottom: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(54, 42, 34, 0.38)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        } as any)
      : {}),
  },
  contentWrap: {
    width: '100%',
    zIndex: 10,
  },
  contentCenter: {
    maxWidth: 420,
    alignItems: 'center',
  },
  contentBottom: {
    maxWidth: 560,
  },
});
