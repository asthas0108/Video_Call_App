import React from 'react';
import "../App.css";
import {Link, useNavigate} from "react-router-dom";

const LandingPage = () => {

    const router = useNavigate();


  return (
    <div className='landingPageContainer'>
        <nav>
            <div className='navHeader'>
                <h2>VideoCall</h2>
            </div>
            <div className='navlist'>
                <p onClick={()=>{
                    router("/123456")
                }}>Join as guest</p>
                <p onClick={()=>{
                    router("/auth")
                }}>Register</p>
                <div onClick={()=>{
                    router("/auth")
                }} role='button'>
                    <p>Login</p>
                </div>
            </div>
        </nav>

        <div className='landingMainContainer'>
            <div>
                <h1><span style={{color:"#ff9839"}}>Connect</span> with your loved ones</h1>
                <p>Cover a distance with VideoCall</p>
                <div role='button'>
                    <Link to={"/auth"}>Get Started</Link>
                </div>
            </div>
            <div>
                <img src="/mobile.png" alt=''></img>
            </div>
        </div>

    </div>
  )
}

export default LandingPage;