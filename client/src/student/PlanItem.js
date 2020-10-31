import React from 'react';
import style from './Plan.module.css';
import {Collapse} from 'react-collapse';
import {IoMdArrowDroprightCircle, IoMdArrowDropdownCircle, IoMdSquareOutline, IoIosCheckboxOutline} from 'react-icons/io'

class PlanItem extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            name: props.data.class.name,
            credits: props.data.class.credit,
            nodeId: props.data._id,
            key: props.keyVal,
            className: props.className,
            isCollapseOpen:false
        }

        this.onSelect = this.onSelect.bind(this);
    }

    render(){
        var isSelected = this.state.className === "selected";
        return (
            <>
                <li key={this.state.key} className={this.state.className==="selected"?style.selected:style.unselected}>
                        {
                            this.state.isCollapseOpen?
                            <IoMdArrowDropdownCircle onClick={(e)=>{this.setState({isCollapseOpen:!this.state.isCollapseOpen});e.preventDefault()}} style={{margin:"auto 0", padding:"0px 10px"}}/>:
                            <IoMdArrowDroprightCircle onClick={()=>this.setState({isCollapseOpen:!this.state.isCollapseOpen})} style={{margin:"auto 0", padding:"0px 10px"}}/>
                        }
                    <div onClick={this.onSelect} style={{display:"inline-flex", width:"95%", flexDirection:"row", justifyContent:"space-between"}}>
                        <span className={style.classTitle}>{this.state.name} ({this.state.credits})</span>
                        {
                            isSelected?
                            <IoMdSquareOutline style={{margin:"auto 0", width:"25px", height:"25px", float:'right', padding:"10px"}} value={isSelected?"Remove Class":"Keep Class"}/>:
                            <IoIosCheckboxOutline style={{margin:"auto 0", width:"25px", height:"25px", float:'right', padding:"10px"}} value={isSelected?"Remove Class":"Keep Class"}/>
                        }
                    </div>
                </li>
                <Collapse isOpened={this.state.isCollapseOpen}>
                    <ul className={style.collapsable}>
                        <li>
                            <p>TEST lorem ipsum, class description goes here.</p>
                            <p>So would teacher name/RateMyProfessor link.</p>
                        </li>
                    </ul>
                </Collapse>
            </>
        )
    }

    componentWillReceiveProps(props){
        this.setState({className:props.className})
    }

    onSelect = (e) =>{
        this.props.handleSelect(this.state.nodeId, e.target);
    }
}

export default PlanItem;