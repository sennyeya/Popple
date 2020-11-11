import React from 'react';
import Modal from 'react-modal';
import { CircularProgressbarWithChildren , buildStyles  } from 'react-circular-progressbar';
import {LoadingIndicator} from '../shared/Loading';
import 'react-circular-progressbar/dist/styles.css';

Modal.setAppElement('#root')


export default function ClassDetails({id, closeModal, isOpen, API}){
    const [paneDetails, setPaneDetails] = React.useState("");
    const [isLoading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("")

    React.useEffect(()=>{
        if(!id||!API){
            return
        }
        setLoading(true)
        setError("")
        setPaneDetails("")
        API.get("/student/bucket/itemInfo", {id}).then(json=>{
            setPaneDetails(json)
            setLoading(false)
        }).catch(e=>{
            setError(e.statusText);
            setLoading(false)
        });
    }, [id, API]);

    if(!id){
        return <></>
    }
    return (
        <InfoModal
            isOpen={isOpen}
            title={paneDetails.name || "Class Details"}
            closeModal={closeModal}
        >
            {
                isLoading?
                <LoadingIndicator/>:
                (
                    error?
                    <p>Error: {error}</p>:
                    <div style={{display:"flex", flexDirection:"row", flexWrap:"wrap", justifyContent:"left"}}>
                        <div style={{marginBottom:"10px", display:"flex",flex:"row", flexWrap:"wrap", justifyContent:"space-evenly", alignItems:"center", width:"100%"}}>
                            <div style={{textAlign:"center"}}>
                                <div style={{width:100, height:100}}>
                                    <CircularProgressbarWithChildren  
                                        value={paneDetails.planProgress} 
                                        text={`${paneDetails.planProgress}%`} 
                                        circleRatio={0.75}  /* Make the circle only 0.75 of the full diameter */
                                        styles={buildStyles({
                                            rotation: 1 / 2 + 1 / 8,
                                            strokeLinecap: "butt",
                                            trailColor: "#eee"
                                        })}
                                    />
                                </div>
                                <p style={{width:"100%"}}>Major Progress</p>
                            </div>
                            <div style={{textAlign:"center"}}>
                                <div style={{width:100, height:100}}>
                                    <CircularProgressbarWithChildren  
                                        value={paneDetails.graduationProgress} 
                                        text={`${paneDetails.graduationProgress}%`} 
                                        circleRatio={0.75}  /* Make the circle only 0.75 of the full diameter */
                                        styles={buildStyles({
                                            rotation: 1 / 2 + 1 / 8,
                                            strokeLinecap: "butt",
                                            trailColor: "#eee"
                                        })}
                                    />
                                </div>
                                <p style={{width:"100%"}}>Degree Progress</p>
                            </div>
                        </div>
                        
                        <DisplayText header="Description">{paneDetails.description}</DisplayText>
                        
                    </div>
                )
            }
        </InfoModal>
    )
}

function DisplayText({children, header}){
    return (
    <div style={{padding:"5px", width:"100%"}}>
        <p>{header}: </p>
        {children}
    </div>
    )
}


export function InfoModal({isOpen, closeModal, message, children, title}){
    const customStyles = {
        content : {
          top                   : '50%',
          left                  : '50%',
          right                 : 'auto',
          bottom                : 'auto',
          marginRight           : '-50%',
          transform             : 'translate(-50%, -50%)'
        }
      };
    return (
        <Modal
          isOpen={isOpen}
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel="Message"
        >
            <h2>{title}</h2>
            <br/>
            <div>{message?message:(children?<>{children}</>:<></>)}</div>
            <br/>
            <button onClick={closeModal} style={{float:"right", margin:"5px"}} className="primary">Close</button>
        </Modal>
    )
}