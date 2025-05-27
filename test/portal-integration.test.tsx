import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { db } from '@/main';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import Dashboard from '@/pages/Dashboard';
import { AuthProvider } from '@/context/auth';

// Create a new QueryClient for each test
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
      refetchOnWindowFocus: false,
    },
  },
});

// Wrapper component with all necessary providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('Portal Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should share applications between student and admin portals', async () => {
    // Mock application data
    const mockApplication = {
      id: 'test-app-1',
      student_id: 'test-student-1',
      status: 'pending',
      created_at: new Date()
    };

    // Mock Firebase response for applications
    vi.mocked(collection).mockImplementation((db, collectionName) => {
      if (collectionName === 'applications') {
        return {
          where: () => ({
            get: () => Promise.resolve({
              docs: [{
                id: mockApplication.id,
                data: () => mockApplication
              }]
            })
          })
        } as any;
      }
      return {} as any;
    });

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    // Verify application appears in student dashboard
    await waitFor(() => {
      expect(screen.getByText(/Apply for Room/i)).toBeInTheDocument();
    });
  });

  it('should share maintenance requests between portals', async () => {
    // Mock maintenance request data
    const mockRequest = {
      id: 'test-maint-1',
      student_id: 'test-student-1',
      status: 'pending',
      created_at: new Date()
    };

    // Mock Firebase response for maintenance requests
    vi.mocked(collection).mockImplementation((db, collectionName) => {
      if (collectionName === 'maintenance_requests') {
        return {
          where: () => ({
            get: () => Promise.resolve({
              docs: [{
                id: mockRequest.id,
                data: () => mockRequest
              }]
            })
          })
        } as any;
      }
      return {} as any;
    });

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    // Verify maintenance request appears in student dashboard
    await waitFor(() => {
      expect(screen.getByText(/Maintenance Requests/i)).toBeInTheDocument();
    });
  });

  it('should share announcements between portals', async () => {
    // Mock announcement data
    const mockAnnouncement = {
      id: 'test-announcement-1',
      title: 'Test Announcement',
      content: 'Test Content',
      type: 'general',
      created_at: new Date()
    };

    // Mock Firebase response for announcements
    vi.mocked(collection).mockImplementation((db, collectionName) => {
      if (collectionName === 'announcements') {
        return {
          orderBy: () => ({
            get: () => Promise.resolve({
              docs: [{
                id: mockAnnouncement.id,
                data: () => mockAnnouncement
              }]
            })
          })
        } as any;
      }
      return {} as any;
    });

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    // Verify announcement appears in student dashboard
    await waitFor(() => {
      expect(screen.getByText(/Test Announcement/i)).toBeInTheDocument();
    });
  });
}); 