import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { vi } from 'vitest';
import React from 'react';

// Mock Radix UI components
vi.mock('@radix-ui/react-dropdown-menu', () => ({
  Root: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  Trigger: ({ children }: { children: React.ReactNode }) => React.createElement('button', null, children),
  Content: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  Item: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  Group: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  Portal: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  Sub: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  SubTrigger: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  SubContent: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  CheckboxItem: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  RadioGroup: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  RadioItem: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  Label: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  Separator: () => React.createElement('hr', null),
  ItemIndicator: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
}));

// Mock Radix UI Avatar component
vi.mock('@radix-ui/react-avatar', () => ({
  Root: ({ children }: { children: React.ReactNode }) => React.createElement('div', { className: 'avatar-root' }, children),
  Image: ({ src, alt }: { src: string; alt: string }) => React.createElement('img', { src, alt, className: 'avatar-image' }),
  Fallback: ({ children }: { children: React.ReactNode }) => React.createElement('div', { className: 'avatar-fallback' }, children),
}));

// Mock Firebase
vi.mock('@/main', () => ({
  auth: {
    onAuthStateChanged: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    currentUser: {
      uid: 'test-user-id',
      email: 'test@example.com'
    }
  },
  db: {
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        get: vi.fn(() => Promise.resolve({
          data: () => ({
            id: 'test-doc-id',
            data: {}
          })
        })),
        set: vi.fn(() => Promise.resolve()),
        update: vi.fn(() => Promise.resolve()),
        delete: vi.fn(() => Promise.resolve())
      })),
      where: vi.fn(() => ({
        get: vi.fn(() => Promise.resolve({
          docs: []
        }))
      })),
      orderBy: vi.fn(() => ({
        get: vi.fn(() => Promise.resolve({
          docs: []
        }))
      }))
    }))
  }
}));

// Mock auth context
vi.mock('@/context/auth', () => ({
  useAuth: () => ({
    user: {
      uid: 'test-user-id',
      role: 'student',
      email: 'test@example.com'
    },
    loading: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    refreshUser: vi.fn()
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/' }),
    Link: ({ children, to }: { children: React.ReactNode, to: string }) => 
      React.createElement('a', { href: to }, children)
  };
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
}); 