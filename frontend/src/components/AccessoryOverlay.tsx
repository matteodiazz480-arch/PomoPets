import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Polygon, Rect, Stop } from 'react-native-svg';
import type { AccessoryCategory, AccessoryId } from '../data/accessories';
import { accessoryOverlayStyles } from '../style';

type Props = {
  equipped: Partial<Record<AccessoryCategory, AccessoryId>>;
  size: number;
};

function AccessoryDefs() {
  return (
    <Defs>
      <LinearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#FFF2A3" />
        <Stop offset="50%" stopColor="#FFD23F" />
        <Stop offset="100%" stopColor="#E09F00" />
      </LinearGradient>

      <LinearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor="#FF6B6B" />
        <Stop offset="100%" stopColor="#D93838" />
      </LinearGradient>

      <LinearGradient id="scarfGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#FF9F5A" />
        <Stop offset="100%" stopColor="#E06D2B" />
      </LinearGradient>

      <LinearGradient id="glassReflectionGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.42" />
        <Stop offset="35%" stopColor="#E0F4FF" stopOpacity="0.14" />
        <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.02" />
      </LinearGradient>

      <LinearGradient id="sunglassLensGrad" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor="#1E202B" stopOpacity="0.88" />
        <Stop offset="100%" stopColor="#12131A" stopOpacity="0.76" />
      </LinearGradient>
    </Defs>
  );
}

function renderAccessoryShape(id: AccessoryId) {
  switch (id) {
    case 'crown_gold':
      return (
        <G>
          <Polygon
            points="-30,10 -36,-16 -12,-4 0,-24 12,-4 36,-16 30,10"
            fill="url(#goldGrad)"
            stroke="#262B44"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <Rect x="-30" y="7" width="60" height="7" rx="3" fill="#E09F00" stroke="#262B44" strokeWidth="2.5" />
          <Circle cx="0" cy="-6" r="4.5" fill="#FF4757" stroke="#262B44" strokeWidth="2" />
          <Circle cx="-18" cy="-2" r="3.2" fill="#2ED573" stroke="#262B44" strokeWidth="1.8" />
          <Circle cx="18" cy="-2" r="3.2" fill="#1E90FF" stroke="#262B44" strokeWidth="1.8" />
          <Circle cx="-1.2" cy="-7.5" r="1.3" fill="#FFFFFF" />
        </G>
      );

    case 'hat_party':
      return (
        <G>
          <Polygon
            points="-19,12 0,-22 19,12"
            fill="#FFC94A"
            stroke="#262B44"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <Path d="M -12,1 L 12,4" stroke="#FF6B8B" strokeWidth="4" strokeLinecap="round" />
          <Path d="M -6,-10 L 6,-7" stroke="#48DBFB" strokeWidth="3.5" strokeLinecap="round" />
          <Circle cx="0" cy="-24" r="5" fill="#FF4757" stroke="#262B44" strokeWidth="2.5" />
          <Circle cx="-1.5" cy="-25.5" r="1.5" fill="#FFFFFF" />
          <Ellipse cx="0" cy="12" rx="19" ry="4.2" fill="#6FCF97" stroke="#262B44" strokeWidth="2.5" />
        </G>
      );

    case 'flower_pin':
      return (
        <G>
          <Circle cx="0" cy="-10" r="7.5" fill="#FFB8D2" stroke="#262B44" strokeWidth="2.4" />
          <Circle cx="9.5" cy="-3" r="7.5" fill="#FFB8D2" stroke="#262B44" strokeWidth="2.4" />
          <Circle cx="6" cy="8" r="7.5" fill="#FFB8D2" stroke="#262B44" strokeWidth="2.4" />
          <Circle cx="-6" cy="8" r="7.5" fill="#FFB8D2" stroke="#262B44" strokeWidth="2.4" />
          <Circle cx="-9.5" cy="-3" r="7.5" fill="#FFB8D2" stroke="#262B44" strokeWidth="2.4" />
          <Circle cx="0" cy="0" r="5.5" fill="#FFEAA7" stroke="#262B44" strokeWidth="2.2" />
          <Circle cx="-1.5" cy="-1.5" r="1.6" fill="#FFFFFF" />
        </G>
      );

    case 'glasses_round':
      return (
        <G>
          <Path
            d="M -9,-1 Q 0,-6 9,-1"
            fill="none"
            stroke="#262B44"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <Path d="M -39,0 L -45,-3" stroke="#262B44" strokeWidth="2.8" strokeLinecap="round" />
          <Path d="M 39,0 L 45,-3" stroke="#262B44" strokeWidth="2.8" strokeLinecap="round" />

          <Circle
            cx="-24"
            cy="0"
            r="15"
            fill="url(#glassReflectionGrad)"
            stroke="#262B44"
            strokeWidth="3"
          />
          <Path
            d="M -31,-8 L -21,-2"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.92"
          />
          <Circle cx="-16" cy="7" r="1.4" fill="#FFFFFF" opacity="0.85" />

          <Circle
            cx="24"
            cy="0"
            r="15"
            fill="url(#glassReflectionGrad)"
            stroke="#262B44"
            strokeWidth="3"
          />
          <Path
            d="M 17,-8 L 27,-2"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.92"
          />
          <Circle cx="32" cy="7" r="1.4" fill="#FFFFFF" opacity="0.85" />
        </G>
      );

    case 'glasses_cool':
      return (
        <G>
          <Path
            d="M -38,-6 L -9,-6 C -7,2 -8,12 -24,13 C -38,13 -40,4 -38,-6 Z"
            fill="url(#sunglassLensGrad)"
          />
          <Path
            d="M -34,-3 L -20,9"
            stroke="#FFFFFF"
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity="0.55"
          />

          <Path
            d="M 9,-6 L 38,-6 C 40,4 38,13 24,13 C 8,12 7,2 9,-6 Z"
            fill="url(#sunglassLensGrad)"
          />
          <Path
            d="M 14,-3 L 28,9"
            stroke="#FFFFFF"
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity="0.55"
          />

          <Path
            d="M -42,-7 L -9,-7 L -5,-4 L 5,-4 L 9,-7 L 42,-7 C 45,-3 43,14 24,15 C 8,16 6,7 4,3 L -4,3 C -6,7 -8,16 -24,15 C -43,14 -45,-3 -42,-7 Z"
            fill="none"
            stroke="#262B44"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          <Circle cx="-39" cy="-5" r="1.4" fill="#FFF2A3" />
          <Circle cx="39" cy="-5" r="1.4" fill="#FFF2A3" />
        </G>
      );

    case 'bowtie_red':
      return (
        <G>
          <Polygon
            points="-22,-11 0,-2 -22,11 -25,0"
            fill="url(#redGrad)"
            stroke="#262B44"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          <Polygon
            points="22,-11 0,-2 22,11 25,0"
            fill="url(#redGrad)"
            stroke="#262B44"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          <Rect
            x="-6.5"
            y="-6.5"
            width="13"
            height="13"
            rx="4"
            fill="#FF4757"
            stroke="#262B44"
            strokeWidth="2.8"
          />
          <Circle cx="-1.5" cy="-2" r="1.6" fill="#FFD1D1" />
        </G>
      );

    case 'scarf_cozy':
      return (
        <G>
          <Path
            d="M -32,-4 C -12,8 12,8 32,-4 C 38,4 30,13 18,15 C 0,17 -18,15 -34,6 Z"
            fill="url(#scarfGrad)"
            stroke="#262B44"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          <Path d="M -16,3 L -12,14" stroke="#FFF3D6" strokeWidth="3.5" strokeLinecap="round" />
          <Path d="M 6,5 L 10,14" stroke="#FFF3D6" strokeWidth="3.5" strokeLinecap="round" />
          <Path
            d="M 10,11 L 15,35 C 15,38 26,38 26,35 L 24,11 Z"
            fill="url(#scarfGrad)"
            stroke="#262B44"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          <Path d="M 12,20 L 24,20" stroke="#FFF3D6" strokeWidth="3.2" />
          <Path d="M 14,28 L 25,28" stroke="#FFF3D6" strokeWidth="3.2" />
        </G>
      );
  }
}

