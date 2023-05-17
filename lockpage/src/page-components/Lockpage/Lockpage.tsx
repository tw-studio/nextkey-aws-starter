////
///
// Lockpage page component

import React from 'react'

import Head from 'next/head'

import { styled } from '../../../../stitches.config'
import Lockbox from '../../components/Lockbox'
import { HttpClient } from '../../types'

////
///
// MARK: Types

type LockpageProps = {
  httpClient: HttpClient
}

type LockpageState = {
  inputValue: string
  placeholder: string
}

////
///
// MARK: Lockpage

const keyName = 'theKey'

export default class Lockpage extends React.Component<
  LockpageProps,
  LockpageState
> {
  constructor(props: LockpageProps) {
    super(props)
    this.state = {
      inputValue: '',
      placeholder: 'welcome',
    }
    
    this.handleUnlock = this.handleUnlock.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  handleUnlock(httpClient: HttpClient, inputValue: string) {
    return (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const bodyData: Record<string, string> = {}
      bodyData[keyName] = inputValue
      httpClient
        .post('/unlock')
        .type('application/json')
        .send(`{"${keyName}":"${inputValue}"}`)
        .then(() => {
          // Navigate to root on success response
          window.location.replace('../')
        })
        .catch(() => {
          this.setState({
            inputValue: '',
            placeholder: 'nope',
          })
        })
    }
  }

  handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      inputValue: event.target.value,
    })
  }

  render() {
    return (
      <LockpageContainer>
        <Head>
          <title>enter</title>
        </Head>
        <Main>
          <Lockbox
            submitHandler={this.handleUnlock}
            httpClient={this.props.httpClient}
            inputValue={this.state.inputValue}
            changeHandler={this.handleChange}
            placeholder={this.state.placeholder}
          />
        </Main>
      </LockpageContainer>
    )
  }
}

const LockpageContainer = styled('div', {
  backgroundColor: '#ffffff',
})

const Main = styled('main', {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  minHeight: '90vh',
  minWidth: '100vw',

  '@sm': { minHeight: '100vh' },
})
