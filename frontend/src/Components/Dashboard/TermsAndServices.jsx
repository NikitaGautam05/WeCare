import React from "react";
import { motion } from "framer-motion";

function TermsAndServices() {
  return (
    <div className="w-full bg-gray-50 text-gray-800">
      
      {/* Header */}
      <div className="w-full bg-black text-white py-20">
        <div className=" mx-auto px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Terms & Services
            </h1>
            <p className="mt-4 text-gray-300 text-sm">
              Last Updated: {new Date().toLocaleDateString()}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full min-h-screen mx-auto px-6 md:px-8 py-16 space-y-12">
        
        <Section
  title="1. Acceptance of Terms"
  content={
    <>
      <p>
        By accessing or using Elder Ease, you agree to be legally bound by these Terms & Services. 
        These terms form a binding agreement between you and Elder Ease regarding your use of the platform.
      </p>
      <p>
        If you do not agree to any part of these Terms, you must immediately stop using our services.
        Continued use indicates full acceptance of all rules, obligations, and limitations described herein.
      </p>
    </>
  }
/>

<Section
  title="2. Description of Services"
  content={
    <>
      <p>
        Elder Ease is an online marketplace connecting independent caregivers with individuals or families seeking elder care services.
      </p>
      <p>
        We provide a platform for communication and matching, but do not employ caregivers directly, 
        offer medical services, or oversee day-to-day care. Users are responsible for vetting and managing arrangements independently.
      </p>
    </>
  }
/>

<Section
  title="3. User Registration"
  content={
    <>
      <p>
        Users must provide accurate, complete, and current information during registration. 
        Maintaining the accuracy of your information is your responsibility.
      </p>
      <p>
        You are responsible for keeping your account credentials secure and for all activity conducted under your account. 
        Elder Ease is not liable for unauthorized access caused by negligence or sharing of login details.
      </p>
    </>
  }
/>

<Section
  title="4. Independent Contractor Status"
  content={
    <>
      <p>
        Caregivers using Elder Ease operate as independent contractors. Nothing in these Terms establishes an employer-employee, partnership, or agency relationship between Elder Ease and any user.
      </p>
      <p>
        Users must acknowledge that Elder Ease does not supervise caregivers, provide benefits, or manage schedules. 
        All arrangements are directly handled between the parties.
      </p>
    </>
  }
/>

<Section
  title="5. Caregiver Responsibilities"
  content={
    <>
      <p>
        Caregivers are responsible for ensuring that all qualifications, certifications, licenses, and experience details are accurate and valid.
      </p>
      <p>
        They must comply with applicable laws, including tax obligations, professional licensing, and safety regulations. 
        Any dispute or liability arising from their services is their sole responsibility.
      </p>
    </>
  }
/>

<Section
  title="6. Care Seeker Responsibilities"
  content={
    <>
      <p>
        Care Seekers must verify caregiver credentials, conduct interviews if necessary, and maintain a safe and respectful work environment.
      </p>
      <p>
        Elder Ease provides the platform for connection, but Care Seekers are solely responsible for employment compliance, supervision, and ensuring tasks are legally appropriate.
      </p>
    </>
  }
/>

<Section
  title="7. Payments"
  content={
    <>
      <p>
        All payments and compensation agreements are made directly between Care Seekers and Caregivers. 
        Elder Ease is not involved in payment processing.
      </p>
      <p>
        Users are responsible for negotiating rates, ensuring timely payment, and handling tax obligations. 
        Elder Ease is not responsible for disputes, late payments, or off-platform transactions.
      </p>
    </>
  }
/>

<Section
  title="8. Prohibited Conduct"
  content={
    <>
      <p>
        Users may not engage in any fraudulent, harassing, discriminatory, or unlawful behavior. 
        Misrepresentation of qualifications or intent is strictly prohibited.
      </p>
      <p>
        Elder Ease reserves the right to suspend or terminate accounts for any violation of these Terms. 
        Users must conduct themselves professionally and respectfully at all times.
      </p>
    </>
  }
/>

<Section
  title="9. Limitation of Liability"
  content={
    <>
      <p>
        Elder Ease is not liable for indirect, incidental, or consequential damages resulting from user interactions or platform use. 
        This includes but is not limited to disputes between Care Seekers and Caregivers.
      </p>
      <p>
        Users acknowledge and accept that Elder Ease is a technology platform only and does not guarantee the quality or outcomes of services.
      </p>
    </>
  }
/>

<Section
  title="10. Termination"
  content={
    <>
      <p>
        Elder Ease may suspend or terminate accounts for violations of these Terms, unsafe conduct, or legal reasons.
      </p>
      <p>
        Users may voluntarily close their accounts at any time. Termination does not absolve users from obligations accrued prior to closure, including payments or compliance responsibilities.
      </p>
    </>
  }
/>

<Section
  title="11. Amendments"
  content={
    <>
      <p>
        Elder Ease may update these Terms from time to time to reflect changes in the law, services, or platform features.
      </p>
      <p>
        Users are responsible for reviewing Terms periodically. Continued use of the platform after amendments indicates acceptance of the revised Terms.
      </p>
    </>
  }
/>

      </div>

      {/* Footer */}
      <div className="border-t border-gray-700 py-8 text-center bg-black text-white text-sm">
  © {new Date().getFullYear()} Elder Ease. All rights reserved.
</div>
    </div>
  );
}

function Section({ title, content }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      className="space-y-4"
    >
      <h2 className="text-lg md:text-xl font-semibold text-gray-900">
        {title}
      </h2>
      <div className="text-gray-700 leading-relaxed text-base md:text-lg pl-4 space-y-3">
        {content}
      </div>
    </motion.div>
  );
}


export default TermsAndServices;
