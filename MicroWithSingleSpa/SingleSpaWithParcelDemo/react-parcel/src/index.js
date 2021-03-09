import React from 'react'
import ReactDOM from 'react-dom'
import singleSpaReact from 'single-spa-react'

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