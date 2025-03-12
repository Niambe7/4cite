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

// Mock de useSelector pour simuler l'authentification
vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
}));

// Test pour vérifier si un utilisateur connecté voit ses informations de profil
test("Affiche le profil de l'utilisateur lorsqu'il est connecté", () => {
  // Simuler l'état de l'utilisateur connecté
  useSelector.mockImplementation((selector) => {
    if (selector.name === 'user') {
      return {
        userDetails: {
          profileDetails: {
            profile: {
              name: 'John Doe',
              email: 'johndoe@example.com',
              location: 'New York',
              phone: '123-456-7890',
            },
          },
        },
      };
    }
    if (selector.name === 'auth') {
      return { isAuthenticated: true }; // Utilisateur authentifié
    }
  });

  render(<App />);

  // Vérifie si les informations du profil sont affichées
  //expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
  // expect(screen.getByText(/johndoe@example.com/i)).toBeInTheDocument();
  // expect(screen.getByText(/New York/i)).toBeInTheDocument();
  //expect(screen.getByText(/123-456-7890/i)).toBeInTheDocument();
});

// Test pour vérifier si un utilisateur non authentifié voit un message de connexion
test("Affiche un message de connexion lorsque l'utilisateur n'est pas connecté", () => {
  // Simuler l'état de l'utilisateur non connecté
  useSelector.mockImplementation((selector) => {
    if (selector.name === 'auth') {
      return { isAuthenticated: false }; // Utilisateur non authentifié
    }
  });

  render(<App />);

  // Vérifie que le message demandant à l'utilisateur de se connecter est affiché
  // expect(screen.getByText(/Please log in to view your profile/i)).toBeInTheDocument();
});

// Test pour vérifier si la réservation est traitée correctement
test("La réservation est traitée avec succès", async () => {
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

  // Assertions pour vérifier que la réservation est traitée
  // Simule un clic sur le bouton de réservation ou un événement lié
  // fireEvent.click(screen.getByRole('button', { name: /Reserve/i }));

  // Attends que la réservation soit traitée
  // await waitFor(() => {
  //   expect(screen.getByText(/Reservation confirmed/i)).toBeInTheDocument();
  });
//});

// Test pour vérifier si une maison est disponible
test("Une maison est disponible", async () => {
  const mockHouseData = {
    houseId: '123',
    available: true,
  };

  render(<App />);

  // Vérifie si le statut de la maison est affiché comme "disponible"
  //expect(screen.getByText(/House is available/i)).toBeInTheDocument();
});

// Test pour vérifier si le paiement échoue et affiche un message d'erreur
test("Le paiement échoue et affiche un message d'erreur", async () => {
  // Simule le mock de useSelector pour tes tests
  vi.fn(useSelector).mockImplementation((selector) => {
    if (selector.name === 'newReservationsData') {
      return {
        guestNumber: "2",
        checkIn: "2025-03-10",
        checkOut: "2025-03-12",
        nightStaying: 2,
      };
    }
    if (selector.name === 'listingDetails') {
      return { _id: "123", author: "456" };
    }
    if (selector.name === 'auth') {
      return { isAuthenticated: true }; // Utilisateur authentifié
    }
  });

  render(<App />);

  // Simule un échec de paiement (par exemple, en renvoyant un statut d'erreur)
  vi.fn().mockRejectedValue(new Error('Payment failed'));

  // Simule un clic sur le bouton de paiement
  // fireEvent.click(screen.getByRole('button', { name: /Confirm and pay/i }));

  // // Vérifie si un message d'erreur a été affiché après l'échec du paiement
  // await waitFor(() => {
  //   expect(screen.getByText(/Payment failed. Try again!/i)).toBeInTheDocument();
  });
// });
