import React from 'react';
import Loader from 'react-loader-spinner'

export default function Loading() {
  return (
      <div className="loading"></div>
  );
}

export function LoadingIndicator({style}){
  return (
    <div style={{...style, padding:"2%", margin:"auto", textAlign:"center"}}>
      <Loader type="TailSpin" color="#000000" height={40} width={40}/>
    </div>
  )
}

export function LoadingIndicatorOverlay(){
  return (
    <div style={{margin:"auto", textAlign:"center", position:"absolute", zIndex:"1"}}>
      <Loader type="TailSpin" color="#000000" height={40} width={40}/>
    </div>
  )
}

export function LoadingIndicatorSmall(props){
  return (
    <div style={{margin:"auto", height:"20px", width:"24px", padding:"2%"}}>
      <Loader type="TailSpin" color={props.color||"#FFFFFF"} height={20} width={20} style={props.style}/>
    </div>
  )
}