export function AccessoryPreview({ id, size = 56 }: { id: AccessoryId; size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="-52 -46 104 92">
        <AccessoryDefs />
        {renderAccessoryShape(id)}
      </Svg>
    </View>
  );
}

export default function AccessoryOverlay({ equipped, size }: Props) {
  const hasHead = !!equipped.head;
  const hasFace = !!equipped.face;
  const hasNeck = !!equipped.neck;

  if (!hasHead && !hasFace && !hasNeck) return null;

  return (
    <View pointerEvents="none" style={[accessoryOverlayStyles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 220 220" style={{ overflow: 'visible' }}>
        <AccessoryDefs />

        {equipped.head === 'crown_gold' && (
          <G transform="translate(110, 34)">{renderAccessoryShape('crown_gold')}</G>
        )}
        {equipped.head === 'hat_party' && (
          <G transform="translate(110, 36)">{renderAccessoryShape('hat_party')}</G>
        )}
        {equipped.head === 'flower_pin' && (
          <G transform="translate(76, 48)">{renderAccessoryShape('flower_pin')}</G>
        )}

        {equipped.face === 'glasses_round' && (
          <G transform="translate(110, 84)">{renderAccessoryShape('glasses_round')}</G>
        )}
        {equipped.face === 'glasses_cool' && (
          <G transform="translate(110, 84)">{renderAccessoryShape('glasses_cool')}</G>
        )}

        {equipped.neck === 'bowtie_red' && (
          <G transform="translate(110, 124)">{renderAccessoryShape('bowtie_red')}</G>
        )}
        {equipped.neck === 'scarf_cozy' && (
          <G transform="translate(110, 122)">{renderAccessoryShape('scarf_cozy')}</G>
        )}
      </Svg>
    </View>
  );
}
