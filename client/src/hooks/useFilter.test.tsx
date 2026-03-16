import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import dayjs from 'dayjs';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';

import { createTestStore } from '@/test/test-utils';
import type { Employee, Slot } from '@/types';
import { getInitialCurrentDate } from '@/utils/date';
import { useFilter } from './useFilter';

let employeesMock: Employee[] = [];

vi.mock('@/hooks/useEmployeesQuery', () => ({
  useEmployeesQuery: () => ({
    employees: employeesMock,
    employee: null,
    isLoading: false,
  }),
}));

describe('useFilter', () => {
  beforeEach(() => {
    employeesMock = [];
  });

  const makeWrapper = (store: ReturnType<typeof createTestStore>) =>
    function Wrapper({ children }: { children: ReactNode }) {
      return <Provider store={store}>{children}</Provider>;
    };

  it('stores date as YYYY-MM-DD', () => {
    const store = createTestStore();
    const wrapper = makeWrapper(store);

    const { result } = renderHook(() => useFilter(), { wrapper });

    act(() => {
      result.current.handleDateChange(dayjs('2026-02-12T12:00:00Z'));
    });

    expect(store.getState().filter.date).toBe('2026-02-12');
  });

  it('sets employee from employees list by id (and clears on undefined)', () => {
    employeesMock = [
      { id: 'e1', firstName: 'A' },
      { id: 'e2', firstName: 'B' },
    ];

    const store = createTestStore();
    const wrapper = makeWrapper(store);
    const { result } = renderHook(() => useFilter(), { wrapper });

    act(() => {
      result.current.handleEmployeeChange('e2');
    });
    expect(store.getState().filter.employee).toEqual({ id: 'e2', firstName: 'B' });

    act(() => {
      result.current.handleEmployeeChange(undefined);
    });
    expect(store.getState().filter.employee).toBeUndefined();
  });

  it('sets service when serviceId is valid (no-op on invalid id)', () => {
    const store = createTestStore();
    const wrapper = makeWrapper(store);
    const { result } = renderHook(() => useFilter(), { wrapper });

    const initialService = store.getState().filter.service;

    act(() => {
      result.current.handleServiceChange(2);
    });
    expect(store.getState().filter.service).toEqual({
      id: 2,
      name: 'Beard Trim',
      duration: 15,
    });

    act(() => {
      result.current.handleServiceChange(999);
    });
    expect(store.getState().filter.service).toEqual({
      id: 2,
      name: 'Beard Trim',
      duration: 15,
    });

    expect(initialService).toEqual({ id: 1, name: 'Haircut', duration: 30 });
  });

  it('resets filter state back to defaults', () => {
    employeesMock = [{ id: 'e1', firstName: 'A' }];

    const store = createTestStore();
    const wrapper = makeWrapper(store);
    const { result } = renderHook(() => useFilter(), { wrapper });

    act(() => {
      result.current.handleDateChange(dayjs('2026-02-12T12:00:00Z'));
      result.current.handleServiceChange(3);
      result.current.handleEmployeeChange('e1');
    });

    expect(store.getState().filter.date).toBe('2026-02-12');
    expect(store.getState().filter.service).toEqual({
      id: 3,
      name: 'Straight Razor Shave',
      duration: 15,
    });
    expect(store.getState().filter.employee).toEqual({ id: 'e1', firstName: 'A' });

    act(() => {
      result.current.handleFilterReset();
    });

    expect(store.getState().filter.date).toBe(getInitialCurrentDate());
    expect(store.getState().filter.employee).toBeUndefined();
    expect(store.getState().filter.service).toEqual({ id: 1, name: 'Haircut', duration: 30 });
  });

  it('stores selection locally (not in redux)', () => {
    const store = createTestStore();
    const wrapper = makeWrapper(store);
    const { result } = renderHook(() => useFilter(), { wrapper });

    const slot: Slot = {
      id: 's1',
      start: dayjs('2026-02-12T10:00:00Z'),
      end: dayjs('2026-02-12T10:30:00Z'),
      available: [],
    };

    expect(result.current.selection).toEqual({});

    act(() => {
      result.current.handleSelectionChange(slot);
    });

    const selection = result.current.selection as Slot;
    expect(selection.id).toBe('s1');
    expect(dayjs.isDayjs(selection.start)).toBe(true);
  });
});
