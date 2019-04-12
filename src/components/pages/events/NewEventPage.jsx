import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { CheckCircle } from 'react-feather'
import { CSSTransition } from 'react-transition-group'
import { toast } from 'react-toastify'
import { Redirect } from 'react-router-dom'
import { graphql } from 'react-apollo'
import { EditEventVariableForm } from '~/components/events/EditEventVariableForm'
import { EventMatcherSentence } from '~/components/events/EventMatcherSentence'
import { MatcherForm } from '~/components/recipes/MatcherForm'
import { FooterContainer } from '~/components/layout/Footer'
import { ScrollToTop } from '~/components/ScrollToTop'
import { createEventMutation } from '~/mutations/createEventMutation'
import { currentUserQuery } from '~/queries/currentUserQuery'
import { recipeQuery } from '~/queries/recipeQuery'
import { altBrandColor, brandColor } from '~/utils/brandColors'
// import { varDescriptionToVarName } from '~/utils/varDescriptionToVarName'
import { deepCloneMatcher } from '~/utils/deepCloneMatcher'
// import { RECIPES } from '~/../config/recipes'
import * as routes from '~/../config/routes'

export const NewEventPage = 
  graphql(currentUserQuery, { name: 'currentUserData' })(
    graphql(recipeQuery, {
      name: 'recipeData',
      skip: (props) => !props.match.params.recipeId,
      options: (props) => ({
        variables: { id: props.match.params.recipeId }
      })
    })(
      graphql(createEventMutation, { name: 'createEventMutation' })(
        class _NewEventPage extends Component {
          state = {
            event: {
              frequency: '-1',
              matchers: [
                // {
                //   operator: -1,
                //   operand: -1
                // }
              ]
            },
            editMatcherIndex: null
          }

          static propTypes = {
            match: PropTypes.object.isRequired
          }

          static contextTypes = {
            router: PropTypes.object.isRequired
          }

          componentWillMount() {
            const { currentUser } = this.props.currentUserData

            if (!currentUser) {
              toast.error('Please sign in to access this page.')
              this.setState({ redirect: true })
            }
          }

          handleSaveEvent = (e) => {
            e.preventDefault()

            this.props.createEventMutation({
              variables: {
                event: this.state.event
              }
            }).then(() => {
              toast('Successfully saved event!')
            }).catch(error => {
              console.error(error)
            })
          }

          handleSetEditMatcher = (editMatcherIndex) => {
            this.setState({
              editMatcherIndex
            })
          }

          handleCancelEditingMatcher = (e) => {
            e.preventDefault()

            this.handleSetEditMatcher(null)
          }

          // handleInputChange = (variable, typeOrOperand, newValue) => {
          //   const {
          //     description,
          //     sourceDataType
          //   } = variable

          //   const name = varDescriptionToVarName(description)

          //   if (sourceDataType === 'uint256') {
          //     // note: currently does not handle negative values:
          //     newValue = newValue.replace(/[^0-9.]/g, '')
          //   }

          //   let matcher = this.state.event.matchers.find((matcher) => (
          //     matcher.variableId === variable.id
          //   ))

          //   if (!matcher) {
          //     console.log('no matcher yet, creating one with variableId: ', variable.id)
          //     matcher = {
          //       variableId: variable.id,
          //       type: '0',
          //       operand: newValue
          //     }
          //   }

          //   if (typeOrOperand === 'type') {
          //     matcher.type = newValue
          //   } else {
          //     matcher.operand = newValue
          //   }

          //   this.setState({
          //     [name]: matcher
          //   }, this.updateEventMatcher(variable, matcher))
          // }

          // updateEventMatcher = (variable, matcher) => {
          //   const matchers = this.state.event.matchers

          //   let existingMatcher = this.state.event.matchers.find((matcher) => (
          //     matcher.variableId === variable.id
          //   ))

          //   if (!existingMatcher) {
          //     matchers.push(matcher)
          //   } else {
          //     const matcherIndex = this.state.event.matchers.indexOf(existingMatcher)
          //     matchers[matcherIndex].operand = matcher.operand
          //   }
            
          //   this.setState({
          //     event: {
          //       ...this.state.event,
          //       matchers
          //     }
          //   }, () => { console.log(this.state.event)})
          // }

          isEditing = () => {
            return this.state.editMatcherIndex !== null
          }

          recipeSentence = (recipe) => {
            let str = !recipe.name.charAt(0).match(/[aeiou]/) ? `a ` : `an `
            str += recipe.name
            
            return str
          }

          onChangeMatcher = (matcher) => {
            const matchers = this.state.event.matchers.slice()
            matchers[this.state.editMatcherIndex] = matcher

            this.setState({
              event: {
                ...this.state.event,
                matchers
              }
            })
          }

          componentDidUpdate(prevProps) {
            let recipe 
            
            if (prevProps.recipeData && (prevProps.recipeData.recipe !== this.props.recipeData.recipe)) {
              recipe = this.props.recipeData.recipe
              console.log(recipe)

              let matchers = recipe.recipeMatchers.map(recipeMatcher => (
                deepCloneMatcher(recipeMatcher.matcher)
              ))
              // matchers = cloneDeep(matchers)

              const event = {
                ...this.state.event,
                matchers,
                recipeId: parseInt(recipe.id, 10)
              }
              console.log('event', event)
              
              this.setState({
                event
              })
            }
          }
          
          render () {
            let colorClass = 'is-dark'
            let altColorClass = 'is-blue'
            let variableForm = null

            const editMatcher = this.isEditing()
              ? this.state.event.matchers[this.state.editMatcherIndex]
              : null

            let recipe = {
              description: 'New Event',
              name: 'event matching the following'
            }

            if (this.state.redirect) {
              return <Redirect to={routes.SIGNIN} />
            }

            if (this.props.recipeData) {
              if (this.props.recipeData.loading) {
                return null
              } else {
                recipe = this.props.recipeData.recipe
    
                if (recipe) {
                  colorClass = brandColor(recipe.id)
                  altColorClass = altBrandColor(recipe.id + 1)
                }
              }
            }


            if (editMatcher) {
              variableForm = (
                <>          
                  <div className='drawer has-bg__dark'>
                    <div className='container'>
                      <div className='row'>
                        <div className='col-xs-12 col-sm-8 col-start-sm-3 has-text-centered'>
                          <form className='form mt10 drawer-form'>
                            <MatcherForm
                              key={`matcher-${this.state.matcherIndex}`}
                              matcher={editMatcher}
                              onChange={
                                (updatedMatcher) => this.onChangeMatcher(updatedMatcher)
                              }
                            />
                            {/* <EditEventVariableForm */}

                            <div className='buttons'>
                              {/* <button
                                className='button has-icon has-stroke-red'
                                onClick={this.handleCancelEditingMatcher}
                              >
                                <XCircle
                                  className='icon__button has-stroke-red'
                                />
                              </button> */}

                              <button
                                className='button has-icon has-stroke-green'
                                onClick={this.handleCancelEditingMatcher}
                              >
                                <CheckCircle
                                  className='icon__button has-stroke-green'
                                />
                              </button>
                            </div>

                          </form>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* this needs to be at the bottom or it takes the <CSSTransition/> classes */}
                  <div
                    className={`drawer__clickbox ${this.isEditing() ? 'is-active' : null}`}
                    onClick={(e) => {
                      e.preventDefault()
                      this.handleCancelEditingMatcher(e)
                    }}
                  />
                </>
              )
            }

            const frequencyWord = (this.state.event.frequency === '-1') ? 'Every time' : 'Only once'

            const matcherSentences = (
              <>
                <span className="event-box__text">
                  {frequencyWord} {this.recipeSentence(recipe)} occurs
                </span>
                {this.state.event.matchers.map((eventMatcher, index) => (
                  <EventMatcherSentence
                    key={`event-matcher-sentence-${index}`}
                    matcher={eventMatcher}
                    index={index}
                    state={this.state}
                    handleSetEditMatcher={this.handleSetEditMatcher}
                    isFirst={index === 0}
                    isActive={editMatcher && eventMatcher === editMatcher}
                  />
                ))}
              </>
            )


            return (
              <div className='is-positioned-absolutely'>
                <Helmet
                  title='Create New Event'
                />

                <ScrollToTop />

                <CSSTransition
                  timeout={300}
                  classNames='drawer'
                  in={this.isEditing()}
                >
                  {state => variableForm}
                </CSSTransition>

                <section className='section section--main-content'>
                  <div className={`container-fluid pb20 is-dark`}>
                    <div className='container'>
                      <div className='row'>
                        <div className='col-xs-12 has-text-centered is-size-4'>
                          <h6 className='is-size-6 has-text-grey-lighter has-text-centered is-uppercase has-text-weight-bold mt20 pt20 pb20'>
                            {recipe.description || recipe.name}
                          </h6>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`event-box event-box__header ${colorClass}`}>
                    <div className={`container-fluid pt20 pb20`}>
                      <div className='container'>
                        <div className='row'>
                          <div className='col-xs-12 col-xl-10 col-start-xl-3 is-size-4'>
                            {matcherSentences}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`event-box event-box__footer ${altColorClass}`}>
                    <div className={`container-fluid`}>
                      <div className='container'>
                        <div className='row'>
                          <div className='col-xs-12 has-text-centered is-size-4'>
                            {/* ... then turn on my Phillips Hue lightbulb */}
                            ... then send me an email&nbsp;
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`is-white-ter pt30 pb30`}>
                    <div className={`container-fluid`}>
                      <div className='container'>
                        <div className='row'>
                          <div className='col-xs-12 has-text-centered is-size-4'>
                            <button
                              onClick={this.handleSaveEvent}
                              className='button is-success'
                            >
                              {!this.state.event.createdAt ? 'Create' : 'Save'} Event
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <FooterContainer />
              </div>
            )
          }
        }
      )
    )
  )