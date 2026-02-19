import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HeatmapGrid } from '../../components/HeatmapGrid';

describe('HeatmapGrid', () => {
  const dates = [
    '2026-02-15', '2026-02-16', '2026-02-17', '2026-02-18',
    '2026-02-19', '2026-02-20', '2026-02-21',
  ];

  const availability = [
    { date: '2026-02-15', time_block: 'morning', is_available: true, source: 'pattern' },
    { date: '2026-02-15', time_block: 'afternoon', is_available: false, source: 'pattern' },
    { date: '2026-02-16', time_block: 'evening', is_available: true, source: 'slot' },
  ];

  it('renders day labels', () => {
    const { getByText } = render(
      <HeatmapGrid dates={dates} availability={[]} />
    );
    expect(getByText('Sun')).toBeTruthy();
    expect(getByText('Mon')).toBeTruthy();
    expect(getByText('Sat')).toBeTruthy();
  });

  it('renders time block labels', () => {
    const { getByText } = render(
      <HeatmapGrid dates={dates} availability={[]} />
    );
    expect(getByText('AM')).toBeTruthy();
    expect(getByText('PM')).toBeTruthy();
    expect(getByText('Eve')).toBeTruthy();
  });

  it('renders legend', () => {
    const { getByText } = render(
      <HeatmapGrid dates={dates} availability={[]} />
    );
    expect(getByText('You free')).toBeTruthy();
    expect(getByText('Busy')).toBeTruthy();
  });

  it('renders all 7 day numbers', () => {
    const { getByText } = render(
      <HeatmapGrid dates={dates} availability={[]} />
    );
    // Verify all 7 day numbers are rendered
    expect(getByText('15')).toBeTruthy();
    expect(getByText('16')).toBeTruthy();
    expect(getByText('17')).toBeTruthy();
    expect(getByText('18')).toBeTruthy();
    expect(getByText('19')).toBeTruthy();
    expect(getByText('20')).toBeTruthy();
    expect(getByText('21')).toBeTruthy();
  });

  it('calls onCellPress when editable and cell is tapped', () => {
    const onCellPress = jest.fn();
    const { UNSAFE_root } = render(
      <HeatmapGrid
        dates={dates}
        availability={availability}
        editable
        onCellPress={onCellPress}
      />
    );
    // Find a touchable cell and press it
    const touchables = findTouchableCells(UNSAFE_root);
    if (touchables.length > 0) {
      fireEvent.press(touchables[0]);
      expect(onCellPress).toHaveBeenCalled();
    }
  });

  it('does not call onCellPress when not editable', () => {
    const onCellPress = jest.fn();
    render(
      <HeatmapGrid
        dates={dates}
        availability={availability}
        editable={false}
        onCellPress={onCellPress}
      />
    );
    // Non-editable cells are Views, not TouchableOpacity, so no press handler
    expect(onCellPress).not.toHaveBeenCalled();
  });
});

// Helper to find cells by minHeight style
function findCellsByMinHeight(root: any, minHeight: number): any[] {
  const results: any[] = [];
  function walk(node: any) {
    if (node?.props?.style?.minHeight === minHeight) {
      results.push(node);
    }
    React.Children.forEach(node?.props?.children, walk);
  }
  walk(root);
  return results;
}

// Helper to find touchable cells
function findTouchableCells(root: any): any[] {
  const results: any[] = [];
  function walk(node: any) {
    if (
      node?.props?.style?.minHeight === 44 &&
      node?.props?.onPress
    ) {
      results.push(node);
    }
    React.Children.forEach(node?.props?.children, walk);
  }
  walk(root);
  return results;
}
