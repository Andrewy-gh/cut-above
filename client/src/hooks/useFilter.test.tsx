import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import dayjs from 'dayjs';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';

import { createTestStore } from '@/test/test-utils';
import { useFilter } from './useFilter';

vi.mock('@/hooks/useEmployeesQuery', () => ({
  useEmployeesQuery: () => ({
    employees: [],
    employee: null,
    isLoading: false,
  }),
}));

describe('useFilter', () => {
  it('stores date as YYYY-MM-DD', () => {
    const store = createTestStore();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useFilter(), { wrapper });

    act(() => {
      result.current.handleDateChange(dayjs('2026-02-12T12:00:00Z'));
    });

    expect(store.getState().filter.date).toBe('2026-02-12');
  });
});
