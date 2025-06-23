// Tests automáticos básicos para el flujo de suscripción
import { render, screen, waitFor } from '@testing-library/react';
import SubscriptionStatus from '../components/subscription-status';

// Mock de supabase
jest.mock('../lib/supabase/client', () => {
  return {
    supabase: {
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn(),
      })),
    },
  };
});

const { supabase } = require('../lib/supabase/client');

describe('Flujo de suscripción', () => {
  const userId = 'user-123';

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('muestra correctamente una suscripción activa', async () => {
    supabase.from().maybeSingle.mockResolvedValueOnce({
      data: {
        id: 'sub-1',
        user_id: userId,
        status: 'active',
        cancelAtPeriodEnd: false,
      },
      error: null,
    });
    render(<SubscriptionStatus userId={userId} />);
    await waitFor(() => {
      expect(screen.getByText(/Active/i)).toBeInTheDocument();
      expect(screen.getByText(/Plan Premium/i)).toBeInTheDocument();
    });
  });

  it('muestra correctamente el periodo de gracia (cancelada vigente)', async () => {
    // No hay activa, pero hay cancelada con ends_at en el futuro
    supabase.from().maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    supabase.from().order().limit().select.mockResolvedValueOnce({
      data: [{
        id: 'sub-2',
        user_id: userId,
        status: 'cancelled',
        ends_at: new Date(Date.now() + 86400000).toISOString(), // Mañana
      }],
      error: null,
    });
    render(<SubscriptionStatus userId={userId} />);
    await waitFor(() => {
      expect(screen.getByText(/Cancelada \(periodo de gracia\)/i)).toBeInTheDocument();
      expect(screen.getByText(/acceso premium/i)).toBeInTheDocument();
    });
  });

  it('muestra correctamente el plan free si no hay suscripción', async () => {
    supabase.from().maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    supabase.from().order().limit().select.mockResolvedValueOnce({ data: [], error: null });
    render(<SubscriptionStatus userId={userId} />);
    await waitFor(() => {
      expect(screen.getByText(/Plan Free/i)).toBeInTheDocument();
    });
  });

  it('muestra error si el webhook falla', async () => {
    supabase.from().maybeSingle.mockRejectedValueOnce(new Error('Webhook error'));
    render(<SubscriptionStatus userId={userId} />);
    await waitFor(() => {
      expect(screen.getByText(/No se pudo obtener la información de la suscripción/i)).toBeInTheDocument();
    });
  });
}); 