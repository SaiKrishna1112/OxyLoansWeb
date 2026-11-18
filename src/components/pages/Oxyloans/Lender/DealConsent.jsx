import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Card,
  Spin,
  Button,
  Tag,
  Typography,
  Alert,
  Modal,
  Divider,
  Row,
  Col,
  Space,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ArrowRightOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
  UserOutlined,
  BankOutlined,
  WalletOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { formatAmountWithCommas } from "../../../../utils/formatAmount";
import {
  getDealConsentInfo,
  recordDealConsent,
  getExternalEncryptedKey,
} from "../../../HttpRequest/beforelogin";
import { saveLastVisitedUrl } from "../../../../utils/redirectUtils";
import { oxylogodashboard } from "../../../imagepath";

const { Title, Text, Paragraph } = Typography;

const DealConsent = () => {
  const [searchParams] = useSearchParams();

  // Extract query parameters
  const token = searchParams.get("token") || searchParams.get("Token") || "";
  const rawChoice = (
    searchParams.get("choice") ||
    searchParams.get("Choice") ||
    ""
  ).toUpperCase();
  const initialChoice =
    rawChoice === "CONTINUE" || rawChoice === "WITHDRAW" ? rawChoice : null;

  // Component state
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [consentInfo, setConsentInfo] = useState(null);
  const [selectedChoice, setSelectedChoice] = useState(initialChoice);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [apiKey, setApiKey] = useState(null);

  // User auth state
  const isLoggedIn = !!(
    sessionStorage.getItem("accessToken") ||
    localStorage.getItem("accessToken")
  );
  const userId =
    sessionStorage.getItem("userId") ||
    localStorage.getItem("userId") ||
    "";
  const dashboardLink = userId ? `/lenderAIDashboard/${userId}` : "/dashboard";

  // Remember this deal consent page for post-login redirect
  useEffect(() => {
    saveLastVisitedUrl(window.location.pathname, window.location.search);
  }, []);

  // Fetch deal consent details on mount
  const fetchDealConsentInfo = async () => {
    if (!token) {
      setLoading(false);
      setError(
        "No consent token was provided in the link. Please ensure you clicked the full link received via email or WhatsApp."
      );
      return;
    }

    setLoading(true);
    setError(null);
    setSubmitError(null);

    try {
      // 1. Resolve encrypted API key for X-Api-Key authentication
      let key = apiKey;
      if (!key) {
        const encResp = await getExternalEncryptedKey();
        key =
          encResp?.data?.encryptedData ||
          encResp?.data?.key ||
          encResp?.data?.apiKey ||
          encResp?.data?.token ||
          (typeof encResp?.data === "string" ? encResp.data : null);
        if (key) {
          setApiKey(key);
        }
      }

      // 2. Fetch consent info with X-Api-Key
      const response = await getDealConsentInfo(token, key);
      const data = response?.data || {};

      if (response?.status === 200) {
        setConsentInfo(data);

        // Check if token is invalid or expired based on server response message
        if (
          data.message &&
          (!data.dealName ||
            data.message.toLowerCase().includes("invalid") ||
            data.message.toLowerCase().includes("expired"))
        ) {
          setError(data.message || "Invalid or expired consent link.");
        } else if (data.alreadyResponded) {
          // Already responded - lock state
          setSelectedChoice(data.consentType || null);
        } else if (initialChoice) {
          setSelectedChoice(initialChoice);
        }
      } else {
        const errorMsg =
          data.message ||
          data.errorMessage ||
          data.error ||
          "Unable to verify consent link. It may be invalid or expired.";
        setError(errorMsg);
      }
    } catch (err) {
      console.error("Error fetching deal consent info:", err);
      setError(
        "Failed to connect to the consent service. Please check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealConsentInfo();
  }, [token]);

  // Handle choice submission
  const handleSubmitConsent = async (choiceToSubmit = selectedChoice) => {
    if (!choiceToSubmit) {
      setSubmitError("Please select an option (Continue or Withdraw) to proceed.");
      return;
    }

    if (!token) {
      setSubmitError("Missing consent token. Cannot submit.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setConfirmModalVisible(false);

    try {
      let key = apiKey;
      if (!key) {
        const encResp = await getExternalEncryptedKey();
        key =
          encResp?.data?.encryptedData ||
          encResp?.data?.key ||
          encResp?.data?.apiKey ||
          encResp?.data?.token ||
          (typeof encResp?.data === "string" ? encResp.data : null);
        if (key) {
          setApiKey(key);
        }
      }

      const response = await recordDealConsent(token, choiceToSubmit, key);
      const resData = response?.data || {};

      if (
        response?.status === 200 ||
        response?.status === 201 ||
        response?.status === 204
      ) {
        // Success
        setSuccessData({
          choice: choiceToSubmit,
          message:
            typeof resData === "string"
              ? resData
              : resData.message ||
                "Your consent response has been successfully registered.",
          timestamp: new Date(),
        });
      } else {
        const errMsg =
          resData.message ||
          resData.errorMessage ||
          resData.error ||
          "Failed to record your consent. Please try again or contact support.";
        setSubmitError(errMsg);
      }
    } catch (err) {
      console.error("Error submitting consent:", err);
      setSubmitError(
        "A network error occurred while submitting your decision. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to format currency
  const renderAmount = (amount) => {
    if (amount == null || amount === "" || isNaN(amount)) return "N/A";
    try {
      return formatAmountWithCommas(amount);
    } catch {
      return `₹${Number(amount).toLocaleString("en-IN")}`;
    }
  };

  // Helper to format date
  const renderDate = (dateVal) => {
    if (!dateVal) return "N/A";
    const m = moment(dateVal);
    return m.isValid() ? m.format("DD-MMM-YYYY") : String(dateVal);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        padding: "32px 16px",
      }}
    >
      {/* Top Header / Branding */}
      <div
        style={{
          maxWidth: 680,
          margin: "0 auto 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <Link to="/" style={{ display: "inline-flex", alignItems: "center" }}>
          <img
            src={oxylogodashboard}
            alt="OxyLoans"
            style={{ height: 42, objectFit: "contain" }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </Link>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "#ffffff",
            padding: "6px 14px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            color: "#1e3a8a",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <SafetyCertificateOutlined style={{ color: "#2563eb", fontSize: 14 }} />
          RBI-Registered NBFC-P2P
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        {/* Loading Spinner */}
        {loading && (
          <Card
            bordered={false}
            style={{
              borderRadius: 16,
              boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
              textAlign: "center",
              padding: "60px 20px",
            }}
          >
            <Spin size="large" />
            <Title level={4} style={{ marginTop: 24, marginBottom: 8, color: "#1e293b" }}>
              Verifying Deal Consent Link...
            </Title>
            <Text type="secondary" style={{ fontSize: 14 }}>
              Please wait while we retrieve your investment and deal details.
            </Text>
          </Card>
        )}

        {/* Error / Expired Link State */}
        {!loading && error && (
          <Card
            bordered={false}
            style={{
              borderRadius: 16,
              boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
              textAlign: "center",
              padding: "40px 24px",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "#fef2f2",
                color: "#ef4444",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 34,
                marginBottom: 20,
              }}
            >
              <ExclamationCircleOutlined />
            </div>

            <Title level={3} style={{ marginBottom: 12, color: "#0f172a" }}>
              Link Expired or Invalid
            </Title>

            <Alert
              type="error"
              showIcon
              message={error}
              style={{
                textAlign: "left",
                marginBottom: 24,
                borderRadius: 8,
                fontSize: 14,
              }}
            />

            <Paragraph style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>
              This deal consent link may have already expired, been completed, or is
              invalid. If you believe this is an error or need assistance with your
              investment decision, please get in touch with our lender support team.
            </Paragraph>

            <Divider style={{ margin: "24px 0" }} />

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchDealConsentInfo}
                style={{ borderRadius: 8 }}
              >
                Retry
              </Button>
              <Link
                to={isLoggedIn ? dashboardLink : "/loginotp"}
                onClick={() => {
                  if (!isLoggedIn) {
                    saveLastVisitedUrl(window.location.pathname, window.location.search);
                  }
                }}
              >
                <Button
                  type="primary"
                  style={{
                    borderRadius: 8,
                    background: "#0040e0",
                    borderColor: "#0040e0",
                  }}
                >
                  {isLoggedIn ? "Go to Dashboard" : "Go to Lender Login"}
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Success State */}
        {!loading && !error && successData && (
          <Card
            bordered={false}
            style={{
              borderRadius: 16,
              boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
              textAlign: "center",
              padding: "40px 24px",
              animation: "fadeIn 0.4s ease",
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background:
                  successData.choice === "CONTINUE" ? "#ecfdf5" : "#eff6ff",
                color:
                  successData.choice === "CONTINUE" ? "#10b981" : "#2563eb",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
                marginBottom: 20,
              }}
            >
              <CheckCircleOutlined />
            </div>

            <Title level={2} style={{ marginBottom: 8, color: "#0f172a", fontSize: 24 }}>
              Consent Recorded Successfully
            </Title>

            <Text style={{ fontSize: 15, color: "#64748b", display: "block", marginBottom: 24 }}>
              Thank you for submitting your decision. Your preference has been locked
              in the OxyLoans platform.
            </Text>

            {/* Receipt Summary Card */}
            <div
              style={{
                background: "#f8fafc",
                borderRadius: 12,
                padding: "20px 24px",
                textAlign: "left",
                marginBottom: 24,
                border: "1px solid #e2e8f0",
              }}
            >
              <Row gutter={[16, 12]}>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Your Decision
                  </Text>
                  <div>
                    {successData.choice === "CONTINUE" ? (
                      <Tag color="success" style={{ fontSize: 13, padding: "2px 10px", fontWeight: 700 }}>
                        <CheckOutlined /> CONTINUE WITH DEAL
                      </Tag>
                    ) : (
                      <Tag color="warning" style={{ fontSize: 13, padding: "2px 10px", fontWeight: 700 }}>
                        <WalletOutlined /> WITHDRAW FROM DEAL
                      </Tag>
                    )}
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Deal Name
                  </Text>
                  <div style={{ fontWeight: 600, color: "#1e293b" }}>
                    {consentInfo?.dealName || "N/A"}
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Lender Name
                  </Text>
                  <div style={{ fontWeight: 600, color: "#1e293b" }}>
                    {consentInfo?.lenderName || "Valued Lender"}
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Participated Amount
                  </Text>
                  <div style={{ fontWeight: 700, color: "#059669", fontSize: 15 }}>
                    {renderAmount(consentInfo?.participatedAmount)}
                  </div>
                </Col>
              </Row>
            </div>

            <Alert
              type="info"
              showIcon
              message={
                successData.choice === "CONTINUE"
                  ? "Your participation will continue in this deal. You will receive regular monthly returns until the end of the revised tenure."
                  : "Your withdrawal request has been registered. Your principal and accrued interest will be credited back to your wallet upon deal maturity."
              }
              style={{ textAlign: "left", marginBottom: 24, borderRadius: 8, fontSize: 13 }}
            />

            <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              <Link to={dashboardLink}>
                <Button
                  type="primary"
                  size="large"
                  style={{
                    borderRadius: 8,
                    background: "#0040e0",
                    borderColor: "#0040e0",
                    padding: "0 28px",
                  }}
                >
                  Go to Dashboard <ArrowRightOutlined />
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Already Responded State */}
        {!loading && !error && !successData && consentInfo?.alreadyResponded && (
          <Card
            bordered={false}
            style={{
              borderRadius: 16,
              boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
              padding: "32px 24px",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "#eff6ff",
                  color: "#2563eb",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  marginBottom: 16,
                }}
              >
                <InfoCircleOutlined />
              </div>
              <Title level={3} style={{ marginBottom: 6, color: "#0f172a" }}>
                Response Already Recorded
              </Title>
              <Text type="secondary" style={{ fontSize: 14 }}>
                You have already submitted your consent response for this deal.
              </Text>
            </div>

            {/* Deal Info Card */}
            <div
              style={{
                background: "#f8fafc",
                borderRadius: 12,
                padding: "20px 24px",
                border: "1px solid #e2e8f0",
                marginBottom: 20,
              }}
            >
              <Row gutter={[16, 14]}>
                <Col span={24} sm={12}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <BankOutlined /> Deal Name
                  </Text>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
                    {consentInfo.dealName || "N/A"}
                  </div>
                </Col>

                <Col span={24} sm={12}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <UserOutlined /> Lender Name
                  </Text>
                  <div style={{ fontWeight: 600, color: "#334155" }}>
                    {consentInfo.lenderName || "N/A"}
                  </div>
                </Col>

                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Participated Amount
                  </Text>
                  <div style={{ fontWeight: 700, color: "#059669", fontSize: 16 }}>
                    {renderAmount(consentInfo.participatedAmount)}
                  </div>
                </Col>

                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <CalendarOutlined /> EMI End Date
                  </Text>
                  <div style={{ fontWeight: 600, color: "#334155" }}>
                    {renderDate(consentInfo.emiEndDate)}
                  </div>
                </Col>

                <Col span={24}>
                  <Divider style={{ margin: "8px 0" }} />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Your Submitted Choice
                  </Text>
                  <div style={{ marginTop: 4 }}>
                    {(consentInfo.consentType || "").toUpperCase() === "CONTINUE" ? (
                      <Tag color="success" style={{ fontSize: 14, padding: "4px 12px", fontWeight: 700 }}>
                        <CheckOutlined /> CONTINUE WITH DEAL
                      </Tag>
                    ) : (consentInfo.consentType || "").toUpperCase() === "WITHDRAW" ? (
                      <Tag color="warning" style={{ fontSize: 14, padding: "4px 12px", fontWeight: 700 }}>
                        <WalletOutlined /> WITHDRAW FROM DEAL
                      </Tag>
                    ) : (
                      <Tag color="blue" style={{ fontSize: 14, padding: "4px 12px", fontWeight: 700 }}>
                        {consentInfo.consentType || "COMPLETED"}
                      </Tag>
                    )}
                  </div>
                </Col>
              </Row>
            </div>

            <Alert
              type="info"
              showIcon
              message="Your response is locked in our records. If you wish to change your decision or have questions, please contact your OxyLoans relationship manager or support."
              style={{ fontSize: 13, borderRadius: 8, marginBottom: 24 }}
            />

            <div style={{ textAlign: "center" }}>
              <Link
                to={isLoggedIn ? dashboardLink : "/loginotp"}
                onClick={() => {
                  if (!isLoggedIn) {
                    saveLastVisitedUrl(window.location.pathname, window.location.search);
                  }
                }}
              >
                <Button
                  type="primary"
                  style={{
                    borderRadius: 8,
                    background: "#0040e0",
                    borderColor: "#0040e0",
                    padding: "0 28px",
                  }}
                >
                  {isLoggedIn ? "Go to Dashboard" : "Go to Lender Login"}
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Active Pending Consent State */}
        {!loading && !error && !successData && consentInfo && !consentInfo.alreadyResponded && (
          <Card
            bordered={false}
            style={{
              borderRadius: 16,
              boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
              padding: "28px 24px",
            }}
          >
            {/* Title & Badge */}
            <div style={{ marginBottom: 20 }}>
              <Tag color="purple" style={{ marginBottom: 8, fontWeight: 600 }}>
                LENDER DEAL CONSENT
              </Tag>
              <Title level={3} style={{ marginBottom: 4, color: "#0f172a" }}>
                Deal Tenure & Extension Consent
              </Title>
              <Text type="secondary" style={{ fontSize: 14 }}>
                Please review your participation details below and choose whether you
                wish to continue with this deal or withdraw your funds at maturity.
              </Text>
            </div>

            {/* Deal Overview Box */}
            <div
              style={{
                background: "#f8fafc",
                borderRadius: 12,
                padding: "20px 24px",
                border: "1px solid #e2e8f0",
                marginBottom: 24,
              }}
            >
              <Row gutter={[16, 14]}>
                <Col span={24} sm={14}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <BankOutlined /> Deal Name
                  </Text>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>
                    {consentInfo.dealName || "Participated Deal"}
                  </div>
                </Col>

                <Col span={24} sm={10}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <UserOutlined /> Lender Name
                  </Text>
                  <div style={{ fontWeight: 600, color: "#334155", fontSize: 14 }}>
                    {consentInfo.lenderName || "Valued Lender"}
                  </div>
                </Col>

                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Participated Amount
                  </Text>
                  <div
                    style={{
                      fontWeight: 800,
                      color: "#059669",
                      fontSize: 18,
                      letterSpacing: "-0.3px",
                    }}
                  >
                    {renderAmount(consentInfo.participatedAmount)}
                  </div>
                </Col>

                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <CalendarOutlined /> EMI End Date
                  </Text>
                  <div style={{ fontWeight: 600, color: "#1e293b", fontSize: 14 }}>
                    {renderDate(consentInfo.emiEndDate)}
                  </div>
                </Col>
              </Row>
            </div>

            {/* Submission Error Banner */}
            {submitError && (
              <Alert
                type="error"
                showIcon
                closable
                message={submitError}
                onClose={() => setSubmitError(null)}
                style={{ marginBottom: 20, borderRadius: 8 }}
              />
            )}

            {/* Choices Options Heading */}
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: 14, color: "#1e293b" }}>
                Select Your Choice:
              </Text>
            </div>

            {/* Choice 1: CONTINUE */}
            <div
              onClick={() => setSelectedChoice("CONTINUE")}
              style={{
                borderRadius: 12,
                border:
                  selectedChoice === "CONTINUE"
                    ? "2px solid #10b981"
                    : "1px solid #cbd5e1",
                background:
                  selectedChoice === "CONTINUE" ? "#ecfdf5" : "#ffffff",
                padding: "16px 18px",
                marginBottom: 14,
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow:
                  selectedChoice === "CONTINUE"
                    ? "0 4px 14px rgba(16, 185, 129, 0.15)"
                    : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    border:
                      selectedChoice === "CONTINUE"
                        ? "6px solid #10b981"
                        : "2px solid #94a3b8",
                    background: "#ffffff",
                    marginTop: 2,
                    flexShrink: 0,
                    transition: "all 0.2s ease",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                        color:
                          selectedChoice === "CONTINUE" ? "#065f46" : "#0f172a",
                      }}
                    >
                      CONTINUE WITH DEAL
                    </span>
                    <Tag color="success" style={{ fontWeight: 600 }}>
                      Keep Earning Returns
                    </Tag>
                  </div>
                  <Paragraph
                    style={{
                      margin: "6px 0 0",
                      fontSize: 13,
                      color:
                        selectedChoice === "CONTINUE" ? "#047857" : "#64748b",
                      lineHeight: 1.5,
                    }}
                  >
                    Continue your participation in this deal and keep earning
                    monthly interest returns until the extended tenure completion.
                  </Paragraph>
                </div>
              </div>
            </div>

            {/* Choice 2: WITHDRAW */}
            <div
              onClick={() => setSelectedChoice("WITHDRAW")}
              style={{
                borderRadius: 12,
                border:
                  selectedChoice === "WITHDRAW"
                    ? "2px solid #f59e0b"
                    : "1px solid #cbd5e1",
                background:
                  selectedChoice === "WITHDRAW" ? "#fffbeb" : "#ffffff",
                padding: "16px 18px",
                marginBottom: 24,
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow:
                  selectedChoice === "WITHDRAW"
                    ? "0 4px 14px rgba(245, 158, 11, 0.15)"
                    : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    border:
                      selectedChoice === "WITHDRAW"
                        ? "6px solid #f59e0b"
                        : "2px solid #94a3b8",
                    background: "#ffffff",
                    marginTop: 2,
                    flexShrink: 0,
                    transition: "all 0.2s ease",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                        color:
                          selectedChoice === "WITHDRAW" ? "#92400e" : "#0f172a",
                      }}
                    >
                      WITHDRAW FROM DEAL
                    </span>
                    <Tag color="warning" style={{ fontWeight: 600 }}>
                      Return Principal to Wallet
                    </Tag>
                  </div>
                  <Paragraph
                    style={{
                      margin: "6px 0 0",
                      fontSize: 13,
                      color:
                        selectedChoice === "WITHDRAW" ? "#b45309" : "#64748b",
                      lineHeight: 1.5,
                    }}
                  >
                    Withdraw your participation. Your principal investment and
                    earned returns will be credited back to your OxyLoans wallet at
                    maturity.
                  </Paragraph>
                </div>
              </div>
            </div>

            {/* Confirm Submit Action Button */}
            <div style={{ textAlign: "center" }}>
              <Button
                type="primary"
                size="large"
                loading={submitting}
                disabled={!selectedChoice || submitting}
                onClick={() => setConfirmModalVisible(true)}
                style={{
                  width: "100%",
                  height: 48,
                  borderRadius: 10,
                  fontSize: 16,
                  fontWeight: 600,
                  background:
                    selectedChoice === "CONTINUE"
                      ? "#10b981"
                      : selectedChoice === "WITHDRAW"
                      ? "#f59e0b"
                      : "#0040e0",
                  borderColor:
                    selectedChoice === "CONTINUE"
                      ? "#10b981"
                      : selectedChoice === "WITHDRAW"
                      ? "#f59e0b"
                      : "#0040e0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                {selectedChoice
                  ? `Confirm & Submit Choice (${selectedChoice})`
                  : "Please Select an Option Above"}
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Confirmation Safeguard Modal */}
      <Modal
        title={
          <span style={{ fontSize: 16, fontWeight: 700 }}>
            {selectedChoice === "CONTINUE" ? (
              <span style={{ color: "#059669" }}>
                <CheckCircleOutlined /> Confirm Continue Decision
              </span>
            ) : (
              <span style={{ color: "#d97706" }}>
                <WalletOutlined /> Confirm Withdrawal Decision
              </span>
            )}
          </span>
        }
        open={confirmModalVisible}
        onCancel={() => setConfirmModalVisible(false)}
        confirmLoading={submitting}
        onOk={() => handleSubmitConsent(selectedChoice)}
        okText={
          selectedChoice === "CONTINUE"
            ? "Yes, Continue Participation"
            : "Yes, Withdraw Funds"
        }
        okButtonProps={{
          style: {
            background: selectedChoice === "CONTINUE" ? "#10b981" : "#f59e0b",
            borderColor: selectedChoice === "CONTINUE" ? "#10b981" : "#f59e0b",
            fontWeight: 600,
          },
        }}
        cancelText="Review Again"
      >
        <div style={{ padding: "12px 0" }}>
          <Paragraph style={{ fontSize: 14, color: "#334155" }}>
            Are you sure you want to record your choice as{" "}
            <strong style={{ color: selectedChoice === "CONTINUE" ? "#059669" : "#d97706" }}>
              {selectedChoice}
            </strong>{" "}
            for deal <strong>{consentInfo?.dealName || "this deal"}</strong>?
          </Paragraph>
          <div
            style={{
              background: "#f8fafc",
              padding: "12px 16px",
              borderRadius: 8,
              fontSize: 13,
              color: "#64748b",
            }}
          >
            <div>
              <strong>Lender:</strong> {consentInfo?.lenderName || "N/A"}
            </div>
            <div>
              <strong>Amount:</strong> {renderAmount(consentInfo?.participatedAmount)}
            </div>
            <div>
              <strong>EMI End Date:</strong> {renderDate(consentInfo?.emiEndDate)}
            </div>
          </div>
          <Paragraph style={{ fontSize: 12, color: "#94a3b8", marginTop: 12, marginBottom: 0 }}>
            * Note: Once submitted, your consent will be locked in the OxyLoans platform.
          </Paragraph>
        </div>
      </Modal>

      {/* Footer */}
      <div
        style={{
          maxWidth: 680,
          margin: "32px auto 0",
          textAlign: "center",
          fontSize: 12,
          color: "#94a3b8",
          lineHeight: 1.6,
        }}
      >
        <div>
          OxyLoans Marketplace Pvt. Ltd. | RBI Certificate of Registration: N-09.00447
        </div>
        <div style={{ marginTop: 4 }}>
          Need assistance? Contact us at{" "}
          <a href="mailto:support@oxyloans.com" style={{ color: "#2563eb" }}>
            support@oxyloans.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default DealConsent;
