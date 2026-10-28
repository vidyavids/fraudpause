import { useEffect, useRef, useState } from 'react';
import {
  FALLBACK_LINE,
  checkTranscribeAvailable,
  requestVerdict,
  transcribeAudio,
  type VerdictResult,
} from '../lib/api';
import {
  blobToBase64,
  blobToWav24kMono,
  getSpeechRecognitionCtor,
  speakText,
  type BrowserSpeechRecognition,
} from '../lib/voice';
import {
  QR_SAFETY_LINE,
  SHORTENER_BANNER,
  SHORTENER_FLAG,
  applyQrCeiling,
  buildQrMessage,
  decodeCanvas,
  decodeQrFromFile,
  drawQrHighlight,
  fileToScreeningDataUrl,
  isShortenedUrl,
  qrSayLines,
  splitQrDoNow,
  splitQrFlags,
} from '../lib/qr';
import {
  OUTCOME_STEP,
  OUTCOME_TEXT,
  PAYMENT_METHODS,
  buildPaymentMessage,
  outcomeForVerdict,
  paymentNormals,
  type PayeeFamiliarity,
  type PaymentForm,
  type PaymentMethod,
  type PaymentOutcome,
} from '../lib/payment';
import { mergeCautions, splitCautions } from '../lib/cautions';

const AFTERMATH_CHECKLIST = [
  'Call your bank NOW using the number on your card — ask to freeze, recall, or dispute the payment.',
  'Freeze or lock your card in the banking app if that option exists.',
  'Change passwords for your bank and email; turn on two-factor authentication.',
  'Report the scam to your bank fraud team and keep a reference number.',
  'File a police report — bring screenshots, numbers, and receipts.',
  'Watch statements daily for the next weeks; dispute anything unknown.',
  'Warn the person or company that was impersonated, if you can reach them safely.',
];

const verdictStyles: Record<string, string> = {
  'Likely scam': 'bg-red-700 text-white',
  'Suspicious — slow down': 'bg-amber-500 text-slate-950',
  'Looks consistent with legitimate': 'bg-emerald-700 text-white',
};

function ReportItRow() {
  return (
    <p className="mt-3 text-sm">
      <span className="font-bold">Report it: </span>
      <a
        href="https://reportfraud.ftc.gov"
        target="_blank"
        rel="noreferrer"
        className="underline"
      >
        reportfraud.ftc.gov
      </a>
      {' · '}
      <a href="https://www.ic3.gov" target="_blank" rel="noreferrer" className="underline">
        ic3.gov
      </a>
      {' · '}
      your bank&apos;s fraud line — the number on your card
    </p>
  );
}

