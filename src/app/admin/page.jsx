import React from 'react';

const Login = () => {
    return (
        <div className='flex justify-center items-center bg-linear-to-br from-[#0b182b] via-[#042e6d] to-[#5d8dd3] py-12 px-4 h-screen'>
            <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl text-white">
            <div className="card-body">
                <fieldset className="fieldset">
                <label className="label">Email</label>
                <input type="email" className="input" placeholder="Email" />
                <label className="label">Password</label>
                <input type="password" className="input" placeholder="Password" />
                <div><a className="link link-hover">Forgot password?</a></div>
                <button className="btn btn-neutral mt-4">Login</button>
                </fieldset>
            </div>
            </div>
        </div>
    );
};

export default Login;