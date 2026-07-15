import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  Eye,
  Mic,
  Monitor,
  Play,
  Radio,
  ShieldCheck,
  Sparkles,
  StopCircle,
  Video,
  Volume2,
  Wifi,
  WifiOff,
} from 'lucide-react';

type ConnectionStatus = 'idle' | 'camera-starting' | 'connecting' | 'live' | 'offline' | 'ended';
type TimelineEvent = { label: string; detail: string; tone: 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate' };

const WS_URL = import.meta.env.VITE_INTERVIEW_WS_URL || 'ws://127.0.0.1:8000/ws';

const toneStyles: Record<TimelineEvent['tone'], string> = {
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20',
  amber: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20',
  rose: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20',
  slate: 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
};

const connectionCopy: Record<ConnectionStatus, { label: string; detail: string }> = {
  idle: { label: 'Ready check', detail: 'Camera and AI analysis will start together.' },
  'camera-starting': { label: 'Starting camera', detail: 'Allow camera permission to continue.' },
  connecting: { label: 'Connecting AI', detail: 'Opening the live analysis channel.' },
  live: { label: 'Live analysis', detail: 'Emotion, gaze, and suspicious activity are updating.' },
  offline: { label: 'Analysis offline', detail: 'Camera is active, but backend WebSocket is not connected.' },
  ended: { label: 'Session ended', detail: 'Final interview signals are ready.' },
};

function InterviewPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioIntervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const tabWarningRef = useRef(false);
  const sessionActiveRef = useRef(false);

  const [interviewStarted, setInterviewStarted] = useState(false);
  const [analysisVisible, setAnalysisVisible] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [emotion, setEmotion] = useState('Neutral');
  const [focus, setFocus] = useState('Looking at camera');
  const [suspiciousCount, setSuspiciousCount] = useState(0);
  const [micStatus, setMicStatus] = useState('Microphone unavailable');
  const [speakingStatus, setSpeakingStatus] = useState('Silence detected');
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [, setSilenceSeconds] = useState(0);
  const [communicationConfidence, setCommunicationConfidence] = useState(55);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([
    { label: 'Readiness loaded', detail: 'Interview room prepared for camera checks.', tone: 'indigo' },
  ]);

  const statusCopy = connectionCopy[connectionStatus];
  const overallInterviewScore = Math.max(35, Math.min(98, Math.round((communicationConfidence || 55) + (focus.toLowerCase().includes('camera') ? 18 : -8) - suspiciousCount * 4)));

  const focusTone = useMemo(() => {
    const normalized = focus.toLowerCase();
    if (normalized.includes('camera')) return 'text-emerald-600 dark:text-emerald-300';
    if (normalized.includes('left') || normalized.includes('right') || normalized.includes('up') || normalized.includes('down')) return 'text-amber-600 dark:text-amber-300';
    if (normalized.includes('no face') || normalized.includes('distraction') || normalized.includes('error')) return 'text-rose-600 dark:text-rose-300';
    return 'text-slate-700 dark:text-slate-200';
  }, [focus]);

  const addTimelineEvent = (event: TimelineEvent) => {
    setTimeline((current) => {
      if (current[0]?.label === event.label) return current;
      return [event, ...current].slice(0, 6);
    });
  };

  const cleanupLiveResources = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.close();
      wsRef.current = null;
    }

    if (audioIntervalRef.current) {
      window.clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }

    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startAudioMonitoring = (stream: MediaStream) => {
    const audioTracks = stream.getAudioTracks();
    if (!audioTracks.length) {
      setMicStatus('Microphone unavailable');
      setSpeakingStatus('Audio not granted');
      setVolumeLevel(0);
      return;
    }

    setMicStatus(audioTracks[0].enabled ? 'Microphone active' : 'Microphone muted');

    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        setSpeakingStatus('Audio analysis unavailable');
        return;
      }

      const audioContext = new AudioContextClass();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      audioContextRef.current = audioContext;
      const data = new Uint8Array(analyser.frequencyBinCount);

      audioIntervalRef.current = window.setInterval(() => {
        analyser.getByteFrequencyData(data);
        const average = data.reduce((sum, value) => sum + value, 0) / Math.max(data.length, 1);
        const level = Math.min(100, Math.round((average / 128) * 100));
        setVolumeLevel(level);
        setSpeakingStatus(level > 12 ? 'Speaking detected' : 'Silence detected');
        setSilenceSeconds((current) => (level > 12 ? 0 : current + 1));
        setCommunicationConfidence(Math.min(98, Math.max(35, level > 12 ? 72 + Math.round(level / 4) : 48)));
      }, 1000);
    } catch (error) {
      console.warn('Audio monitoring unavailable.', error);
      setSpeakingStatus('Audio analysis unavailable');
    }
  };
  const startFrameSender = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      const video = videoRef.current;
      const socket = wsRef.current;

      if (!video || !socket || socket.readyState !== WebSocket.OPEN) return;
      if (!video.videoWidth || !video.videoHeight) return;

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      socket.send(canvas.toDataURL('image/jpeg', 0.75));
    }, 350);
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabWarningRef.current = true;
        setFocus('Possible distraction detected');
        setSuspiciousCount((count) => count + 1);
        addTimelineEvent({ label: 'Tab switch detected', detail: 'Candidate left the interview window.', tone: 'rose' });
        return;
      }

      if (tabWarningRef.current) {
        tabWarningRef.current = false;
        setFocus('Looking at camera');
        addTimelineEvent({ label: 'Window focus restored', detail: 'Candidate returned to the interview room.', tone: 'amber' });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (!interviewStarted) return;

    const timer = window.setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [interviewStarted]);

  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!interviewStarted || !video || !stream) return;

    video.srcObject = stream;
    video.muted = true;
    video.play().catch((error) => {
      console.warn('Camera preview could not autoplay.', error);
      addTimelineEvent({ label: 'Camera preview paused', detail: 'Click inside the page or restart the interview if the preview stays blank.', tone: 'amber' });
    });
  }, [interviewStarted]);

  useEffect(() => cleanupLiveResources, []);

  const startInterview = async () => {
    cleanupLiveResources();
    sessionActiveRef.current = false;
    setAnalysisVisible(false);
    setInterviewStarted(false);
    setElapsedSeconds(0);
    setEmotion('Neutral');
    setFocus('Looking at camera');
    setSuspiciousCount(0);
    setConnectionStatus('camera-starting');
    setTimeline([{ label: 'Camera requested', detail: 'Waiting for browser permission.', tone: 'indigo' }]);

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: true,
        });
      } catch (mediaError) {
        console.warn('Camera with microphone failed, retrying video only.', mediaError);
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: false,
        });
        setMicStatus('Microphone permission blocked');
        setSpeakingStatus('Audio not granted');
        addTimelineEvent({ label: 'Microphone unavailable', detail: 'Camera started with video-only monitoring.', tone: 'amber' });
      }

      streamRef.current = stream;
      startAudioMonitoring(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setInterviewStarted(true);
      sessionActiveRef.current = true;
      setConnectionStatus('connecting');
      addTimelineEvent({ label: 'Camera online', detail: 'Video stream is active and ready.', tone: 'emerald' });

      const socket = new WebSocket(WS_URL);
      wsRef.current = socket;

      socket.onopen = () => {
        setConnectionStatus('live');
        startFrameSender();
        addTimelineEvent({ label: 'AI analysis connected', detail: 'Backend is receiving camera frames.', tone: 'emerald' });
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.emotion) setEmotion(data.emotion);
          if (data.focus_status) setFocus(data.focus_status);
          if (data.suspicious_count !== undefined) {
            const backendCount = Number(data.suspicious_count) || 0;
            setSuspiciousCount((currentCount) => Math.max(currentCount, backendCount));
          }

          if (data.focus_status && data.focus_status !== 'Looking at camera') {
            addTimelineEvent({ label: data.focus_status, detail: 'Focus signal updated by live monitoring.', tone: 'amber' });
          }
        } catch {
          addTimelineEvent({ label: 'Analysis packet skipped', detail: 'Received an unreadable monitoring response.', tone: 'amber' });
        }
      };

      socket.onerror = () => {
        setConnectionStatus('offline');
        addTimelineEvent({ label: 'AI analysis offline', detail: `Could not connect to ${WS_URL}. Start the backend to restore live emotion and gaze analysis.`, tone: 'rose' });
      };

      socket.onclose = () => {
        if (sessionActiveRef.current) {
          setConnectionStatus('offline');
          addTimelineEvent({ label: 'AI channel closed', detail: 'Camera remains available, but live backend analysis stopped.', tone: 'amber' });
        }
      };
    } catch (error) {
      console.error('Error starting interview:', error);
      cleanupLiveResources();
      sessionActiveRef.current = false;
      setInterviewStarted(false);
      setAnalysisVisible(false);
      setConnectionStatus('idle');
      addTimelineEvent({ label: 'Camera blocked', detail: 'Please allow camera permission and try again.', tone: 'rose' });
      alert('Failed to start the interview. Please allow camera and microphone permissions.');
    }
  };

  const stopInterview = () => {
    sessionActiveRef.current = false;
    cleanupLiveResources();
    setInterviewStarted(false);
    setAnalysisVisible(true);
    setConnectionStatus('ended');
    addTimelineEvent({ label: 'Interview ended', detail: 'Final monitoring summary generated.', tone: 'slate' });
  };

  const elapsedTime = `${Math.floor(elapsedSeconds / 60).toString().padStart(2, '0')}:${(elapsedSeconds % 60).toString().padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto flex w-full max-w-[1450px] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        {!interviewStarted && !analysisVisible && (
          <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400" />
            <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="p-6 sm:p-10">
                <div className="inline-flex animate-[fadeInUp_0.5s_ease-out] items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Interview readiness
                </div>
                <h1 className="mt-5 max-w-3xl animate-[fadeInUp_0.6s_ease-out] text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                  Start a monitored interview with live emotion and focus analysis.
                </h1>
                <p className="mt-4 max-w-2xl animate-[fadeInUp_0.7s_ease-out] text-sm font-medium leading-7 text-slate-600 dark:text-slate-400">
                  Navin's AI checks camera readiness, connects the AI monitoring channel, and then tracks emotion, gaze direction, and suspicious activity during the session.
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  {[
                    { icon: Camera, label: 'Camera', text: 'Face clearly visible' },
                    { icon: Eye, label: 'Focus', text: 'Avoid looking away' },
                    { icon: ShieldCheck, label: 'Integrity', text: 'Tab switches are flagged' },
                  ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="animate-[fadeInUp_0.8s_ease-out] rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40" style={{ animationDelay: `${index * 70}ms` }}>
                        <Icon className="h-5 w-5 text-indigo-500" />
                        <p className="mt-3 text-xs font-black text-slate-900 dark:text-white">{item.label}</p>
                        <p className="mt-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">{item.text}</p>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={startInterview}
                  className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-700"
                >
                  <Play className="h-4 w-4" />
                  Start Live Interview
                </button>
              </div>

              <div className="border-t border-slate-200 bg-slate-950 p-5 text-white dark:border-slate-800 lg:border-l lg:border-t-0">
                <div className="relative min-h-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
                  <div className="absolute right-8 top-8 h-28 w-28 animate-pulse rounded-full border border-cyan-300/30" />
                  <div className="absolute right-16 top-16 h-14 w-14 animate-ping rounded-full bg-cyan-300/10" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Startup system</p>
                        <h2 className="mt-2 text-xl font-black">Live room launch</h2>
                      </div>
                      <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[10px] font-black text-emerald-300">Ready</span>
                    </div>

                    <div className="mt-8 space-y-3">
                      {[
                        ['01', 'Camera permission', 'Browser asks for video access'],
                        ['02', 'AI WebSocket', 'Frames stream to backend analysis'],
                        ['03', 'Live signals', 'Emotion, gaze and flags update'],
                        ['04', 'Final summary', 'Session report remains visible'],
                      ].map(([step, label, detail]) => (
                        <div key={step} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-3">
                          <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-400/15 text-xs font-black text-indigo-200">{step}</div>
                          <div>
                            <p className="text-xs font-black">{label}</p>
                            <p className="text-[11px] text-slate-400">{detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {interviewStarted && !analysisVisible && (
          <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 shadow-xl dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
                    <Video className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black">Live Interview Room</p>
                    <p className="text-[11px] font-semibold text-slate-400">{statusCopy.detail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black text-slate-200">
                    <Clock className="h-3.5 w-3.5" />
                    {elapsedTime}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black ${connectionStatus === 'live' ? 'bg-emerald-400/15 text-emerald-300' : 'bg-amber-400/15 text-amber-300'}`}>
                    {connectionStatus === 'live' ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
                    {statusCopy.label}
                  </span>
                </div>
              </div>

              <div className="relative aspect-video bg-black">
                <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
                <div className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur">
                  Candidate camera
                </div>
                <div className="absolute bottom-4 left-4 right-4 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-2xl bg-black/45 p-3 text-white backdrop-blur">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-300">Emotion</p>
                    <p className="mt-1 text-sm font-black capitalize text-cyan-200">{emotion}</p>
                  </div>
                  <div className="rounded-2xl bg-black/45 p-3 text-white backdrop-blur">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-300">Focus</p>
                    <p className={`mt-1 text-sm font-black ${focusTone}`}>{focus}</p>
                  </div>
                  <div className="rounded-2xl bg-black/45 p-3 text-white backdrop-blur">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-300">Suspicious</p>
                    <p className="mt-1 text-sm font-black text-rose-200">{suspiciousCount} events</p>
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-5">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-300">Live analysis</p>
                    <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">Monitoring signals</h2>
                  </div>
                  <Activity className="h-5 w-5 text-indigo-500" />
                </div>

                <div className="mt-5 grid gap-3">
                  <SignalCard icon={Sparkles} label="Current emotion" value={emotion} tone="text-cyan-600 dark:text-cyan-300" />
                  <SignalCard icon={Eye} label="Focus status" value={focus} tone={focusTone} />
                  <SignalCard icon={AlertTriangle} label="Suspicious activities" value={String(suspiciousCount)} tone="text-rose-600 dark:text-rose-300" />
                  <SignalCard icon={Mic} label="Microphone status" value={micStatus} tone="text-emerald-600 dark:text-emerald-300" />
                  <SignalCard icon={Volume2} label="Speaking activity" value={`${speakingStatus} (${volumeLevel}%)`} tone="text-blue-600 dark:text-blue-300" />
                  <SignalCard icon={Activity} label="Overall interview score" value={`${overallInterviewScore}%`} tone="text-indigo-600 dark:text-indigo-300" />
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-indigo-500" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Event timeline</h3>
                </div>
                <div className="mt-4 space-y-2">
                  {timeline.map((item, index) => (
                    <div key={`${item.label}-${index}`} className={`rounded-2xl border p-3 ${toneStyles[item.tone]}`}>
                      <p className="text-xs font-black">{item.label}</p>
                      <p className="mt-1 text-[11px] font-semibold opacity-80">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[Mic, Camera, Monitor].map((Icon, index) => (
                  <button key={index} className="flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>

              <button onClick={stopInterview} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700">
                <StopCircle className="h-4 w-4" />
                Stop Interview
              </button>
            </aside>
          </section>
        )}

        {analysisVisible && !interviewStarted && (
          <section className="mx-auto w-full max-w-5xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h1 className="mt-4 text-3xl font-black text-slate-950 dark:text-white">Interview Session Ended</h1>
              <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">Final monitoring summary from the live session.</p>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-4">
              <SummaryCard label="Final emotion" value={emotion} icon={Sparkles} tone="text-cyan-600 dark:text-cyan-300" />
              <SummaryCard label="Final focus status" value={focus} icon={Eye} tone={focusTone} />
              <SummaryCard label="Suspicious activities" value={String(suspiciousCount)} icon={AlertTriangle} tone="text-rose-600 dark:text-rose-300" />
              <SummaryCard label="Communication confidence" value={`${communicationConfidence}%`} icon={Mic} tone="text-blue-600 dark:text-blue-300" />
            </div>

            <div className="mt-8 flex justify-center">
              <button onClick={startInterview} className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-black text-white transition hover:bg-indigo-700">
                <Play className="h-4 w-4" />
                Start New Interview
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

const SignalCard = ({ icon: Icon, label, value, tone }: { icon: typeof Activity; label: string; value: string; tone: string }) => (
  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
    <p className={`mt-2 text-lg font-black capitalize ${tone}`}>{value}</p>
  </div>
);

const SummaryCard = ({ icon: Icon, label, value, tone }: { icon: typeof Activity; label: string; value: string; tone: string }) => (
  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
    <Icon className={`h-5 w-5 ${tone}`} />
    <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
    <p className={`mt-2 text-xl font-black capitalize ${tone}`}>{value}</p>
  </div>
);

export default InterviewPage;
