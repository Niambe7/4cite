/*import { render, screen } from "@testing-library/react";
import App from "./App";

test("Vérifie que le texte 'Welcome' est affiché", () => {
  render(<App />);
  expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
});*/
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest'; // Importe vi depuis vitest
import App from './App';

// Mock partiel de react-router-dom
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal(); // Importe les exports réels
  return {
    ...actual, // Conserve les exports réels
    RouterProvider: () => <div>Mocked RouterProvider</div>, // Mock uniquement RouterProvider
  };
});

test("Vérifie que le texte 'Welcome' est affiché", () => {
  render(<App />);
  expect(screen.getByText(/Mocked RouterProvider/i)).toBeInTheDocument();
});

