import React from "react";

export default function TermsOfServicePage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12 text-justify">
      <h1 className="text-3xl font-bold mb-2 text-center">Terms of Service</h1>
      <p className="text-center text-sm mb-8">
        Nutrimate<br />
        Effective Date: 21-06-2025
      </p>
      <ol className="list-decimal pl-4 space-y-4">
        <li>
          <strong>Purpose of the Application</strong><br />
          Nutrimate is an entertainment-oriented application that provides meal planning functionalities for recreational purposes only. All information provided through this application, including meal plans, shopping lists, and food suggestions, is automatically generated and must be considered as informational content only.
        </li>
        <li>
          <strong>No Medical or Nutritional Advice</strong><br />
          Nutrimate does not provide medical, nutritional, or professional advice of any kind. The creator of Nutrimate is not a certified nutritionist, dietitian, or healthcare professional.<br /><br />
          Users must consult with a qualified healthcare provider before making any decisions related to their diet, nutrition, or health. Use of this application is at your own risk.
        </li>
        <li>
          <strong>Limitation of Liability</strong><br />
          The creator of Nutrimate shall not be held liable for any damages, losses, illnesses, injuries, or any other adverse effects resulting from the use of or reliance on the information presented by the application.
        </li>
        <li>
          <strong>Use of the Service</strong><br />
          Users agree that Nutrimate is a recreational tool and must not be used as a reliable source for making decisions related to health, nutrition, or well-being.
        </li>
        <li>
          <strong>Changes to the Terms</strong><br />
          We reserve the right to modify these Terms of Service at any time without prior notice. Continued use of the application implies acceptance of the updated terms.
        </li>
        <li>
          <strong>Contact</strong><br />
          For any questions or concerns about these Terms, please contact us at:<br />
          Website: <a href="https://www.nutrimate.net" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">www.nutrimate.net</a>
        </li>
      </ol>
    </main>
  );
}
