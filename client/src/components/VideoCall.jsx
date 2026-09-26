
import { useCallback, useEffect, useRef, useState } from "react";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export default function VideoCall({
  socket,
  receiverId,
  receiverName,
  groupId,
  groupName,
}) {
  const [callStatus, setCallStatus] = useState("idle");
  const [callType, setCallType] = useState("audio");
  const [callMode, setCallMode] = useState("personal");
  const [incomingCall, setIncomingCall] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [error, setError] = useState("");
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [participants, setParticipants] = useState([]);

  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteVideoRefs = useRef({});
  const remoteAudioRefs = useRef({});
  const peerConnectionsRef = useRef(new Map());
  const pendingCandidatesRef = useRef(new Map());

  const callIdRef = useRef(null);
  const callTypeRef = useRef("audio");
  const callModeRef = useRef("personal");
  const incomingCallRef = useRef(null);
  const mountedRef = useRef(false);

  const isActive = callStatus !== "idle";

  // Keep the latest incoming call available to event handlers.
  useEffect(() => {
    incomingCallRef.current = incomingCall;
  }, [incomingCall]);

  const setStatus = useCallback((status) => {
    if (mountedRef.current) {
      setCallStatus(status);
    }
  }, []);

  const updateRemoteStream = useCallback((peerId, stream, name = "Participant") => {
    setRemoteStreams((previous) => {
      const existing = previous.find((item) => item.peerId === peerId);

      if (existing) {
        return previous.map((item) =>
          item.peerId === peerId ? { ...item, stream, name } : item
        );
      }

      return [...previous, { peerId, stream, name }];
    });
  }, []);

  const removeRemoteStream = useCallback((peerId) => {
    setRemoteStreams((previous) =>
      previous.filter((item) => item.peerId !== peerId)
    );

    delete remoteVideoRefs.current[peerId];
    delete remoteAudioRefs.current[peerId];
  }, []);

  const cleanup = useCallback(() => {
    peerConnectionsRef.current.forEach((peer) => {
      peer.ontrack = null;
      peer.onicecandidate = null;
      peer.onconnectionstatechange = null;
      peer.close();
    });

    peerConnectionsRef.current.clear();
    pendingCandidatesRef.current.clear();

    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    Object.values(remoteVideoRefs.current).forEach((element) => {
      if (element) element.srcObject = null;
    });

    Object.values(remoteAudioRefs.current).forEach((element) => {
      if (element) element.srcObject = null;
    });

    remoteVideoRefs.current = {};
    remoteAudioRefs.current = {};
    callIdRef.current = null;
    incomingCallRef.current = null;

    if (mountedRef.current) {
      setIncomingCall(null);
      setCallStatus("idle");
      setRemoteStreams([]);
      setParticipants([]);
      setIsMuted(false);
      setIsCameraOn(true);
    }
  }, []);

  const getMedia = useCallback(async (type) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Camera/microphone access is not supported in this browser.");
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: type === "video",
    });

    localStreamRef.current = stream;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    return stream;
  }, []);

  const createPeerConnection = useCallback(
    (peerId, peerName = "Participant") => {
      const existing = peerConnectionsRef.current.get(peerId);
      if (existing) return existing;

      const peer = new RTCPeerConnection(ICE_SERVERS);
      const localStream = localStreamRef.current;

      if (localStream) {
        localStream.getTracks().forEach((track) => {
          peer.addTrack(track, localStream);
        });
      }

      peer.ontrack = (event) => {
        const stream = event.streams?.[0];
        if (stream) {
          updateRemoteStream(peerId, stream, peerName);
        }
      };

      peer.onicecandidate = (event) => {
        if (!event.candidate || !callIdRef.current || !socket) return;

        if (callModeRef.current === "group") {
          socket.emit("group_webrtc_ice_candidate", {
            callId: callIdRef.current,
            to: peerId,
            candidate: event.candidate,
          });
        } else {
          socket.emit("webrtc_ice_candidate", {
            callId: callIdRef.current,
            candidate: event.candidate,
          });
        }
      };

      peer.onconnectionstatechange = () => {
        if (
          peer.connectionState === "failed" ||
          peer.connectionState === "closed"
        ) {
          peerConnectionsRef.current.delete(peerId);
          pendingCandidatesRef.current.delete(peerId);
          removeRemoteStream(peerId);
        }

        if (peer.connectionState === "connected") {
          setStatus("in-call");
        }
      };

      peerConnectionsRef.current.set(peerId, peer);
      return peer;
    },
    [socket, updateRemoteStream, removeRemoteStream, setStatus]
  );

  const flushCandidates = useCallback(async (peerId, peer) => {
    const candidates = pendingCandidatesRef.current.get(peerId) || [];

    for (const candidate of candidates) {
      try {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Could not add queued ICE candidate:", err);
      }
    }

    pendingCandidatesRef.current.delete(peerId);
  }, []);

  const addIceCandidate = useCallback(async (peerId, candidate) => {
    if (!candidate) return;

    const peer = peerConnectionsRef.current.get(peerId);

    if (!peer || !peer.remoteDescription) {
      const pending = pendingCandidatesRef.current.get(peerId) || [];
      pending.push(candidate);
      pendingCandidatesRef.current.set(peerId, pending);
      return;
    }

    try {
      await peer.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error("Could not add ICE candidate:", err);
    }
  }, []);

  // Start a personal audio/video call.
  const startPersonalCall = async (type) => {
    if (!socket || !socket.connected) {
      setError("Socket connected nahi hai. Page refresh karke dobara try karo.");
      return;
    }

    if (!receiverId) {
      setError("Pehle kisi user ki chat select karo.");
      return;
    }

    if (isActive) return;

    try {
      setError("");
      setCallType(type);
      setCallMode("personal");
      callTypeRef.current = type;
      callModeRef.current = "personal";
      setStatus("calling");

      await getMedia(type);

      socket.emit("call_user", {
        receiverId,
        callType: type,
      });
    } catch (err) {
      console.error("Could not start personal call:", err);
      setError(err.message || "Microphone/camera permission nahi mili.");
      cleanup();
    }
  };

  // Start a group audio/video call.
  const startGroupCall = async (type) => {
    if (!socket || !socket.connected) {
      setError("Socket connected nahi hai. Page refresh karke dobara try karo.");
      return;
    }

    if (!groupId) {
      setError("Group select nahi hai.");
      return;
    }

    if (isActive) return;

    try {
      setError("");
      setCallType(type);
      setCallMode("group");
      callTypeRef.current = type;
      callModeRef.current = "group";
      setStatus("calling");

      await getMedia(type);

      socket.emit("group_call_start", {
        groupId,
        callType: type,
      });
    } catch (err) {
      console.error("Could not start group call:", err);
      setError(err.message || "Microphone/camera permission nahi mili.");
      cleanup();
    }
  };

  const acceptPersonalCall = async () => {
    const call = incomingCallRef.current;
    if (!call || !socket) return;

    try {
      setError("");
      callIdRef.current = call.callId;
      callModeRef.current = "personal";
      callTypeRef.current = call.callType || "audio";
      setCallMode("personal");
      setCallType(call.callType || "audio");

      await getMedia(call.callType || "audio");

      socket.emit("accept_call", { callId: call.callId });
      setIncomingCall(null);
      incomingCallRef.current = null;
      setStatus("connecting");
    } catch (err) {
      console.error("Could not accept personal call:", err);
      setError(err.message || "Microphone/camera permission nahi mili.");
      socket.emit("reject_call", { callId: call.callId });
      cleanup();
    }
  };

  const joinGroupCall = async () => {
    const call = incomingCallRef.current;
    if (!call || !socket) return;

    try {
      setError("");
      callIdRef.current = call.callId;
      callModeRef.current = "group";
      callTypeRef.current = call.callType || "audio";
      setCallMode("group");
      setCallType(call.callType || "audio");

      await getMedia(call.callType || "audio");

      socket.emit("group_call_join", {
        callId: call.callId,
        groupId: call.groupId,
      });

      setIncomingCall(null);
      incomingCallRef.current = null;
      setStatus("connecting");
    } catch (err) {
      console.error("Could not join group call:", err);
      setError(err.message || "Microphone/camera permission nahi mili.");
      cleanup();
    }
  };

  const rejectIncomingCall = () => {
    const call = incomingCallRef.current;
    if (!call || !socket) return;

    if (call.mode === "group") {
      socket.emit("group_call_reject", { callId: call.callId });
    } else {
      socket.emit("reject_call", { callId: call.callId });
    }

    setIncomingCall(null);
    incomingCallRef.current = null;
    setStatus("idle");
  };

  const endCall = () => {
    if (socket && callIdRef.current) {
      if (callModeRef.current === "group") {
        socket.emit("group_call_leave", {
          callId: callIdRef.current,
        });
      } else {
        socket.emit("end_call", {
          callId: callIdRef.current,
        });
      }
    }

    cleanup();
  };

  const toggleMute = () => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const nextMuted = !isMuted;

    stream.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });

    setIsMuted(nextMuted);
  };

  const toggleCamera = () => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const nextCameraOn = !isCameraOn;

    stream.getVideoTracks().forEach((track) => {
      track.enabled = nextCameraOn;
    });

    setIsCameraOn(nextCameraOn);
  };

  // Personal call: caller creates offer after receiver accepts.
  const handleCallAccepted = async ({ callId }) => {
    if (callModeRef.current !== "personal") return;
    if (callId) callIdRef.current = callId;

    try {
      const peer = createPeerConnection(
        "personal-peer",
        receiverName || "Other user"
      );

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socket.emit("webrtc_offer", {
        callId: callIdRef.current,
        offer,
      });

      setStatus("connecting");
    } catch (err) {
      console.error("Personal offer creation failed:", err);
      setError("Call connect nahi ho paayi.");
      endCall();
    }
  };

  // Personal call: receiver handles offer and sends answer.
  const handleWebRTCOffer = async ({ callId, offer }) => {
    if (callModeRef.current !== "personal") return;

    try {
      callIdRef.current = callId;

      const peer = createPeerConnection(
        "personal-peer",
        receiverName || "Other user"
      );

      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      await flushCandidates("personal-peer", peer);

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit("webrtc_answer", { callId, answer });
      setStatus("connecting");
    } catch (err) {
      console.error("Could not handle personal offer:", err);
      setError("Call connect nahi ho paayi.");
    }
  };

  const handleWebRTCAnswer = async ({ callId, answer }) => {
    if (callModeRef.current !== "personal") return;
    if (callIdRef.current && callId !== callIdRef.current) return;

    const peer = peerConnectionsRef.current.get("personal-peer");
    if (!peer) return;

    try {
      await peer.setRemoteDescription(new RTCSessionDescription(answer));
      await flushCandidates("personal-peer", peer);
      setStatus("in-call");
    } catch (err) {
      console.error("Could not handle personal answer:", err);
      setError("Call answer process nahi ho paaya.");
    }
  };

  // Group call: create a peer-to-peer offer for one participant.
  const createGroupOffer = async (participant) => {
    const peerId = participant?.socketId;

    if (
      !socket ||
      !callIdRef.current ||
      !peerId ||
      peerId === socket.id ||
      callModeRef.current !== "group"
    ) {
      return;
    }

    // Avoid duplicate offers to the same participant.
    if (peerConnectionsRef.current.has(peerId)) return;

    const peer = createPeerConnection(
      peerId,
      participant.name || "Participant"
    );

    try {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socket.emit("group_webrtc_offer", {
        callId: callIdRef.current,
        to: peerId,
        offer,
      });
    } catch (err) {
      console.error("Group offer failed:", err);
      setError("Group call mein participant connect nahi ho paaya.");
    }
  };

  const handleGroupOffer = async ({ callId, from, offer, name }) => {
    if (!from || !offer || callModeRef.current !== "group") return;
    if (callIdRef.current && callId !== callIdRef.current) return;

    try {
      callIdRef.current = callId;

      const peer = createPeerConnection(from, name || "Participant");

      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      await flushCandidates(from, peer);

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit("group_webrtc_answer", {
        callId,
        to: from,
        answer,
      });

      setStatus("in-call");
    } catch (err) {
      console.error("Group offer handling failed:", err);
      setError("Group call ka connection establish nahi ho paaya.");
    }
  };

  const handleGroupAnswer = async ({ callId, from, answer }) => {
    if (callModeRef.current !== "group") return;
    if (callIdRef.current && callId !== callIdRef.current) return;

    const peer = peerConnectionsRef.current.get(from);
    if (!peer) return;

    try {
      await peer.setRemoteDescription(new RTCSessionDescription(answer));
      await flushCandidates(from, peer);
      setStatus("in-call");
    } catch (err) {
      console.error("Group answer handling failed:", err);
      setError("Group call ka answer process nahi ho paaya.");
    }
  };

  // Server sends this to the user who joins a running group call.
  const handleGroupParticipants = async ({
    callId,
    participants: list = [],
  }) => {
    if (callModeRef.current !== "group") return;
    if (callId) callIdRef.current = callId;

    const others = list.filter(
      (participant) => participant.socketId !== socket.id
    );

    setParticipants(others);

    // Only one side creates the offer to avoid simultaneous offers.
    for (const participant of others) {
      if (
        socket.id.localeCompare(participant.socketId) < 0
      ) {
        await createGroupOffer(participant);
      }
    }

    setStatus("in-call");
  };

  // Existing participants receive this when a new user joins.
  const handleGroupPeerJoined = async ({ callId, participant }) => {
    if (callModeRef.current !== "group") return;
    if (callIdRef.current && callId !== callIdRef.current) return;
    if (!participant?.socketId || participant.socketId === socket.id) return;

    setParticipants((previous) => {
      if (previous.some((item) => item.socketId === participant.socketId)) {
        return previous;
      }

      return [...previous, participant];
    });

    if (socket.id.localeCompare(participant.socketId) < 0) {
      await createGroupOffer(participant);
    }
  };

  const handleGroupPeerLeft = ({ callId, socketId }) => {
    if (callIdRef.current && callId !== callIdRef.current) return;

    const peer = peerConnectionsRef.current.get(socketId);

    if (peer) {
      peer.ontrack = null;
      peer.onicecandidate = null;
      peer.onconnectionstatechange = null;
      peer.close();
      peerConnectionsRef.current.delete(socketId);
    }

    pendingCandidatesRef.current.delete(socketId);
    removeRemoteStream(socketId);

    setParticipants((previous) =>
      previous.filter((participant) => participant.socketId !== socketId)
    );
  };

  // Attach streams to their corresponding media elements.
  useEffect(() => {
    remoteStreams.forEach(({ peerId, stream }) => {
      const video = remoteVideoRefs.current[peerId];
      const audio = remoteAudioRefs.current[peerId];

      if (video && video.srcObject !== stream) {
        video.srcObject = stream;
      }

      if (audio && audio.srcObject !== stream) {
        audio.srcObject = stream;
      }
    });
  }, [remoteStreams]);

  // Socket listeners. Keep these separate from chat message listeners.
  useEffect(() => {
    if (!socket) return undefined;

    mountedRef.current = true;

    const onIncomingCall = (call) => {
      if (callStatus !== "idle") {
        socket.emit("reject_call", { callId: call.callId });
        return;
      }

      incomingCallRef.current = { ...call, mode: "personal" };
      setIncomingCall({ ...call, mode: "personal" });
      setCallMode("personal");
      callModeRef.current = "personal";
      setCallType(call.callType || "audio");
      callTypeRef.current = call.callType || "audio";
      setStatus("ringing");
    };

    const onGroupIncoming = (call) => {
      // Do not replace an ongoing call with another incoming call.
      if (callStatus !== "idle") {
        socket.emit("group_call_reject", { callId: call.callId });
        return;
      }

      const incoming = {
        ...call,
        mode: "group",
      };

      incomingCallRef.current = incoming;
      setIncomingCall(incoming);
      setCallStatus("ringing");
      setCallMode("group");
      callModeRef.current = "group";
      setCallType(call.callType || "audio");
      callTypeRef.current = call.callType || "audio";
    };

    const onCallRinging = ({ callId }) => {
      callIdRef.current = callId;
      setStatus("ringing");
    };

    const onCallRejected = () => {
      setError("Call reject kar di gayi.");
      cleanup();
    };

    const onCallEnded = ({ callId } = {}) => {
      if (callIdRef.current && callId && callId !== callIdRef.current) return;
      cleanup();
    };

    const onCallError = (payload) => {
      setError(payload?.message || "Call mein error aaya.");
      cleanup();
    };

    const onPersonalIce = ({ callId, candidate }) => {
      if (callIdRef.current && callId !== callIdRef.current) return;
      addIceCandidate("personal-peer", candidate);
    };

    const onGroupIce = ({ callId, from, candidate }) => {
      if (callIdRef.current && callId !== callIdRef.current) return;
      addIceCandidate(from, candidate);
    };

    const onGroupStarted = ({ callId, participants: list = [] }) => {
      callIdRef.current = callId;
      callModeRef.current = "group";
      setParticipants(
        list.filter((participant) => participant.socketId !== socket.id)
      );
      setStatus("in-call");
    };

    const onGroupRejected = ({ name }) => {
      setError(`${name || "A participant"} ne group call join nahi ki.`);
    };

    const onGroupEnded = ({ callId } = {}) => {
      if (callIdRef.current && callId && callId !== callIdRef.current) return;
      cleanup();
    };

    socket.on("incoming_call", onIncomingCall);
    socket.on("call_ringing", onCallRinging);
    socket.on("call_accepted", handleCallAccepted);
    socket.on("call_rejected", onCallRejected);
    socket.on("call_ended", onCallEnded);
    socket.on("call_error", onCallError);
    socket.on("webrtc_offer", handleWebRTCOffer);
    socket.on("webrtc_answer", handleWebRTCAnswer);
    socket.on("webrtc_ice_candidate", onPersonalIce);

    socket.on("group_call_incoming", onGroupIncoming);
    socket.on("group_call_started", onGroupStarted);
    socket.on("group_call_participants", handleGroupParticipants);
    socket.on("group_call_peer_joined", handleGroupPeerJoined);
    socket.on("group_call_peer_left", handleGroupPeerLeft);
    socket.on("group_call_rejected", onGroupRejected);
    socket.on("group_call_ended", onGroupEnded);
    socket.on("group_call_error", onCallError);
    socket.on("group_webrtc_offer", handleGroupOffer);
    socket.on("group_webrtc_answer", handleGroupAnswer);
    socket.on("group_webrtc_ice_candidate", onGroupIce);

    return () => {
      socket.off("incoming_call", onIncomingCall);
      socket.off("call_ringing", onCallRinging);
      socket.off("call_accepted", handleCallAccepted);
      socket.off("call_rejected", onCallRejected);
      socket.off("call_ended", onCallEnded);
      socket.off("call_error", onCallError);
      socket.off("webrtc_offer", handleWebRTCOffer);
      socket.off("webrtc_answer", handleWebRTCAnswer);
      socket.off("webrtc_ice_candidate", onPersonalIce);

      socket.off("group_call_incoming", onGroupIncoming);
      socket.off("group_call_started", onGroupStarted);
      socket.off("group_call_participants", handleGroupParticipants);
      socket.off("group_call_peer_joined", handleGroupPeerJoined);
      socket.off("group_call_peer_left", handleGroupPeerLeft);
      socket.off("group_call_rejected", onGroupRejected);
      socket.off("group_call_ended", onGroupEnded);
      socket.off("group_call_error", onCallError);
      socket.off("group_webrtc_offer", handleGroupOffer);
      socket.off("group_webrtc_answer", handleGroupAnswer);
      socket.off("group_webrtc_ice_candidate", onGroupIce);
    };
  }, [
    socket,
    callStatus,
    cleanup,
    setStatus,
    addIceCandidate,
    handleCallAccepted,
    handleWebRTCOffer,
    handleWebRTCAnswer,
    handleGroupParticipants,
    handleGroupPeerJoined,
    handleGroupPeerLeft,
    handleGroupOffer,
    handleGroupAnswer,
  ]);

  // Stop media when this component is removed.
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      peerConnectionsRef.current.forEach((peer) => peer.close());
      peerConnectionsRef.current.clear();

      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    };
  }, []);

  const startCall = (type) => {
    if (groupId) {
      startGroupCall(type);
    } else {
      startPersonalCall(type);
    }
  };

  const title =
    callMode === "group"
      ? groupName || incomingCall?.groupName || "Group call"
      : receiverName || incomingCall?.callerName || "Call";

  return (
    <>
      {/* Header buttons */}
      {!isActive && !incomingCall && (
        <div className="video-call-header-actions">
          <button
            type="button"
            className="video-call-icon-button"
            title={groupId ? "Start group audio call" : "Start audio call"}
            aria-label="Start audio call"
            onClick={() => startCall("audio")}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.35 1.9.69 2.8a2 2 0 0 1-.45 2.11L8.08 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.84.57 2.8.69A2 2 0 0 1 22 16.92Z" />
            </svg>
          </button>

          <button
            type="button"
            className="video-call-icon-button"
            title={groupId ? "Start group video call" : "Start video call"}
            aria-label="Start video call"
            onClick={() => startCall("video")}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="6" width="13" height="12" rx="2" />
              <path d="m16 10 5-3v10l-5-3" />
            </svg>
          </button>
        </div>
      )}

      {/* Show errors even when no call window is open */}
      {error && !isActive && (
        <div className="video-call-error" role="alert">
          {error}
          <button type="button" onClick={() => setError("")}>
            Dismiss
          </button>
        </div>
      )}

      {/* Incoming call dialog */}
      {incomingCall && (
        <div className="video-call-overlay">
          <div className="video-call-dialog">
            <div className="video-call-dialog-icon">
              {incomingCall.callType === "video" ? "▣" : "☎"}
            </div>

            <h2>
              {incomingCall.mode === "group"
                ? incomingCall.groupName || groupName || "Group call"
                : incomingCall.callerName || "Incoming call"}
            </h2>

            <p>
              {incomingCall.mode === "group"
                ? `${incomingCall.callerName || "Someone"} is inviting you to a group ${incomingCall.callType || "audio"} call`
                : `Incoming ${incomingCall.callType || "audio"} call`}
            </p>

            <div className="video-call-dialog-actions">
              <button
                type="button"
                className="video-call-reject"
                onClick={rejectIncomingCall}
              >
                Reject
              </button>

              <button
                type="button"
                className="video-call-accept"
                onClick={
                  incomingCall.mode === "group"
                    ? joinGroupCall
                    : acceptPersonalCall
                }
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active call window: hide it while Accept/Reject is visible. */}
      {isActive && !incomingCall && (
        <div className="video-call-overlay">
          <div className="video-call-window">
            <div className="video-call-topbar">
              <div>
                <h2>{title}</h2>
                <p>
                  {callStatus === "calling" && "Calling..."}
                  {callStatus === "ringing" && "Ringing..."}
                  {callStatus === "connecting" && "Connecting..."}
                  {callStatus === "in-call" &&
                    (callMode === "group"
                      ? `${participants.length + 1} participants`
                      : "Connected")}
                </p>
              </div>

              <button
                type="button"
                className="video-call-close"
                onClick={endCall}
                aria-label="End call"
              >
                ×
              </button>
            </div>

            <div className="video-call-media">
              {callType === "video" && (
                <>
                  <div className="video-call-local">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                    />
                    <span>You</span>
                  </div>

                  {remoteStreams.map(({ peerId, name }) => (
                    <div className="video-call-remote" key={peerId}>
                      <video
                        ref={(element) => {
                          remoteVideoRefs.current[peerId] = element;
                          const stream = remoteStreams.find(
                            (item) => item.peerId === peerId
                          )?.stream;

                          if (element && stream && element.srcObject !== stream) {
                            element.srcObject = stream;
                          }
                        }}
                        autoPlay
                        playsInline
                      />
                      <span>{name}</span>
                    </div>
                  ))}
                </>
              )}

              {callType === "audio" && (
                <div className="video-call-audio-participants">
                  <div className="video-call-audio-person">
                    <div className="video-call-audio-avatar">You</div>
                    <span>You</span>
                  </div>

                  {remoteStreams.map(({ peerId, name }) => (
                    <div className="video-call-audio-person" key={peerId}>
                      <div className="video-call-audio-avatar">
                        {name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <span>{name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Keep remote audio mounted for audio and video calls */}
              {remoteStreams.map(({ peerId, stream }) => (
                <audio
                  key={`audio-${peerId}`}
                  autoPlay
                  ref={(element) => {
                    remoteAudioRefs.current[peerId] = element;

                    if (element && element.srcObject !== stream) {
                      element.srcObject = stream;
                    }
                  }}
                />
              ))}
            </div>

            {error && (
              <p className="video-call-error" role="alert">
                {error}
              </p>
            )}

            <div className="video-call-controls">
              <button
                type="button"
                className={isMuted ? "active" : ""}
                onClick={toggleMute}
                title={isMuted ? "Unmute microphone" : "Mute microphone"}
              >
                {isMuted ? "Unmute" : "Mute"}
              </button>

              {callType === "video" && (
                <button
                  type="button"
                  className={!isCameraOn ? "active" : ""}
                  onClick={toggleCamera}
                  title={isCameraOn ? "Turn camera off" : "Turn camera on"}
                >
                  {isCameraOn ? "Camera off" : "Camera on"}
                </button>
              )}

              <button
                type="button"
                className="video-call-end"
                onClick={endCall}
              >
                End call
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}