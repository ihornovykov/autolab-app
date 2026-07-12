import { useSearch } from "@tanstack/react-router";

export const SuccessView = () => {
  const { checkout_id } = useSearch({ from: "/success" });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1>Payment Successful!</h1>
      {checkout_id && <p>Checkout ID: {checkout_id}</p>}
    </div>
  );
};
