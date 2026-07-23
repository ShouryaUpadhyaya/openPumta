import { render, screen } from '@testing-library/react';
import Navigation from '@/components/Navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

vi.mock('@/store/useLayoutStore', () => ({
  useLayoutStore: () => ({ isSidebarCollapsed: false, toggleSidebar: vi.fn() }),
}));

vi.mock('@/store/useAuthStore');

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Home: () => <div data-testid="icon-home" />,
  BarChart: () => <div data-testid="icon-barchart" />,
  Timer: () => <div data-testid="icon-timer" />,
  ListChecks: () => <div data-testid="icon-listchecks" />,
  User: () => <div data-testid="icon-user" />,
  LogIn: () => <div data-testid="icon-login" />,
  CheckCircle: () => <div data-testid="icon-checkcircle" />,
  Settings: () => <div data-testid="icon-settings" />,
  Menu: () => <div data-testid="icon-menu" />,
  LogOut: () => <div data-testid="icon-logout" />,
}));

describe('Navigation nudges', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders standard Logout button for authenticated users', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { name: 'Test User', email: 'test@example.com', isGuest: false },
      fetchUser: vi.fn(),
      loading: false,
      logout: vi.fn(),
    } as any);

    render(<Navigation mounted={true} />);

    // Should render a Logout button in the sidebar (we have two instances for collapsed/uncollapsed, we check for presence)
    const logoutElements = screen.getAllByText('Logout');
    expect(logoutElements.length).toBeGreaterThan(0);

    // Should NOT render Sign Up Now
    expect(screen.queryByText('Sign Up Now')).not.toBeInTheDocument();
  });

  it('renders pulsating Sign Up Now button for guest users', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { name: 'Guest', isGuest: true },
      fetchUser: vi.fn(),
      loading: false,
      logout: vi.fn(),
    } as any);

    const { container } = render(<Navigation mounted={true} />);

    // Should render Sign Up Now instead of Logout
    const signUpElements = screen.getAllByText('Sign Up Now');
    expect(signUpElements.length).toBeGreaterThan(0);

    expect(screen.queryByText('Logout')).not.toBeInTheDocument();

    // Ensure the element has the animate-pulse class
    const signUpLink = signUpElements[0].closest('a');
    expect(signUpLink).toHaveAttribute('href', '/signup');

    // The div inside the link has the pulse class
    const pulseDiv = signUpLink?.querySelector('.animate-pulse');
    expect(pulseDiv).toBeInTheDocument();
  });
});
