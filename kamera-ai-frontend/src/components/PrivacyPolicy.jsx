import React, { useEffect } from "react";
import '../styles/TermsOfService.css'; 

const PrivacyPolicy = () => {
  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  return (
    <div className="privacy-policy-container">
      <h1 className="title">Privacy Policy</h1>
      <p className="effective-date">Effective Date: December 2024</p>

      <section className="policy-section">
        <h2>1. Introduction</h2>
        <p>
          This Privacy Policy explains how Kamera.Ai collects, uses, and protects your personal information.
        </p>
      </section>

      <section className="policy-section">
        <h2>2. Information We Collect</h2>
        <p>
          We may collect the following types of information:
        </p>
        <ul>
          <li>Personal information (e.g., name, email address, phone number)</li>
          <li>Usage data (e.g., pages visited, interaction with features)</li>
          <li>Cookies and tracking technologies</li>
        </ul>
      </section>

      <section className="policy-section">
        <h2>3. How We Use Your Information</h2>
        <p>We use the collected information for:</p>
        <ul>
          <li>Providing and improving our services</li>
          <li>Personalizing your experience</li>
          <li>Communicating with you</li>
          <li>Complying with legal obligations</li>
        </ul>
      </section>

      <section className="policy-section">
        <h2>4. Data Sharing</h2>
        <p>
          We may share your data with trusted third-party services or if required by law.
        </p>
      </section>

      <section className="policy-section">
        <h2>5. Data Security</h2>
        <p>
          We take reasonable measures to protect your personal information from unauthorized access, alteration, or destruction.
        </p>
      </section>

      <section className="policy-section">
        <h2>6. Your Rights</h2>
        <p>
          You have the right to access, update, or delete your personal information. You can also withdraw your consent at any time.
        </p>
      </section>

      <section className="policy-section">
        <h2>7. Cookies</h2>
        <p>
          Our website uses cookies to enhance your user experience. You can manage cookie preferences through your browser settings.
        </p>
      </section>

      <section className="policy-section">
        <h2>8. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy occasionally. Any changes will be posted on this page with an updated effective date.
        </p>
      </section>

      <section className="policy-section">
        <h2>9. Contact Us</h2>
        <p>
          If you have any questions or concerns about our privacy practices, please contact us at <a href="mailto:support@kamera.ai.com">Support@Kamera.ai.com</a>.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
