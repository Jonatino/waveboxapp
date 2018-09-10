import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck'
export default class FARCheck extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faCheck} />)
  }
}