function VerdictCard({
  result,
  greenBadgeText,
  safetyLine,
}: {
  result: VerdictResult;
  greenBadgeText?: string;
  safetyLine?: string;
}) {
  const badge =
    result.verdict === 'Looks consistent with legitimate' && greenBadgeText
      ? greenBadgeText
      : result.verdict;
  const { indicators, cautions: derived } = splitCautions(result.redFlags);
  const cautions = mergeCautions(result.cautions, derived);
  return (
    <section aria-label="Verdict" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <span
        className={`inline-block rounded-full px-3 py-1 text-sm font-bold ${verdictStyles[result.verdict]}`}
      >
        {badge}
      </span>
      {safetyLine && <p className="mt-2 text-sm font-semibold">{safetyLine}</p>}
      {result.mock && result.note && (
        <p className="mt-2 text-xs text-slate-500">{result.note}</p>
      )}

      <h3 className="mt-3 text-sm font-bold">Red flags</h3>
      {indicators.length > 0 ? (
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
          {indicators.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-sm text-slate-600">None.</p>
      )}

      {cautions.length > 0 && (
        <>
          <h3 className="mt-3 text-sm font-bold">Cautions</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
            {cautions.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </>
      )}

      <h3 className="mt-3 text-sm font-bold">What to do now</h3>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
        {result.whatToDo.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>

      <h3 className="mt-3 text-sm font-bold">What to say</h3>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
        {result.whatToSay.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>

      {typeof window !== 'undefined' && 'speechSynthesis' in window && (
        <button
          type="button"
          onClick={() =>
            speakText(`${badge}. ${result.whatToDo[0] ?? ''}`)
          }
          className="mt-3 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold"
        >
          Hear this verdict
        </button>
      )}

      {result.whatToDo[0] && (
        <p className="mt-3 text-sm">
          <span className="font-bold">Your next step: </span>
          {result.whatToDo[0]}
        </p>
      )}

      {result.verdict !== 'Looks consistent with legitimate' && <ReportItRow />}

      <p className="mt-3 text-xs text-slate-500">
        This is guidance, not a guarantee — verify through official channels.
      </p>
    </section>
  );
}

function MicIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function MicButton({
  label,
  state,
  onPress,
  onRelease,
}: {
  label: string;
  state: 'idle' | 'active' | 'busy';
  onPress: () => void;
  onRelease: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={state === 'busy'}
      onPointerDown={(e) => {
        e.preventDefault();
        onPress();
      }}
      onPointerUp={onRelease}
      onPointerLeave={onRelease}
      onPointerCancel={onRelease}
      onKeyDown={(e) => {
        if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
          e.preventDefault();
          onPress();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onRelease();
        }
      }}
      onContextMenu={(e) => e.preventDefault()}
      className={`flex touch-none select-none items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold shadow-sm disabled:opacity-60 ${
        state === 'active' ? 'bg-red-700 text-white' : 'bg-slate-100 text-slate-700'
      }`}
    >
      <MicIcon />
      {state === 'active'
        ? 'Listening… release to send'
        : state === 'busy'
          ? 'Transcribing…'
          : 'Hold to talk'}
    </button>
  );
}

const outcomeStyles: Record<PaymentOutcome, string> = {
  STOP: 'bg-red-700 text-white',
  PAUSE: 'bg-amber-500 text-slate-950',
  PROCEED: 'bg-emerald-700 text-white',
};

function PaymentVerdictCard({
  result,
  outcome,
  normals,
}: {
  result: VerdictResult;
  outcome: PaymentOutcome;
  normals: string[];
}) {
  const { indicators: flags, cautions: derived } = splitCautions(result.redFlags);
  const cautions = mergeCautions(result.cautions, derived);
  return (
    <section aria-label="Payment verdict" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-block rounded-full px-3 py-1 text-sm font-bold ${outcomeStyles[outcome]}`}
        >
          {OUTCOME_TEXT[outcome].title}
        </span>
        <span className="text-sm font-semibold">{OUTCOME_TEXT[outcome].detail}</span>
      </div>
      {result.mock && result.note && (
        <p className="mt-2 text-xs text-slate-500">{result.note}</p>
      )}

      <h3 className="mt-3 text-sm font-bold">Red flags</h3>
      {flags.length > 0 ? (
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
          {flags.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-sm text-slate-600">None.</p>
      )}

      {cautions.length > 0 && (
        <>
          <h3 className="mt-3 text-sm font-bold">Cautions</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
            {cautions.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </>
      )}

      <h3 className="mt-3 text-sm font-bold">Checked and found normal</h3>
      {normals.length > 0 ? (
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
          {normals.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-sm text-slate-600">None.</p>
      )}

      <h3 className="mt-3 text-sm font-bold">What to do now</h3>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
        {result.whatToDo.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>

      <h3 className="mt-3 text-sm font-bold">What to say</h3>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
        {result.whatToSay.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>

      {typeof window !== 'undefined' && 'speechSynthesis' in window && (
        <button
          type="button"
          onClick={() =>
            speakText(`${OUTCOME_TEXT[outcome].title}. ${OUTCOME_STEP[outcome]}`)
          }
          className="mt-3 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold"
        >
          Hear this verdict
        </button>
      )}

      <p className="mt-3 text-sm">
        <span className="font-bold">Your next step: </span>
        {OUTCOME_STEP[outcome]}
      </p>

      {outcome !== 'PROCEED' && <ReportItRow />}

      <p className="mt-3 text-xs text-slate-500">
        This is guidance, not a guarantee — verify through official channels.
      </p>
    </section>
  );
}

function QrVerdictCard({
  result,
  decodedUrl,
}: {
  result: VerdictResult;
  decodedUrl: string;
}) {
  const isGreen = result.verdict === 'Looks consistent with legitimate';
  const badge = isGreen ? 'No red flags found' : result.verdict;
  const {
    concerns,
    appearanceNotes: flagNotes,
    cautions: derived,
  } = splitQrFlags(result.redFlags);
  const cautions = mergeCautions(result.cautions, derived);
  const { actions, appearanceNotes: doNotes } = splitQrDoNow(result.whatToDo);
  const appearanceNotes = [...flagNotes, ...doNotes];
  const shortened = isShortenedUrl(decodedUrl);
  const flags =
    shortened && !concerns.some((f) => /shorten|redirect|final destination/i.test(f))
      ? [SHORTENER_FLAG, ...concerns]
      : concerns;
  const sayLines = qrSayLines(result.whatToSay, decodedUrl);
  return (
    <section aria-label="QR verdict" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <span
        className={`inline-block rounded-full px-3 py-1 text-sm font-bold ${verdictStyles[result.verdict]}`}
      >
        {badge}
      </span>
      {isGreen && <p className="mt-2 text-sm font-semibold">{QR_SAFETY_LINE}</p>}
      {result.mock && result.note && (
        <p className="mt-2 text-xs text-slate-500">{result.note}</p>
      )}

      <h3 className="mt-3 text-sm font-bold">Red flags</h3>
      {flags.length > 0 ? (
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
          {flags.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-sm text-slate-600">None.</p>
      )}

      {cautions.length > 0 && (
        <>
          <h3 className="mt-3 text-sm font-bold">Cautions</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
            {cautions.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </>
      )}

      {appearanceNotes.length > 0 && (
        <>
          <h3 className="mt-3 text-sm font-bold">Checked and found normal</h3>
          <h4 className="mt-2 text-sm font-semibold">
            Sticker appearance (visual check only — can&apos;t confirm authenticity)
          </h4>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
            {appearanceNotes.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </>
      )}

      <h3 className="mt-3 text-sm font-bold">What to do now</h3>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
        {actions.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>

      <h3 className="mt-3 text-sm font-bold">What to say</h3>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
        {sayLines.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>

      {typeof window !== 'undefined' && 'speechSynthesis' in window && (
        <button
          type="button"
          onClick={() => speakText(`${badge}. ${result.whatToDo[0] ?? ''}`)}
          className="mt-3 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold"
        >
          Hear this verdict
        </button>
      )}

      {result.whatToDo[0] && (
        <p className="mt-3 text-sm">
          <span className="font-bold">Your next step: </span>
          {result.whatToDo[0]}
        </p>
      )}

      {result.verdict !== 'Looks consistent with legitimate' && <ReportItRow />}

      <p className="mt-3 text-xs text-slate-500">
        This is guidance, not a guarantee — verify through official channels.
      </p>
    </section>
  );
}

function PrivacyLine({ text }: { text: string }) {
  return (
    <p className="rounded-lg bg-slate-100 px-3 py-2 text-center text-xs font-medium text-slate-700">
      {text}
    </p>
  );
}

function PrivacyMessages() {
  return (
    <PrivacyLine text="We don't keep your messages in our database. Our AI provider processes them to produce your result." />
  );
}

function PrivacyPhoto() {
  return (
    <PrivacyLine text="Your photo is processed in-session to produce this check and is not kept in our database. FraudPause never uses it for training." />
  );
}

type InputMode = 'standard' | 'whatsapp' | 'sms' | 'qr' | 'payment';

interface SampleSms {
  id: string;
  sender: string;
  time: string;
  body: string;
}

// Simulation only — sample messages, not the user's real inbox.
const SAMPLE_SMS: SampleSms[] = [
  {
    id: 'sms-delivery-fee',
    sender: 'POSTAL-SERVICE',
    time: '9:41 AM',
    body: 'POSTAL-SERVICE: URGENT — your parcel is held. Pay the $2.30 delivery fee now to release it: post-fee.top/pay',
  },
  {
    id: 'sms-prize-claim',
    sender: 'PRIZE-INFO',
    time: '8:15 AM',
    body: "PRIZE-INFO: Congratulations! You've been selected in our $500 gift draw. To claim, reply with your full account number.",
  },
  {
    id: 'sms-unrequested-otp',
    sender: 'BANK-ALERT',
    time: 'Yesterday',
    body: "BANK-ALERT: Your one-time passcode is 441902. If you didn't request this, call the number on your card.",
  },
  {
    id: 'sms-branch-reminder',
    sender: 'MAIN ST BRANCH',
    time: 'Yesterday',
    body: 'MAIN ST BRANCH: Reminder — your appointment is tomorrow at 10:30 AM. Reply YES to confirm or call to reschedule.',
  },
  {
    id: 'sms-pharmacy',
    sender: 'PHARMACY',
    time: 'Monday',
    body: 'PHARMACY: Your prescription is ready for pickup. Open Mon–Sat 9–6.',
  },
];

function smsBadge(verdict: VerdictResult['verdict']): { text: string; classes: string } {
  if (verdict === 'Likely scam') return { text: 'Likely scam', classes: 'bg-red-700 text-white' };
  if (verdict === 'Suspicious — slow down')
    return { text: 'Suspicious', classes: 'bg-amber-500 text-slate-950' };
  return { text: 'No red flags found', classes: 'bg-emerald-700 text-white' };
}

export default function Door1() {
  const [mode, setMode] = useState<InputMode>('standard');
  const [messageText, setMessageText] = useState('');
  const [callDescription, setCallDescription] = useState('');
  const [screenshotName, setScreenshotName] = useState<string | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerdictResult | null>(null);
  const [alreadySent, setAlreadySent] = useState(false);

  const [waText, setWaText] = useState('');
  const [waSent, setWaSent] = useState<string | null>(null);
  const [waLoading, setWaLoading] = useState(false);
  const [waError, setWaError] = useState<string | null>(null);
  const [waResult, setWaResult] = useState<VerdictResult | null>(null);

  // SMS simulation: undefined = still screening, null = screening failed.
  const [smsVerdicts, setSmsVerdicts] = useState<
    Record<string, VerdictResult | null | undefined>
  >({});
  const [selectedSmsId, setSelectedSmsId] = useState<string | null>(null);

  const [qrFileName, setQrFileName] = useState<string | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [qrDecoded, setQrDecoded] = useState<string | null>(null);
  const [qrDecoding, setQrDecoding] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [qrResult, setQrResult] = useState<VerdictResult | null>(null);
  const [qrCheckedUrl, setQrCheckedUrl] = useState<string | null>(null);
  // Downscaled upload photo for the vision tamper check:
  // undefined = preparing, null = unavailable (check runs text-only).
  const [qrScreeningImage, setQrScreeningImage] = useState<string | null | undefined>(undefined);

  const [qrSource, setQrSource] = useState<'upload' | 'camera'>('upload');
  const [camOn, setCamOn] = useState(false);
  const [camDecoded, setCamDecoded] = useState<string | null>(null);
  const [camFrame, setCamFrame] = useState<string | null>(null);
  const [camDisplay, setCamDisplay] = useState<string | null>(null);
  const [camError, setCamError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scanCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef(0);

  type VoiceTarget = 'message' | 'call';
  const [voiceTarget, setVoiceTarget] = useState<VoiceTarget | null>(null);
  const [voiceBusy, setVoiceBusy] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const pressedRef = useRef<VoiceTarget | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const voiceStreamRef = useRef<MediaStream | null>(null);
  const recogRef = useRef<BrowserSpeechRecognition | null>(null);
  const availRef = useRef<boolean | null>(null);
  const preferBrowserRef = useRef(false);
  const maxTimerRef = useRef(0);

  const [payPayee, setPayPayee] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Bank transfer / wire');
  const [payFamiliarity, setPayFamiliarity] = useState<PayeeFamiliarity | null>(null);
  const [payContext, setPayContext] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [payResult, setPayResult] = useState<{
    result: VerdictResult;
    outcome: PaymentOutcome;
    normals: string[];
  } | null>(null);

  // Screen every sample message on arrival — automatically, before the user
  // opens the inbox — through the same verdict engine as the other modes.
  useEffect(() => {
    let cancelled = false;
    for (const m of SAMPLE_SMS) {
      requestVerdict({
        messageText: m.body,
        callDescription: '',
        hasScreenshot: false,
      })
        .then((v) => {
          if (!cancelled) setSmsVerdicts((prev) => ({ ...prev, [m.id]: v }));
        })
        .catch(() => {
          if (!cancelled) setSmsVerdicts((prev) => ({ ...prev, [m.id]: null }));
        });
    }
    return () => {
      cancelled = true;
    };
  }, []);

  // Release the camera whenever the user leaves the camera pane or Door 1.
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setCamOn(false);
    };
  }, [mode, qrSource]);

  // Stop any voice capture if Door 1 unmounts mid-press.
  useEffect(() => {
    return () => {
      try {
        recogRef.current?.abort();
      } catch {
        /* noop */
      }
      recogRef.current = null;
      voiceStreamRef.current?.getTracks().forEach((t) => t.stop());
      voiceStreamRef.current = null;
      window.clearTimeout(maxTimerRef.current);
    };
  }, []);

  const hasInput =
    messageText.trim().length > 0 ||
    callDescription.trim().length > 0 ||
    screenshotName !== null;

  function onFileChange(file: File | undefined) {
    if (!file) {
      setScreenshotName(null);
      setScreenshotPreview(null);
      return;
    }
    setScreenshotName(file.name);
    // Local preview only — nothing is uploaded or stored.
    const url = URL.createObjectURL(file);
    setScreenshotPreview(url);
  }

  function fillTranscript(target: VoiceTarget, text: string) {
    if (target === 'message') {
      setMessageText((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text));
    } else {
      setCallDescription((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text));
    }
  }

  function stopVoiceTracks() {
    voiceStreamRef.current?.getTracks().forEach((t) => t.stop());
    voiceStreamRef.current = null;
  }

  function resetVoicePress() {
    window.clearTimeout(maxTimerRef.current);
    pressedRef.current = null;
    setVoiceTarget(null);
  }

  function startBrowserVoice(target: VoiceTarget) {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setVoiceError('Voice input is not available in this browser — please type instead.');
      resetVoicePress();
      return;
    }
    try {
      const recog = new Ctor();
      recog.interimResults = false;
      recog.maxAlternatives = 1;
      recog.onresult = (event: any) => {
        const text: string = event?.results?.[0]?.[0]?.transcript ?? '';
        if (text.trim()) fillTranscript(target, text.trim());
      };
      recog.onerror = () => {
        setVoiceError('Could not hear that — please try again or type instead.');
      };
      recog.onend = () => {
        recogRef.current = null;
      };
      recogRef.current = recog;
      recog.start();
      maxTimerRef.current = window.setTimeout(() => endVoicePress(), 30000);
    } catch {
      setVoiceError('Voice input is not available in this browser — please type instead.');
      resetVoicePress();
    }
  }

  async function startRecordingVoice(target: VoiceTarget) {
    try {
      if (
        typeof MediaRecorder === 'undefined' ||
        !navigator.mediaDevices?.getUserMedia
      ) {
        throw new Error('no recorder');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (pressedRef.current !== target) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      voiceStreamRef.current = stream;
      chunksRef.current = [];
      const mimeType =
        typeof MediaRecorder.isTypeSupported === 'function' &&
        MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : '';
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.start();
      maxTimerRef.current = window.setTimeout(() => endVoicePress(), 30000);
    } catch {
      // Recording unavailable (denied or unsupported) — try browser recognition
      // while the user is still holding.
      startBrowserVoice(target);
    }
  }

  async function onVoicePress(target: VoiceTarget) {
    if (pressedRef.current !== null || voiceBusy) return;
    pressedRef.current = target;
    setVoiceTarget(target);
    setVoiceError(null);
    if (preferBrowserRef.current) {
      startBrowserVoice(target);
      return;
    }
    if (availRef.current === null) {
      try {
        availRef.current = await checkTranscribeAvailable();
      } catch {
        availRef.current = false;
      }
      if (pressedRef.current !== target) return;
    }
    if (availRef.current) startRecordingVoice(target);
    else startBrowserVoice(target);
  }

  function endVoicePress() {
    const target = pressedRef.current;
    if (!target || voiceBusy) return;
    window.clearTimeout(maxTimerRef.current);
    pressedRef.current = null;
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      // Keep voiceTarget set so the busy indicator stays on this button.
      setVoiceBusy(true);
      recorder.onstop = () => {
        recorderRef.current = null;
        stopVoiceTracks();
        const blob = new Blob(chunksRef.current);
        chunksRef.current = [];
        void transcribeRecording(target, blob);
      };
      recorder.stop();
      return;
    }
    setVoiceTarget(null);
    const recog = recogRef.current;
    if (recog) {
      try {
        recog.stop();
      } catch {
        recogRef.current = null;
      }
    }
  }

  async function transcribeRecording(target: VoiceTarget, blob: Blob) {
    try {
      if (!blob.size) {
        setVoiceError('Nothing was recorded — please try again or type instead.');
        return;
      }
      const wav = await blobToWav24kMono(blob);
      if (!wav) throw new Error('convert failed');
      const base64 = await blobToBase64(wav);
      if (!base64) throw new Error('convert failed');
      const text = await transcribeAudio(base64);
      fillTranscript(target, text);
    } catch {
      preferBrowserRef.current = true;
      if (getSpeechRecognitionCtor()) {
        setVoiceError(
          'Server transcription failed — hold again to use browser recognition, or type instead.',
        );
      } else {
        setVoiceError('Voice transcription failed — please type instead.');
      }
    } finally {
      setVoiceBusy(false);
      setVoiceTarget(null);
    }
  }

  async function onCheck() {
    setError(null);
    setResult(null);
    if (!hasInput) {
      setError('Paste a message, describe the call, or attach a screenshot first.');
      return;
    }
    setLoading(true);
    try {
      const verdict = await requestVerdict({
        messageText: messageText.trim(),
        callDescription: callDescription.trim(),
        hasScreenshot: screenshotName !== null,
        screenshotName: screenshotName ?? undefined,
      });
      setResult(verdict);
    } catch {
      setError(`${FALLBACK_LINE} (The check failed — stay paused.)`);
    } finally {
      setLoading(false);
    }
  }

  async function onWaSend() {
    setWaError(null);
    setWaResult(null);
    const text = waText.trim();
    if (!text) {
      setWaError('Paste the WhatsApp message first.');
      return;
    }
    setWaSent(text);
    setWaLoading(true);
    try {
      // Same verdict engine as the other modes — no new backend.
      const verdict = await requestVerdict({
        messageText: text,
        callDescription: '',
        hasScreenshot: false,
      });
      setWaResult(verdict);
    } catch {
      setWaError(`${FALLBACK_LINE} (The check failed — stay paused.)`);
    } finally {
      setWaLoading(false);
    }
  }

  async function onQrFileChange(file: File | undefined) {
    setQrError(null);
    setQrResult(null);
    setQrCheckedUrl(null);
    setQrDecoded(null);
    setQrScreeningImage(undefined);
    if (!file) {
      setQrFileName(null);
      setQrPreview(null);
      return;
    }
    setQrFileName(file.name);
    // Downscaled copy for the vision tamper check, prepared alongside decode.
    fileToScreeningDataUrl(file).then((d) => setQrScreeningImage(d));
    setQrDecoding(true);
    try {
      const decoded = await decodeQrFromFile(file);
      if (!decoded) {
        setQrPreview(null);
        setQrError(
          "Couldn't find a QR code in this photo. Don't pay via this sticker — use the official app or the meter itself.",
        );
        return;
      }
      // Preview shows the decoded code highlighted.
      setQrPreview(decoded.previewDataUrl);
      setQrDecoded(decoded.text);
    } finally {
      setQrDecoding(false);
    }
  }

  async function onQrCheck() {
    setQrError(null);
    setQrResult(null);
    if (!qrDecoded) {
      setQrError('Upload a photo of the QR code first.');
      return;
    }
    setQrLoading(true);
    try {
      // Same verdict engine as the other modes — no new backend.
      const verdict = await requestVerdict({
        messageText: buildQrMessage(qrDecoded),
        callDescription: '',
        hasScreenshot: false,
        imageDataUrl: qrScreeningImage ?? undefined,
      });
      setQrResult(applyQrCeiling(verdict));
      setQrCheckedUrl(qrDecoded);
    } catch {
      setQrError(`${FALLBACK_LINE} (The check failed — stay paused.)`);
    } finally {
      setQrLoading(false);
    }
  }

  function stopCamera() {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCamOn(false);
  }

  function scanLoop() {
    const video = videoRef.current;
    const canvas = scanCanvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }
    const maxDim = 640;
    const scale = Math.min(1, maxDim / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const decoded = decodeCanvas(canvas);
      if (decoded) {
        setCamDecoded(decoded.text);
        // Clean frame for the tamper check first, then the highlighted display.
        let clean: string | null = null;
        try {
          clean = canvas.toDataURL('image/jpeg', 0.7);
        } catch {
          clean = null;
        }
        setCamFrame(clean);
        drawQrHighlight(canvas, decoded.location);
        try {
          setCamDisplay(canvas.toDataURL('image/jpeg', 0.7));
        } catch {
          setCamDisplay(clean);
        }
        stopCamera();
        return;
      }
    }
    rafRef.current = requestAnimationFrame(scanLoop);
  }

  async function startCamera() {
    setCamError(null);
    setCamDecoded(null);
    setCamFrame(null);
    setCamDisplay(null);
    setQrResult(null);
    setQrCheckedUrl(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCamError('This browser cannot access the camera. Use photo upload instead.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) {
        stopCamera();
        return;
      }
      video.srcObject = stream;
      await video.play();
      setCamOn(true);
      scanLoop();
    } catch {
      setCamError('Camera unavailable or permission denied. Use photo upload instead.');
      stopCamera();
    }
  }

  async function onPaymentCheck() {
    setPayError(null);
    setPayResult(null);
    const payee = payPayee.trim();
    const amount = Number(payAmount);
    if (!payee) {
      setPayError('Enter the payee name first.');
      return;
    }
    if (!payAmount.trim() || !isFinite(amount) || amount <= 0) {
      setPayError('Enter a valid amount in USD (more than 0).');
      return;
    }
    if (!payFamiliarity) {
      setPayError('Tell us whether this payee is new, changed, or known.');
      return;
    }
    const form: PaymentForm = {
      payee,
      amount,
      method: payMethod,
      familiarity: payFamiliarity,
      context: payContext,
    };
    setPayLoading(true);
    try {
      // Same verdict engine as the other modes — no new backend.
      const verdict = await requestVerdict({
        messageText: buildPaymentMessage(form),
        callDescription: '',
        hasScreenshot: false,
      });
      setPayResult({
        result: verdict,
        outcome: outcomeForVerdict(verdict.verdict),
        normals: paymentNormals(form),
      });
    } catch {
      setPayError(`${FALLBACK_LINE} (The check failed — stay paused.)`);
    } finally {
      setPayLoading(false);
    }
  }

  async function onCamCheck() {
    setCamError(null);
    setQrResult(null);
    if (!camDecoded) {
      setCamError('Point the camera at the QR code first.');
      return;
    }
    setQrLoading(true);
    try {
      // Same verdict engine as the other modes — no new backend.
      const verdict = await requestVerdict({
        messageText: buildQrMessage(camDecoded),
        callDescription: '',
        hasScreenshot: false,
        imageDataUrl: camFrame ?? undefined,
      });
      setQrResult(applyQrCeiling(verdict));
      setQrCheckedUrl(camDecoded);
    } catch {
      setCamError(`${FALLBACK_LINE} (The check failed — stay paused.)`);
    } finally {
      setQrLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Input mode" className="flex flex-wrap gap-2 text-sm">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'standard'}
          onClick={() => setMode('standard')}
          className={`rounded-full px-3 py-1 font-semibold ${
            mode === 'standard'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          Paste / screenshot / call
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'whatsapp'}
          onClick={() => setMode('whatsapp')}
          className={`rounded-full px-3 py-1 font-semibold ${
            mode === 'whatsapp'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          Forwarded from WhatsApp
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'sms'}
          onClick={() => setMode('sms')}
          className={`rounded-full px-3 py-1 font-semibold ${
            mode === 'sms'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          SMS screening
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'qr'}
          onClick={() => setMode('qr')}
          className={`rounded-full px-3 py-1 font-semibold ${
            mode === 'qr'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          QR-photo check
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'payment'}
          onClick={() => setMode('payment')}
          className={`rounded-full px-3 py-1 font-semibold ${
            mode === 'payment'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          Payment check
        </button>
      </div>

      {mode === 'standard' && (
        <>
          <p className="text-sm text-slate-600">
            Paste what you received or describe the call. You get a verdict, red
            flags, and exactly what to do and say.
          </p>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold">
              1. Paste the text or email
            </span>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={5}
              placeholder="Paste the full message here, including links and the sender name…"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base shadow-sm focus:border-teal-700 focus:outline-none"
            />
          </label>

          <div className="flex items-center gap-2">
            <MicButton
              label="Hold to dictate the message"
              state={
                voiceTarget === 'message'
                  ? voiceBusy
                    ? 'busy'
                    : 'active'
                  : 'idle'
              }
              onPress={() => onVoicePress('message')}
              onRelease={endVoicePress}
            />
            <p className="text-xs text-slate-500">
              Your voice is transcribed to produce this check and is not kept in
              our database.
            </p>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold">
              2. Upload a screenshot <span className="font-normal text-slate-500">(optional)</span>
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onFileChange(e.target.files?.[0])}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm"
            />
            {screenshotPreview && (
              <img
                src={screenshotPreview}
                alt="Screenshot preview"
                className="mt-2 max-h-48 rounded-lg border border-slate-200 object-contain"
              />
            )}
          </label>

          <p className="text-xs text-slate-500">
            Your photo is processed in-session to produce this check and is not
            kept in our database. FraudPause never uses it for training.
          </p>
          <p className="text-xs text-slate-500">
            Crop or blur account numbers, names, and addresses before uploading
            — only the message itself is needed.
          </p>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold">
              3. Describe the call <span className="font-normal text-slate-500">(optional)</span>
            </span>
            <textarea
              value={callDescription}
              onChange={(e) => setCallDescription(e.target.value)}
              rows={3}
              placeholder="Who called, what did they ask for, what pressure did you feel…"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base shadow-sm focus:border-teal-700 focus:outline-none"
            />
          </label>

          <div className="flex items-center gap-2">
            <MicButton
              label="Hold to dictate the call description"
              state={
                voiceTarget === 'call' ? (voiceBusy ? 'busy' : 'active') : 'idle'
              }
              onPress={() => onVoicePress('call')}
              onRelease={endVoicePress}
            />
          </div>

          {voiceError && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
              {voiceError}
            </p>
          )}

          <button
            type="button"
            onClick={onCheck}
            disabled={loading}
            className="w-full rounded-lg bg-teal-800 px-4 py-3 text-base font-semibold text-white shadow disabled:opacity-60"
          >
            {loading ? 'Checking…' : 'Check this now'}
          </button>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          )}

          {result && <VerdictCard result={result} />}

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <button
              type="button"
              onClick={() => setAlreadySent((v) => !v)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold"
              aria-expanded={alreadySent}
            >
              {alreadySent ? 'Hide the aftermath checklist' : 'I already sent it — what now?'}
            </button>
            {alreadySent && (
              <>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">
                  {AFTERMATH_CHECKLIST.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <ReportItRow />
              </>
            )}
          </div>

          <PrivacyMessages />
        </>
      )}

      {mode === 'whatsapp' && (
        <>
          <p className="text-sm text-slate-600">
            In the full shield, you&apos;d forward this to FraudPause on
            WhatsApp — here, paste it to see the same check.
          </p>

          <div aria-label="WhatsApp check thread" className="space-y-3 rounded-xl bg-slate-100 p-3">
            {waSent === null && !waLoading && !waError && !waResult && (
              <p className="px-1 py-2 text-center text-sm text-slate-500">
                Paste the message you received below and send it to FraudPause.
              </p>
            )}

            {waSent !== null && (
              <div className="flex justify-end">
                <p className="max-w-[85%] whitespace-pre-wrap rounded-xl rounded-br-sm bg-emerald-100 px-3 py-2 text-sm text-slate-900 shadow-sm">
                  {waSent}
                </p>
              </div>
            )}

            {waLoading && (
              <div className="flex justify-start">
                <p className="rounded-xl rounded-bl-sm bg-white px-3 py-2 text-sm text-slate-500 shadow-sm">
                  Checking…
                </p>
              </div>
            )}

            {waError && (
              <div className="flex justify-start">
                <p role="alert" className="max-w-[85%] rounded-xl rounded-bl-sm bg-red-50 px-3 py-2 text-sm text-red-800 shadow-sm">
                  {waError}
                </p>
              </div>
            )}

            {waResult && (
              <div className="flex justify-start">
                <div className="w-full max-w-[95%]">
                  <VerdictCard result={waResult} />
                </div>
              </div>
            )}
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold">
              Paste the WhatsApp message
            </span>
            <textarea
              value={waText}
              onChange={(e) => setWaText(e.target.value)}
              rows={4}
              placeholder="Paste the full message here, including links and the sender name…"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base shadow-sm focus:border-teal-700 focus:outline-none"
            />
          </label>

          <button
            type="button"
            onClick={onWaSend}
            disabled={waLoading}
            className="w-full rounded-lg bg-teal-800 px-4 py-3 text-base font-semibold text-white shadow disabled:opacity-60"
          >
            {waLoading ? 'Checking…' : 'Send to FraudPause'}
          </button>

          <PrivacyMessages />
        </>
      )}

      {mode === 'sms' && (
        <>
          <p className="text-sm text-slate-600">
            With your permission, FraudPause screens SMS as it arrives — flags
            appear automatically, no pasting needed. Automatic screening works
            on Android only; iPhones don&apos;t allow third-party apps to screen
            SMS, so iPhone users check messages by forwarding them or with the
            app check. Screened messages are not kept in our database; our AI
            provider processes them to produce your result. Here, tap a message
            to see its check.
          </p>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-3">
              <p className="text-sm font-bold">
                SIMULATION — sample inbox
              </p>
              <p className="text-xs text-slate-500">
                Sample messages for demonstration. This is not your real inbox.
              </p>
            </div>
            <ul aria-label="Sample SMS inbox" className="divide-y divide-slate-200">
              {SAMPLE_SMS.map((m) => {
                const v = smsVerdicts[m.id];
                const badge =
                  v === undefined
                    ? { text: 'Screening…', classes: 'bg-slate-200 text-slate-600' }
                    : v === null
                      ? { text: 'Not screened', classes: 'bg-slate-200 text-slate-600' }
                      : smsBadge(v.verdict);
                const selected = selectedSmsId === m.id;
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedSmsId(m.id)}
                      aria-label={`${m.sender}: ${badge.text}`}
                      className={`block w-full px-4 py-3 text-left ${
                        selected ? 'bg-teal-50' : ''
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-bold">{m.sender}</span>
                        <span className="flex shrink-0 items-center gap-2">
                          <span className="text-xs text-slate-500">{m.time}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-bold ${badge.classes}`}
                          >
                            {badge.text}
                          </span>
                        </span>
                      </span>
                      <span className="mt-1 line-clamp-2 block text-sm text-slate-600">
                        {m.body}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {selectedSmsId !== null &&
            smsVerdicts[selectedSmsId] !== undefined &&
            smsVerdicts[selectedSmsId] !== null && (
              <VerdictCard
                result={smsVerdicts[selectedSmsId] as VerdictResult}
                greenBadgeText="No red flags found"
                safetyLine="No red flags doesn't mean safe. Verify before paying."
              />
            )}
        </>
      )}

      {mode === 'qr' && (
        <>
          <p className="text-sm text-slate-600">
            A QR sticker can hide any link. FraudPause reads what it really
            points to before you pay.
          </p>
          <div role="tablist" aria-label="QR input" className="flex gap-2 text-sm">
            <button
              type="button"
              role="tab"
              aria-selected={qrSource === 'upload'}
              onClick={() => setQrSource('upload')}
              className={`rounded-full px-3 py-1 font-semibold ${
                qrSource === 'upload'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              Upload photo
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={qrSource === 'camera'}
              onClick={() => setQrSource('camera')}
              className={`rounded-full px-3 py-1 font-semibold ${
                qrSource === 'camera'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              Live camera
            </button>
          </div>

          {qrSource === 'upload' && (
            <>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">
                  1. Photograph the QR sticker
                </span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => onQrFileChange(e.target.files?.[0])}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm"
                />
                {qrPreview && (
                  <img
                    src={qrPreview}
                    alt="QR photo preview"
                    className="mt-2 max-h-48 rounded-lg border border-slate-200 object-contain"
                  />
                )}
              </label>

              {qrDecoding && (
                <p className="text-sm text-slate-500">Reading the QR code…</p>
              )}

              {qrDecoded && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="text-sm font-bold">This QR points to</h3>
                  <p className="mt-1 break-all font-mono text-sm">{qrDecoded}</p>
                  {isShortenedUrl(qrDecoded) && (
                    <p role="alert" className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
                      {SHORTENER_BANNER}
                    </p>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={onQrCheck}
                disabled={qrLoading || qrDecoding || !qrDecoded || qrScreeningImage === undefined}
                className="w-full rounded-lg bg-teal-800 px-4 py-3 text-base font-semibold text-white shadow disabled:opacity-60"
              >
                {qrLoading ? 'Checking…' : 'Check this link'}
              </button>

              {qrError && (
                <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
                  {qrError}
                </p>
              )}
            </>
          )}

          {qrSource === 'camera' && (
            <>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className={`w-full rounded-lg bg-slate-900 ${camOn ? '' : 'hidden'}`}
                />
                {camOn ? (
                  <>
                    <p className="mt-2 text-center text-sm text-slate-500">
                      Hold steady, about 10 cm away, in good light.
                    </p>
                    <p className="mt-1 text-center text-xs text-slate-500">
                      If it won&apos;t read: move closer or farther, avoid glare,
                      or upload a photo instead.
                    </p>
                  </>
                ) : (
                  <p className="py-2 text-center text-sm text-slate-500">
                    Hold steady, about 10 cm away, in good light.
                  </p>
                  <p className="text-center text-xs text-slate-500">
                    If it won&apos;t lock on, move closer or farther, avoid
                    glare, or use Upload photo instead.
                  </p>
                )}
                <canvas ref={scanCanvasRef} className="hidden" aria-hidden="true" />
              </div>

              {!camOn ? (
                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full rounded-lg bg-teal-800 px-4 py-3 text-base font-semibold text-white shadow disabled:opacity-60"
                >
                  Start camera
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-semibold shadow-sm"
                >
                  Stop camera
                </button>
              )}

              {(camDisplay ?? camFrame) && (
                <img
                  src={(camDisplay ?? camFrame) as string}
                  alt="Captured QR frame with the decoded code highlighted"
                  className="max-h-48 rounded-lg border border-slate-200 object-contain"
                />
              )}

              {camDecoded && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="text-sm font-bold">This QR points to</h3>
                  <p className="mt-1 break-all font-mono text-sm">{camDecoded}</p>
                  {isShortenedUrl(camDecoded) && (
                    <p role="alert" className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
                      {SHORTENER_BANNER}
                    </p>
                  )}
                </div>
              )}

              {camDecoded && (
                <button
                  type="button"
                  onClick={onCamCheck}
                  disabled={qrLoading}
                  className="w-full rounded-lg bg-teal-800 px-4 py-3 text-base font-semibold text-white shadow disabled:opacity-60"
                >
                  {qrLoading ? 'Checking…' : 'Check this link'}
                </button>
              )}

              {camError && (
                <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
                  {camError}
                </p>
              )}
            </>
          )}

          {qrResult && (
            <QrVerdictCard result={qrResult} decodedUrl={qrCheckedUrl ?? ''} />
          )}

          <PrivacyPhoto />
          <p className="text-xs text-slate-500">
            Crop or blur account numbers, names, and addresses before uploading
            — only the message itself is needed.
          </p>
          <p className="text-xs text-slate-500">
            Decoded on your device; only the link (and, for tamper analysis, the
            photo) is sent for the verdict.
          </p>
        </>
      )}

      {mode === 'payment' && (
        <>
          <p className="text-sm text-slate-600">
            Check the payment before you send it — especially when the payee is
            new or their details changed. FraudPause can&apos;t see your account
            or stop a payment; it advises before you send.
          </p>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Payee name</span>
            <input
              type="text"
              value={payPayee}
              onChange={(e) => setPayPayee(e.target.value)}
              placeholder="Who are you paying?"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base shadow-sm focus:border-teal-700 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Amount in USD</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base shadow-sm focus:border-teal-700 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Payment method</span>
            <select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base shadow-sm focus:border-teal-700 focus:outline-none"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>

          <fieldset className="block">
            <legend className="mb-1 text-sm font-semibold">
              Is this payee new, or have their payment details changed?
            </legend>
            <div className="flex flex-wrap gap-2 text-sm">
              {(
                [
                  ['new', 'New payee'],
                  ['changed', 'Details changed'],
                  ['known', 'Known payee, same details'],
                ] as Array<[PayeeFamiliarity, string]>
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={payFamiliarity === value}
                  onClick={() => setPayFamiliarity(value)}
                  className={`rounded-full px-3 py-1 font-semibold ${
                    payFamiliarity === value
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold">
              Anything else? <span className="font-normal text-slate-500">(optional)</span>
            </span>
            <textarea
              value={payContext}
              onChange={(e) => setPayContext(e.target.value)}
              rows={3}
              placeholder="Who asked you to pay, any urgency or secrecy…"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base shadow-sm focus:border-teal-700 focus:outline-none"
            />
          </label>

          <button
            type="button"
            onClick={onPaymentCheck}
            disabled={payLoading}
            className="w-full rounded-lg bg-teal-800 px-4 py-3 text-base font-semibold text-white shadow disabled:opacity-60"
          >
            {payLoading ? 'Checking…' : 'Check this payment'}
          </button>

          {payError && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
              {payError}
            </p>
          )}

          {payResult && (
            <PaymentVerdictCard
              result={payResult.result}
              outcome={payResult.outcome}
              normals={payResult.normals}
            />
          )}

          <PrivacyLine text="We don't keep your payment details in our database. Our AI provider processes them to produce your result." />
        </>
      )}
    </div>
  );
}
