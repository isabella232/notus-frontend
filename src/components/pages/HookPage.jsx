import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { FooterContainer } from '~/components/layout/Footer'
import { ScrollToTop } from '~/components/ScrollToTop'

export class HookPage extends PureComponent {
  static propTypes = {
    match: PropTypes.object.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  render () {
    return (
      <div className='is-positioned-absolutely'>
        <Helmet
          title='Hook'
        />

        <ScrollToTop />

        <section className='section section--main-content'>
          <div className='container'>
            <div className='row'>
              <div className='col-xs-12'>
                <p className='content'>
                  <button
                    onClick={this.context.router.history.goBack}
                    className='button is-monospaced is-text has-text-weight-bold back-button has-underline-border'
                  >
                    {'<'} Back
                  </button>
                </p>
              </div>
            </div>
          </div>
        </section>

        <FooterContainer />
      </div>
    )
  }
}
