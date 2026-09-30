import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "./adminAIDashboardShared";
import {
  createDigiLockerUrl, getDigiLockerAadhaarDocument, getDigiLockerStatus, getUserId,
  verifyAadhaarFaceMatch, verifyAadhaarSmartOcr, verifyDigiLockerAccount,
  verifyPan360, verifyPanSmartOcr,
} from "../../../HttpRequest/admin";

const responseData = (response) =>
  typeof response?.data === "string" ? JSON.parse(response.data) : response?.data || {};

const loadImageFile = (file) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    URL.revokeObjectURL(url);
    resolve(image);
  };
  image.onerror = () => {
    URL.revokeObjectURL(url);
    reject(new Error("Unable to read the Aadhaar image."));
  };
  image.src = url;
});

const canvasFile = (canvas, name) => new Promise((resolve, reject) => {
  canvas.toBlob((blob) => {
    if (!blob) return reject(new Error("Unable to prepare the Aadhaar image."));
    resolve(new File([blob], name, { type: "image/jpeg" }));
  }, "image/jpeg", 0.95);
});

const splitCombinedAadhaarImage = async (file) => {
  const image = await loadImageFile(file);
  const halfWidth = Math.floor(image.naturalWidth / 2);
  const makeHalf = async (startX, width, name) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = image.naturalHeight;
    canvas.getContext("2d").drawImage(
      image, startX, 0, width, image.naturalHeight, 0, 0, width, image.naturalHeight
    );
    return canvasFile(canvas, name);
  };
  return [
    await makeHalf(0, halfWidth, `aadhaar-front-${Date.now()}.jpg`),
    await makeHalf(halfWidth, image.naturalWidth - halfWidth, `aadhaar-back-${Date.now()}.jpg`),
  ];
};

const isLikelyCombinedAadhaarImage = async (file) => {
  if (!file?.type?.startsWith("image/")) return false;
  try {
    const image = await loadImageFile(file);
    return image.naturalWidth / image.naturalHeight >= 1.7;
  } catch {
    return false;
  }
};

const mergeAadhaarOcrResponses = (first, second) => {
  if (!second) return first;
  const responses = [first, second];
  const front = responses.find((item) => String(item?.document_type).includes("FRONT")) || first;
  const back = responses.find((item) => String(item?.document_type).includes("BACK")) || second;
  const frontFields = front?.document_fields || {};
  const backFields = back?.document_fields || {};
  const frontQr = front?.qr_details || {};
  const backQr = back?.qr_details || {};
  const preferredQr = frontQr.status === "SECURE" ? frontQr : backQr.status === "SECURE" ? backQr : frontQr;
  const mergedAddress = backFields.address || frontFields.address || preferredQr.address;
  const inferredCareOf = frontFields.father || frontFields.care_of || backFields.care_of ||
    preferredQr.care_of || (mergedAddress ? String(mergedAddress).split(",")[0]?.trim() : null);

  return {
    ...front,
    status: front?.status === "VALID" && back?.status === "VALID" ? "VALID" : front?.status || back?.status,
    document_type: "AADHAAR_COMPLETE",
    document_fields: {
      ...backFields,
      ...frontFields,
      address: mergedAddress,
      pincode: backFields.pincode || frontFields.pincode,
      father: frontFields.father || backFields.father,
      care_of: inferredCareOf,
    },
    qr_details: preferredQr,
    front_response: front,
    back_response: back,
  };
};

const Result = ({ value }) => value ? (
  <details className="mt-3 border rounded">
    <summary className="p-3 fw-semibold" style={{ cursor: "pointer" }}>View complete Cashfree response</summary>
    <pre className="p-3 mb-0 border-top bg-light" style={{ whiteSpace: "pre-wrap" }}>
      {JSON.stringify(value, null, 2)}
    </pre>
  </details>
) : null;

const OcrSummary = ({ value }) => {
  if (!value) return null;
  const fields = value.document_fields || {};
  const qr = value.qr_details || {};
  const quality = value.quality_checks || {};
  const display = (key) => qr[key] ?? fields[key] ?? "—";
  const aadhaar = String(display("uid"));
  const formattedAadhaar = /^\d{12}$/.test(aadhaar)
    ? aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3")
    : aadhaar;
  const address = String(display("address"));
  const addressFirstLine = address !== "—" ? address.split(",")[0]?.trim() : "";
  const careOf = fields.father || fields.care_of || qr.care_of || addressFirstLine || "—";
  const details = [
    ["Name", display("name")],
    ["Date of birth", display("dob")],
    ["Gender", display("gender")],
    ["Father / Care of", careOf],
    ["Aadhaar", formattedAadhaar],
    ["Address", address],
  ];
  const checks = [
    ["Face detected", quality.face_present],
    ["Face clear", quality.face_clear],
    ["QR detected", quality.qr_present],
    ["No blur", quality.blur === false],
    ["No glare", quality.glare === false],
  ];

  return (
    <section className="aadhaar-result-summary" aria-label="Aadhaar verification summary">
      <div className="aadhaar-result-heading">
        <div>
          <span className="aadhaar-result-kicker">Verification result</span>
          <h5>{value.document_type?.replaceAll("_", " ") || "Aadhaar document"}</h5>
        </div>
        <span className={`aadhaar-status-pill ${value.status === "VALID" ? "valid" : "review"}`}>
          <i className={`fas ${value.status === "VALID" ? "fa-circle-check" : "fa-circle-exclamation"}`} />
          {value.status || "REVIEW"}
        </span>
      </div>
      <div className="aadhaar-reference-row">
        <span><small>Verification ID</small>{value.verification_id || "—"}</span>
        <span><small>Reference ID</small>{value.reference_id || "—"}</span>
      </div>
      <div className="aadhaar-detail-list">
        {details.map(([label, data]) => (
          <div key={label} className={label === "Address" ? "wide" : ""}>
            <small>{label}</small><strong>{String(data)}</strong>
          </div>
        ))}
      </div>
      <div className="aadhaar-checks">
        {checks.map(([label, passed]) => (
          <span key={label} className={passed ? "passed" : "failed"}>
            <i className={`fas ${passed ? "fa-check" : "fa-xmark"}`} />{label}
          </span>
        ))}
      </div>
    </section>
  );
};

