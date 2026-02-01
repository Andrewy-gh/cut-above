import { describe, it, expect, vi, afterEach, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '@/components/ErrorBoundary';

const ProblemChild = () => {
  throw new Error('Boom');
};

describe('ErrorBoundary', () => {
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    errorSpy.mockClear();
  });
  afterAll(() => {
    errorSpy.mockRestore();
  });

  it('renders fallback UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /something went wrong/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/boom/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reload/i })).toBeInTheDocument();
  });
});
