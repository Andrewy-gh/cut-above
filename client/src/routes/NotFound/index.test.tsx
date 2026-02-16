import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@/test/test-utils';
import NotFound from './index';

describe('NotFound', () => {
  it('renders a generic 404 message and a home link', () => {
    render(<NotFound />);

    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go back home/i })).toHaveAttribute('href', '/');
  });
});
