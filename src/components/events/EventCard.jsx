import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import classnames from 'classnames'
import {
  AlertTriangle,
  StopCircle,
  CheckCircle
} from 'react-feather'
import { toast } from 'react-toastify'
import { Settings } from 'react-feather'
import { graphql } from 'react-apollo'
import { Link } from 'react-router-dom'
import { currentUserQuery } from '~/queries/currentUserQuery'
import { deleteEventMutation } from '~/mutations/deleteEventMutation'
import { updateEventMutation } from '~/mutations/updateEventMutation'
import { brandColor } from '~/utils/brandColors'
import { EventDescription } from '~/components/events/EventDescription'

export const EventCard = 
  graphql(currentUserQuery, { name: 'currentUserData' })(
    graphql(updateEventMutation, {
      name: 'updateEventMutation'
    })(
      graphql(deleteEventMutation, {
        name: 'deleteEventMutation'
      })(
        class _EventCard extends Component {
          state = {
            editDropdownActive: false  
          }

          handleClick = (e) => {
            const domNode = ReactDOM.findDOMNode(this.node)

            if (domNode && !domNode.contains(e.target)) {
              this.deactivateEditMenu()
            }
          }

          handleEditClick = (e) => {
            e.preventDefault()

            if (this.state.editDropdownActive) {
              this.deactivateEditMenu()
            } else {
              this.activateEditMenu()
            }
          }
          
          deactivateEditMenu = () => {
            this.setState({
              editDropdownActive: false
            })
            
            document.removeEventListener('mousedown', this.handleClick, false)
          }
          
          activateEditMenu = () => {
            this.setState({
              editDropdownActive: true
            })
            
            document.addEventListener('mousedown', this.handleClick, false)
          }

          handleActivate = (e) => {
            e.preventDefault()

            const event = this.props.event

            this.props.updateEventMutation({
              variables: {
                event: {
                  id: event.id,
                  isActive: !event.isActive
                }
              },
              refetchQueries: [
                'eventsQuery',
                'publicEventsQuery',
              ],
            }).then((mutationResult) => {
              this.deactivateEditMenu()
              toast.dismiss()
              toast.success(`Event ${event.isActive ? 'deactivated' : 're-activated'}`)
            }).catch(error => {
              toast.error('Error while updating event')
              console.error(error)
            })
          }

          handleDelete = (e) => {
            e.preventDefault()
            
            const eventId = parseInt(this.props.event.id, 10)

            this.props.deleteEventMutation({
              variables: {
                eventId
              },
              refetchQueries: [
                'eventsQuery',
                'publicEventsQuery',
              ],
            }).then(() => {
              toast.success('Successfully deleted event')
            }).catch(error => {
              console.error(error)
            })
          }

          render () {
            let editDropdown

            const { currentUserData, editable, event } = this.props
            const { currentUser } = currentUserData
            const { user } = event

            if (!currentUser) {
              return null
            }

            if (editable) {
              editDropdown = (
                <div
                  className={classnames(
                    'dropdown',
                    'is-right',
                    'is-up',
                    { 'is-active': this.state.editDropdownActive }
                  )
                }>
                  <div className='dropdown-trigger'>
                    <button
                      className='button has-icon has-icon__transparent'
                      onClick={this.handleEditClick}
                    >
                      <Settings />
                    </button>
                  </div>
                  <div className='dropdown-menu' id='dropdown-menu6' role='menu'>
                    <div className='dropdown-content'>
                      <div
                        className='dropdown-item'
                        onClick={this.handleActivate}
                      >
                        {event.isActive
                          ? (<><StopCircle /> &nbsp;Deactivate</>)
                          : (<><CheckCircle /> &nbsp;Activate</>)
                        }
                      </div>
                      <div
                        className='dropdown-item'
                        onClick={this.props.handleOpenConfirmDeleteModal}
                      >
                        <AlertTriangle /> &nbsp;Delete
                      </div>
                    </div>
                  </div>
                </div>
              )
            }

            return (
              <Link
                key={`event-${event.id}`}
                to={this.props.linkTo}
                ref={node => {this.node = node}}

                className={classnames(
                  'button',
                  'event-card',
                  brandColor(event.id),
                  {
                    'event-card--small': this.props.isSmall,
                    'is-half-opacity': !event.isActive,
                    'is-full-opacity': event.isActive
                  }
                )}
              >
                

                <div className="event-card__header">
                  <p className='event-card__title is-size-5'>
                    {event.title || <EventDescription event={event} brief={true} />}
                  </p>
                </div>


                <div className='event-card__footer'>
                  <p className='event-card__author is-size-7'>
                    by {currentUser.id === parseInt(user.id, 10) ? 'you' : user.name || user.email}
                  </p>
                  <div className='event-card__icons has-text-right'>
                    {editable ? editDropdown : ''}
                  </div>
                </div>
              </Link>
            )
          }
        }
      )
    )
  )