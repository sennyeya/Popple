import React from 'react'
import MessageContext from '../contexts/MessagingContext';

export default class ErrorBoundary extends React.Component{
    constructor(props) {
        super(props);
        this.state = { hasError: false };
        this.popState = this.popState.bind(this)
    }

    popState(){
        this.setState({hasError:false})
    }

    componentDidMount(){
        // Add this:
        var _wr = function(type) {
            var orig = window.history[type];
            return function() {
                var rv = orig.apply(this, arguments);
                var e = new Event(type);
                e.arguments = arguments;
                window.dispatchEvent(e);
                return rv;
            };
        };
        window.history.pushState = _wr('pushState');
        window.history.replaceState = _wr('replaceState');
        window.addEventListener('pushState', this.popState)
        window.addEventListener('replaceState', this.popState)
    }

    componentWillUnmount(){
        window.removeEventListener('pushState', this.popState)
        window.removeEventListener('replaceState', this.popState)
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        this.context.setMessage(error)
    }

    render() {
        if(this.state.hasError){
            return <h1>Something has gone wrong. Please refer to the error message.</h1>
        }
        return this.props.children; 
    }
}

ErrorBoundary.contextType = MessageContext