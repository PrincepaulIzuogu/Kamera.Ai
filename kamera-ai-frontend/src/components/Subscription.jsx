import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import '../styles/Subscription.css';

// Load Stripe
const stripePromise = loadStripe("pk_test_51PTo6n2MU8gPiBkpILyDgrN76F2O8Of3Pi8sbv87yPcON43DQefPjLq3RivXz4GEH8TAWRr7h4Dt7RjfEEHGSYiB00D71vWN2d");

const Subscription = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState("monthly"); // Default to monthly
  const [rooms, setRooms] = useState("1-10"); // Default rooms selection
  const stripe = useStripe();
  const elements = useElements();

  const handlePlanChange = (event) => {
    setPlan(event.target.value);
  };

  const handleRoomsChange = (event) => {
    setRooms(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });

    if (error) {
      console.error(error);
      setLoading(false);
      alert('Payment failed, please try again.');
      return;
    }

    // Call the backend to create the subscription
    try {
      const response = await fetch('https://kamera-ai-backend-aacmbegmdjcxfhdq.germanywestcentral-01.azurewebsites.net/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_method: paymentMethod.id,
          plan: plan,
          rooms: rooms,
        }),
      });

      const data = await response.json();

      if (data.subscription_status === 'active') {
        alert('Subscription successful!');
        navigate('/dashboard');
      } else {
        alert('Subscription failed, please try again.');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      alert('An error occurred while processing your subscription.');
    } finally {
      setLoading(false);
    }
  };

  // Price Calculation
  const getPrice = () => {
    switch (rooms) {
      case "1-10":
        return plan === "monthly" ? "$100/month" : "$1,080/year ($90/month)";
      case "11-50":
        return plan === "monthly" ? "$500/month" : "$5,400/year ($450/month)";
      case "51-100":
        return plan === "monthly" ? "$900/month" : "$9,600/year ($800/month)";
      case "101-200":
        return plan === "monthly" ? "$1,500/month" : "$16,200/year ($1,350/month)";
      case "201-500":
        return plan === "monthly" ? "$2,500/month" : "$27,000/year ($2,250/month)";
      case "500+":
        return "Custom pricing (based on need and scale)";
      default:
        return "$0/month";
    }
  };

  return (
    <div className="subscription-page">
      <h2>Subscribe to Kamera.Ai</h2>

      <div className="subscription-container">
        {/* Left Side: Subscription Details */}
        <div className="subscription-left">
          <div className="room-selection">
            <label>
              Select the number of rooms:
              <select value={rooms} onChange={handleRoomsChange}>
                <option value="1-10">1 - 10 rooms</option>
                <option value="11-50">11 - 50 rooms</option>
                <option value="51-100">51 - 100 rooms</option>
                <option value="101-200">101 - 200 rooms</option>
                <option value="201-500">201 - 500 rooms</option>
                <option value="500+">500+ rooms</option>
              </select>
            </label>
          </div>

          {/* Plan Selection */}
          <div className="plan-selection">
            <label>
              <input
                type="radio"
                name="plan"
                value="monthly"
                checked={plan === "monthly"}
                onChange={handlePlanChange}
              />
              Monthly Subscription
            </label>
            <label>
              <input
                type="radio"
                name="plan"
                value="yearly"
                checked={plan === "yearly"}
                onChange={handlePlanChange}
              />
              Yearly Subscription (Discounted)
            </label>
          </div>

          <div className="subscription-details">
            <h3>Subscription Details</h3>
            <p>Number of Rooms: {rooms}</p>
            <p>Price: {getPrice()}</p>
          </div>
        </div>

        {/* Right Side: Payment Form */}
        <div className="payment-form">
          <form onSubmit={handleSubmit}>
            <h3>Payment Information</h3>
            <CardElement options={{ hidePostalCode: true }} />
            <button type="submit" disabled={!stripe || loading}>
              {loading ? 'Processing...' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const SubscriptionPage = () => {
  return (
    <Elements stripe={stripePromise}>
      <Subscription />
    </Elements>
  );
};

export default SubscriptionPage;
