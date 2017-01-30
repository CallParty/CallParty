import API from './API'
import React, { Component } from 'react'
import Select from 'react-select'
import { Link } from 'react-router'

const ACTIONS = [{
  value: 'call',
  label: 'Call'
}, {
  value: 'vote',
  label: 'Vote'
}];

class NewUpdate extends Component {
  componentWillMount() {
    this.setState({
      campaign: {actions:[]},
      message: 'Hello! This is an update.'
    })
    API.campaign(this.props.params.id, data => {
      this.setState({
        campaign: data
      });
    });
  }

  onSubmit(ev) {
    ev.preventDefault();
  }

  render() {
    var options = this.state.campaign.actions.map(a => ({
      value: a.id,
      label: a.subject
    }));
    if (options.length === 0) {
      return null;
    }
    return <div>
      <div className="meta">
        <h1>New Update</h1>
        <h3>Campaign: <Link to={`/${this.state.campaign.id}`}>{this.state.campaign.title}</Link></h3>
      </div>
      <form onSubmit={this.onSubmit.bind(this)}>
        <fieldset>
          <label htmlFor="actionReference">Action Reference</label>
          <Select
              name="actionReference"
              value={options[0].value}
              options={options}
              onChange={this.onSelectChange.bind(this)}
          />
        </fieldset>
        <fieldset>
          <label htmlFor="message">Message</label>
          <textarea id="message" value={this.state.message} onChange={this.onMessageChange.bind(this)} />
        </fieldset>
        <input type="submit" value="Send" />
      </form>
      <div className="preview">
        <h4>Preview</h4>
        <div className="preview-message">{this.state.message}</div>
      </div>
    </div>;
  }

  onSelectChange(val) {
    this.setState({
      actionRef: val
    });
  }

  onMessageChange(ev) {
    this.setState({
      message: ev.target.value
    });
  }
}

const PARTIES = [{
  value: 'Democrat',
  label: 'Democratic'
}, {
  value: 'Republican',
  label: 'Republican'
}, {
  value: 'Independent',
  label: 'Independent'
}]

const MEMBERS = [{
  value: 'rep',
  label: 'Representative'
}, {
  value: 'sen',
  label: 'Senator'
}]

// TODO these should may be fetched remotely?
const COMMITTEES = [{
  value: 0,
  label: 'Jobs, Rural Economic Growth and Energy Innovation'
}]

class NewAction extends Component {
  static get contextTypes() {
    return { notify: React.PropTypes.func.isRequired }
  }

  componentWillMount() {
    this.setState({
      campaign: {},
      action: {
        message: '',
        link: '',
        subject: '',
        task: '',
        type: 'call'
      }
    })
    API.campaign(this.props.params.id, data => {
      this.setState({
        campaign: data
      });
    });
    this.inputs = {};
  }

  onSelectChange(key, val) {
    const action = this.state.action
    if (Array.isArray(val)) {
      action[key] = val.map(v => v.value)
    } else {
      action[key] = val.value
    }
    this.setState({ action: action })
  }

  onInputChange(key, ev) {
    var action = this.state.action;
    action[key] = ev.target.value;
    this.setState({action: action});
  }

  onSubmit(ev) {
    ev.preventDefault();
    var action = this.state.action;
    for (var k of Object.keys(action)) {
      if (action[k] === undefined || action[k] === null || action[k] === '') {
        this.context.notify({
          message: `${k} can't be blank`,
          level: 'error'
        });
        return;
      }
    }
    API.newCampaignAction(
      this.state.campaign.id,
      action,
      () => {
        this.context.notify({
          message: 'Action created',
          level: 'success',
          autoDismiss: 1,
          onRemove: () => {
            this.props.router.push(`/${this.state.campaign.id}`);
          }
        });
      });
  }

  focusInput(input) {
    this.inputs[input].focus();
  }

  previewTemplate(action) {
    return <div>
      <p>Hi <span className="user-var">[firstName]</span>! We’ve got an issue to call about.</p>
      <p><span className="action-var" onClick={this.focusInput.bind(this, 'message')}>{action.desc}</span>. You can find out more about the issue here: <span className="action-var" onClick={this.focusInput.bind(this, 'link')}>{action.link}</span>.</p>
      <p>You’ll be calling <span className="user-var">[repType]</span> <span className="user-var">[repName]</span>. When you call you’ll talk to a staff member, or you’ll leave a voicemail. Let them know:</p>
      <p>* You’re a constituent calling about <span className="action-var" onClick={this.focusInput.bind(this, 'subject')}>{action.subject}</span>.</p>
      <p>* The call to action: “I’d like <span className="user-var">[repType]</span> <span className="user-var">[repName]</span> to <span className="action-var" onClick={this.focusInput.bind(this, 'task')}>{action.task}</span>.”</p>
      <p>* Share any personal feelings or stories</p>
      <p>* If taking the wrong stance on this issue would endanger your vote, let them know.</p>
      <p>* Answer any questions the staffer has, and be friendly!</p>
    </div>;
  }

  render() {
    return (
      <div>
        <div className="meta">
          <h1>New Action</h1>
          <h3>Campaign: <Link to={`/${this.state.campaign.id}`}>{this.state.campaign.title}</Link></h3>
        </div>
        <form onSubmit={this.onSubmit.bind(this)}>
          <fieldset>
            <label>Type</label>
            <Select
              name="type"
              placeholder="Action Type"
              value={this.state.action.type}
              options={ACTIONS}
              onChange={this.onSelectChange.bind(this, 'type')}
            />
          </fieldset>
          <fieldset>
            <label>Targeting</label>
            <div>
              <Select
                name="memberType"
                placeholder="Member Type"
                value={this.state.action.memberType}
                options={MEMBERS}
                onChange={this.onSelectChange.bind(this, 'memberType')}
                multi={true}
                clearable={false}
              />
              <Select
                name="party"
                placeholder="Party"
                value={this.state.action.party}
                options={PARTIES}
                onChange={this.onSelectChange.bind(this, 'party')}
                multi={true}
                clearable={false}
              />
              <Select
                name="committee"
                placeholder="Committee"
                value={this.state.action.committee}
                options={COMMITTEES}
                onChange={this.onSelectChange.bind(this, 'committee')}
                multi={true}
                clearable={false}
              />
            </div>
          </fieldset>
          <fieldset>
            <label>Message</label>
            <textarea
              value={this.state.action.message}
              onChange={this.onInputChange.bind(this, 'message')}
              ref={(input) => { this.inputs.message = input; }} />
          </fieldset>
          <fieldset>
            <label>Link</label>
            <input
              type="text"
              value={this.state.action.link}
              onChange={this.onInputChange.bind(this, 'link')}
              ref={(input) => { this.inputs.link = input; }} />
          </fieldset>
          <fieldset>
            <label>Subject</label>
            <input
              type="text"
              value={this.state.action.subject}
              onChange={this.onInputChange.bind(this, 'subject')}
              ref={(input) => { this.inputs.subject = input; }} />
          </fieldset>
          <fieldset>
            <label>Task</label>
            <input
              type="text"
              value={this.state.action.task}
              onChange={this.onInputChange.bind(this, 'task')}
              ref={(input) => { this.inputs.task = input; }} />
          </fieldset>
          <input type="submit" value="Send" />
        </form>
        <div className="preview">
          <h4>Preview</h4>
          <div className="preview-message">{this.previewTemplate({
            desc: this.state.action.message,
            link: this.state.action.link,
            subject: this.state.action.subject,
            task: this.state.action.task
          })}</div>
        </div>
      </div>
    );
  }
}

export { NewUpdate, NewAction };
