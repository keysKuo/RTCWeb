const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001',
})
const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {}
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream);
    
    myPeer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');

        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        })
    })

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream);
        console.log(userId);
    }) 
})

socket.on('user-disconnected', userId => {
    if (peers[userId])
        peers[userId].close();
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
})



function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');

    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    })

    call.on('close', () => {
        video.remove();
    })

    peers[userId] = call;
}

function addVideoStream(video, stream) {
    video.srcObject = stream,
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
}

// Room 
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
})

btnCameraOff.addEventListener('click', () => {
  btnCameraOn.classList.remove('d-none')
  btnCameraOff.classList.add('d-none')
})

btnMicrophoneOn.addEventListener('click', () => {
  btnMicrophoneOff.classList.remove('d-none')
  btnMicrophoneOn.classList.add('d-none')
})

btnMicrophoneOff.addEventListener('click', () => {
  btnMicrophoneOn.classList.remove('d-none')
  btnMicrophoneOff.classList.add('d-none')
})

btnLeave.addEventListener('click', () => {
  window.location.href = '/'
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