import { showcase, ui } from '../../content/site.js'
import SectionHeading from '../ui/SectionHeading.jsx'
import StatusBadge from '../ui/StatusBadge.jsx'
import Reveal from '../ui/Reveal.jsx'
import PhoneFrame from '../ui/PhoneFrame.jsx'
import AdminDashboardPreview from '../showcases/AdminDashboardPreview.jsx'
import DriverAppPreview from '../showcases/DriverAppPreview.jsx'
import { SignInScreen } from '../showcases/PassengerAppScreens.jsx'

/*
  Layered device composition: Admin Dashboard in a browser, flanked by both phone apps.
  On small screens the phones sit side by side below the browser instead of overlapping it
  (`sm:contents` dissolves their wrapper so they position against the outer box).
*/
function Devices() {
  return (
    <div className="relative mx-auto max-w-[56rem] [perspective:1600px]">
      <div className="sm:mx-[14%] sm:[transform:rotateX(6deg)]">
        <AdminDashboardPreview />
      </div>
      <div className="mt-8 flex justify-center gap-6 sm:contents">
        <div className="float-slow w-[40%] max-w-[11rem] -rotate-3 sm:absolute sm:bottom-[-14%] sm:left-0 sm:w-[19%] sm:max-w-none">
          <PhoneFrame label="Faithful reproduction of Midnight Purple Passenger sign in; empty fields">
            <SignInScreen />
          </PhoneFrame>
        </div>
        <div className="float-slower w-[40%] max-w-[11rem] rotate-3 sm:absolute sm:right-0 sm:bottom-[-14%] sm:w-[19%] sm:max-w-none">
          <PhoneFrame label="Faithful reproduction of Sky Drive identity and licence registration; empty fields">
            <DriverAppPreview />
          </PhoneFrame>
        </div>
      </div>
    </div>
  )
}

export default function Showcase() {
  return (
    <section aria-labelledby="showcase-title" className="showcase-surface section relative overflow-hidden bg-brand-deep">
      <div className="bg-route-grid-dark pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="container-page relative">
        <Reveal>
          <SectionHeading
            tone="dark"
            align="center"
            id="showcase-title"
            eyebrow={showcase.eyebrow}
            title={showcase.title}
            intro={showcase.intro}
          />
        </Reveal>

        <Reveal delay={120} className="mt-10 lg:mt-12">
          <Devices />
        </Reveal>

        <ul className="mt-12 grid border-t border-line-brand sm:mt-24 md:grid-cols-3">
          {showcase.parts.map((part, index) => (
            <Reveal
              as="li"
              key={part.title}
              delay={index * 90}
              className="border-b border-line-brand py-7 md:border-b-0 md:px-8 md:first:pl-0 md:[&:not(:first-child)]:border-l"
            >
              <StatusBadge status={part.status} tone="dark" />
              <h3 className="mt-4 text-h3 font-bold text-on-brand">{part.title}</h3>
              <p className="mt-1.5 text-on-brand-2">{part.text}</p>
            </Reveal>
          ))}
        </ul>
        <p className="mt-6 text-center text-xs text-on-brand-3">{ui.illustrative}</p>
      </div>
    </section>
  )
}
