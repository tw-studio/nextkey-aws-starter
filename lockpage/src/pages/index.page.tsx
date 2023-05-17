////
///
// index.page.tsx (lockpage)

import { styled } from '../../../stitches.config'
import SuperagentHttpClient from '../lib/SuperagentHttpClient'
import Lockpage from '../page-components/Lockpage'

export default function Index() {
  const httpClient = new SuperagentHttpClient()
  return (
    <IndexContainer>
      <Lockpage httpClient={httpClient} />
    </IndexContainer>
  )
}

const IndexContainer = styled('div', {})
