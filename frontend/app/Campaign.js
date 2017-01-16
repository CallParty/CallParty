import API from './API';
import React, {Component} from 'react';
import {Link} from 'react-router';

class Campaigns extends Component {
  componentWillMount() {
    this.setState({
      campaigns: []
    });
    API.campaigns(data => {
      this.setState({
        campaigns: data
      });
    });
  }

  render() {
    return (
      <div className="table">
        <header>
          <h1>Campaigns</h1>
          <Link to="/new"><button>New Campaign</button></Link>
        </header>
        <table>
          <tbody>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Description</th>
              <th>Date Created</th>
            </tr>
            {this.state.campaigns.map(campaign =>
              <CampaignItem key={campaign.id} onClick={this.viewCampaign.bind(this)} {...campaign} />)}
          </tbody>
        </table>
      </div>
    );
  }

  viewCampaign(campaign) {
    this.props.router.push(`/${campaign.id}`);
  }
}

class CampaignItem extends Component {
  static propTypes = {
    onClick: React.PropTypes.func.isRequired
  }

  render() {
    return <tr onClick={() => this.props.onClick(this.props)}>
      <td>{this.props.id}</td>
      <td>{this.props.title}</td>
      <td>{this.props.description}</td>
      <td>{this.props.date_created}</td>
    </tr>;
  }
}

class Campaign extends Component {
  componentWillMount() {
    this.setState({
      actions: []
    });
    API.campaign(this.props.params.id, data => {
      this.setState(data);
    });
  }

  render() {
    return (
      <div className="campaign">
        <div className="meta">
          <h1>{this.state.title}</h1>
          <h2>{this.state.description}</h2>
          <h4>Created on {this.state.date_created}</h4>
        </div>
        <div className="table">
          <header>
            <h1>Conversations</h1>
            <Link to={`/${this.state.id}/action/new`}><button>New Action</button></Link>
            <Link to={`/${this.state.id}/update/new`}><button>New Update</button></Link>
          </header>
          <table>
            <tbody>
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Subject</th>
                <th>Date Created</th>
              </tr>
              {this.state.actions.map((convo, i) =>
                <ConversationItem key={i} num={i} {...convo} />)}
            </tbody>
          </table>
        </div>
      </div>);
  }
}

class ConversationItem extends Component {
  render() {
    return <tr>
      <td>{this.props.num}</td>
      <td>{this.props.type}</td>
      <td>{this.props.subject}</td>
      <td>{this.props.date_created}</td>
    </tr>;
  }
}

class NewCampaign extends Component {
  static contextTypes = {
    notify: React.PropTypes.func.isRequired
  }

  componentWillMount() {
    this.setState({
      title: '',
      description: ''
    });
  }

  onSubmit(ev) {
    ev.preventDefault();
    API.newCampaign(this.state, campaign => {
      this.context.notify({
        message: `Campaign created`,
        level: 'success',
        autoDismiss: 1,
        onRemove: () => {
          this.props.router.push(`/${campaign.id}`);
        }
      });
    });
  }

  onInputChange(key, ev) {
    var update = {};
    update[key] = ev.target.value;
    this.setState(update);
  }

  render() {
    return <div>
        <form onSubmit={this.onSubmit.bind(this)}>
          <fieldset>
            <label>Title</label>
            <input
              type="text"
              value={this.state.title}
              onChange={this.onInputChange.bind(this, 'title')} />
          </fieldset>
          <fieldset>
            <label>Description</label>
            <input
              type="text"
              value={this.state.description}
              onChange={this.onInputChange.bind(this, 'description')} />
          </fieldset>
          <input type="submit" value="Create" />
        </form>
    </div>;
  }
}

export {Campaigns, Campaign, NewCampaign};
