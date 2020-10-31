import Config from '../config';
import MessagingContext from '../contexts/MessagingContext';

const setError = (resp) =>{
    return resp.json().then(data=>{if(MessagingContext.setMessage) MessagingContext.setMessage(data)})
                        .catch(err=>{if(MessagingContext.setMessage) MessagingContext.setMessage({message:err})})
}

const authOptions = {
    credentials:"include",
    mode: 'cors',
    headers:{
        'Accept':'application/json',
        'Content-Type':'application/json'
    }
}

/**
 * Server access class.
 * @property {Function} get Returns result of GET operation at requested URL.
 */
export default {
    /**
     * Simple API GET.
     * @param {String} url route to request, no leading '/'
     * @param {Object} params object with GET params, added to url.
     */
    get(url, params={}){
        return new Promise((res, rej)=>{
            params = Object.keys(params).map(e=>e+"="+params[e]).join("&")
            fetch(Config.api+url+(params?("?"+params):""), authOptions)
                .then(resp=>{
                    if(!resp.ok) return setError(resp)
                    return resp.json()
                })
                .then(json=>res(json))
        })
    },

    /**
     * Simple POST to API.
     * @param {String} url url for API request, no leading '/'.
     * @param {Object} params POST params, will be added to body of request.
     * @returns {Object} decoded json
     */
    post(url, params){
        return new Promise((res, rej)=>{
            fetch(Config.api + url,{
                ...authOptions,
                method:"POST",
                body: JSON.stringify(params)
            }).then(resp=>{
                if(!resp.ok) setError(resp)
                return resp.json()
            })
            .then(json => res(json))
        })
    }
}