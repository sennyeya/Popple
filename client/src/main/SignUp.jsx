import React from 'react';
import {Form, InputGroup, Col} from 'react-bootstrap';
import {Formik} from 'formik';
import {object, string, ref} from 'yup'
import API from '../shared/API';
import { useUserOutlet } from '../contexts/UserContext';

const schema = object({
    firstName: string().required('First name is required').min(3, 'First name must be at least ${min} characters.'),
    lastName: string().required('Last name is required').min(3,'Last name must be at least ${min} characters.'),
    username: string().required('Username is required').min(3, 'Username must be at least ${min} characters.'),
    password: string().required('Password is required').min(8, 'Password must be at least ${min} characters.'),
    confirmPassword:string().oneOf([ref('password'), null], 'Passwords must match')
  });

export default function SignUp(){
    const setUser = useUserOutlet();

    const [error, setError] = React.useState("");
    const handleSubmit=(values)=>{
        delete values['confirmPassword']
        API.post('/auth/signUp', values).then((user)=>{
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
                        <Form.Group controlId="validationFormikFirstName">
                            <Form.Label>First name</Form.Label>
                            <Form.Control
                                type="text"
                                name="firstName"
                                value={values.firstName}
                                onChange={handleChange}
                                isInvalid={errors.firstName}
                                isValid={touched.firstName && !errors.firstName}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.firstName}
                            </Form.Control.Feedback>
                            
                        </Form.Group>
                        <Form.Group controlId="validationFormikLastName">
                            <Form.Label>Last name</Form.Label>
                            <Form.Control
                                type="text"
                                name="lastName"
                                value={values.lastName}
                                onChange={handleChange}
                                isInvalid={errors.firstName}
                                isValid={touched.lastName && !errors.lastName}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.lastName}
                            </Form.Control.Feedback>
                        </Form.Group>
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
                        <Form.Group controlId="validationFormikConfirmPassword">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="confirmPassword"
                                value={values.confirmPassword}
                                onChange={handleChange}
                                isInvalid={errors.confirmPassword}
                                isValid={touched.confirmPassword&&!errors.confirmPassword&&!errors.password}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.confirmPassword}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <button type="submit" className="primary" style={{width:"100%", margin:"0"}}>Sign Up</button>
                    </Form>
                )}
            </Formik>
        </div>
    )
}