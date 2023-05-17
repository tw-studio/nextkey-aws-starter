//
// guest › index.spec.ts
//
// App must be running at process.env.URL_LOCAL
//
import { Selector, RequestLogger } from 'testcafe'

const urlLocal: string = process.env.URL_LOCAL ?? 'http://localhost:3000'

fixture `homepage`
  .page (urlLocal)

const logger = RequestLogger()
test.meta({ priority: 'P3' })
  .requestHooks(logger)
  ('WHEN visited,\n  should exist', async t => {
    await t.expect(logger.contains(record => record.response.statusCode === 200)).ok()
})

test.meta({ priority: 'P2' })  
  ('should show title that contains \'Welcome to Guest!\'', async t => {
  const title = Selector('title')

  await t.expect(title.innerText).contains('Welcome to Guest!')
})
