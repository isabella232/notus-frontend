import React, { PureComponent } from 'react'
import Vivus from 'vivus'

import { SignupForm } from '~/components/SignupForm'
import Diagram from '~/assets/images/diagram10.svg'
import NotusWordmarkWhitePinkShadow from '~/assets/images/notus-wordmark--white-pink-shadow4.svg'

export const LandingHero = class extends PureComponent {
  componentDidMount() {
    new Vivus(
      'diagram',
      {
        duration: 200, type: 'sync', animTimingFunction: Vivus.EASE_IN_OUT
      }
    )
  }

  render () {
    const { setSuccess, success } = this.props

    return (
      <section
        className={`hero ${success ? 'is-signed-up' : ''}`}
      >
        {/* <div className='hero-bg has-bg' /> */}
        {/* <div className='hero-bg' /> */}

        <div className='hero-body'>
          <div className='container'>
            <div className='row'>
  
              <div className='col-xs-12 col-xl-7 hero--copy'>
                <h1 className='hero--title'>
                  Listen to Ethereum
                </h1>
  
                <h5 className='hero--description'>
                  Easily connect devices &amp; apps with Ethereum. <NotusWordmarkWhitePinkShadow
                    height='16'
                    className='notus-wordmark--home'
                  /> has presets for popular Ethereum events or you can customize your own.
                </h5>
  
                {/* <div className='mt30'>
                  <SignupForm
                    setSuccess={setSuccess}
                    autoFocus
                  />
                </div> */}
              </div>
  
              <div className='col-xs-12 col-xl-5 is-grid-row-reverse-desktop'>
                <Diagram
                  id='diagram'
                  className='hero--diagram'
                />
              </div>
  
            </div>
          </div>
        </div>
      </section>
    )
  }
}
