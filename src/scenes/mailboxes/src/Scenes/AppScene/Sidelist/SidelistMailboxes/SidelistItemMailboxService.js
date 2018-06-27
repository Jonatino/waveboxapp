import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Avatar } from '@material-ui/core'
import ServiceFactory from 'shared/Models/Accounts/ServiceFactory'
import { accountStore } from 'stores/account'
import { settingsStore } from 'stores/settings'
import { userStore } from 'stores/user'
import MailboxServiceBadge from 'wbui/MailboxServiceBadge'
import MailboxServiceTooltip from 'wbui/MailboxServiceTooltip'
import uuid from 'uuid'
import Resolver from 'Runtime/Resolver'
import UISettings from 'shared/Models/Settings/UISettings'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import red from '@material-ui/core/colors/red'

const styles = {
  /**
  * Avatar
  */
  avatar: {
    display: 'block',
    transform: 'translate3d(0,0,0)', // fix for wavebox/waveboxapp#619
    margin: '4px auto',
    borderWidth: 3,
    borderStyle: 'solid',
    cursor: 'pointer',
    WebkitAppRegion: 'no-drag',
    width: 35,
    height: 35,
    backgroundColor: 'white'
  },
  /**
  * Badge
  */
  badge: {
    position: 'absolute',
    height: 20,
    minWidth: 20,
    fontSize: '11px',
    borderRadius: 10,
    lineHeight: '20px',
    top: -3,
    right: 8,
    backgroundColor: 'rgba(238, 54, 55, 0.95)',
    color: red[50],
    fontWeight: process.platform === 'linux' ? 'normal' : '300',
    width: 'auto',
    paddingLeft: 6,
    paddingRight: 6
  },
  badgeFAIcon: {
    color: 'white',
    fontSize: 12
  },
  badgeContainer: {
    padding: 0,
    display: 'block',
    cursor: 'pointer'
  }
}

@withStyles(styles)
class SidelistItemMailboxService extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    serviceId: PropTypes.string.isRequired,
    onOpenService: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)
    this.instanceId = uuid.v4()
  }

  componentDidMount () {
    accountStore.listen(this.accountChanged)
    settingsStore.listen(this.settingsChanged)
    userStore.listen(this.userChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
    settingsStore.unlisten(this.settingsChanged)
    userStore.unlisten(this.userChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId) {
      this.setState(this.generateAccountState(nextProps))
    }
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  state = (() => {
    const settingsState = settingsStore.getState()
    return {
      ...this.generateAccountState(),
      isHovering: false,
      instanceId: uuid.v4(),
      globalShowSleepableServiceIndicator: settingsState.ui.showSleepableServiceIndicator,
      tooltipsEnabled: settingsState.ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.ENABLED || settingsState.ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.SIDEBAR_ONLY
    }
  })()

  generateAccountState (props = this.props, accountState = accountStore.getState()) {
    const { mailboxId, serviceId } = props
    const mailbox = accountState.getMailbox(mailboxId)
    const service = accountState.getService(serviceId)
    return {
      mailbox: mailbox,
      service: service,
      isActive: accountState.isServiceActive(serviceId),
      isSleeping: accountState.isServiceSleeping(serviceId),
      isRestricted: accountState.isServiceRestricted(serviceId)
    }
  }

  accountChanged = (accountState) => {
    this.setState(this.generateAccountState(this.props, accountState))
  }

  settingsChanged = (settingsState) => {
    this.setState({
      globalShowSleepableServiceIndicator: settingsState.ui.showSleepableServiceIndicator,
      tooltipsEnabled: settingsState.ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.ENABLED || settingsState.ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.SIDEBAR_ONLY
    })
  }

  userChanged = (userState) => {
    this.setState(this.generateAccountState(this.props))
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * @param mailboxType: the type of mailbox
  * @param serviceId: the service type
  * @return the url of the service icon
  */
  getServiceIconUrl (mailboxType, serviceId) {
    return "" //TODO
  }

  render () {
    const {
      mailboxId,
      serviceId,
      onOpenService,
      style,
      className,
      classes,
      ...passProps
    } = this.props
    const {
      isHovering,
      isActive,
      isSleeping,
      mailbox,
      service,
      isRestricted,
      globalShowSleepableServiceIndicator,
      tooltipsEnabled
    } = this.state
    if (!mailbox || !service) { return false }

    const borderColor = mailbox.showAvatarColorRing ? (
      isActive || isHovering ? mailbox.color : 'white'
    ) : 'transparent'

    const showSleeping = isSleeping && mailbox.showSleepableServiceIndicator && globalShowSleepableServiceIndicator
    return (
      <MailboxServiceBadge
        id={`ReactComponent-Sidelist-Item-Mailbox-Service-${this.instanceId}`}
        isAuthInvalid={false}
        supportsUnreadCount={service.supportsUnreadCount}
        showUnreadBadge={service.showUnreadBadge}
        unreadCount={service.unreadCount}
        supportsUnreadActivity={service.supportsUnreadActivity}
        showUnreadActivityBadge={service.showUnreadActivityBadge}
        hasUnreadActivity={service.hasUnreadActivity}
        color={service.unreadBadgeColor}
        badgeClassName={classes.badge}
        className={classes.badgeContainer}
        iconClassName={classes.badgeFAIcon}
        onMouseEnter={() => this.setState({ isHovering: true })}
        onMouseLeave={() => this.setState({ isHovering: false })}
        onClick={(evt) => onOpenService(evt, serviceType)}>
        <Avatar
          {...passProps}
          src={this.getServiceIconUrl(mailbox.type, serviceType)}
          imgProps={{ draggable: false }}
          className={classNames(
            classes.avatar,
            'WB-ServiceIcon',
            `WB-ServiceIcon-${mailbox.id}_${service.type}`,
            className
          )}
          style={{
            borderColor: borderColor,
            filter: showSleeping ? 'grayscale(100%)' : 'none',
            ...style
          }} />
        {tooltipsEnabled ? (
          <MailboxServiceTooltip
            mailbox={mailbox}
            service={service}
            isRestricted={isRestricted}
            active={isHovering}
            tooltipTimeout={0}
            position='right'
            arrow='center'
            group={this.instanceId}
            parent={`#ReactComponent-Sidelist-Item-Mailbox-Service-${this.instanceId}`} />
        ) : undefined}
      </MailboxServiceBadge>
    )
  }
}

export default SidelistItemMailboxService
