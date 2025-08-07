const socket = io();
const peer = new RTCPeerConnection();
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

(async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localVideo.srcObject = stream;
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    const ack = await socket.emitWithAck("offer", peer.localDescription);
    console.log("Offer ack:", ack);
  } catch (err) {
    console.error("Error during offer setup:", err);
  }
})();

peer.ontrack = (event) => {
  remoteVideo.srcObject = event.streams[0];
};

peer.onicecandidate = async (event) => {
  if (event.candidate) {
    try {
      const ack = await socket.emitWithAck("ice-candidate", event.candidate);
      console.log("Candidate ack:", ack);
    } catch (err) {
      console.error("Error sending candidate:", err);
    }
  }
};

socket.on("offer", async (offer) => {
  try {
    await peer.setRemoteDescription(offer);
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localVideo.srcObject = stream;
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    const ack = await socket.emitWithAck("answer", peer.localDescription);
    console.log("Answer ack:", ack);
  } catch (err) {
    console.error("Error handling offer:", err);
  }
});

socket.on("answer", async (answer) => {
  try {
    await peer.setRemoteDescription(answer);
  } catch (err) {
    console.error("Error setting remote answer:", err);
  }
});

socket.on("ice-candidate", async (candidate) => {
  try {
    await peer.addIceCandidate(candidate);
  } catch (err) {
    console.error("Error adding ICE candidate:", err);
  }
});
