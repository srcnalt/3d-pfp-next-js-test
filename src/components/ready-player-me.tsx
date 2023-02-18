import { AvatarOptions2D, AvatarOptions3D } from "@sarge/avatar-view/dist/utils/utils";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react"

const AvatarView = dynamic(() => import("@sarge/avatar-view"), {
  ssr: false
});

const options3D: AvatarOptions3D = {
  faceTracking: true,
  orbitControl: true,
  followCursor: true,
  blinkEyes: true
}

const options2D: AvatarOptions2D = {
  scale: [1.4, 1.4],
  position: [0, -5]
}

const subdomain = 'demo'; // Replace with your custom subdomain

export default function ReadyPlayerMe(){
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [url, setUrl] = useState("https://models.readyplayer.me/61069da5616490e7e2ebc787.glb");

  useEffect(() =>{
    if(iframeRef.current){
      iframeRef.current.src = `https://${subdomain}.readyplayer.me/avatar?frameApi`;

      window.addEventListener('message', subscribe);
      document.addEventListener('message', subscribe);
    }
  }, [url])

  function subscribe(event: any) {
    const json = parse(event);

    if (json?.source !== 'readyplayerme') {
      return;
    }

    // Susbribe to all events sent from Ready Player Me once frame is ready
    if (json.eventName === 'v1.frame.ready' && iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({
          target: 'readyplayerme',
          type: 'subscribe',
          eventName: 'v1.**'
        }),
        '*'
      );
    }

    // Get avatar GLB URL
    if (json.eventName === 'v1.avatar.exported') {
      console.log(`Avatar URL: ${json.data.url}`);
      setUrl(json.data.url)
    }

    // Get user id
    if (json.eventName === 'v1.user.set') {
      console.log(`User with id ${json.data.id} set: ${JSON.stringify(json)}`);
    }
  }

  function parse(event: any) {
    try {
      return JSON.parse(event.data);
    } catch (error) {
      return null;
    }
  }

  return <div style={{display: 'flex'}}>
    <iframe style={{width: 480, height: 640}} ref={iframeRef} allow="camera *; microphone *; clipboard-write" />
    <AvatarView type="2D" options3D={options3D} options2D={options2D} url={`${url}?useHands=false&morphTargets=mouthOpen,mouthSmile,ARKit&textureAtlas=512`} />
  </div>
}
