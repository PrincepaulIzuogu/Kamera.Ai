import React, { useEffect } from "react";
import "../styles/TermsOfService.css"; // Ensure the correct path to your CSS file

const TermsOfService = () => {
  useEffect(() => {
    window.scrollTo(0, 0); // Ensure the page scrolls to the top when it's loaded
  }, []);

  return (
    <div className="terms-of-service-container">
      <h1 className="title">Terms of Service</h1>
      <p className="effective-date">Effective Date: December 2024</p>

      <section className="terms-section">
        <h2>1. Introduction</h2>
        <p>
          Welcome to Kamera.Ai! By accessing or using our website or services, you agree to comply with these Terms of Service.
        </p>
      </section>

      <section className="terms-section">
        <h2>2. Use of Service</h2>
        <p>
          You must be at least 18 years old or have the consent of a legal guardian to use this service. You agree to use the service only for lawful purposes.
        </p>
      </section>

      <section className="terms-section">
        <h2>3. User Responsibilities</h2>
        <p>
          You are responsible for maintaining the confidentiality of your account information and for all activities under your account.
        </p>
      </section>

      <section className="terms-section">
        <h2>4. Intellectual Property</h2>
        <p>
          All content provided by Kamera.Ai, including text, images, logos, and software, is the property of Kamera.Ai or its licensors.
        </p>
      </section>

      <section className="terms-section">
        <h2>5. Privacy Policy</h2>
        <p>
          Your use of the service is also governed by our Privacy Policy. Please review it to understand how we collect and use your data.
        </p>
      </section>

      <section className="terms-section">
        <h2>6. Termination</h2>
        <p>
          We reserve the right to suspend or terminate your access to the service for violation of these terms.
        </p>
      </section>

      <section className="terms-section">
        <h2>7. Limitation of Liability</h2>
        <p>
          Kamera.Ai will not be liable for any damages arising out of the use or inability to use the service.
        </p>
      </section>

      <section className="terms-section">
        <h2>8. Changes to Terms</h2>
        <p>
          We may update these Terms of Service from time to time. We will notify users of significant changes.
        </p>
      </section>

      <section className="terms-section">
        <h2>9. Contact Us</h2>
        <p>
          If you have any questions about these terms, please contact us at <a href="mailto:support@Kamera.ai.com">Support@Kamera.ai.com</a>.
        </p>
      </section>
    </div>
  );
};

export default TermsOfService;
