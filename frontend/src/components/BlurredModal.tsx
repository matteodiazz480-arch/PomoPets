import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  TouchableWithoutFeedback,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { blurredModalStyles } from '../style';

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
  const cardScale = useRef(new Animated.Value(0.95)).current;
  const cardTranslateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    if (visible) {
      cardScale.setValue(0.95);
      cardTranslateY.setValue(align === 'bottom' ? 24 : 12);

      Animated.parallel([
        Animated.spring(cardScale, {
          toValue: 1,
          friction: 8,
          tension: 220,
          useNativeDriver: true,
        }),
        Animated.spring(cardTranslateY, {
          toValue: 0,
          friction: 8,
          tension: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, align, cardScale, cardTranslateY]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View
        style={[
          blurredModalStyles.container,
          align === 'bottom' ? blurredModalStyles.alignBottom : blurredModalStyles.alignCenter,
        ]}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={blurredModalStyles.backdrop} />
        </TouchableWithoutFeedback>

        {overlayChildren}

        <Animated.View
          style={[
            blurredModalStyles.contentWrap,
            align === 'bottom' ? blurredModalStyles.contentBottom : blurredModalStyles.contentCenter,
            contentStyle,
            {
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
