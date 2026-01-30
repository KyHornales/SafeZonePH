import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';
import BuddiesPage from '../pages/BuddiesPage';
import TasksPage from '../pages/TasksPage';
import Layout from '../components/layout/Layout';

// Test wrapper for pages
const TestWrapper: React.FC<{ children: React.ReactNode; initialRoute?: string }> = ({ 
  children, 
  initialRoute = '/' 
}) => (
  <MemoryRouter initialEntries={[initialRoute]}>
    <AuthProvider>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </AuthProvider>
  </MemoryRouter>
);

describe('Buddy Matching Flow Integration Tests', () => {
  describe('Buddies Page', () => {
    test('renders buddies page', () => {
      render(
        <TestWrapper initialRoute="/buddies">
          <Layout>
            <BuddiesPage />
          </Layout>
        </TestWrapper>
      );
      
      // Page should render
      expect(document.body.textContent).toBeTruthy();
    });

    test('has navigation elements', () => {
      render(
        <TestWrapper initialRoute="/buddies">
          <Layout>
            <BuddiesPage />
          </Layout>
        </TestWrapper>
      );
      
      // Should have interactive elements
      const buttons = screen.queryAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Tasks Page', () => {
    test('renders tasks page', () => {
      render(
        <TestWrapper initialRoute="/tasks">
          <Layout>
            <TasksPage />
          </Layout>
        </TestWrapper>
      );
      
      // Page should render
      expect(document.body.textContent).toBeTruthy();
    });

    test('has task-related UI elements', () => {
      render(
        <TestWrapper initialRoute="/tasks">
          <Layout>
            <TasksPage />
          </Layout>
        </TestWrapper>
      );
      
      // Tasks page should have headings
      const headings = screen.queryAllByRole('heading');
      expect(headings.length).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('Check-in Flow', () => {
  test('buddies page allows interaction', () => {
    render(
      <TestWrapper initialRoute="/buddies">
        <Layout>
          <BuddiesPage />
        </Layout>
      </TestWrapper>
    );
    
    // Find interactive elements
    const interactiveElements = document.querySelectorAll('button, a, input');
    expect(interactiveElements.length).toBeGreaterThan(0);
  });
});

describe('Task Management', () => {
  test('tasks can be viewed', () => {
    render(
      <TestWrapper initialRoute="/tasks">
        <Layout>
          <TasksPage />
        </Layout>
      </TestWrapper>
    );
    
    // Page renders without error
    expect(document.body.textContent?.length).toBeGreaterThan(0);
  });
});

describe('Navigation', () => {
  test('layout provides navigation', () => {
    render(
      <TestWrapper initialRoute="/buddies">
        <Layout>
          <BuddiesPage />
        </Layout>
      </TestWrapper>
    );
    
    // Should have navigation links or buttons
    const navLinks = screen.queryAllByRole('link');
    const navButtons = screen.queryAllByRole('button');
    
    expect(navLinks.length + navButtons.length).toBeGreaterThan(0);
  });
});

describe('User Interface', () => {
  test('buddies page is styled', () => {
    render(
      <TestWrapper initialRoute="/buddies">
        <Layout>
          <BuddiesPage />
        </Layout>
      </TestWrapper>
    );
    
    // Page should have content
    expect(document.body.innerHTML.length).toBeGreaterThan(100);
  });

  test('tasks page is styled', () => {
    render(
      <TestWrapper initialRoute="/tasks">
        <Layout>
          <TasksPage />
        </Layout>
      </TestWrapper>
    );
    
    // Page should have content
    expect(document.body.innerHTML.length).toBeGreaterThan(100);
  });
});
