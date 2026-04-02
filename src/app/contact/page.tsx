'use client';

import { useState, useEffect } from 'react';
import { FiMail, FiMessageSquare, FiGithub, FiLinkedin, FiTwitter, FiLoader, FiCheck, FiAlertCircle } from 'react-icons/fi';
import BackgroundPattern from '@/components/BackgroundPattern';
import ContentCard from '@/components/ContentCard';
import { Metadata } from 'next';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    confirmEmail: '',
    message: ''
  });

  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [contactInfo, setContactInfo] = useState({
    email: 'contact@example.com',
    location: 'Location',
    connectText: 'Get in touch'
  });

  const [emailValidation, setEmailValidation] = useState({
    isValid: false,
    message: '',
    typingEmail: false,
    typingConfirm: false,
    match: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({
    success: false,
    message: ''
  });

  // Fetch social links and contact info on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch social links
        const socialResponse = await fetch('/api/social-links');
        if (socialResponse.ok) {
          const socialData = await socialResponse.json();
          setSocialLinks(socialData.socialLinks || []);
        }

        // Fetch contact info
        const contactResponse = await fetch('/api/cv/contact');
        if (contactResponse.ok) {
          const contactData = await contactResponse.json();
          if (contactData.contact) {
            setContactInfo(contactData.contact);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Enhanced email validation
  const validateEmail = (email) => {
    // Regular expression for strict email validation
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!email) {
      return { isValid: false, message: '' };
    } else if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }
    return { isValid: true, message: 'Email is valid' };
  };

  // Check if emails match
  useEffect(() => {
    if (formData.email && formData.confirmEmail) {
      setEmailValidation(prev => ({
        ...prev,
        match: formData.email === formData.confirmEmail,
      }));
    } else {
      setEmailValidation(prev => ({
        ...prev,
        match: false,
      }));
    }
  }, [formData.email, formData.confirmEmail]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Handle email validation
    if (name === 'email') {
      const validation = validateEmail(value);
      setEmailValidation(prev => ({
        ...prev,
        isValid: validation.isValid,
        message: validation.message,
        typingEmail: true,
      }));
    }

    // Mark when user is typing in confirm email field
    if (name === 'confirmEmail') {
      setEmailValidation(prev => ({
        ...prev,
        typingConfirm: true,
      }));
    }
  };

  // Handle form field blur events
  const handleBlur = (e) => {
    const { name, value } = e.target;

    if (name === 'email' && value) {
      const validation = validateEmail(value);
      setEmailValidation(prev => ({
        ...prev,
        isValid: validation.isValid,
        message: validation.message,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate emails match before submission
    if (formData.email !== formData.confirmEmail) {
      setSubmitStatus({
        success: false,
        message: 'Email addresses do not match. Please check and try again.'
      });
      return;
    }

    setIsSubmitting(true);

    // Create a copy of form data without confirmEmail for submission
    const submissionData = {
      name: formData.name,
      email: formData.email,
      message: formData.message,
    };

    try {
      const response = await fetch('https://formspree.io/f/mpwdwkbp', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });

      const data = await response.json();

      if (response.ok) {
        // Success
        setSubmitStatus({
          success: true,
          message: 'Your message has been sent successfully! I\'ll get back to you soon.'
        });

        // Reset form
        setFormData({ name: '', email: '', confirmEmail: '', message: '' });
        setEmailValidation({
          isValid: false,
          message: '',
          typingEmail: false,
          typingConfirm: false,
          match: false
        });
      } else {
        // API error
        setSubmitStatus({
          success: false,
          message: data.error || 'Failed to send message. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus({
        success: false,
        message: 'An unexpected error occurred. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BackgroundPattern>
      <div className="container max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">Contact Me</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get in touch for opportunities, collaborations, or just to say hello.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <ContentCard className="p-8 h-full flex flex-col">
            <h2 className="text-2xl font-bold mb-6">Let's Connect</h2>
            <p className="text-muted-foreground mb-8">
              {contactInfo.connectText}
            </p>

            <div className="space-y-6 mt-auto">
              <div className="flex items-center">
                <FiMail className="h-6 w-6 text-primary mr-4" />
                <div>
                  <h3 className="font-medium">Email</h3>
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="text-muted-foreground hover:text-primary"
                  >
                    {contactInfo.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center">
                <FiMessageSquare className="h-6 w-6 text-primary mr-4" />
                <div>
                  <h3 className="font-medium">Social Media</h3>
                  <div className="flex mt-2 space-x-4">
                    {socialLinks.length > 0 ? (
                      socialLinks.map((link) => {
                        const getIcon = (platform: string) => {
                          switch (platform.toLowerCase()) {
                            case 'github': return FiGithub;
                            case 'linkedin': return FiLinkedin;
                            case 'twitter': return FiTwitter;
                            default: return FiMessageSquare;
                          }
                        };
                        const IconComponent = getIcon(link.platform);
                        return (
                          <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <IconComponent className="h-5 w-5" />
                            <span className="sr-only">{link.platform}</span>
                          </a>
                        );
                      })
                    ) : (
                      // Fallback social links
                      <>
                        <a
                          href="https://github.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <FiGithub className="h-5 w-5" />
                          <span className="sr-only">GitHub</span>
                        </a>
                        <a
                          href="https://linkedin.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <FiLinkedin className="h-5 w-5" />
                          <span className="sr-only">LinkedIn</span>
                        </a>
                        <a
                          href="https://twitter.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <FiTwitter className="h-5 w-5" />
                          <span className="sr-only">Twitter</span>
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ContentCard>

          <ContentCard className="p-8 h-full">
            <h2 className="text-2xl font-bold mb-6">Send a Message</h2>

            {submitStatus.success ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-md p-4 mb-6">
                <p className="text-green-800 dark:text-green-200">{submitStatus.message}</p>
                <button
                  onClick={() => setSubmitStatus({ success: false, message: '' })}
                  className="mt-4 text-sm text-primary hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {submitStatus.message && !submitStatus.success && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-md p-4 mb-2">
                    <p className="text-red-800 dark:text-red-200">{submitStatus.message}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                    className="w-full px-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary border-input"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="your.email@example.com"
                      required
                      className={`w-full px-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary ${emailValidation.typingEmail && !emailValidation.isValid ? 'border-red-500' : 'border-input'
                        } ${emailValidation.isValid ? 'pr-10' : ''
                        }`}
                    />
                    {emailValidation.isValid && (
                      <FiCheck className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" />
                    )}
                  </div>
                  {emailValidation.typingEmail && !emailValidation.isValid && formData.email && (
                    <p className="mt-1 text-sm text-red-500">{emailValidation.message || 'Please enter a valid email'}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmEmail" className="block text-sm font-medium mb-2">
                    Confirm Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="confirmEmail"
                      name="confirmEmail"
                      value={formData.confirmEmail}
                      onChange={handleChange}
                      placeholder="Confirm your email address"
                      required
                      className={`w-full px-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary ${emailValidation.typingConfirm && formData.confirmEmail && !emailValidation.match
                        ? 'border-red-500'
                        : 'border-input'
                        } ${emailValidation.match ? 'pr-10' : ''
                        }`}
                    />
                    {emailValidation.match && (
                      <FiCheck className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" />
                    )}
                    {emailValidation.typingConfirm && formData.confirmEmail && !emailValidation.match && (
                      <FiAlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" />
                    )}
                  </div>
                  {emailValidation.typingConfirm && formData.confirmEmail && !emailValidation.match && (
                    <p className="mt-1 text-sm text-red-500">Email addresses do not match</p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Your message"
                    required
                    className="w-full px-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary border-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !emailValidation.isValid || !emailValidation.match}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md transition-colors flex items-center justify-center disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <FiLoader className="animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            )}
          </ContentCard>
        </div>
      </div>
    </BackgroundPattern>
  );
} 