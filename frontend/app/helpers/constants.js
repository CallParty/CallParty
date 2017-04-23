// used in both the NewCampaignUpdate and NewAction components
const CONFIRMATION_MODAL_STYLE = {
  content: {
    top: '50%',
    left: '50%',
    right: '',
    bottom: '',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    maxWidth: '300px',
    height: '100%',
    maxHeight: '135px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
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


export { CONFIRMATION_MODAL_STYLE, PARTIES, MEMBERS }
