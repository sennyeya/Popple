import React from 'react';
import {Form, InputGroup} from 'react-bootstrap';
import {Formik} from 'formik';
import {object, string} from 'yup'
import API from './shared/API';
import { useUserOutlet } from './contexts/UserContext';

const schema = object({
    username: string().required('Username is required').min(3, 'Username must be at least ${min} characters.'),
    password: string().required('Password is required').min(8, 'Password must be at least ${min} characters.')
  });

export default function LoginForm(){
    const {setUser} = useUserOutlet();

    const [error, setError] = React.useState("");
    const handleSubmit=(values)=>{
        API.post('/auth/login', values).then((user)=>{
            setUser(user)
            window.location="/"
        }).catch(async e=>{
            setError(e.message)
        })
    }

    return (
        <div style={{display:"flex", flexDirection:"column", flexWrap:"wrap", alignItems:"center", padding:"10px 10px"}}>
            <Formik
                validationSchema={schema}
                onSubmit={handleSubmit}
                initialValues={{}}
                isInitialValid={false}
            >
                {({
                    handleSubmit,
                    handleChange,
                    handleBlur,
                    values,
                    touched,
                    isValid,
                    errors,
                }) => (
                    <Form noValidate validated={isValid} onSubmit={handleSubmit}>
                        {error?<p style={{color:"red", textAlign:"center"}}>{error}</p>:<></>}
                        <Form.Group controlId="validationFormikUsername">
                            <Form.Label>Username</Form.Label>
                            <InputGroup>
                                <InputGroup.Prepend>
                                <InputGroup.Text id="inputGroupPrepend">@</InputGroup.Text>
                                </InputGroup.Prepend>
                                <Form.Control
                                    type="text"
                                    placeholder="Username"
                                    aria-describedby="inputGroupPrepend"
                                    name="username"
                                    value={values.username}
                                    onChange={handleChange}
                                    isValid={touched.username&&!errors.username}
                                    isInvalid={errors.username}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.username}
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>
                        <Form.Group controlId="validationFormikPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                value={values.password}
                                onChange={handleChange}
                                isInvalid={errors.password}
                                isValid={touched.password && !errors.password}
                            />
                            
                            <Form.Control.Feedback type="invalid">
                                {errors.password}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <button type="submit" className="primary" style={{width:"100%", margin:"0"}}>Login</button>
                    </Form>
                )}
            </Formik>
        </div>
    )
}