const OcrResultPanel = ({ value, loading }) => (
  <aside className="ocr-side-result">
    {loading ? (
      <div className="ocr-result-empty">
        <i className="fas fa-spinner fa-spin" />
        <strong>Reading Aadhaar document</strong>
        <small>Cashfree Smart OCR is extracting and validating the available fields.</small>
      </div>
    ) : value ? (
      <>
        <OcrSummary value={value} />
        <Result value={value} />
      </>
    ) : (
      <div className="ocr-result-empty">
        <i className="fas fa-address-card" />
        <strong>Extracted details will appear here</strong>
        <small>Upload an Aadhaar image or PDF and select “Verify document”.</small>
      </div>
    )}
  </aside>
);

const FaceResultPanel = ({ value, loading }) => {
  const matched = value?.face_match_result === "YES";
  const score = value?.face_match_score == null ? null : Math.round(Number(value.face_match_score) * 100);

  return (
    <aside className={`face-result-panel ${value ? (matched ? "matched" : "not-matched") : ""}`}>
      <div className="face-result-panel-title">
        <span><i className="fas fa-chart-simple" /> Verification result</span>
        {value && <em>{value.status || "COMPLETED"}</em>}
      </div>
      {loading ? (
        <div className="face-result-empty">
          <i className="fas fa-spinner fa-spin" />
          <strong>Comparing faces</strong>
          <small>Please wait for the verification result.</small>
        </div>
      ) : value ? (
        <>
          <div className="face-score-wrap">
            <div className="face-score-circle">
              <strong>{score ?? 0}<sup>%</sup></strong>
              <small>Match score</small>
            </div>
            <div className="face-result-verdict">
              <i className={`fas ${matched ? "fa-circle-check" : "fa-circle-xmark"}`} />
              <strong>{matched ? "Face match confirmed" : "Faces do not match"}</strong>
              <small>{matched ? "Both images appear to belong to the same person." : "Review the images or capture a new selfie."}</small>
            </div>
          </div>
          <div className="face-result-meta">
            <span><small>Result</small><strong>{value.face_match_result || "—"}</strong></span>
            <span><small>Reference ID</small><strong>{value.ref_id || value.reference_id || "—"}</strong></span>
            <span className="wide"><small>Verification ID</small><strong>{value.verification_id || "—"}</strong></span>
          </div>
          <Result value={value} />
        </>
      ) : (
        <div className="face-result-empty">
          <i className="fas fa-user-shield" />
          <strong>Result will appear here</strong>
          <small>Provide both images and select “Verify face match”.</small>
        </div>
      )}
    </aside>
  );
};

const PanResultPanel = ({ value, loading }) => {
  const pan360 = value?.pan360_response || value || {};
  const ocr = value?.pan_ocr_response || {};
  const ocrFields = ocr.document_fields || {};
  const address = pan360.address || {};
  const status = pan360.status || ocr.status;
  const fullName = pan360.registered_name || pan360.name_pan_card || ocrFields.name || "PAN holder";
  const details = [
    ["PAN", pan360.pan || ocrFields.pan],
    ["Registered name", pan360.registered_name],
    ["Name on PAN card", pan360.name_pan_card || ocrFields.name],
    ["First name", pan360.first_name],
    ["Last name", pan360.last_name],
    ["Father's name", ocrFields.father || pan360.father_name],
    ["Date of birth", pan360.date_of_birth || ocrFields.dob],
    ["Gender", pan360.gender],
    ["PAN type", pan360.type],
    ["Masked Aadhaar", pan360.masked_aadhaar_number],
    ["Aadhaar linked", pan360.aadhaar_linked == null ? null : pan360.aadhaar_linked ? "Yes" : "No"],
    ["Masked mobile", pan360.mobile_number],
    ["Masked email", pan360.email],
    ["Full address", address.full_address],
    ["Street", address.street],
    ["City", address.city],
    ["State", address.state],
    ["Pincode", address.pincode],
    ["Country", address.country],
  ].filter(([, fieldValue]) => fieldValue != null && fieldValue !== "");
  const initials = fullName.split(/\s+/).filter(Boolean).slice(0, 2)
    .map((part) => part.charAt(0)).join("").toUpperCase();

  return (
    <aside className="pan-result-panel">
      <div className="pan-result-header">
        <span><i className="fas fa-id-card" /> PAN verification result</span>
        {status && <em className={status}>{status}</em>}
      </div>
      {loading ? (
        <div className="pan-result-empty"><i className="fas fa-spinner fa-spin" />
          <strong>Verifying PAN details</strong>
          <small>Processing the selected Cashfree PAN verification API.</small></div>
      ) : value ? (
        <>
          <div className="pan-profile-card">
            <span>{initials || <i className="fas fa-user" />}</span>
            <div><small>Income Tax record</small><strong>{fullName}</strong>
              <em><i className="fas fa-circle-check" /> {pan360.message || "PAN details received"}</em></div>
          </div>
          <div className="pan-reference-row">
            <span><small>Verification ID</small><strong>{pan360.verification_id || ocr.verification_id || "—"}</strong></span>
            <span><small>Reference ID</small><strong>{pan360.reference_id || ocr.reference_id || "—"}</strong></span>
          </div>
          <div className="pan-detail-grid">
            {details.map(([label, fieldValue]) => (
              <span key={label} className={label === "Full address" ? "wide" : ""}>
                <small>{label}</small><strong>{String(fieldValue)}</strong>
              </span>
            ))}
          </div>
          {!value.pan_ocr_response && (
            <div className="pan-ocr-note"><i className="fas fa-circle-info" />
              Upload the PAN card to extract the father's name and printed card details.</div>
          )}
          {value.pan_ocr_response && !value.pan360_response && (
            <div className="pan-ocr-note"><i className="fas fa-circle-info" />
              PAN OCR does not provide address, mobile, email or masked Aadhaar. Use PAN 360 separately for those fields.</div>
          )}
          <Result value={value} />
        </>
      ) : (
        <div className="pan-result-empty"><i className="fas fa-address-card" />
          <strong>Complete PAN details will appear here</strong>
          <small>PAN 360 provides identity and address data; PAN OCR adds the father's name.</small></div>
      )}
    </aside>
  );
};

