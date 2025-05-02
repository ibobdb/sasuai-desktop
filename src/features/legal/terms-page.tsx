import { Card } from '@/components/ui/card'
import { WindowControls } from '@/components/window-controls'
import { Link } from '@tanstack/react-router'

export default function TermsPage() {
  return (
    <div className="h-svh flex flex-col bg-background relative">
      {/* Title bar with drag region and window controls */}
      <div className="h-10 w-full titlebar-drag-region absolute top-0 left-0 pointer-events-none">
        <div className="absolute top-2 right-2 z-50 pointer-events-auto">
          <WindowControls />
        </div>
      </div>

      {/* Main content with correct overflow handling */}
      <div className="flex-1 w-full overflow-auto pt-10">
        <div className="container py-8 max-w-4xl mx-auto">
          <div className="mb-6 flex items-center">
            <Link
              to="/sign-in"
              className="flex items-center text-sm text-primary hover:underline mr-4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              Back
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
          </div>

          <Card className="p-8 shadow-md">
            <div className="legal-document">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-mono font-bold mb-2">TERMS OF SERVICE</h1>
                <p className="text-sm font-mono">Last Updated: May 1, 2025</p>
              </div>

              <p className="font-mono text-sm mb-6 leading-relaxed">
                PLEASE READ THESE TERMS AND CONDITIONS CAREFULLY BEFORE USING OUR SERVICE. BY
                ACCESSING OR USING THE SASUAI STORE APPLICATION, YOU AGREE TO BE BOUND BY THESE
                TERMS OF SERVICE.
              </p>

              <div className="mb-6 pb-4 border-b border-muted">
                <h2 className="font-mono text-lg font-bold mb-3">1. INTRODUCTION</h2>
                <p className="font-mono text-sm pl-4 leading-relaxed">
                  1.1. Samunu Team (hereinafter &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
                  provides a provides a software application and related services (collectively, the
                  &quot;Service&quot;) the following Terms of Service (&quot;Terms&quot;).
                </p>
                <p className="font-mono text-sm pl-4 mt-2 leading-relaxed">
                  1.2. These Terms constitute a legally binding agreement between you and Samunu
                  Team regarding your use of the Service.
                </p>
              </div>

              <div className="mb-6 pb-4 border-b border-muted">
                <h2 className="font-mono text-lg font-bold mb-3">2. DEFINITIONS</h2>
                <p className="font-mono text-sm pl-4 leading-relaxed">
                  2.1. &quot;Service&quot; refers to the Sasuai Store application, website, and any
                  related services provided by us.
                </p>
                <p className="font-mono text-sm pl-4 mt-2 leading-relaxed">
                  2.2. &quot;User,&quot; &quot;you,&quot; and &quot;your&quot; refers to the
                  individual or entity using our Service.
                </p>
                <p className="font-mono text-sm pl-4 mt-2 leading-relaxed">
                  2.3. &quot;Content&quot; refers to text, graphics, images, music, software, audio,
                  video, information or other materials.
                </p>
              </div>

              <div className="mb-6 pb-4 border-b border-muted">
                <h2 className="font-mono text-lg font-bold mb-3">
                  3. ACCOUNT REGISTRATION AND SECURITY
                </h2>
                <p className="font-mono text-sm pl-4 leading-relaxed">
                  3.1. To use certain features of our Service, you may be required to register for
                  an account.
                </p>
                <p className="font-mono text-sm pl-4 mt-2 leading-relaxed">
                  3.2. You agree to provide accurate, current, and complete information during the
                  registration process and to update such information to keep it accurate, current,
                  and complete.
                </p>
                <p className="font-mono text-sm pl-4 mt-2 leading-relaxed">
                  3.3. You are solely responsible for safeguarding your password and for all
                  activity that occurs under your account.
                </p>
                <p className="font-mono text-sm pl-4 mt-2 leading-relaxed">
                  3.4. You agree to notify us immediately of any unauthorized use of your account or
                  any other breach of security.
                </p>
              </div>

              <div className="mb-6 pb-4 border-b border-muted">
                <h2 className="font-mono text-lg font-bold mb-3">4. USER CONDUCT</h2>
                <p className="font-mono text-sm pl-4 leading-relaxed">
                  You agree not to use the Service to:
                </p>
                <ol className="list-decimal pl-8 mt-2 text-sm font-mono space-y-1 leading-relaxed">
                  <li>Violate any applicable local, state, national, or international law;</li>
                  <li>
                    Infringe any intellectual property or other right of any person or entity;
                  </li>
                  <li>Distribute malicious software or engage in hacking activities;</li>
                  <li>
                    Transmit any material that is defamatory, obscene, or otherwise objectionable;
                  </li>
                  <li>
                    Interfere with or disrupt the Service or servers connected to the Service;
                  </li>
                  <li>Attempt to gain unauthorized access to our systems or user accounts;</li>
                  <li>
                    Collect or store personal data about other users without their express consent.
                  </li>
                </ol>
              </div>

              <div className="mb-6 pb-4 border-b border-muted">
                <h2 className="font-mono text-lg font-bold mb-3">
                  5. INTELLECTUAL PROPERTY RIGHTS
                </h2>
                <p className="font-mono text-sm pl-4 leading-relaxed">
                  5.1. The Service and its original content, features, and functionality are owned
                  by Samunu Team and are protected by international copyright, trademark, patent,
                  trade secret, and other intellectual property or proprietary rights laws.
                </p>
                <p className="font-mono text-sm pl-4 mt-2 leading-relaxed">
                  5.2. You may not duplicate, copy, or reuse any portion of the HTML/CSS,
                  JavaScript, visual design elements, or concepts without express written permission
                  from Samunu Team.
                </p>
              </div>

              <div className="mb-6 pb-4 border-b border-muted">
                <h2 className="font-mono text-lg font-bold mb-3">6. PRIVACY</h2>
                <p className="font-mono text-sm pl-4 leading-relaxed">
                  6.1. Your use of our Service is also governed by our Privacy Policy, which can be
                  found at{' '}
                  <Link to="/privacy" className="text-primary hover:underline">
                    https://sasuaistore.com/privacy
                  </Link>
                  .
                </p>
                <p className="font-mono text-sm pl-4 mt-2 leading-relaxed">
                  6.2. By using the Service, you consent to all actions we take with respect to your
                  information consistent with our Privacy Policy.
                </p>
              </div>

              <div className="mb-6 pb-4 border-b border-muted">
                <h2 className="font-mono text-lg font-bold mb-3">7. TERMINATION</h2>
                <p className="font-mono text-sm pl-4 leading-relaxed">
                  7.1. We reserve the right to terminate or suspend your account and access to our
                  Service at our sole discretion, without notice, for conduct that we believe
                  violates these Terms or is harmful to other users, us, or third parties.
                </p>
                <p className="font-mono text-sm pl-4 mt-2 leading-relaxed">
                  7.2. All provisions of these Terms which by their nature should survive
                  termination shall survive termination, including, without limitation, ownership
                  provisions, warranty disclaimers, indemnity and limitations of liability.
                </p>
              </div>

              <div className="mb-6 pb-4 border-b border-muted">
                <h2 className="font-mono text-lg font-bold mb-3">8. CONTACT INFORMATION</h2>
                <p className="font-mono text-sm pl-4 leading-relaxed">
                  8.1. If you have questions about these Terms, please contact us:
                </p>
                <p className="font-mono text-sm pl-4 mt-2 leading-relaxed">
                  By email: nestorzamili@gmail.com
                  <br />
                  By visiting this page on our website:
                  <a
                    href="https://nestorzamili.works/#contact"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline ml-1"
                  >
                    https://nestorzamili.works/#contact
                  </a>
                </p>
              </div>

              <div className="mt-8 mb-4">
                <p className="font-mono text-sm italic text-center">
                  By using Sasuai Store, you acknowledge that you have read and understood these
                  Terms of Service and agree to be bound by them.
                </p>
              </div>
            </div>
          </Card>

          <div className="mt-8 mb-4 text-center text-sm text-muted-foreground font-mono">
            &copy; {new Date().getFullYear()} Samunu Team. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  )
}
