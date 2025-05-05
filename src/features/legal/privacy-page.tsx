import { Card } from '@/components/ui/card'
import { WindowControls } from '@/components/window-controls'
import { Link } from '@tanstack/react-router'

export default function PrivacyPage() {
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
            <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          </div>

          <Card className="p-8 shadow-md">
            <div className="legal-document">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-mono font-bold mb-2">PRIVACY POLICY</h1>
                <p className="text-sm font-mono">Last Updated: May 1, 2025</p>
              </div>

              <p className="font-mono text-sm mb-6 leading-relaxed">
                THIS PRIVACY POLICY DESCRIBES HOW SAMUNU TEAM (&quot;WE&quot;, &quot;OUR&quot;, OR
                &quot;US&quot;) COLLECTS, USES, AND DISCLOSES YOUR PERSONAL INFORMATION WHEN YOU USE
                OUR SASUAI STORE APPLICATION AND SERVICES.
              </p>

              <div className="mb-6 pb-4 border-b border-muted">
                <h2 className="font-mono text-lg font-bold mb-3">1. INFORMATION COLLECTION</h2>
                <p className="font-mono text-sm pl-4 leading-relaxed">
                  1.1. <strong>Personal Information.</strong> We may collect personally identifiable
                  information that you provide to us, such as your name, email address, phone
                  number, and billing information.
                </p>
                <p className="font-mono text-sm pl-4 mt-2 leading-relaxed">
                  1.2. <strong>Account Information.</strong> If you create an account with us, we
                  collect your login credentials, account preferences, and related information.
                </p>
                <p className="font-mono text-sm pl-4 mt-2 leading-relaxed">
                  1.3. <strong>Usage Data.</strong> We automatically collect information about how
                  you interact with our Service, including the features you use, the time spent, and
                  other statistical data.
                </p>
                <p className="font-mono text-sm pl-4 mt-2 leading-relaxed">
                  1.4. <strong>Device Information.</strong> We may collect information about your
                  device, including IP address, browser type, operating system, and device
                  identifiers.
                </p>
              </div>

              <div className="mb-6 pb-4 border-b border-muted">
                <h2 className="font-mono text-lg font-bold mb-3">2. USE OF INFORMATION</h2>
                <p className="font-mono text-sm pl-4 leading-relaxed">
                  2.1. We use the information we collect for the following purposes:
                </p>
                <ol
                  type="a"
                  className="list-[lower-alpha] pl-8 mt-2 text-sm font-mono space-y-1 leading-relaxed"
                >
                  <li>To provide and maintain our Service;</li>
                  <li>To notify you about changes to our Service;</li>
                  <li>To allow you to participate in interactive features;</li>
                  <li>To provide customer support;</li>
                  <li>To gather analysis or valuable information to improve our Service;</li>
                  <li>To monitor the usage of our Service;</li>
                  <li>To detect, prevent, and address technical issues;</li>
                  <li>To fulfill any other purpose for which you provide it.</li>
                </ol>
              </div>

              <div className="mb-6 pb-4 border-b border-muted">
                <h2 className="font-mono text-lg font-bold mb-3">3. DATA STORAGE AND SECURITY</h2>
                <p className="font-mono text-sm pl-4 leading-relaxed">
                  3.1. We implement reasonable security measures to protect the security of your
                  personal information from unauthorized access, alteration, disclosure, or
                  destruction.
                </p>
                <p className="font-mono text-sm pl-4 mt-2 leading-relaxed">
                  3.2. Despite our efforts, no method of transmission over the Internet or method of
                  electronic storage is 100% secure. We cannot guarantee absolute security of your
                  data.
                </p>
              </div>

              <div className="mb-6 pb-4 border-b border-muted">
                <h2 className="font-mono text-lg font-bold mb-3">4. DATA RETENTION</h2>
                <p className="font-mono text-sm pl-4 leading-relaxed">
                  4.1. We will retain your personal information only for as long as is necessary for
                  the purposes set out in this Privacy Policy.
                </p>
                <p className="font-mono text-sm pl-4 mt-2 leading-relaxed">
                  4.2. We will retain and use your information to the extent necessary to comply
                  with our legal obligations, resolve disputes, and enforce our policies.
                </p>
              </div>

              <div className="mb-6 pb-4 border-b border-muted">
                <h2 className="font-mono text-lg font-bold mb-3">5. YOUR DATA RIGHTS</h2>
                <p className="font-mono text-sm pl-4 leading-relaxed">
                  5.1. Depending on your location, you may have the following rights regarding your
                  data:
                </p>
                <ol
                  type="a"
                  className="list-[lower-alpha] pl-8 mt-2 text-sm font-mono space-y-1 leading-relaxed"
                >
                  <li>The right to access information we hold about you;</li>
                  <li>
                    The right to request correction of any inaccurate personal information we hold;
                  </li>
                  <li>The right to request erasure of your personal data;</li>
                  <li>The right to restrict or object to our processing of your personal data;</li>
                  <li>
                    The right to request the transfer of your personal data to you or a third party;
                  </li>
                  <li>
                    The right to withdraw consent at any time where we rely on consent to process
                    your personal data.
                  </li>
                </ol>
              </div>

              <div className="mb-6 pb-4 border-b border-muted">
                <h2 className="font-mono text-lg font-bold mb-3">6. CHILDREN&apos;S PRIVACY</h2>
                <p className="font-mono text-sm pl-4 leading-relaxed">
                  6.1. Our Service does not address anyone under the age of 18
                  (&quot;Children&quot;).
                </p>
                <p className="font-mono text-sm pl-4 mt-2 leading-relaxed">
                  6.2. We do not knowingly collect personally identifiable information from anyone
                  under the age of 18. If you are a parent or guardian and you are aware that your
                  Child has provided us with Personal Data, please contact us. If we become aware
                  that we have collected Personal Data from children without verification of
                  parental consent, we take steps to remove that information from our servers.
                </p>
              </div>

              <div className="mb-6 pb-4 border-b border-muted">
                <h2 className="font-mono text-lg font-bold mb-3">
                  7. CHANGES TO THIS PRIVACY POLICY
                </h2>
                <p className="font-mono text-sm pl-4 leading-relaxed">
                  7.1. We may update our Privacy Policy from time to time. We will notify you of any
                  changes by posting the new Privacy Policy on this page and updating the &quot;Last
                  Updated&quot; date.
                </p>
                <p className="font-mono text-sm pl-4 mt-2 leading-relaxed">
                  7.2. You are advised to review this Privacy Policy periodically for any changes.
                  Changes to this Privacy Policy are effective when they are posted on this page.
                </p>
              </div>

              <div className="mb-6 pb-4 border-b border-muted">
                <h2 className="font-mono text-lg font-bold mb-3">8. CONTACT US</h2>
                <p className="font-mono text-sm pl-4 leading-relaxed">
                  8.1. If you have any questions about this Privacy Policy, please contact us:
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
                  By using Sasuai Store, you acknowledge that you have read and understood this
                  Privacy Policy and agree to its terms.
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
