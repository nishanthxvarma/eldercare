import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ResidentList from '../ResidentList';

// Mock the apiClient
vi.mock('../../../api/client', () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: {
        data: {
          residents: [
            { _id: '1', firstName: 'John', lastName: 'Doe', roomNumber: '101', status: 'ACTIVE' },
            { _id: '2', firstName: 'Jane', lastName: 'Smith', roomNumber: '102', status: 'ACTIVE' },
          ],
          pagination: { total: 2, page: 1, pages: 1 }
        }
      }
    })
  }
}));

describe('ResidentList Page', () => {
  const queryClient = new QueryClient();

  it('renders resident list correctly', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ResidentList />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Residents')).toBeInTheDocument();
    
    expect(await screen.findByText('John Doe')).toBeInTheDocument();
    expect(await screen.findByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('101')).toBeInTheDocument();
  });
});
