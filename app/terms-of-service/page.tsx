import React from "react";

export default function TermsOfServicePage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12 text-justify">
      <h1 className="text-3xl font-bold mb-2 text-center">Terms of Service</h1>
      <ol className="list-decimal pl-4 space-y-4">
        <li>
          <strong>Acceptance of Terms</strong><br />
          By creating an account or using NutriMate ("the Service"), you agree to these Terms of Service ("Agreement").<br />
          If you do not agree to these terms, you may not use the Service.
        </li>
        <li>
          <strong>Description of the Service</strong><br />
          NutriMate is a web-based meal planning application designed for personal and recreational use only. The Service includes tools for:
          <ul className="list-disc pl-6 mt-2">
            <li>Meal planning and recipe discovery.</li>
            <li>Generating shopping lists based on selected meals.</li>
            <li>Nutritional analysis of meals and meal plans.</li>
            <li>Calorie calculators.</li>
            <li>Saving dietary preferences, restrictions, and personal goals.</li>
            <li>Accessing premium features such as advanced planning, additional recipes, unlimited lists, and enhanced customization.</li>
          </ul>
          <br />
          NutriMate is not a medical service, does not offer professional nutritional or dietary advice, and is not intended to replace consultation with qualified healthcare providers.
        </li>
        <li>
          <strong>Medical Disclaimer</strong><br />
          All content and tools provided through NutriMate are intended for informational and entertainment purposes only.<br />
          They are not a substitute for professional medical advice, diagnosis, or treatment.<br />
          Always consult with your physician, nutritionist, or healthcare professional before making health-related decisions or starting any new diet or meal plan.<br />
          Do not use NutriMate to diagnose, treat, or manage health conditions.
        </li>
        <li>
          <strong>User Accounts and Eligibility</strong><br />
          To use the Service, you must create an account and be at least 18 years old. You are responsible for:
          <ul className="list-disc pl-6 mt-2">
            <li>Providing accurate, complete, and updated information.</li>
            <li>Maintaining the confidentiality of your account credentials.</li>
            <li>All activity under your account, including unauthorized access.</li>
          </ul>
          NutriMate reserves the right to suspend or terminate accounts at its sole discretion, including for violations of these terms.
        </li>
        <li>
          <strong>Subscriptions and Payments</strong><br />
          NutriMate offers both free and paid subscriptions (monthly or annual plans). Paid subscriptions provide access to additional features and content.<br />
          Payments are processed via third-party services (such as Stripe or similar), and NutriMate does not store sensitive payment data, except for minimal identifiers (such as the last 4 digits of your card).<br />
          Subscription prices may change. Continued use of the Service after price changes implies acceptance of the new rates.<br />
          Free trials may be offered; after the trial ends, billing begins automatically unless you cancel in advance.
        </li>
        <li>
          <strong>User Content and Conduct</strong><br />
          Premium users may upload content such as recipes. By uploading content, you grant NutriMate a non-exclusive, worldwide, royalty-free license to use, display, reproduce, and share such content within the Service.<br />
          You are solely responsible for:
          <ul className="list-disc pl-6 mt-2">
            <li>Ensuring your content does not violate any laws, intellectual property rights, or privacy rights.</li>
            <li>Not uploading harmful, malicious, or inappropriate content.</li>
            <li>Obtaining necessary permissions from third parties if applicable.</li>
          </ul>
          NutriMate reserves the right to review, modify, or remove any content at its sole discretion.
        </li>
        <li>
          <strong>Prohibited Uses</strong><br />
          You may not:
          <ul className="list-disc pl-6 mt-2">
            <li>Use automated tools (bots, scrapers, etc.) to access the Service.</li>
            <li>Resell, redistribute, or publicly display any part of the Service.</li>
            <li>Attempt to bypass any security or access controls.</li>
            <li>Use the Service for unlawful or unauthorized purposes.</li>
          </ul>
          Violation of these terms may result in immediate termination of your account.
        </li>
        <li>
          <strong>Intellectual Property</strong><br />
          All intellectual property related to NutriMate, including trademarks, logos, designs, and code, remains the exclusive property of the company or its licensors.<br />
          Users may not reproduce, distribute, or create derivative works from the Service without prior written consent.
        </li>
        <li>
          <strong>DMCA Notice (Copyright Infringement)</strong><br />
          If you believe your copyrighted work has been infringed on NutriMate, please submit a DMCA takedown notice containing:
          <ul className="list-disc pl-6 mt-2">
            <li>Your physical or electronic signature.</li>
            <li>Identification of the copyrighted work.</li>
            <li>Identification of the infringing material and its location on the Service.</li>
            <li>Your contact information.</li>
            <li>A statement under penalty of perjury that you are authorized to act on behalf of the copyright owner.</li>
          </ul>
          Send notices to: [Your Contact Email Here]<br />
          Subject: DMCA Notice - NutriMate
        </li>
        <li>
          <strong>Limitation of Liability</strong><br />
          NutriMate is provided "as is" and "as available" without warranties of any kind.<br />
          We are not responsible for:
          <ul className="list-disc pl-6 mt-2">
            <li>Any inaccuracies, interruptions, or errors in the Service.</li>
            <li>Decisions made based on Service content or tools.</li>
            <li>Any loss of data, profits, or damages resulting from the use of the Service.</li>
          </ul>
          In no case shall our total liability exceed USD 100.
        </li>
        <li>
          <strong>Governing Law and Jurisdiction</strong><br />
          This Agreement is governed by the laws of Argentina.<br />
          Any dispute arising from these Terms shall be resolved in the courts of Argentina.
        </li>
        <li>
          <strong>Changes to These Terms</strong><br />
          NutriMate reserves the right to update these Terms of Service at any time.<br />
          Changes will be posted on the website, and continued use of the Service constitutes acceptance of the new terms.
        </li>
        <li>
          <strong>Contact Information</strong><br />
          For any questions or concerns regarding these Terms of Service, please contact:<br />
          NutriMate<br />
          [Your Business Address Here]<br />
          Email: [Your Contact Email Here]
        </li>
      </ol>
    </main>
  );
}
1