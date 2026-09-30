import SiteView from '@/features/website/components/SiteView'
import { defaultSections, defaultSettings } from '@/features/website/content/defaults'
export default function Template() { return <SiteView settings={defaultSettings} sections={defaultSections} demo /> }
