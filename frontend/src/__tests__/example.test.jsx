/**
 * Verification test to ensure Vitest setup is working correctly
 * Tests the Header component with basic rendering
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Header from '../components/common/Header';

describe('Header Component', () => {
  it('renders the application title', () => {
    render(<Header />);
    const titleElement = screen.getByText('Pixel Prompt');
    expect(titleElement).toBeInTheDocument();
  });

  it('renders the tagline', () => {
    render(<Header />);
    const taglineElement = screen.getByText('Text-to-Image Variety Pack');
    expect(taglineElement).toBeInTheDocument();
  });

  it('renders a header element', () => {
    render(<Header />);
    const headerElement = screen.getByRole('banner');
    expect(headerElement).toBeInTheDocument();
  });
});
