import { TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../providers/ThemeProvider';

type InterestChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function InterestChip({ label, selected = false, onPress }: InterestChipProps) {
  const c = useColors();
  const chipStyle = { marginRight: 8, marginBottom: 8, borderRadius: 999, overflow: 'hidden' as const };
  const gradientStyle = { paddingHorizontal: 14, paddingVertical: 7 };
  const selectedTextStyle = { color: '#ffffff', fontWeight: '600' as const, fontSize: 13 };
  const unselectedTextStyle = { color: c.textSecondary, fontWeight: '600' as const, fontSize: 13 };

  if (selected) {
    const content = (
      <LinearGradient colors={['#8875ff', '#c084fc']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={gradientStyle}>
        <Text style={selectedTextStyle}>{label}</Text>
      </LinearGradient>
    );
    if (onPress) {
      return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={chipStyle}>
          {content}
        </TouchableOpacity>
      );
    }
    return <LinearGradient colors={['#8875ff', '#c084fc']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[chipStyle, gradientStyle]}><Text style={selectedTextStyle}>{label}</Text></LinearGradient>;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[chipStyle, {
        paddingHorizontal: 14,
        paddingVertical: 7,
        backgroundColor: c.bgCardHover,
        borderWidth: 1,
        borderColor: c.border,
      }]}
    >
      <Text style={unselectedTextStyle}>{label}</Text>
    </TouchableOpacity>
  );
}
