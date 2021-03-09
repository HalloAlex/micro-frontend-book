import React from 'react'
import ReactDOM from 'react-dom'
import * as singleSpa from 'single-spa';
import singleSpaReact from 'single-spa-react'
import Parcel from '../node_modules/single-spa-react/lib/esm/parcel'

const MyParcelComponent = () => {
  return <div >
    <h1>This is a React parcel</h1>
  </div>
}

const MyParcel = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: MyParcelComponent
})

export const name = 'HelloParcel'
export const bootstrap = MyParcel.bootstrap
export const mount = MyParcel.mount
export const unmount = MyParcel.unmount

export default class HelloParcel extends React.Component {
  render () {
    return (
      <Parcel
        mountParcel={singleSpa.mountRootParcel}
        config={MyParcel}
      />
    )
  }
}