const DigiLockerResultPanel = ({ value, loading, step }) => {
  const document = value?.document || value?.data || value || {};
  const userDetails = value?.user_details || document?.user_details || {};
  const identity = Object.keys(userDetails).length > 0 ? userDetails : document;
  const status = value?.status || (step >= 4 ? "COMPLETED" : "PENDING");
  const rawProfileImage = identity.photo_link || identity.profile_image || identity.profile_picture || identity.photo || identity.picture;
  const profileImage = rawProfileImage && /^(data:|https?:|blob:)/i.test(rawProfileImage)
    ? rawProfileImage
    : rawProfileImage
      ? `data:image/jpeg;base64,${rawProfileImage}`
      : "";
  const profileName = identity.name || "DigiLocker customer";
  const hasIdentityDetails = Boolean(
    identity.name || identity.mobile || identity.mobile_number || identity.dob ||
    identity.date_of_birth || identity.gender || identity.uid || identity.aadhaar ||
    identity.aadhaar_number || profileImage
  );
  const profileInitials = profileName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
  const addressSource = identity.address || identity.split_address;
  const formattedAddress = addressSource && typeof addressSource === "object"
    ? Object.values(addressSource).filter(Boolean).join(", ")
    : addressSource;
  const consentDateValue = value?.document_consent_validity || value?.consent_validity || value?.consent_date;
  const consentDate = consentDateValue && !Number.isNaN(Date.parse(consentDateValue))
    ? new Date(consentDateValue).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    })
    : consentDateValue;
  const fields = [
    ["Name", identity.name],
    ["Mobile number", identity.mobile || identity.mobile_number],
    ["Consent valid until", step === 3 ? consentDate : null],
    ["Date of birth", identity.dob || identity.date_of_birth],
    ["Year of birth", identity.year_of_birth],
    ["Gender", identity.gender],
    ["Aadhaar (masked by UIDAI)", identity.aadhaar || identity.aadhar || identity.uid || identity.aadhaar_number || identity.aadhaar_last_four_digit],
    ["Email", identity.email],
    ["Father / Care of", identity.care_of || identity.father_name],
    ["Address", formattedAddress],
  ].filter(([, fieldValue]) => fieldValue != null && fieldValue !== "");

  return (
    <aside className="digi-result-panel">
      <div className="digi-result-title">
        <span><i className="fas fa-shield-halved" /> DigiLocker response</span>
        <em className={String(status).toUpperCase()}>{status}</em>
      </div>
      {loading ? (
        <div className="digi-result-empty"><i className="fas fa-spinner fa-spin" />
          <strong>Checking DigiLocker</strong><small>Retrieving the latest consent and document status.</small></div>
      ) : value ? (
        <>
          <div className="digi-result-success">
            <i className="fas fa-circle-check" />
            <div><strong>{value.message || (step >= 4 ? "Aadhaar retrieved successfully" : "Request completed")}</strong>
              <small>Response received securely from Cashfree DigiLocker.</small></div>
          </div>
          <div className="digi-result-ids">
            <span><small>Verification ID</small><strong>{value.verification_id || "—"}</strong></span>
            <span><small>Reference ID</small><strong>{value.reference_id || "—"}</strong></span>
          </div>
          {hasIdentityDetails && (
            <div className={`digi-customer-profile ${step >= 4 && profileImage ? "document-profile" : ""}`}>
              <div className="digi-profile-avatar">
                {profileImage
                  ? <img src={profileImage} alt={`${profileName} profile`} />
                  : <span>{profileInitials || <i className="fas fa-user" />}</span>}
              </div>
              <div>
                <small>Verified DigiLocker profile</small>
                <strong>{profileName}</strong>
                <em><i className="fas fa-circle-check" /> Identity authenticated</em>
              </div>
            </div>
          )}
          {fields.length > 0 && <div className="digi-document-fields">
            {fields.map(([label, fieldValue]) => <span key={label} className={label === "Address" ? "wide" : ""}>
              <small>{label}</small><strong>{String(fieldValue)}</strong>
            </span>)}
          </div>}
          <Result value={value} />
        </>
      ) : (
        <div className="digi-result-empty"><i className="fas fa-file-shield" />
          <strong>Cashfree response will appear here</strong>
          <small>Complete each step to retrieve the verified Aadhaar document.</small></div>
      )}
    </aside>
  );
};

