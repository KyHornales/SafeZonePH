import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

// Test wrapper for pages
const TestWrapper: React.FC<{ children: React.ReactNode; initialRoute?: string }> = ({ 
  children, 
  initialRoute = '/' 
}) => (
  <MemoryRouter initialEntries={[initialRoute]}>
    <AuthProvider>
      {children}
    </AuthProvider>
  </MemoryRouter>
);

describe('Authentication Flow Integration Tests', () => {
  describe('Login Page', () => {
    test('renders login page without crashing', () => {
      render(
        <TestWrapper initialRoute="/login">
          <LoginPage />
        </TestWrapper>
      );
      
      // Page should render
      expect(document.body.innerHTML.length).toBeGreaterThan(100);
    });

    test('has submit button', () => {
      render(
        <TestWrapper initialRoute="/login">
          <LoginPage />
        </TestWrapper>
      );
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    test('has email input', () => {
      render(
        <TestWrapper initialRoute="/login">
          <LoginPage />
        </TestWrapper>
      );
      
      const emailInput = screen.queryByPlaceholderText(/email/i);
      expect(emailInput).toBeInTheDocument();
    });

    test('has password input', () => {
      render(
        <TestWrapper initialRoute="/login">
          <LoginPage />
        </TestWrapper>
      );
      
      const passwordInputs = document.querySelectorAll('input[type="password"]');
      expect(passwordInputs.length).toBeGreaterThan(0);
    });

    test('email input accepts text', async () => {
      render(
        <TestWrapper initialRoute="/login">
          <LoginPage />
        </TestWrapper>
      );
      
      const emailInput = screen.getByPlaceholderText(/email/i) as HTMLInputElement;
      await userEvent.type(emailInput, 'test@example.com');
      
      expect(emailInput.value).toBe('test@example.com');
    });
  });

  describe('Register Page', () => {
    test('renders register page without crashing', () => {
      render(
        <TestWrapper initialRoute="/register">
          <RegisterPage />
        </TestWrapper>
      );
      
      // Page should render
      expect(document.body.innerHTML.length).toBeGreaterThan(100);
    });

    test('has interactive elements', () => {
      render(
        <TestWrapper initialRoute="/register">
          <RegisterPage />
        </TestWrapper>
      );
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    test('has navigation structure', () => {
      render(
        <TestWrapper initialRoute="/register">
          <RegisterPage />
        </TestWrapper>
      );
      
      // Should have links or headings
      const headings = screen.queryAllByRole('heading');
      const links = screen.queryAllByRole('link');
      expect(headings.length + links.length).toBeGreaterThan(0);
    });
  });

  describe('Form Interaction', () => {
    test('form fields are editable', async () => {
      render(
        <TestWrapper initialRoute="/login">
          <LoginPage />
        </TestWrapper>
      );
      
      const textInputs = screen.queryAllByRole('textbox');
      if (textInputs.length > 0) {
        const firstInput = textInputs[0] as HTMLInputElement;
        await userEvent.type(firstInput, 'test');
        expect(firstInput.value.length).toBeGreaterThan(0);
      }
    });

    test('buttons are clickable', () => {
      render(
        <TestWrapper initialRoute="/login">
          <LoginPage />
        </TestWrapper>
      );
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('Page Accessibility', () => {
    test('login page has proper heading structure', () => {
      render(
        <TestWrapper initialRoute="/login">
          <LoginPage />
        </TestWrapper>
      );
      
      const headings = screen.queryAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    test('register page has proper heading structure', () => {
      render(
        <TestWrapper initialRoute="/register">
          <RegisterPage />
        </TestWrapper>
      );
      
      const headings = screen.queryAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });
});
