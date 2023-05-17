////
///
// guest › index.page.tsx

import { GetServerSideProps } from 'next'

import { styled } from '@/stitches.config'
import cleanUpDataArray from '@/utils/clean-up-data-array'
import NextKeyWelcome, { type NextKeyBenefitData } from '@components/page/NextKeyWelcome'
import NextKeyBenefit from '@models/NextKeyBenefit'
import { demoNextKeyBenefitJson } from '@resources/DemoContent'

////
///
// MARK: Types

type IndexProps = {
  nextKeyBenefitData: NextKeyBenefitData[]
}

////
///
// MARK: Index

export default function Index({ nextKeyBenefitData }: IndexProps) {
  return (
    <IndexContainer>
      <NextKeyWelcome index="1" nextKeyBenefitData={nextKeyBenefitData} />
    </IndexContainer>
  )
}

const IndexContainer = styled('div', {})

////
///
// MARK: getServerSideProps

export const getServerSideProps: GetServerSideProps = async () => {
  let rawNextKeyBenefitJson
  try {
    const rawNextKeyBenefitData = await NextKeyBenefit.query()
    rawNextKeyBenefitJson = JSON.parse(JSON.stringify(rawNextKeyBenefitData))
    // console.log('Loading demo data from database...')
  } catch (error) {
    // Hardcode fallback for demo purposes only (ex: no database connection)
    rawNextKeyBenefitJson = demoNextKeyBenefitJson
    // console.log('Loading demo data from file...')
  }

  const nextKeyBenefitData = cleanUpDataArray(rawNextKeyBenefitJson, 'fk_nextkey_benefit_id')

  return { props: { nextKeyBenefitData } }
}