const VerifyAadhaarLocal = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [activeMethod, setActiveMethod] = useState("digilocker");
  const [inputKey, setInputKey] = useState(0);
  const [ocrFile, setOcrFile] = useState(null);
  const [ocrBackFile, setOcrBackFile] = useState(null);
  const [ocrCombinedImage, setOcrCombinedImage] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [ocrError, setOcrError] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [panNumber, setPanNumber] = useState("");
  const [panName, setPanName] = useState("");
  const [panFile, setPanFile] = useState(null);
  const [panMode, setPanMode] = useState("360");
  const [pan360Result, setPan360Result] = useState(null);
  const [panOcrResult, setPanOcrResult] = useState(null);
  const [panError, setPanError] = useState("");
  const [panLoading, setPanLoading] = useState(false);
  const [aadhaarImage, setAadhaarImage] = useState(null);
  const [aadhaarPreview, setAadhaarPreview] = useState("");
  const [selfieImage, setSelfieImage] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [threshold, setThreshold] = useState("0.75");
  const [faceResult, setFaceResult] = useState(null);
  const [faceError, setFaceError] = useState("");
  const [faceLoading, setFaceLoading] = useState(false);
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [flow, setFlow] = useState("signin");
  const [digiResult, setDigiResult] = useState(null);
  const [digiMessage, setDigiMessage] = useState("");
  const [digiError, setDigiError] = useState("");
  const [digiLoading, setDigiLoading] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [consentUrl, setConsentUrl] = useState("");
  const [digiStep, setDigiStep] = useState(1);
  const [digiVisibleStep, setDigiVisibleStep] = useState(1);
  const [digiResponses, setDigiResponses] = useState({});
  const [digiPolling, setDigiPolling] = useState(false);

  const message = (error, fallback) => {
    if (error?.code === "ERR_NETWORK" || (!error?.response && error?.message === "Network Error")) {
      return "Unable to reach the local verification service. Confirm the backend is running on port 8181.";
    }
    return error?.response?.data?.errorMessage || error?.response?.data?.message || error?.message || fallback;
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  };

  useEffect(() => () => streamRef.current?.getTracks().forEach((track) => track.stop()), []);

  const startCamera = async () => {
    setFaceError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 } }, audio: false,
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraActive(true);
    } catch (error) {
      setFaceError(error?.name === "NotAllowedError"
        ? "Camera permission denied. Allow access or upload a selfie."
        : "Unable to open camera. Please upload a selfie.");
    }
  };

  const captureSelfie = () => {
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return setFaceError("Unable to capture selfie.");
      setSelfieImage(new File([blob], `selfie-${Date.now()}.jpg`, { type: "image/jpeg" }));
      setSelfiePreview(URL.createObjectURL(blob));
      stopCamera();
    }, "image/jpeg", 0.92);
  };

  const runOcr = async (event) => {
    event.preventDefault();
    if (!ocrFile) return setOcrError("Upload an Aadhaar image or PDF.");
    setOcrLoading(true); setOcrError("");
    try {
      let frontFile = ocrFile;
      let backFile = ocrBackFile;
      if (!backFile && ocrCombinedImage) {
        [frontFile, backFile] = await splitCombinedAadhaarImage(ocrFile);
      }
      const first = responseData(await verifyAadhaarSmartOcr(frontFile, "front"));
      const second = backFile
        ? responseData(await verifyAadhaarSmartOcr(backFile, "back"))
        : null;
      setOcrResult(mergeAadhaarOcrResponses(first, second));
    }
    catch (error) { setOcrError(message(error, "Smart OCR failed.")); }
    finally { setOcrLoading(false); }
  };

  const runPan360 = async (event) => {
    event.preventDefault();
    const normalizedPan = panNumber.trim().toUpperCase();
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(normalizedPan)) {
      return setPanError("Enter a valid 10-character PAN number, for example ABCDE1234F.");
    }
    setPanLoading(true); setPanError(""); setPan360Result(null);
    try {
      const pan360Response = responseData(await verifyPan360(normalizedPan, panName.trim()));
      if (pan360Response.code || pan360Response.type ||
          (pan360Response.status && pan360Response.status !== "VALID")) {
        return setPanError(pan360Response.message || "PAN verification was not successful.");
      }
      setPan360Result({ pan360_response: pan360Response });
    } catch (error) {
      setPanError(message(error, "PAN 360 verification failed."));
    } finally {
      setPanLoading(false);
    }
  };

  const runPanOcr = async (event) => {
    event.preventDefault();
    if (!panFile) return setPanError("Upload a PAN card image for Smart OCR.");
    setPanLoading(true); setPanError(""); setPanOcrResult(null);
    try {
      const panOcrResponse = responseData(await verifyPanSmartOcr(panFile));
      if (panOcrResponse.code === "insufficient_balance") {
        setPanError("Cashfree PAN Smart OCR has insufficient verification balance. PAN 360 and basic PAN verification may still work because they are separate Cashfree products.");
        return;
      }
      if (panOcrResponse.code || panOcrResponse.type ||
          (panOcrResponse.status && panOcrResponse.status !== "VALID")) {
        setPanError(panOcrResponse.message || "PAN OCR could not validate this image.");
        return;
      }
      setPanOcrResult({ pan_ocr_response: panOcrResponse });
    } catch (error) {
      setPanError(message(error, "PAN Smart OCR failed."));
    } finally {
      setPanLoading(false);
    }
  };

  const runFaceMatch = async (event) => {
    event.preventDefault();
    if (!aadhaarImage || !selfieImage) return setFaceError("Upload Aadhaar and capture or upload a selfie.");
    setFaceLoading(true); setFaceError("");
    try { setFaceResult(responseData(await verifyAadhaarFaceMatch(aadhaarImage, selfieImage, Number(threshold)))); }
    catch (error) { setFaceError(message(error, "Face match failed.")); }
    finally { setFaceLoading(false); }
  };

  const runDigi = async (action, request) => {
    setDigiLoading(action); setDigiError(""); setDigiMessage("");
    try {
      const data = responseData(await request());
      setDigiResult(data);
      const responseStep = { account: 1, create: 2, status: 3, document: 4 }[action];
      if (responseStep) {
        setDigiResponses((current) => ({ ...current, [responseStep]: data }));
      }
      const nextVerificationId = data.verification_id || verificationId;
      const nextReferenceId = data.reference_id ? String(data.reference_id) : referenceId;
      if (data.verification_id) setVerificationId(data.verification_id);
      if (data.reference_id) setReferenceId(String(data.reference_id));
      if (data.url) setConsentUrl(data.url);
      if (data.message) setDigiMessage(data.message);
      if (nextVerificationId || nextReferenceId) {
        sessionStorage.setItem("aadhaarDigiLockerRequest", JSON.stringify({
          verificationId: nextVerificationId,
          referenceId: nextReferenceId,
        }));
      }
      if (action === "account") {
        setDigiStep(2);
        setDigiVisibleStep(2);
      }
      if (action === "create") {
        setDigiStep(3);
        setDigiVisibleStep(3);
      }
      if (action === "document") {
        setDigiStep(4);
        setDigiVisibleStep(4);
      }
      return data;
    } catch (error) {
      setDigiError(message(error, "DigiLocker request failed."));
      return null;
    }
    finally { setDigiLoading(""); }
  };

  const checkAccount = async () => {
    if (!/^\d{12}$/.test(aadhaarNumber)) return setDigiError("Enter a valid 12 digit Aadhaar number.");
    await runDigi("account", () => verifyDigiLockerAccount(getUserId(), aadhaarNumber));
  };

  const createConsent = async () => {
    const redirectUrl = window.location.protocol === "https:"
      ? `${window.location.origin}/verifyAadhaarLocal?digilockerReturn=1`
      : undefined;
    await runDigi("create", () => createDigiLockerUrl(getUserId(), flow, redirectUrl));
  };

  const continueToDigiLocker = () => {
    if (!consentUrl) return;
    const consentWindow = window.open(consentUrl, "_blank");
    if (!consentWindow) {
      setDigiError("The browser blocked the DigiLocker tab. Allow pop-ups and try again.");
      return;
    }
    consentWindow.opener = null;
    setDigiStep(3);
    setDigiVisibleStep(3);
    setDigiPolling(true);
    setDigiMessage("DigiLocker opened in a new tab. This page is checking consent automatically.");
  };

  useEffect(() => {
    if (!digiPolling || (!verificationId && !referenceId)) return undefined;
    let cancelled = false;
    let attempts = 0;
    let timer;

    const pollStatus = async () => {
      if (cancelled) return;
      attempts += 1;
      try {
        const statusData = responseData(await getDigiLockerStatus(verificationId, referenceId));
        if (cancelled) return;
        setDigiResult(statusData);
        setDigiResponses((current) => ({ ...current, 3: statusData }));
        const returnedStatus = String(statusData.status || "").toUpperCase();
        if (["AUTHENTICATED", "SUCCESS", "VALID", "COMPLETED"].includes(returnedStatus)) {
          setDigiStep(4);
          setDigiVisibleStep(4);
          setDigiPolling(false);
          setDigiMessage("Consent received. Retrieving the verified Aadhaar document.");
          try {
            const documentData = responseData(
              await getDigiLockerAadhaarDocument(verificationId, referenceId)
            );
            if (!cancelled) {
              setDigiResult(documentData);
              setDigiResponses((current) => ({ ...current, 4: documentData }));
              setDigiMessage("DigiLocker consent completed and Aadhaar retrieved successfully.");
            }
          } catch (documentError) {
            if (!cancelled) {
              setDigiError(message(documentError, "Consent completed. Use Fetch Aadhaar to retry document retrieval."));
            }
          }
          return;
        }
      } catch (statusError) {
        if (!cancelled && attempts >= 3) {
          setDigiError(message(statusError, "Unable to check DigiLocker consent status."));
        }
      }

      if (attempts >= 36) {
        setDigiPolling(false);
        setDigiMessage("Consent is still pending. Complete DigiLocker, then select Check status.");
        return;
      }
      timer = window.setTimeout(pollStatus, 5000);
    };

    pollStatus();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [digiPolling, verificationId, referenceId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("digilockerReturn") !== "1") return;
    const saved = JSON.parse(sessionStorage.getItem("aadhaarDigiLockerRequest") || "{}");
    const savedVerificationId = saved.verificationId || "";
    const savedReferenceId = saved.referenceId || "";
    setActiveMethod("digilocker");
    setVerificationId(savedVerificationId);
    setReferenceId(savedReferenceId);
    setDigiStep(3);
    setDigiVisibleStep(3);
    window.history.replaceState({}, "", "/verifyAadhaarLocal");

    if (!savedVerificationId && !savedReferenceId) {
      setDigiError("DigiLocker request details were not found. Please create a new consent request.");
      return;
    }

    const resumeConsent = async () => {
      setDigiLoading("status");
      setDigiError("");
      try {
        const statusData = responseData(
          await getDigiLockerStatus(savedVerificationId, savedReferenceId)
        );
        setDigiResult(statusData);
        setDigiResponses((current) => ({ ...current, 3: statusData }));
        const returnedStatus = String(statusData.status || "").toUpperCase();
        if (["AUTHENTICATED", "SUCCESS", "VALID", "COMPLETED"].includes(returnedStatus)) {
          const documentData = responseData(
            await getDigiLockerAadhaarDocument(savedVerificationId, savedReferenceId)
          );
          setDigiResult(documentData);
          setDigiStep(4);
          setDigiVisibleStep(4);
          setDigiResponses((current) => ({ ...current, 4: documentData }));
          setDigiMessage("DigiLocker consent completed and Aadhaar retrieved.");
        } else {
          setDigiMessage(`DigiLocker status: ${statusData.status || "PENDING"}`);
        }
      } catch (error) {
        setDigiError(message(error, "Unable to resume DigiLocker verification."));
      } finally {
        setDigiLoading("");
      }
    };
    resumeConsent();
  }, []);

  const reset = () => {
    stopCamera(); setInputKey((key) => key + 1);
    setOcrFile(null); setOcrBackFile(null); setOcrCombinedImage(false);
    setOcrResult(null); setOcrError("");
    setPanNumber(""); setPanName(""); setPanFile(null); setPanMode("360");
    setPan360Result(null); setPanOcrResult(null); setPanError("");
    setAadhaarImage(null); setAadhaarPreview(""); setSelfieImage(null); setSelfiePreview("");
    setFaceResult(null); setFaceError("");
    setAadhaarNumber(""); setDigiResult(null); setDigiMessage(""); setDigiError("");
    setVerificationId(""); setReferenceId(""); setConsentUrl(""); setDigiStep(1); setDigiPolling(false);
    setDigiVisibleStep(1); setDigiResponses({});
    sessionStorage.removeItem("aadhaarDigiLockerRequest");
  };

  const selectMethod = (method) => {
    if (method !== "face") stopCamera();
    setActiveMethod(method);
  };

  const digiLoadingStep = { account: 1, create: 2, status: 3, document: 4 }[digiLoading];

  return (
    <PageShell title="Identity Verification" breadcrumb={<li className="breadcrumb-item active">Aadhaar & PAN</li>}
      actions={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}><i className="fas fa-arrow-left me-1" />Back</button>
        <button className="btn btn-outline-primary btn-sm" onClick={reset}><i className="fas fa-rotate-right me-1" />Refresh</button>
      </>}>
      <div className="aadhaar-verify-shell">
        <div className="aadhaar-security-note">
          <span className="aadhaar-security-icon"><i className="fas fa-lock" /></span>
          <div>
            <strong>Secure Aadhaar and PAN verification</strong>
            <p>Choose one Cashfree verification method. Sensitive inputs are displayed only for the selected method.</p>
          </div>
        </div>

        <div className="aadhaar-method-tabs" role="tablist" aria-label="Aadhaar verification methods">
          <button type="button" role="tab" aria-selected={activeMethod === "digilocker"}
            className={activeMethod === "digilocker" ? "active" : ""} onClick={() => selectMethod("digilocker")}>
            <i className="fas fa-shield-halved" />
            <span><strong>DigiLocker</strong><small>Verified digital Aadhaar</small></span>
            <em>Recommended</em>
          </button>
          <button type="button" role="tab" aria-selected={activeMethod === "ocr"}
            className={activeMethod === "ocr" ? "active" : ""} onClick={() => selectMethod("ocr")}>
            <i className="fas fa-file-image" />
            <span><strong>Smart OCR</strong><small>Extract details from document</small></span>
          </button>
          <button type="button" role="tab" aria-selected={activeMethod === "face"}
            className={activeMethod === "face" ? "active" : ""} onClick={() => selectMethod("face")}>
            <i className="fas fa-user-check" />
            <span><strong>Face Match</strong><small>Compare Aadhaar and selfie</small></span>
          </button>
          <button type="button" role="tab" aria-selected={activeMethod === "pan"}
            className={activeMethod === "pan" ? "active" : ""} onClick={() => selectMethod("pan")}>
            <i className="fas fa-address-card" />
            <span><strong>PAN Details</strong><small>PAN 360 and PAN OCR</small></span>
          </button>
        </div>

      {activeMethod === "pan" && (
      <div className="card border-0 shadow-sm pan-verification-card"><div className="card-body">
        <div className="pan-official-header">
          <span><i className="fas fa-address-card" /></span>
          <div><h4>Complete PAN Verification</h4>
            <p>PAN 360 retrieves identity and address data. PAN OCR adds the father's name and card fields.</p></div>
          <em><i className="fas fa-shield-halved" /> Cashfree Secure ID</em>
        </div>
        <div className="pan-api-selector" role="tablist" aria-label="PAN verification APIs">
          <button type="button" role="tab" aria-selected={panMode === "360"}
            disabled={panLoading} className={panMode === "360" ? "active" : ""}
            onClick={() => { setPanMode("360"); setPanError(""); }}>
            <span>1</span><div><strong>PAN 360</strong><small>Verify by PAN number and retrieve identity/address data</small></div>
            <i className="fas fa-chevron-right" />
          </button>
          <button type="button" role="tab" aria-selected={panMode === "ocr"}
            disabled={panLoading} className={panMode === "ocr" ? "active" : ""}
            onClick={() => { setPanMode("ocr"); setPanError(""); }}>
            <span>2</span><div><strong>PAN Smart OCR</strong><small>Upload PAN card to read father’s name and printed fields</small></div>
            <i className="fas fa-chevron-right" />
          </button>
        </div>
        <div className="pan-main-layout">
          <section className="pan-input-panel">
            {panMode === "360" ? (
            <>
            <div className="pan-panel-heading">
              <span>1</span>
              <div><strong>Enter PAN information</strong>
                <small>Name is optional but improves name-match verification.</small></div>
            </div>
            <form onSubmit={runPan360}>
              <label className="pan-field-label" htmlFor="panNumber">PAN number <em>Required</em></label>
              <input id="panNumber" className="form-control pan-number-input" maxLength={10}
                placeholder="ABCDE1234F" value={panNumber}
                onChange={(event) => {
                  setPanNumber(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""));
                  setPan360Result(null); setPanError("");
                }} />
              <label className="pan-field-label mt-3" htmlFor="panName">Customer name <small>Optional</small></label>
              <input id="panName" className="form-control" placeholder="Name as per PAN records"
                value={panName} onChange={(event) => {
                  setPanName(event.target.value); setPan360Result(null); setPanError("");
                }} />
              <div className="pan-data-note"><i className="fas fa-circle-info" />
                <span>PAN 360 may return address, masked mobile and masked email. Cashfree reports approximately 45% availability for these optional fields.</span>
              </div>
              <button className="btn pan-verify-button w-100" disabled={panLoading || panNumber.length !== 10}>
                <i className={`fas ${panLoading ? "fa-spinner fa-spin" : "fa-circle-check"} me-2`} />
                {panLoading ? "Checking PAN 360..." : "Verify with PAN 360"}
              </button>
            </form>
            </>
            ) : (
            <>
            <div className="pan-panel-heading pan-ocr-heading">
              <span>2</span>
              <div><strong>Read PAN card image</strong>
                <small>Extract PAN, printed name, father’s name and DOB. Address is not returned by PAN OCR.</small></div>
            </div>
            <form onSubmit={runPanOcr}>
              <label className={`pan-upload-zone ${panFile ? "has-file" : ""}`} htmlFor="panCardFile">
                <i className={`fas ${panFile ? "fa-file-circle-check" : "fa-cloud-arrow-up"}`} />
                <span><strong>{panFile ? panFile.name : "Upload PAN card image"}</strong>
                  <small>{panFile ? "PAN OCR will extract father’s name, DOB and card name" : "JPG, JPEG or PNG · Maximum 5 MB"}</small></span>
              </label>
              <input key={`pan-${inputKey}`} id="panCardFile" className="face-file-input" type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                onChange={(event) => {
                  setPanFile(event.target.files?.[0] || null);
                  setPanOcrResult(null); setPanError("");
                }} />
              <button className="btn pan-ocr-button w-100 mt-3" disabled={panLoading || !panFile}>
                <i className={`fas ${panLoading ? "fa-spinner fa-spin" : "fa-magnifying-glass"} me-2`} />
                {panLoading ? "Reading PAN card..." : "Run PAN Smart OCR"}
              </button>
            </form>
            <div className="pan-data-note"><i className="fas fa-circle-info" />
              <span>PAN OCR does not return address, mobile, email or masked Aadhaar. Use PAN 360 for those fields.</span>
            </div>
            </>
            )}
            {panError && <div className="alert alert-danger mt-3 mb-0">{panError}</div>}
          </section>
          <PanResultPanel value={panMode === "360" ? pan360Result : panOcrResult} loading={panLoading} />
        </div>
      </div></div>
      )}

      {activeMethod === "ocr" && (
      <div className="card border-0 shadow-sm ocr-verification-card"><div className="card-body">
        <div className="ocr-official-header">
          <span><i className="fas fa-file-shield" /></span>
          <div><h4>Smart OCR Document Verification</h4>
            <p>Extract and validate Aadhaar information from a document image or PDF.</p></div>
          <em><i className="fas fa-lock" /> Secure processing</em>
        </div>
        <div className="ocr-main-layout">
          <section className="ocr-upload-panel">
            <div className="ocr-panel-heading">
              <span>1</span>
              <div><strong>Upload Aadhaar document</strong><small>Select a clear front image or an unprotected PDF</small></div>
            </div>
            <form onSubmit={runOcr}>
              <label className={`ocr-upload-zone ${ocrFile ? "has-file" : ""}`} htmlFor="ocrAadhaarFile">
                <i className={`fas ${ocrFile ? "fa-file-circle-check" : "fa-cloud-arrow-up"}`} />
                <strong>{ocrFile ? ocrFile.name : "Choose Aadhaar document"}</strong>
                <small>{ocrFile ? `${(ocrFile.size / 1024).toFixed(1)} KB · Ready to verify` : "Click to browse JPG, JPEG, PNG or PDF"}</small>
              </label>
              <input key={`ocr-${inputKey}`} id="ocrAadhaarFile" className="face-file-input" type="file"
                accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                onChange={(event) => {
                  const selected = event.target.files?.[0] || null;
                  setOcrFile(selected);
                  setOcrBackFile(null);
                  setOcrCombinedImage(false);
                  if (selected) {
                    isLikelyCombinedAadhaarImage(selected).then(setOcrCombinedImage);
                  }
                  setOcrResult(null);
                  setOcrError("");
                }} />
              <label className={`ocr-combined-option ${ocrCombinedImage ? "selected" : ""}`}>
                <input type="checkbox" checked={ocrCombinedImage}
                  disabled={!ocrFile || Boolean(ocrBackFile) || ocrFile?.type === "application/pdf"}
                  onChange={(event) => setOcrCombinedImage(event.target.checked)} />
                <span><i className="fas fa-table-columns" />
                  <span><strong>Front and back are in this same image</strong>
                    <small>Automatically split the left and right sides before OCR</small></span>
                </span>
                {ocrCombinedImage && <em>Auto-split enabled</em>}
              </label>
              <div className={`ocr-back-file-row ${ocrBackFile ? "selected" : ""}`}>
                <span><i className="fas fa-address-card" />
                  <span><strong>Aadhaar back side</strong><small>Recommended to extract address and pincode</small></span>
                </span>
                <label className="btn btn-sm btn-outline-primary mb-0" htmlFor="ocrAadhaarBackFile">
                  <i className="fas fa-upload me-1" />{ocrBackFile ? "Change" : "Add back image"}
                </label>
                <input key={`ocr-back-${inputKey}`} id="ocrAadhaarBackFile" className="face-file-input" type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png" onChange={(event) => {
                    setOcrBackFile(event.target.files?.[0] || null);
                    setOcrCombinedImage(false);
                    setOcrResult(null);
                    setOcrError("");
                  }} />
              </div>
              {ocrBackFile && <div className="ocr-back-file-name">
                <i className="fas fa-circle-check" />{ocrBackFile.name}
              </div>}
              <div className="ocr-requirements">
                <span><i className="fas fa-check" /> Maximum 5 MB</span>
                <span><i className="fas fa-check" /> Clear and readable</span>
                <span><i className="fas fa-check" /> PDF must be unlocked</span>
              </div>
              <button className="btn ocr-verify-button w-100" disabled={ocrLoading || !ocrFile}>
                <i className={`fas ${ocrLoading ? "fa-spinner fa-spin" : "fa-magnifying-glass"} me-2`} />
                {ocrLoading ? "Extracting document details..." : "Verify document"}
              </button>
            </form>
            {ocrError && <div className="alert alert-danger mt-3 mb-0">{ocrError}</div>}
          </section>
          <OcrResultPanel value={ocrResult} loading={ocrLoading} />
        </div>
      </div></div>
      )}

      {activeMethod === "face" && (
      <div className="card border-0 shadow-sm face-match-card"><div className="card-body">
        <div className="face-match-header">
          <span className="face-match-header-icon"><i className="fas fa-user-check" /></span>
          <div><h4>Face Identity Verification</h4>
            <p>Securely compare the Aadhaar photograph with the customer's live selfie.</p></div>
          <span className="face-session-status"><i className="fas fa-shield-halved" /> Secure session</span>
        </div>
        <div className="face-official-notice">
          <i className="fas fa-circle-info" />
          <span>Both photographs must clearly show one face. Supported formats: JPG, JPEG and PNG.</span>
        </div>
        <div className="face-main-layout">
          <div className="face-input-column">
          <form onSubmit={runFaceMatch}>
          <div className="face-upload-grid">
            <div className="face-upload-step face-document-panel">
              <span className="face-step-number">1</span>
              <div className="face-step-title"><strong>Aadhaar source image</strong><small>Upload a clear image containing the Aadhaar photograph</small></div>
              <label className={`face-upload-zone ${aadhaarPreview ? "has-image" : ""}`} htmlFor="faceAadhaarImage">
                {aadhaarPreview
                  ? <img src={aadhaarPreview} alt="Selected Aadhaar" />
                  : <><i className="fas fa-id-card" /><strong>Upload Aadhaar image</strong><small>Choose a clear image showing the face</small></>}
              </label>
              <input key={`id-${inputKey}`} id="faceAadhaarImage" className="face-file-input" type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png" onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setAadhaarImage(file);
                  if (file) setAadhaarPreview(URL.createObjectURL(file));
                }} />
              {aadhaarImage && <div className="face-selected-file"><i className="fas fa-circle-check" />{aadhaarImage.name}</div>}
            </div>

            <div className="face-compare-divider"><span>VS</span></div>

            <div className="face-upload-step face-selfie-panel">
              <span className="face-step-number">2</span>
              <div className="face-step-title"><strong>Live customer selfie</strong><small>Face the camera directly in neutral lighting</small></div>
              <div className={`face-upload-zone ${selfiePreview || cameraActive ? "has-image" : ""}`}>
                <video ref={videoRef} muted playsInline className={cameraActive ? "face-camera-video" : "d-none"} />
                {selfiePreview && !cameraActive
                  ? <img src={selfiePreview} alt="Customer selfie" />
                  : !cameraActive && <><i className="fas fa-camera" /><strong>Capture customer selfie</strong><small>Use camera for the best result</small></>}
              </div>
              <div className="face-selfie-actions">
                <button className="btn btn-primary btn-sm" type="button" onClick={cameraActive ? captureSelfie : startCamera}>
                  <i className="fas fa-camera me-1" />{cameraActive ? "Capture now" : "Open camera"}
                </button>
                {cameraActive && <button className="btn btn-outline-secondary btn-sm" type="button" onClick={stopCamera}>Cancel</button>}
                <label className="btn btn-outline-primary btn-sm mb-0" htmlFor="faceSelfieImage">
                  <i className="fas fa-upload me-1" />Upload instead
                </label>
                <input key={`selfie-${inputKey}`} id="faceSelfieImage" className="face-file-input" type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png" capture="user" onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setSelfieImage(file);
                    if (file) setSelfiePreview(URL.createObjectURL(file));
                  }} />
              </div>
              {selfieImage && <div className="face-selected-file"><i className="fas fa-circle-check" />Selfie ready</div>}
            </div>
          </div>

          <div className="face-match-action-bar">
            <div><label htmlFor="faceThreshold">Match sensitivity</label>
              <select id="faceThreshold" className="form-select form-select-sm" value={threshold}
                onChange={(event) => setThreshold(event.target.value)}>
                <option value="0.70">70% · Standard</option>
                <option value="0.75">75% · Recommended</option>
                <option value="0.80">80% · Strict</option>
              </select></div>
            <p><i className="fas fa-lock" /> Images are used only for this verification request.</p>
            <button className="btn face-verify-button" disabled={faceLoading || !aadhaarImage || !selfieImage}>
              <i className={`fas ${faceLoading ? "fa-spinner fa-spin" : "fa-user-check"} me-2`} />
              {faceLoading ? "Comparing faces..." : "Verify face match"}
            </button>
          </div>
        </form>
          {faceError && <div className="alert alert-danger mt-3 mb-0">{faceError}</div>}
          </div>
          <FaceResultPanel value={faceResult} loading={faceLoading} />
        </div>
      </div></div>
      )}

      {activeMethod === "digilocker" && (
      <div className="card border-0 shadow-sm digi-verification-card"><div className="card-body">
        <div className="digi-official-header">
          <span><i className="fas fa-building-shield" /></span>
          <div><h4>Aadhaar Verification via DigiLocker</h4>
            <p>Collect consent and retrieve the customer’s government-verified Aadhaar document.</p></div>
          <em><i className="fas fa-lock" /> Consent based</em>
        </div>
        <div className="digi-stepper">
          {[
            [1, "Check account", "Confirm Aadhaar availability", "fa-id-card"],
            [2, "Create consent", "Prepare secure DigiLocker link", "fa-link"],
            [3, "User consent", "Complete DigiLocker authorization", "fa-user-lock"],
            [4, "Fetch Aadhaar", "Retrieve verified document", "fa-file-shield"],
          ].map(([number, title, subtitle, icon]) => (
            <button key={number} type="button" disabled={number > digiStep}
              onClick={() => setDigiVisibleStep(number)}
              className={`${digiVisibleStep === number ? "active" : ""} ${digiStep === number ? "current" : ""} ${digiStep > number ? "complete" : ""}`}>
              <span><i className={`fas ${digiStep > number ? "fa-check" : icon}`} /></span>
              <div><strong>{number}. {title}</strong><small>{subtitle}</small></div>
            </button>
          ))}
        </div>
        <div className="digi-main-layout">
          <section className="digi-control-panel">
            {digiVisibleStep === 1 && (
            <div className={`digi-step-card ${digiStep === 1 ? "active" : digiStep > 1 ? "complete" : ""}`}>
              <span className="digi-step-badge">1</span>
              <div className="digi-step-copy"><strong>Check DigiLocker account</strong>
                <small>Enter the customer’s 12-digit Aadhaar number.</small></div>
              <div className="digi-input-action">
                <input className="form-control" inputMode="numeric" maxLength={12}
                  placeholder="12 digit Aadhaar number" value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ""))} />
                <button className="btn btn-outline-primary" type="button" onClick={checkAccount}
                  disabled={Boolean(digiLoading)}>
                  {digiLoading === "account" ? "Checking..." : "Check account"}
                </button>
              </div>
            </div>
            )}

            {digiVisibleStep === 2 && (
            <div className={`digi-step-card ${digiStep === 2 ? "active" : digiStep > 2 ? "complete" : ""}`}>
              <span className="digi-step-badge">2</span>
              <div className="digi-step-copy"><strong>Create consent request</strong>
                <small>Select the flow and generate a secure Cashfree URL.</small></div>
              <div className="digi-input-action">
                <select className="form-select" value={flow} onChange={(e) => setFlow(e.target.value)}
                  disabled={digiStep < 2}>
                  <option value="signin">Existing DigiLocker user</option>
                  <option value="signup">New DigiLocker user</option>
                </select>
                <button className="btn btn-primary" type="button" onClick={createConsent}
                  disabled={digiStep < 2 || Boolean(digiLoading)}>
                  {digiLoading === "create" ? "Creating..." : "Create consent"}
                </button>
              </div>
            </div>
            )}

            {digiVisibleStep === 3 && (
            <div className={`digi-step-card ${digiStep === 3 ? "active" : digiStep > 3 ? "complete" : ""}`}>
              <span className="digi-step-badge">3</span>
              <div className="digi-step-copy"><strong>Complete user consent</strong>
                <small>DigiLocker opens in a new tab while this page automatically checks consent status.</small></div>
              <button className="btn digi-continue-button w-100" type="button"
                disabled={!consentUrl || digiPolling} onClick={continueToDigiLocker}>
                <i className={`fas ${digiPolling ? "fa-spinner fa-spin" : "fa-arrow-up-right-from-square"} me-2`} />
                {digiPolling ? "Waiting for DigiLocker consent..." : "Continue to DigiLocker"}
              </button>
            </div>
            )}

            {digiVisibleStep === 4 && (
            <div className={`digi-step-card ${digiStep >= 4 ? "complete" : ""}`}>
              <span className="digi-step-badge">4</span>
              <div className="digi-step-copy"><strong>Retrieve verified Aadhaar</strong>
                <small>Status and document retrieval happen automatically after consent.</small></div>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-secondary btn-sm" type="button"
                  disabled={!verificationId && !referenceId}
                  onClick={() => runDigi("status", () => getDigiLockerStatus(verificationId, referenceId))}>
                  Check status
                </button>
                <button className="btn btn-outline-success btn-sm" type="button"
                  disabled={!verificationId && !referenceId}
                  onClick={() => runDigi("document", () => getDigiLockerAadhaarDocument(verificationId, referenceId))}>
                  Fetch Aadhaar
                </button>
              </div>
            </div>
            )}
            {digiMessage && <div className="alert alert-success mt-3 mb-0">{digiMessage}</div>}
            {digiError && <div className="alert alert-danger mt-3 mb-0">{digiError}</div>}
          </section>
          <DigiLockerResultPanel value={digiResponses[digiVisibleStep] || (digiVisibleStep === digiStep ? digiResult : null)}
            loading={digiLoadingStep === digiVisibleStep || (digiPolling && digiVisibleStep === 3 && !digiResponses[3])}
            step={digiVisibleStep} />
        </div>
      </div></div>
      )}
      </div>
    </PageShell>
  );
};

export default VerifyAadhaarLocal;
