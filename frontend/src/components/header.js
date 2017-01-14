import React from 'react'
import logo from '../img/graph.png'

export default () => (
  <div>
    <header className='tc pv4 pv5-ns'>
      <img src={logo} className='br-100 pa1 ba b--black-10 h3 w3' alt='avatar' />
      <h1 className='f5 f4-ns fw6 mid-gray'>Call Party Admin</h1>
      <h2 className='f6 gray fw2 ttu tracked'>example page</h2>
    </header>
    <div className="debug">
      <div className="fl w-70 pa2 debug special-text">
        left column
      </div>
      <div className="fl w-30 pa2 debug">
        right column
      </div>
    </div>
  </div>
)