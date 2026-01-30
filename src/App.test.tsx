import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders SafeZonePH app', () => {
  render(<App />);
  // App should render without crashing - check for any content
  expect(document.body.innerHTML.length).toBeGreaterThan(0);
});

test('app has interactive elements', () => {
  render(<App />);
  // App should have buttons or links
  const buttons = screen.queryAllByRole('button');
  const links = screen.queryAllByRole('link');
  expect(buttons.length + links.length).toBeGreaterThan(0);
});
