import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { InterestChip } from '../../components/ui/InterestChip';

describe('InterestChip', () => {
  it('renders the label', () => {
    const { getByText } = render(<InterestChip label="Hiking" />);
    expect(getByText('Hiking')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <InterestChip label="Coffee" onPress={onPress} />
    );
    fireEvent.press(getByText('Coffee'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders selected and unselected states', () => {
    const { getByText, rerender } = render(
      <InterestChip label="Gaming" selected={false} />
    );
    expect(getByText('Gaming')).toBeTruthy();

    rerender(<InterestChip label="Gaming" selected={true} />);
    expect(getByText('Gaming')).toBeTruthy();
  });
});
