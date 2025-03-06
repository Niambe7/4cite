import { render, screen } from "@testing-library/react";
import App from "./App";

test("Vérifie que le texte 'Welcome' est affiché", () => {
  render(<App />);
  expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
});
