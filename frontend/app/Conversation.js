import React, {Component} from 'react';
import Select from 'react-select';

// TODO fetch actions associated with the campaign
var actions = [{id: 0, subject: 'foo'}];

class NewUpdate extends Component {
  componentWillMount() {
    // TODO fetch this remotely
    this.setState({
      campaign: campaigns[this.props.params.id],
      actions: actions,
      message: 'Hello! This is an update.'
    });
  }

  onSubmit(ev) {
    ev.preventDefault();
  }

  render() {
    var options = this.state.actions.map(a => ({
      value: a.id,
      label: a.subject
    }));
    return <div>
      <h1>New Update</h1>
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
  value: 'd',
  label: 'Democratic'
}, {
  value: 'r',
  label: 'Republican'
}, {
  value: 'i',
  label: 'Independent'
}];
const MEMBERS = [{
  value: 'r',
  label: 'Representative'
}, {
  value: 's',
  label: 'Senator'
}];
// TODO these should may be fetched remotely?
const COMMITTEES = [{
  value: 0,
  label: 'Jobs, Rural Economic Growth and Energy Innovation'
}];

class NewAction extends Component {
  componentWillMount() {
    // TODO fetch this remotely
    this.setState({
      campaign: campaigns[this.props.params.id]
    });
    this.inputs = {};
  }

  onSelectChange(key, val) {
    var update = {};
    update[key] = val;
    this.setState(update);
  }

  onInputChange(key, ev) {
    var update = {};
    update[key] = ev.target.value;
    this.setState(update);
  }

  onSubmit(ev) {
    ev.preventDefault();
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
        <form onSubmit={this.onSubmit.bind(this)}>
          <fieldset>
            <label>Targeting</label>
            <div>
              <Select
                  name="memberType"
                  placeholder="Member Type"
                  value={this.state.memberType}
                  options={MEMBERS}
                  onChange={this.onSelectChange.bind(this, 'memberType')} />
              <Select
                  name="party"
                  placeholder="Party"
                  value={this.state.party}
                  options={PARTIES}
                  onChange={this.onSelectChange.bind(this, 'party')} />
              <Select
                  name="committee"
                  placeholder="Committee"
                  value={this.state.committee}
                  options={COMMITTEES}
                  onChange={this.onSelectChange.bind(this, 'committee')} />
            </div>
          </fieldset>
          <fieldset>
            <label>Message</label>
            <textarea
              value={this.state.message}
              onChange={this.onInputChange.bind(this, 'message')}
              ref={(input) => { this.inputs.message = input; }} />
          </fieldset>
          <fieldset>
            <label>Link</label>
            <input
              type="text"
              value={this.state.link}
              onChange={this.onInputChange.bind(this, 'link')}
              ref={(input) => { this.inputs.link = input; }} />
          </fieldset>
          <fieldset>
            <label>Subject</label>
            <input
              type="text"
              value={this.state.subject}
              onChange={this.onInputChange.bind(this, 'subject')}
              ref={(input) => { this.inputs.subject = input; }} />
          </fieldset>
          <fieldset>
            <label>Task</label>
            <input
              type="text"
              value={this.state.task}
              onChange={this.onInputChange.bind(this, 'task')}
              ref={(input) => { this.inputs.task = input; }} />
          </fieldset>
          <input type="submit" value="Send" />
        </form>
        <div className="preview">
          <h4>Preview</h4>
          <div className="preview-message">{this.previewTemplate({
            desc: this.state.message,
            link: this.state.link,
            subject: this.state.subject,
            task: this.state.task
          })}</div>
        </div>
      </div>
    );
  }
}

export {NewUpdate, NewAction};
