import React from 'react';
import GraphItem from './Graph';
import ClassDetails from './ClassModal';
import ClassBuckets from './ClassBuckets';
import Template from '../shared/Template'

export default function StudentDashboard({API}){
	const [isClassModalOpen, setClassModalOpen] = React.useState(false)
	const [selectedClass, setSelectedClass] = React.useState(null)

    return(
		<>
			<Template size={[1]} height={"auto"}>
				<p>Drag and drop your required courses to and from your plan.</p>
			</Template>
			<Template size={[.5, .5]} height={"auto"}>
				<ClassBuckets
					API={API} 
					openClassModal={()=>setClassModalOpen(true)} 
					setSelected={setSelectedClass}
				/>
				<GraphItem
					API={API} 
					openClassModal={()=>setClassModalOpen(true)} 
					setSelected={setSelectedClass}
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