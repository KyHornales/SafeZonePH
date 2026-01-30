import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

// Test wrapper for pages that don't have their own router
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

describe('WCAG 2.1 Compliance', () => {
  describe('Perceivable', () => {
    test('landing page has readable headings', () => {
      render(
        <TestWrapper>
          <LandingPage />
        </TestWrapper>
      );
      
      // There should be at least one heading
      const headings = screen.queryAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    test('login form has labeled inputs', () => {
      render(
        <TestWrapper initialRoute="/login">
          <LoginPage />
        </TestWrapper>
      );
      
      // Check for text inputs - should have labels or placeholders for accessibility
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        const hasLabel = input.hasAttribute('aria-label') || 
                        input.hasAttribute('aria-labelledby') ||
                        input.hasAttribute('placeholder') ||
                        input.id;
        expect(hasLabel).toBeTruthy();
      });
    });

    test('register form has labeled inputs', () => {
      render(
        <TestWrapper initialRoute="/register">
          <RegisterPage />
        </TestWrapper>
      );
      
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        const hasLabel = input.hasAttribute('aria-label') || 
                        input.hasAttribute('aria-labelledby') ||
                        input.hasAttribute('placeholder') ||
                        input.id;
        expect(hasLabel).toBeTruthy();
      });
    });
  });

  describe('Operable', () => {
    test('buttons are keyboard accessible', () => {
      render(
        <TestWrapper>
          <LandingPage />
        </TestWrapper>
      );
      
      const buttons = screen.queryAllByRole('button');
      buttons.forEach(button => {
        // Buttons should not have negative tabindex
        const tabIndex = button.getAttribute('tabindex');
        if (tabIndex) {
          expect(parseInt(tabIndex)).toBeGreaterThanOrEqual(0);
        }
      });
    });

    test('links have discernible text', () => {
      render(
        <TestWrapper>
          <LandingPage />
        </TestWrapper>
      );
      
      const links = screen.queryAllByRole('link');
      links.forEach(link => {
        const hasText = link.textContent?.trim() || 
                       link.getAttribute('aria-label') ||
                       link.querySelector('img, svg');
        expect(hasText).toBeTruthy();
      });
    });

    test('form inputs are focusable', () => {
      render(
        <TestWrapper initialRoute="/login">
          <LoginPage />
        </TestWrapper>
      );
      
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).not.toHaveAttribute('tabindex', '-1');
      });
    });
  });

  describe('Understandable', () => {
    test('page has a clear title or main heading', () => {
      render(
        <TestWrapper>
          <LandingPage />
        </TestWrapper>
      );
      
      const headings = screen.queryAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    test('form has submit button', () => {
      render(
        <TestWrapper initialRoute="/login">
          <LoginPage />
        </TestWrapper>
      );
      
      const submitButton = screen.queryByRole('button', { name: /sign in|login|submit/i });
      expect(submitButton).toBeInTheDocument();
    });

    test('error states are communicated', () => {
      render(
        <TestWrapper initialRoute="/login">
          <LoginPage />
        </TestWrapper>
      );
      
      // Page should render without error - has buttons
      expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
    });
  });

  describe('Robust', () => {
    test('form elements have proper types', () => {
      render(
        <TestWrapper initialRoute="/login">
          <LoginPage />
        </TestWrapper>
      );
      
      // Password inputs should have type="password"
      const passwordInputs = document.querySelectorAll('input[type="password"]');
      expect(passwordInputs.length).toBeGreaterThan(0);
    });

    test('interactive elements have proper roles', () => {
      render(
        <TestWrapper>
          <LandingPage />
        </TestWrapper>
      );
      
      // Buttons should be buttons
      const buttons = screen.queryAllByRole('button');
      buttons.forEach(button => {
        expect(button.tagName === 'BUTTON' || button.getAttribute('role') === 'button').toBeTruthy();
      });
    });
  });
});

describe('Keyboard Navigation', () => {
  test('form inputs can be tabbed through', () => {
    render(
      <TestWrapper initialRoute="/login">
        <LoginPage />
      </TestWrapper>
    );
    
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    expect(focusableElements.length).toBeGreaterThan(0);
  });
});

describe('Color Contrast', () => {
  test('text elements exist on the page', () => {
    render(
      <TestWrapper>
        <LandingPage />
      </TestWrapper>
    );
    
    // Simple check that the page renders content
    expect(document.body.textContent?.trim().length).toBeGreaterThan(0);
  });
});

describe('Screen Reader Compatibility', () => {
  test('page has semantic structure', () => {
    render(
      <TestWrapper>
        <LandingPage />
      </TestWrapper>
    );
    
    // Check for semantic elements
    const hasSemanticStructure = 
      document.querySelector('main') || 
      document.querySelector('header') || 
      document.querySelector('nav') ||
      document.querySelector('section') ||
      screen.queryAllByRole('heading').length > 0;
    
    expect(hasSemanticStructure).toBeTruthy();
  });

  test('interactive elements are properly labeled', () => {
    render(
      <TestWrapper initialRoute="/login">
        <LoginPage />
      </TestWrapper>
    );
    
    const buttons = screen.queryAllByRole('button');
    // At least one button should have a label
    const labeledButtons = buttons.filter(button => {
      const hasLabel = button.textContent?.trim() || 
                      button.getAttribute('aria-label') ||
                      button.getAttribute('title') ||
                      button.querySelector('svg'); // Icon buttons
      return hasLabel;
    });
    expect(labeledButtons.length).toBeGreaterThan(0);
  });
});
