import Link from "next/link";
import { Eyebrow } from "@/components/primitives/SectionLabel";
import { CONTACT_EMAIL, CONTACT_EMAIL_HREF, SITE_LEGAL_NAME, SITE_NAME } from "@/lib/site";

/**
 * Privacy Policy. Describes the website as it actually behaves today: an enquiry form that emails KUSP, no enquiry database,
 * no analytics and no tracking cookies. If any of that changes, this page must change with it.
 */
export function PrivacyPage() {
  return (
    <section className="page-section privacy" data-header-tone="light" aria-labelledby="privacy-title">
      <div className="pv-wrap">
        <Eyebrow>{SITE_NAME} / PRIVACY</Eyebrow>
        <h1 id="privacy-title">
          Privacy <em>Policy.</em>
        </h1>
        <p className="pv-meta">{SITE_NAME} · {SITE_LEGAL_NAME} · Last updated 10 October 2026</p>
        <p className="body-copy pv-lead">
          This policy explains what personal information {SITE_NAME} ({SITE_LEGAL_NAME}) receives through this website, why, and what happens to it.
        </p>

        <div className="pv-body">
          <section aria-labelledby="pv-1">
            <h2 id="pv-1">Information you send us</h2>
            <p>When you use the enquiry form on the <Link href="/contact">Contact page</Link>, we receive:</p>
            <ul>
              <li>your name and organisation;</li>
              <li>your email address and, if you choose to give it, your phone number;</li>
              <li>the sector, support required and project stage you select;</li>
              <li>the enquiry message you write.</li>
            </ul>
            <p>Please do not include confidential or sensitive information in the message.</p>
          </section>

          <section aria-labelledby="pv-2">
            <h2 id="pv-2">How we use it</h2>
            <p>We use this information to respond to your enquiry. Submitting the form does not subscribe you to any mailing list, and we do not send marketing messages as a result of it.</p>
          </section>

          <section aria-labelledby="pv-3">
            <h2 id="pv-3">How enquiries are handled</h2>
            <p>
              Each enquiry is sent by email to {SITE_NAME} at <a href={CONTACT_EMAIL_HREF}>{CONTACT_EMAIL}</a>. The website does not keep an enquiry database and does not store the content of your enquiry itself.
              Hosting and email systems may create ordinary technical and security logs (for example, that a request was made), which are not used to keep your enquiry content.
            </p>
          </section>

          <section aria-labelledby="pv-4">
            <h2 id="pv-4">Service providers</h2>
            <p>Third-party hosting and email providers process data only as needed to run the website and deliver your enquiry to us.</p>
          </section>

          <section aria-labelledby="pv-5">
            <h2 id="pv-5">Cookies and analytics</h2>
            <p>
              This website does not currently use analytics or advertising tools and does not set tracking cookies. If that changes, this policy will be updated.
              If you choose to contact us on WhatsApp, that conversation takes place on WhatsApp and is subject to WhatsApp&apos;s own terms and privacy practices.
            </p>
          </section>

          <section aria-labelledby="pv-6">
            <h2 id="pv-6">How long we keep it</h2>
            <p>Enquiry correspondence may be retained only as reasonably necessary to respond to you, for business records, and to meet legal or operational requirements.</p>
          </section>

          <section aria-labelledby="pv-7">
            <h2 id="pv-7">Your information</h2>
            <p>
              You may contact us about the personal information you have given us, including to ask what we hold or to request correction or deletion, at <a href={CONTACT_EMAIL_HREF}>{CONTACT_EMAIL}</a>.
            </p>
          </section>

          <section aria-labelledby="pv-8">
            <h2 id="pv-8">Changes to this policy</h2>
            <p>We may update this policy as the website changes. The date above shows when it was last updated.</p>
          </section>
        </div>
      </div>
    </section>
  );
}
