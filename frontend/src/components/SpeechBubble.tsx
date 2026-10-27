import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { speechBubbleStyles } from '../style';

type Props = {
  text: string;
  large?: boolean;
};

export default function SpeechBubble({ text, large = false }: Props) {
  const pop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    pop.setValue(0);
    Animated.spring(pop, { toValue: 1, friction: 6, tension: 90, useNativeDriver: true }).start();
  }, [text, pop]);

  const scale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });
  const opacity = pop;

  return (
    <Animated.View style={[speechBubbleStyles.wrap, large && speechBubbleStyles.largeWrap, { opacity, transform: [{ scale }] }]}>
      <View style={[speechBubbleStyles.bubble, large && speechBubbleStyles.largeBubble]}>
        <Text style={[speechBubbleStyles.text, large && speechBubbleStyles.largeText]}>{text}</Text>
      </View>
      <View style={speechBubbleStyles.tailShadow} />
      <View style={speechBubbleStyles.tail} />
    </Animated.View>
  );
}
