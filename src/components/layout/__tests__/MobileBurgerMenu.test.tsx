
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MobileBurgerMenu } from '../MobileBurgerMenu';

// Mock hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    profile: null,
    signOut: vi.fn(),
    hasRole: vi.fn(() => false),
  })),
}));

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: vi.fn(() => true),
}));

// Mock AutoTranslate component
vi.mock('@/components/AutoTranslate', () => ({
  AutoTranslate: ({ text }: { text: string }) => <span>{text}</span>,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('MobileBurgerMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Burger button positioning with safe-area-inset', () => {
    it('should render burger button with safe-area-inset-top styling', () => {
      renderWithRouter(<MobileBurgerMenu />);
      
      const button = screen.getByLabelText('Ouvrir le menu');
      expect(button).toBeInTheDocument();
      
      // Check inline styles for safe-area-inset
      const style = button.getAttribute('style');
      expect(style).toContain('safe-area-inset-top');
    });

    it('should have proper fallback for safe-area-inset', () => {
      renderWithRouter(<MobileBurgerMenu />);
      
      const button = screen.getByLabelText('Ouvrir le menu');
      const style = button.getAttribute('style');
      
      // Should use max() with fallback value
      expect(style).toContain('max(');
      expect(style).toContain('16px'); // Fallback value
    });

    it('should have high z-index for proper layering', () => {
      renderWithRouter(<MobileBurgerMenu />);
      
      const button = screen.getByLabelText('Ouvrir le menu');
      const style = button.getAttribute('style');
      
      expect(style).toContain('z-index: 9999');
    });

    it('should be fixed positioned', () => {
      renderWithRouter(<MobileBurgerMenu />);
      
      const button = screen.getByLabelText('Ouvrir le menu');
      const style = button.getAttribute('style');
      
      expect(style).toContain('position: fixed');
    });

    it('should have backdrop blur for iOS PWA', () => {
      renderWithRouter(<MobileBurgerMenu />);
      
      const button = screen.getByLabelText('Ouvrir le menu');
      const style = button.getAttribute('style');
      
      expect(style).toContain('backdrop-filter: blur');
      expect(style).toContain('-webkit-backdrop-filter: blur');
    });
  });

  describe('Menu interaction', () => {
    it('should open menu when burger button is clicked', async () => {
      renderWithRouter(<MobileBurgerMenu />);
      
      const button = screen.getByLabelText('Ouvrir le menu');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should close menu when close button is clicked', async () => {
      renderWithRouter(<MobileBurgerMenu />);
      
      // Open menu
      const openButton = screen.getByLabelText('Ouvrir le menu');
      fireEvent.click(openButton);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      // Close menu
      const closeButton = screen.getByLabelText('Fermer le menu');
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should close menu when backdrop is clicked', async () => {
      renderWithRouter(<MobileBurgerMenu />);
      
      // Open menu
      const openButton = screen.getByLabelText('Ouvrir le menu');
      fireEvent.click(openButton);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      // Click backdrop
      const backdrop = screen.getByRole('dialog').querySelector('.bg-black\\/60');
      if (backdrop) {
        fireEvent.click(backdrop);
      }
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should lock scroll when menu is open', async () => {
      renderWithRouter(<MobileBurgerMenu />);
      
      const openButton = screen.getByLabelText('Ouvrir le menu');
      fireEvent.click(openButton);
      
      await waitFor(() => {
        expect(document.documentElement.style.overflow).toBe('hidden');
        expect(document.body.style.overflow).toBe('hidden');
      });
    });

    it('should restore scroll when menu is closed', async () => {
      renderWithRouter(<MobileBurgerMenu />);
      
      // Open menu
      const openButton = screen.getByLabelText('Ouvrir le menu');
      fireEvent.click(openButton);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      // Close menu
      const closeButton = screen.getByLabelText('Fermer le menu');
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(document.documentElement.style.overflow).not.toBe('hidden');
        expect(document.body.style.overflow).not.toBe('hidden');
      });
    });
  });

  describe('Responsive behavior', () => {
    it('should not render on desktop', () => {
      const { useIsMobile } = require('@/hooks/use-mobile');
      useIsMobile.mockReturnValue(false);
      
      const { container } = renderWithRouter(<MobileBurgerMenu />);
      expect(container.firstChild).toBeNull();
    });

    it('should render on mobile', () => {
      const { useIsMobile } = require('@/hooks/use-mobile');
      useIsMobile.mockReturnValue(true);
      
      renderWithRouter(<MobileBurgerMenu />);
      expect(screen.getByLabelText('Ouvrir le menu')).toBeInTheDocument();
    });
  });

  describe('PWA behavior', () => {
    it('should use portal for menu rendering', async () => {
      renderWithRouter(<MobileBurgerMenu />);
      
      const openButton = screen.getByLabelText('Ouvrir le menu');
      fireEvent.click(openButton);
      
      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        // Portal should render to document.body
        expect(dialog.parentElement).toBe(document.body);
      });
    });

    it('should have highest z-index for PWA overlay', async () => {
      renderWithRouter(<MobileBurgerMenu />);
      
      const openButton = screen.getByLabelText('Ouvrir le menu');
      fireEvent.click(openButton);
      
      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog.className).toContain('z-[99999]');
      });
    });

    it('should prevent scroll on touch devices', async () => {
      renderWithRouter(<MobileBurgerMenu />);
      
      const openButton = screen.getByLabelText('Ouvrir le menu');
      fireEvent.click(openButton);
      
      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        const backdrop = dialog.querySelector('.bg-black\\/60');
        
        if (backdrop) {
          const style = window.getComputedStyle(backdrop);
          // Should have touch-action: none or similar
          expect(backdrop.getAttribute('style')).toContain('touch-action: none');
        }
      });
    });
  });

  describe('Navigation items', () => {
    it('should show public navigation for unauthenticated users', () => {
      renderWithRouter(<MobileBurgerMenu />);
      
      const openButton = screen.getByLabelText('Ouvrir le menu');
      fireEvent.click(openButton);
      
      expect(screen.getByText('Accueil')).toBeInTheDocument();
      expect(screen.getByText('Top Artistes')).toBeInTheDocument();
      expect(screen.getByText('Se connecter')).toBeInTheDocument();
    });

    it('should show authenticated navigation for logged-in users', () => {
      const { useAuth } = require('@/hooks/useAuth');
      useAuth.mockReturnValue({
        user: { id: '1' },
        profile: { 
          id: '1', 
          display_name: 'Test User', 
          profile_type: 'artist',
          avatar_url: null 
        },
        signOut: vi.fn(),
        hasRole: vi.fn(() => false),
      });
      
      renderWithRouter(<MobileBurgerMenu />);
      
      const openButton = screen.getByLabelText('Ouvrir le menu');
      fireEvent.click(openButton);
      
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('Déconnexion')).toBeInTheDocument();
    });
  });
});
