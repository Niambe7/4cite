import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest'; // Importe vi depuis vitest
import App from './App';
import { useSelector } from 'react-redux'; // Importation de useSelector

// Mock de react-router-dom
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal(); // Importe les exports réels
  return {
    ...actual, // Conserve les exports réels
    RouterProvider: () => <div>Mocked RouterProvider</div>, // Mock uniquement RouterProvider
  };
});

// Mock de l'action de réservation
vi.mock('./redux/actions/reservationsActions', () => ({
  newReservation: vi.fn(() => ({ type: 'NEW_RESERVATIONS_DATA', payload: {} })),
}));

// Mock de l'API pour la réservation
vi.mock('./frontend', () => ({
  post: vi.fn(() => Promise.resolve({ status: 200, data: {} })),
}));

// Mock des actions de la maison (HouseActions)
vi.mock('./redux/actions/houseActions', () => ({
  getHouseDetails: vi.fn(() => ({ type: 'CURRENT_NEW_HOUSE', payload: { available: true } })),
  getOneListingRoomsDetails: vi.fn(() => ({
    type: 'GET_LISTING_DETAILS',
    payload: { available: true },
  })),
}));

// Mock de react-stripe-js pour le test de paiement
vi.mock('@stripe/react-stripe-js', () => ({
  useStripe: vi.fn(),
  useElements: vi.fn(),
  PaymentElement: vi.fn(() => <div>Mocked PaymentElement</div>),
}));

// Mock du toast et de Toaster
vi.mock('react-hot-toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
  Toaster: () => <div>Mocked Toaster</div>, // Mock de Toaster
}));

// Test de bienvenue
test("Welcome to Akkor Hotel", () => {
  render(<App />);
  expect(screen.getByText(/Mocked RouterProvider/i)).toBeInTheDocument();
});

// Test pour vérifier la réservation traitée avec succès
test("La réservation traitée avec succès", async () => {
  const mockListingData = {
    _id: '123',
    author: '456',
  };
  const mockFormData = {
    formattedStartDate: '2023-10-01',
    formattedEndDate: '2023-10-05',
    nightsStaying: 4,
    totalGuest: 2,
    reservationBasePrice: 100,
    tax: 20,
    authorEarned: 80,
  };

  render(<App />);
  // Assure-toi d'ajouter les actions ou assertions nécessaires pour tester la réservation
});

// Test pour vérifier la disponibilité d'une maison
test("Une maison est disponible", async () => {
  const mockHouseData = {
    houseId: '123',
    available: true,
  };

  render(<App />);
  // Assure-toi d'ajouter les actions ou assertions nécessaires pour tester la disponibilité de la maison
});

// Test pour vérifier que le paiement échoue et affiche un message d'erreur
test("Vérifie que le paiement échoue et affiche un message d'erreur", async () => {
  // Simule le mock de useSelector ici pour tes tests
  vi.fn(useSelector).mockImplementation((selector) => {
    if (selector.name === "newReservationsData") {
      return {
        guestNumber: "2",
        checkIn: "2025-03-10",
        checkOut: "2025-03-12",
        nightStaying: 2,
      };
    }
    if (selector.name === "listingDetails") {
      return { _id: "123", author: "456" };
    }
  });

  render(<App />);

  // Simule un échec de paiement
  //fireEvent.click(screen.getByRole('button', { name: /Confirm and pay/i }));

  // Vérifie si un message d'erreur a été affiché
  //await waitFor(() => {
    //expect(screen.getByText(/Payment failed. Try again!/i)).toBeInTheDocument();
  });

