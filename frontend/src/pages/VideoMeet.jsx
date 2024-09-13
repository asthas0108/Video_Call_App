import React, { useEffect, useRef, useState } from 'react';
import { Badge, IconButton, TextField } from '@mui/material';
import { Button } from '@mui/material';
import io from "socket.io-client";

import "../styles/VideoMeet.css";

const server_url = "http://localhost:8000";

var connections = {};

const peerConfigConnections = {
  "iceServers": [
      { "urls": "stun:stun.l.google.com:19302" }
  ]
}

export const VideoMeet = () => {

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoRef = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);
    
    let [video, setVideo] = useState([]);

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState();

    let [screenAvailable, setScreenAvailable] = useState();

    let [message, setMessage] = useState("");

    let [messages, setMessages] = useState([]);

    let [newMessages, setNewMessages] = useState(0);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef([]);

    let [videos, setVideos] = useState([]);

  const getPermissions = async () => {
    try{
      const videoPermissions = await navigator.mediaDevices.getUserMedia({video:true});

      if(videoPermissions){
        setVideoAvailable(true);
      }else{
        setVideoAvailable(false);
      }

      const audioPermissions = await navigator.mediaDevices.getUserMedia({audio:true});

      if(audioPermissions){
        setAudioAvailable(true);
      }else{
        setAudioAvailable(false);
      }

      if(navigator.mediaDevices.getDisplayMedia){
        setScreenAvailable(true);
      }else{
        setScreenAvailable(false);
      }

      if(videoAvailable || audioAvailable){
        const userMediaStream = await navigator.mediaDevices.getUserMedia({video:videoAvailable, audio: audioAvailable});
      
        if(userMediaStream){
          window.localStream = userMediaStream;
          if(localVideoRef.current){
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }

    }catch (err){
      console.log(err);
    }
  }
  
  useEffect(() => {
    getPermissions();
  }, [videoAvailable, audioAvailable]);

  let getUserMediaSuccess = (stream) => {
    try{

      window.localStream.getTracks().forEach(track => track.stop())

    }catch(e){
      console.log(e);
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for(let id in connections){
      if(id === socketIdRef) continue;

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description)
        .then(() => {
          socketIdRef.current.emit("signal", id, JSON.stringify({"sdp":connections[id].localDescription}))
        })
        .catch(e=>console.log(e))
      })
    }

  }

  let getUserMedia = () => {
    if((video && videoAvailable) || (audio && audioAvailable)){
      navigator.mediaDevices.getUserMedia({video: video, audio: audio})
      .then(getUserMediaSuccess()) // getuserMedia success
      .then((stream) => {})
      .catch((e) => console.log(e));
    }else{
      try{
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }catch(e){

      }
    }
  }

  useEffect(()=>{
    if(video !== undefined && audio !== undefined){
      getUserMedia();
    }
  }, [audio, video]);


  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);

    if(fromId !== socketIdRef){
      if(signal.sdp){
        connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
          if(signal.sdp.type === "offer"){

            connections[fromId].createAnswer().then((description) => {
              connections[fromId].setLocalDescription(description).then(() => {
                socketIdRef.current.emit("signal", fromId, JSON>stringify({"sdp": connections[fromId].localDescription}))
              }).catch(e => console.log(e))
            }).catch(e => console.log(e))

          }
        }).catch(e => console.log(e))
      }

      if(signal.ice){
        connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e=>console.log(e))
      }

    }
  }

  let addMessage = () => {

  }

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, {secure: false});

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {

      socketRef.current.emit("join-call",window.location.href);

      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        setVideo((videos) => videos.filter((video) => video.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {

          connections[socketListId] = new RTCPeerConnection(peerConfigConnections);

          connections[socketListId].onicecandidate = (event) => {
            if(event.candidate !== null){
              socketRef.current.emit("signal", socketListId, JSON.stringify({"ice":event.candidate}));
            }
          }

          connections[socketListId].onaddstream = (event) => {

            let videoExists = videoRef.current.find(video => video.socketId === socketListId);

            if(videoExists) {
              setVideo(vidoes => {
                const updatedVideos = videos.map(video =>
                  video.socketId === socketListId ? {...video, stream: event.stream}:video
                );

                videoRef.current = updatedVideos;
                return updatedVideos;
              })
            }else{

              let newVideo = {
                socketId: socketListId,
                stream: event.stream,
                autoPlay: true,
                playsinline: true
              }

              setVideo(videos => {
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
              
            }

          };

          if(window.localStream !== undefined && window.localStream !== null){
            connections[socketListId].addStream(window.localStream);
          }else{
            // blacksilence
          }

        })

        if(id === socketIdRef.current){
          for(let id2 in connections){

            if(id === id2) continue;

            try{

              connections[id2].addStream(window.localStream);


            }catch{

            }

            connections[id2].createOffer().then((description) => {
              connections[id2].setLocalDescription(description)
              .then(() => {
                socketRef.current.emit("signal", id2, JSON.stringify({"sdp" :connections[id2].localDescription}))
              })

              .catch(e => console.log(e))
            })

          }
        }

      })
    })

  }

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  }

  let connect = () => {
    setAskForUsername(false);
    getMedia();
  }

  return (
    <div>

      { askForUsername === true ?
          <div>

            <h2>Enter into Lobby</h2>

            <TextField id="outlined-basic" label="Username" value={username} onChange={e => setUsername(e.target.value)} variant="outlined" />

            <Button variant="contained" onClick={connect}>Connect</Button>

            <div>
              <video ref={localVideoRef} autoPlay muted></video>
            </div>

          </div> :

          <></>
      }

    </div>
  )
}
