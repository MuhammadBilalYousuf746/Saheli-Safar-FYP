import DriverExperience from '../components/sections/DriverExperience.jsx'
import WaveTransition from '../components/ui/WaveTransition.jsx'

export default function DriversPage() {
  return <div className="driver-page-theme">
    <WaveTransition from="#F5F0FA" middle="#8CB8D8" to="#2F6F9D" className="relative block h-10 w-full sm:h-14" />
    <DriverExperience headingLevel={1} />
  </div>
}
