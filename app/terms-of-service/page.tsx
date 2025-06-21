import React from "react";

export default function TermsOfServicePage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12 text-justify">
      <h1 className="text-3xl font-bold mb-2 text-center">Terms of Service</h1>
      <p className="text-center text-sm mb-8">Nutrimate<br/>Effective Date: 21-06-2025</p>
      <ol className="list-decimal pl-4 space-y-4">
        <li>
          <strong>Acceptance of Terms</strong><br/>
          By accessing and using the Nutrimate platform (the "Platform"), you agree to be legally bound by these Terms of Service ("Terms") and any other policies referenced herein. If you do not agree to these Terms, you must refrain from using the Platform.
        </li>
        <li>
          <strong>Description of Service</strong><br/>
          Nutrimate is a web-based application that provides personalized meal plans, nutritional suggestions, food organization tools, and other related features. Some functionalities are only available through a paid subscription.
        </li>
        <li>
          <strong>Eligibility</strong><br/>
          The Platform is intended for users who are 18 years or older, or minors with the express consent of a legal guardian. By registering, you represent and warrant that all information provided is true, accurate, current, and complete.
        </li>
        <li>
          <strong>Account Registration</strong><br/>
          To access certain features, users must create an account by providing a valid email address and a secure password. You are solely responsible for maintaining the confidentiality of your login credentials. Any activity conducted through your account is presumed to be yours unless proven otherwise.
        </li>
        <li>
          <strong>Subscriptions and Payments</strong><br/>
          Access to premium features of the Platform requires an active paid subscription, which renews automatically unless canceled in advance by the user.<br/>
          All payments are processed via third-party payment service providers. Nutrimate does not store sensitive card information nor directly controls the payment process.<br/>
          Canceling a subscription will stop future charges, but does not guarantee a refund for previous payments, unless stated otherwise in the following section.
        </li>
        <li>
          <strong>Refund Policy</strong><br/>
          Because Nutrimate provides immediate access to personalized digital content upon subscription, you explicitly waive your right of withdrawal, as recognized under applicable e-commerce and consumer protection laws, unless such waiver is not permitted in your jurisdiction.<br/><br/>
          As a general rule, <strong>all sales are final and non-refundable</strong>.<br/><br/>
          Exceptionally, refund requests will be considered <strong>only</strong> under the following strict conditions:
          <ol className="list-decimal pl-6">
            <li>The user <strong>has not accessed or used any features</strong> of the Platform (such as logging in, viewing content, generating plans) after the subscription payment.</li>
            <li>The request is submitted with a <strong>valid technical justification</strong>, and the issue is <strong>fully attributable to Nutrimate's infrastructure</strong> (e.g., a complete service outage), and not caused by the user's device, browser, or network.</li>
          </ol>
          Refund requests that meet these conditions must be sent to Nutrimate and include:
          <ul className="list-disc pl-6">
            <li>The email associated with the account.</li>
            <li>A clear explanation of the issue encountered.</li>
            <li>Proof that no access was made (if applicable).</li>
          </ul>
          Refunds, if approved, will be processed via the original payment method. Processing time may vary depending on the payment provider.<br/><br/>
          Nutrimate reserves the right to deny any refund request that does not meet the above criteria or in cases of abuse. <strong>All refund decisions are final and not subject to appeal.</strong>
        </li>
        <li>
          <strong>User Responsibilities</strong><br/>
          Users agree to use the Platform lawfully and ethically, and specifically agree not to:<br/>
          <ul className="list-disc pl-6">
            <li>Violate the rights of third parties, including intellectual property or personal data.</li>
            <li>Use the Platform for fraudulent, defamatory, or unlawful purposes.</li>
            <li>Interfere with or compromise the Platform's security or performance through reverse engineering, scraping, automation, or other unauthorized practices.</li>
          </ul>
        </li>
        <li>
          <strong>Intellectual Property</strong><br/>
          All content, trademarks, designs, source code, algorithms, databases, images, and texts available on the Platform are the exclusive property of Nutrimate or are properly licensed for use. They are protected by intellectual property laws.<br/><br/>
          Reproduction, distribution, modification, or commercial use of such content is strictly prohibited without prior written authorization.
        </li>
        <li>
          <strong>Limitation of Liability</strong><br/>
          Nutrimate provides informational and educational content only. It does not constitute medical, nutritional, or therapeutic advice. You assume full responsibility for any decisions you make based on the information provided by the Platform.<br/><br/>
          Nutrimate does not guarantee uninterrupted or error-free service, and will not be held liable for losses resulting from the use or inability to use the service.
        </li>
        <li>
          <strong>Changes to the Terms</strong><br/>
          Nutrimate reserves the right to modify these Terms at any time. Changes will take effect once published on the Platform. Continued use of the service after the changes implies tacit acceptance of the new terms.
        </li>
        <li>
          <strong>Termination of Service</strong><br/>
          You may cancel your account at any time. Likewise, Nutrimate may suspend or delete accounts that violate these Terms or abuse the service, with or without prior notice.
        </li>
        <li>
          <strong>Governing Law and Jurisdiction</strong><br/>
          These Terms shall be governed by and interpreted in accordance with the laws of [Your country or legal jurisdiction]. Any disputes shall be submitted to the competent courts of said jurisdiction, to the exclusion of any other forum.
        </li>
        <li>
          <strong>Contact</strong><br/>
          For inquiries, notices, or rights requests, please contact the Nutrimate team at:<br/>
          Website: <a href="https://www.nutrimate.net" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">www.nutrimate.net</a>
        </li>
      </ol>
    </main>
  );
} 