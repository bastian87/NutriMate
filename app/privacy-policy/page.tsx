import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12 text-justify">
      <h1 className="text-3xl font-bold mb-2 text-center">Privacy Policy</h1>
      <p className="text-center text-sm mb-8">Nutrimate<br/>Effective Date: 21-06-2025</p>
      <ol className="list-decimal pl-4 space-y-4">
        <li>
          <strong>Introduction</strong><br/>
          This Privacy Policy explains how Nutrimate (“we”, “our”, or “the Platform”) collects, uses, and protects your personal data when you access or use our services. By using the Platform, you consent to the practices described herein.
        </li>
        <li>
          <strong>Data Controller</strong><br/>
          The data controller responsible for processing your information is [Your Legal Name or Entity], located in [City, Country]. If you have questions or requests regarding your data, please contact us at: [your-email].
        </li>
        <li>
          <strong>Data We Collect</strong><br/>
          We may collect the following categories of personal data:
          <ul className="list-disc pl-6">
            <li><strong>Identification Data:</strong> name, email address.</li>
            <li><strong>User Profile Data:</strong> dietary preferences, allergies, health goals, food restrictions.</li>
            <li><strong>Technical Information:</strong> IP address, browser type, device type, usage logs.</li>
            <li><strong>Payment Information:</strong> processed securely by third-party payment providers (we do not store credit card details).</li>
          </ul>
        </li>
        <li>
          <strong>How We Use Your Data</strong><br/>
          Your personal data may be used for the following purposes:
          <ul className="list-disc pl-6">
            <li>To provide and personalize our meal planning services.</li>
            <li>To manage your account and subscription.</li>
            <li>To analyze usage and improve our features and content.</li>
            <li>To process payments and deliver customer support.</li>
            <li>To comply with legal obligations.</li>
          </ul>
        </li>
        <li>
          <strong>Legal Basis for Processing</strong><br/>
          We process your data based on one or more of the following legal grounds:
          <ul className="list-disc pl-6">
            <li>Your explicit consent.</li>
            <li>The performance of a contract (e.g., subscription).</li>
            <li>Compliance with legal obligations.</li>
            <li>Our legitimate interests in improving and securing the service.</li>
          </ul>
        </li>
        <li>
          <strong>Data Retention</strong><br/>
          We retain your personal data only as long as necessary for the purposes stated in this Policy. After this period, data is deleted or anonymized unless legal obligations require longer retention.
        </li>
        <li>
          <strong>Data Security</strong><br/>
          We apply appropriate technical and organizational security measures to protect your data, including encryption, secure servers, and access controls. Our infrastructure is hosted on trusted third-party services (e.g., cloud and database providers).
        </li>
        <li>
          <strong>Data Sharing and Third Parties</strong><br/>
          We do not sell or rent your personal data to third parties. However, we may share data under the following circumstances:
          <ul className="list-disc pl-6">
            <li>With third-party payment processors and infrastructure providers.</li>
            <li>With legal authorities if required by applicable law.</li>
            <li>With service providers strictly as necessary to operate the Platform.</li>
          </ul>
          All third parties are required to process your data in compliance with relevant privacy regulations.
        </li>
        <li>
          <strong>Your Rights</strong><br/>
          You have the following rights regarding your personal data:
          <ul className="list-disc pl-6">
            <li><strong>Access:</strong> request a copy of your data.</li>
            <li><strong>Correction:</strong> request rectification of inaccurate or incomplete data.</li>
            <li><strong>Deletion:</strong> request erasure of your data (“right to be forgotten”).</li>
            <li><strong>Objection:</strong> object to certain types of processing.</li>
            <li><strong>Restriction:</strong> request limitation of processing.</li>
            <li><strong>Portability:</strong> request your data in a portable format.</li>
          </ul>
          To exercise any of these rights, contact us at [your-email].
        </li>
        <li>
          <strong>Cookies and Tracking Technologies</strong><br/>
          The Platform may use cookies and similar technologies to enhance performance and user experience. You may disable cookies through your browser settings, although this may affect certain functionalities.
        </li>
        <li>
          <strong>Refund Policy Reference</strong><br/>
          While subscription payments are processed by external platforms, Nutrimate retains records of transactions for customer support and fraud prevention.<br/><br/>
          To learn more about the conditions under which a refund may be requested, please refer to the Refund Policy section in our Terms of Service.
        </li>
        <li>
          <strong>Changes to this Privacy Policy</strong><br/>
          We reserve the right to update this Privacy Policy at any time. Updates will be published on the Platform, and continued use implies acceptance of the revised terms.
        </li>
        <li>
          <strong>Contact</strong><br/>
          If you have any questions about this Privacy Policy or wish to exercise your data rights, please contact us at:<br/>
          Website: <a href="https://www.nutrimate.net" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">www.nutrimate.net</a>
        </li>
      </ol>
    </main>
  );
} 