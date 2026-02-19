import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { WeekNavigator } from '../../components/WeekNavigator';

describe('WeekNavigator', () => {
  it('renders the week label', () => {
    const { getByText } = render(
      <WeekNavigator label="Feb 15 – 21" onPrev={() => {}} onNext={() => {}} />
    );
    expect(getByText('Feb 15 – 21')).toBeTruthy();
  });

  it('calls onPrev when back arrow is pressed', () => {
    const onPrev = jest.fn();
    const { UNSAFE_getAllByType } = render(
      <WeekNavigator label="Feb 15 – 21" onPrev={onPrev} onNext={() => {}} />
    );
    // First touchable is the back button
    const touchables = UNSAFE_getAllByType(
      require('react-native').TouchableOpacity
    );
    fireEvent.press(touchables[0]);
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it('calls onNext when forward arrow is pressed', () => {
    const onNext = jest.fn();
    const { UNSAFE_getAllByType } = render(
      <WeekNavigator label="Feb 15 – 21" onPrev={() => {}} onNext={onNext} />
    );
    const touchables = UNSAFE_getAllByType(
      require('react-native').TouchableOpacity
    );
    fireEvent.press(touchables[1]);
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
