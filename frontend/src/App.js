import './App.css';
import {Route, BrowserRouter as Router, Routes} from "react-router-dom";
import LandingPage from './pages/landing';
import Home from './pages/home'
import Authentication from './pages/authentication';
import { AuthProvider } from './contexts/AuthContext';
import { VideoMeet } from './pages/VideoMeet';
import History from './pages/history';

function App() {
  return (

    <div className='App'>

      <Router>

        <AuthProvider>


        <Routes>

          <Route path='/' element={<LandingPage/>}/>

          <Route path='/auth' element={<Authentication/>}/>

          <Route path='/home' element={<Home/>}></Route>

          <Route path='/history' element={<History/>}></Route>

          <Route path='/:url' element={<VideoMeet/>}/>

        </Routes>


        </AuthProvider>

        

      </Router>

    </div>

  );
}

export default App;
