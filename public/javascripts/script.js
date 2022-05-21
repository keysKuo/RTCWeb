const peers = {};
const chatContainer = document.getElementById('left');
const remoteVideoContainer = document.getElementById('right');
const toggleButton = document.getElementById('toggle-cam');
const roomId = window.location.pathname.split('/')[2];
const userVideo = document.getElementById('user-video');
let userStream;
let isAdmin = false;
const socket = io('/');

function callOtherUsers(otherUsers, stream) {
    if (!otherUsers.length) {
        isAdmin = true;
    }
    
    document.getElementById('numMembers').innerHTML = otherUsers.length + 1;
    
    otherUsers.forEach(userIdToCall => {
        const peer = createPeer(userIdToCall);
        peers[userIdToCall] = peer;
        stream.getTracks().forEach(track => {
            peer.addTrack(track, stream);
        });
    });
}

function createPeer(userIdToCall) {
    const peer = new RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun.stunprotocol.org"
            }
        ]
    });
    peer.onnegotiationneeded = () => userIdToCall ? handleNegotiationNeededEvent(peer, userIdToCall) : null;
    peer.onicecandidate = handleICECandidateEvent;
    
    const mediaStream = new MediaStream();
    peer.ontrack = (e) => {
        mediaStream.addTrack(e.track);
        
        
    }

    const container = document.createElement('div');
    container.classList.add('remote-video-container');
    const video = document.createElement('video');
    video.srcObject = mediaStream;
    video.autoplay = true;
    video.playsInline = true;
    video.classList.add("remote-video");
    container.appendChild(video);
    
    container.id = userIdToCall;
    remoteVideoContainer.appendChild(container);

    return peer;
}

async function handleNegotiationNeededEvent(peer, userIdToCall) {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    const payload = {
        sdp: peer.localDescription,
        userIdToCall,
    };

    socket.emit('peer connection request', payload);
}

async function handleReceiveOffer({ sdp, callerId }, stream) {
    const peer = createPeer(callerId);
    peers[callerId] = peer;
    const desc = new RTCSessionDescription(sdp);
    await peer.setRemoteDescription(desc);

    stream.getTracks().forEach(track => {
        peer.addTrack(track, stream);
    });

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    const payload = {
        userToAnswerTo: callerId,
        sdp: peer.localDescription,
    };

    socket.emit('connection answer', payload);
}

function handleAnswer({ sdp, answererId }) {
    const desc = new RTCSessionDescription(sdp);
    peers[answererId].setRemoteDescription(desc).catch(e => console.log(e));
}

function handleICECandidateEvent(e) {
    if (e.candidate) {
        Object.keys(peers).forEach(id => {
            const payload = {
                target: id,
                candidate: e.candidate,
            }
            socket.emit("ice-candidate", payload);
        });
    }
}

function handleReceiveIce({ candidate, from }) {
    const inComingCandidate = new RTCIceCandidate(candidate);
    peers[from].addIceCandidate(inComingCandidate);
};

function handleDisconnect(userId) {
    delete peers[userId];
    document.getElementById(userId).remove();
    
};




function hideCam() {
    const videoTrack = userStream.getTracks().find(track => track.kind === 'video');
    videoTrack.enabled = false;
}

function showCam() {
    const videoTrack = userStream.getTracks().find(track => track.kind === 'video');
    videoTrack.enabled = true;
}

async function init() {
    socket.on('connect', async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio:true, video: true });
        userStream = stream;
        userVideo.srcObject = stream;
        userVideo.muted = true;
        socket.emit('user joined room', roomId);

        
        socket.on('all other users', (otherUsers) => callOtherUsers(otherUsers, stream));

        socket.on("connection offer", (payload) => handleReceiveOffer(payload, stream));

        socket.on('connection answer', handleAnswer);

        socket.on('ice-candidate', handleReceiveIce);

        socket.on('user disconnected', (userId) => handleDisconnect(userId));

        socket.on('hide cam', hideCam);

        socket.on("show cam", showCam);

        socket.on('server is full', () => alert("chat is full"));
    });
}

init();

// Room Configuration
const btnCameraOn = document.querySelector('[name="btn-camera-on"]')
const btnCameraOff = document.querySelector('[name="btn-camera-off"]')
const btnMicrophoneOn = document.querySelector('[name="btn-microphone-on"]')
const btnMicrophoneOff = document.querySelector('[name="btn-microphone-off"]')
const btnLeave = document.querySelector('[name="btn-leave"]')
const btnParticipants = document.querySelector('[name="btn-participants"]')
const btnCloseParticipants = document.querySelector(
  '[name="btn-close-participants"]'
)
const sidebar = document.querySelector('.sidebar')

btnCameraOn.addEventListener('click', () => {
  btnCameraOff.classList.remove('d-none')
  btnCameraOn.classList.add('d-none')
  showCam();
})

btnCameraOff.addEventListener('click', () => {
  btnCameraOn.classList.remove('d-none')
  btnCameraOff.classList.add('d-none')
  hideCam();
})

btnMicrophoneOn.addEventListener('click', () => {
  btnMicrophoneOff.classList.remove('d-none')
  btnMicrophoneOn.classList.add('d-none')
  $("video").prop('muted','');
})

btnMicrophoneOff.addEventListener('click', () => {
  btnMicrophoneOn.classList.remove('d-none')
  btnMicrophoneOff.classList.add('d-none')
  $("video").prop('muted','true');
})

btnLeave.addEventListener('click', () => {
  window.location.href = '/leave'
})

btnParticipants.addEventListener('click', () => {
  
  sidebar.classList.toggle('d-none')
})

btnCloseParticipants.addEventListener('click', () => {
  sidebar.classList.add('d-none')
})

function resizeIframe(obj) {
  obj.style.height =
    obj.contentWindow.document.documentElement.scrollHeight + 'px'
}

