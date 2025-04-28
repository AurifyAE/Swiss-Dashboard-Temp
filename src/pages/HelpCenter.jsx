import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import toast, { Toaster } from "react-hot-toast";

function HelpCenter() {
  const title = "Support";
  const description = "Contact us to get any assistance";
  const [activeTab, setActiveTab] = useState("contact");

  // Form states
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formReset, setFormReset] = useState(false);

  // FAQ states
  const [expandedFAQs, setExpandedFAQs] = useState({});

  // Contact information data
  const contactInfos = [
    {
      title: "Chat With Us",
      details: [
        "Our friendly team is here to help.",
        "Email: aurifycontact@gmail.com",
      ],
    },
    {
      title: "Call Us",
      details: [
        "Available Mon-Sat from 10am to 10pm",
        "Phone: (+91) 971585023411",
      ],
    },
    {
      title: "Meet Our Team",
      details: ["Muhammed Ajmal TK"],
    },
    {
      title: "Stay Connected",
      details: [(
        <span>
          <a
            href="https://www.aurify.ae"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:underline"
          >
            www.aurify.ae
          </a>
        </span>
      )],
    },
  ];

  // Form fields configuration with required property
  const formFields = [
    { id: "firstName", label: "First Name", type: "text", required: true },
    { id: "lastName", label: "Last Name", type: "text", required: true },
    { id: "companyName", label: "Company Name", type: "text", required: true },
    { id: "emailId", label: "Email Id", type: "email", required: true },
    { id: "phoneNumber", label: "Phone Number", type: "tel", required: true },
    {
      id: "concern",
      label: "Tell us your concern",
      type: "textarea",
      rows: 6,
      required: false,
    },
  ];

  // FAQ data
  const technicalFAQs = [
    {
      id: "tech-1",
      question: "What technologies power the trading dashboard?",
      answer:
        "The dashboard is built using a combination of modern web technologies, including React, and a robust backend framework like Node.js. For live rate updates, we use WebSocket connections to ensure real-time data delivery.",
    },
    {
      id: "tech-2",
      question: "How accurate are the live rates displayed on the dashboard?",
      answer:
        "The live rates for gold and silver are sourced from reputable financial data providers and global market feeds. Rates are updated every second to reflect the latest market conditions.",
    },
    {
      id: "tech-3",
      question: "Can I customize the dashboard?",
      answer:
        "Yes, users can customize their dashboard by selecting preferred commodities, adjusting data refresh intervals, and setting alerts for specific price thresholds.",
    },
    {
      id: "tech-4",
      question: "What browsers are supported?",
      answer:
        "The dashboard supports all major browsers, including Google Chrome, Mozilla Firefox, Safari, and Microsoft Edge. For the best experience, we recommend using the latest version of your preferred browser.",
    },
    {
      id: "tech-5",
      question: "Is the platform mobile-friendly?",
      answer:
        "Yes, the dashboard is fully responsive and optimized for use on mobile devices, tablets, and desktops.",
    },
    {
      id: "tech-6",
      question: "How do I troubleshoot display issues?",
      answer:
        "If you experience any display issues, please try refreshing the page or clearing your browser cache. If the problem persists, contact our support team with details of the issue and your browser version.",
    },
    {
      id: "tech-7",
      question: "Can I export data from the dashboard?",
      answer:
        "Yes, you can export data in various formats, including CSV and Excel, for offline analysis and record-keeping.",
    },
  ];

  const securityFAQs = [
    {
      id: "sec-1",
      question: "How secure is the trading dashboard?",
      answer:
        "Security is a top priority. Our platform uses industry-standard encryption protocols (SSL/TLS) to protect data transmissions and ensure secure connections.",
    },
    {
      id: "sec-2",
      question: "What measures are in place to protect my account?",
      answer:
        "We implement multi-factor authentication (MFA) for account access, strong password policies, and account lockout mechanisms after multiple failed login attempts to prevent unauthorized access.",
    },
    {
      id: "sec-3",
      question: "How is my personal data protected?",
      answer:
        "Personal data is stored in encrypted form on secure servers. We comply with data protection regulations like GDPR to ensure your personal information is handled with the highest level of security and privacy.",
    },
    {
      id: "sec-4",
      question: "Is the platform monitored for security threats?",
      answer:
        "Yes, our platform is continuously monitored for potential security threats. We use advanced intrusion detection and prevention systems to safeguard against malicious activity.",
    },
    {
      id: "sec-5",
      question:
        "What should I do if I suspect unauthorized activity on my account?",
      answer:
        "If you suspect unauthorized activity, please contact our support team immediately. We will assist you in securing your account and investigating the issue.",
    },
    {
      id: "sec-6",
      question: "Does the platform offer secure payment options?",
      answer:
        "Yes, all transactions are processed through secure, PCI-compliant payment gateways, ensuring your financial data is protected.",
    },
    {
      id: "sec-7",
      question: "How can I report a security vulnerability?",
      answer: (
        <span>
          If you discover a security vulnerability, please report it to our
          security team via{" "}
          <a
            href="https://www.aurify.ae"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            www.aurify.ae
          </a>
          . We take all reports seriously and will address them promptly.
        </span>
      ),
    },
    {
      id: "sec-8",
      question: "Are there backups in case of data loss?",
      answer:
        "We perform regular data backups and have disaster recovery plans in place to ensure that your data is safe and can be restored in the event of any data loss.",
    },
  ];

  // Tab options
  const tabs = [
    { id: "contact", label: "Contact Us" },
    { id: "faq", label: "FAQs" },
  ];

  useEffect(() => {
    if (formReset) {
      // Reset form fields
      const form = document.getElementById("contactForm");
      if (form) form.reset();
      setFormReset(false);

      // Show toast for form reset
      toast.success("Form has been reset");
    }
  }, [formReset]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Collect form data from DOM elements
    const formData = {};
    let isValid = true;
    let firstInvalidField = null;

    formFields.forEach((field) => {
      const element = document.getElementById(field.id);
      const value = element.value;
      formData[field.id] = value;

      // Validate required fields
      if (field.required && !value.trim()) {
        isValid = false;
        element.classList.add("border-red-500");
        if (!firstInvalidField) firstInvalidField = element;
      } else {
        element.classList.remove("border-red-500");
      }
    });

    if (!isValid) {
      toast.error("Please fill in all required fields");
      // Focus on the first invalid field
      if (firstInvalidField) firstInvalidField.focus();
      return;
    }

    console.log("Form submitted:", formData);
    setFormSubmitted(true);
    toast.success("Form submitted successfully!");
    // Add form submission logic here
  };

  const resetForm = () => {
    setFormReset(true);
    setFormSubmitted(false);

    // Remove any validation styling
    formFields.forEach((field) => {
      const element = document.getElementById(field.id);
      if (element) element.classList.remove("border-red-500");
    });
  };

  const toggleFAQ = (id) => {
    setExpandedFAQs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Helper component for tabs
  const TabButton = ({ id, label, active, onClick }) => (
    <button
      className={`px-0 py-1 ${
        active
          ? "bg-gradient-to-r from-[#32B4DB] to-[#156AEF] bg-clip-text text-transparent border-b-2 border-blue-500 font-semibold"
          : "text-[#555555] font-semibold"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );

  // Helper component for contact info sections
  const ContactInfoSection = ({ title, details }) => (
    <div className="flex flex-col">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-5">
        {details.map((detail, index) => (
          <p key={index} className="text-lg">
            {detail}
          </p>
        ))}
      </div>
    </div>
  );

  // Helper component for form fields using uncontrolled approach with required attribute
  const FormField = ({ id, label, type, rows, required }) => (
    <div className="flex flex-col">
      <label
        htmlFor={id}
        className="font-inter font-semibold text-[16px] text-[#737272]"
      >
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          id={id}
          name={id}
          rows={rows}
          required={required}
          className="border-2 border-[#D9D9D9] rounded-md outline-none px-4 py-2 mt-3 font-semibold"
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          required={required}
          className="border-2 border-[#D9D9D9] rounded-md outline-none px-4 py-2 mt-3 font-semibold"
        />
      )}
    </div>
  );

  // FAQ Item component
  const FAQItem = ({ id, question, answer, isExpanded, onToggle }) => (
    <div className="border-b border-gray-200 py-4">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => onToggle(id)}
      >
        <h3 className="text-lg font-medium text-gray-800">{question}</h3>
        <button
          className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label={isExpanded ? "Collapse answer" : "Expand answer"}
        >
          <span className="text-blue-600 font-bold text-lg leading-none">
            {isExpanded ? "−" : "+"}
          </span>
        </button>
      </div>
      {isExpanded && (
        <div className="mt-3 text-gray-600">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gradient-to-r from-[#E9FAFF] to-[#EEF3F9] h-full">
      <Header title={title} description={description} />
      {/* React Hot Toast component */}
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            style: {
              background: "#EDF7ED",
              color: "#1E4620",
              border: "1px solid #C6E6C9",
            },
            duration: 3000,
          },
          error: {
            style: {
              background: "#FDEDED",
              color: "#5F2120",
              border: "1px solid #F5C2C7",
            },
            duration: 4000,
          },
        }}
      />
      <div className="bg-white rounded-xl mx-16 p-10 mb-16">
        <div className="flex flex-row justify-center gap-20 pb-4">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              id={tab.id}
              label={tab.label}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>
        <div className="mt-6">
          {activeTab === "contact" ? (
            <div>
              <div className="flex flex-col bg-gradient-to-r from-[#32B4DB] to-[#156AEF] rounded-xl text-white p-8">
                <div className="flex justify-center">
                  <h1 className="font-bold text-2xl">Get in Touch</h1>
                </div>
                <div className="flex flex-row justify-between w-full py-6 px-12 mt-6 flex-wrap gap-y-6">
                  {contactInfos.map((info, index) => (
                    <React.Fragment key={index}>
                      <ContactInfoSection
                        title={info.title}
                        details={info.details}
                      />
                      {index < contactInfos.length - 1 && (
                        <div className="w-px bg-[#D9D9D9] mx-4"></div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <form id="contactForm" onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-6 gap-y-5 mt-12 w-full">
                  {formFields.map((field) => (
                    <FormField
                      key={field.id}
                      id={field.id}
                      label={field.label}
                      type={field.type}
                      rows={field.rows}
                      required={field.required}
                    />
                  ))}
                </div>
                <div className="flex flex-row justify-end mt-5 gap-5">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="border-2 text-[#156AEF] border-[#32B4DB] rounded-md font-semibold px-5 py-2 text-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-[#32B4DB] to-[#156AEF] px-4 py-2 rounded-md text-white text-md font-semibold cursor-pointer"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="mx-auto">
              <div className="mb-10">
                <div className="bg-gradient-to-r from-[#32B4DB] to-[#156AEF] rounded-xl text-white p-4 mb-4">
                  <h2 className="text-2xl font-bold text-center">
                    Technical FAQs
                  </h2>
                  <p className="text-center mt-2">
                    Everything you need to know about the technical aspects of
                    our trading dashboard.
                  </p>
                </div>

                <div className="divide-y divide-gray-200">
                  {technicalFAQs.map((faq) => (
                    <FAQItem
                      key={faq.id}
                      id={faq.id}
                      question={faq.question}
                      answer={faq.answer}
                      isExpanded={!!expandedFAQs[faq.id]}
                      onToggle={toggleFAQ}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="bg-gradient-to-r from-[#32B4DB] to-[#156AEF] rounded-xl text-white p-4 mb-4">
                  <h2 className="text-2xl font-bold text-center">
                    Security FAQs
                  </h2>
                  <p className="text-center mt-2">
                    Learn about the security measures we have in place to
                    protect your account and data.
                  </p>
                </div>

                <div className="divide-y divide-gray-200">
                  {securityFAQs.map((faq) => (
                    <FAQItem
                      key={faq.id}
                      id={faq.id}
                      question={faq.question}
                      answer={faq.answer}
                      isExpanded={!!expandedFAQs[faq.id]}
                      onToggle={toggleFAQ}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Still have questions?
                </h3>
                <p className="text-gray-600 mb-4">
                  If you couldn't find the answer to your question, please feel
                  free to contact us directly.
                </p>
                <button
                  onClick={() => setActiveTab("contact")}
                  className="bg-gradient-to-r from-[#32B4DB] to-[#156AEF] px-4 py-2 rounded-md text-white text-md font-semibold cursor-pointer"
                >
                  Contact Us
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HelpCenter;