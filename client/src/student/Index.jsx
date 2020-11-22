import React from 'react';
import GraphItem from './Graph';
import ClassDetails from './ClassModal';
import ClassBuckets from './ClassBuckets';
import Template from '../shared/Template'

export default function StudentDashboard({API}){
	const [isClassModalOpen, setClassModalOpen] = React.useState(false)
	const [selectedClass, setSelectedClass] = React.useState(null);
	const [graphNodes, setGraphNodes] = React.useState([])

    return(
		<>
			<Template size={[1]} height={"auto"}>
				<span>Drag and drop your required courses to and from your plan.</span>
			</Template>
			<Template size={[.5, .5]} height={"auto"}>
				<ClassBuckets
					API={API} 
					openClassModal={()=>setClassModalOpen(true)} 
					setSelected={setSelectedClass}
					setGraphNodes={setGraphNodes}
				/>
				<GraphItem
					API={API} 
					openClassModal={()=>setClassModalOpen(true)} 
					setSelected={setSelectedClass}
					graphNodes={graphNodes}
				/>
			</Template>
			<ClassDetails
                    id={selectedClass} 
                    isOpen={isClassModalOpen} 
                    API={API}
                    closeModal={()=>setClassModalOpen(false)}/>
		</>
	)
}