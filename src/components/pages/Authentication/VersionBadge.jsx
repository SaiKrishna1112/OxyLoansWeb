import React, { useEffect, useRef, useState } from "react";
import FeatherIcon from "feather-icons-react";
import { APP_VERSION } from "../../../version";

export default function VersionBadge() {
  const [checking, setChecking] = useState(false);
  const [serverVersion, setServerVersion] = useState(null);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const containerRef = useRef(null);

  const checkForUpdate = async () => {
    setChecking(true);
    try {
      const res = await fetch(`/version.json?_t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setServerVersion(data);
        if (data.buildCode && data.buildCode !== APP_VERSION.buildCode) {
          setHasUpdate(true);
        } else {
          setHasUpdate(false);
        }
      }
    } catch (e) {
      // offline or version.json unreachable, fallback to bundled version
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkForUpdate();
  }, []);

  // Close details popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDetails(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleForceUpdate = () => {
    if (window.caches) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
    // Hard refresh to fetch latest deployed bundle
    window.location.reload(true);
  };

  return (
    <div className="login-version-container" ref={containerRef}>
      {hasUpdate ? (
        <button
          type="button"
          className="login-version-badge update-available"
          onClick={handleForceUpdate}
          title="A newer version was deployed! Click to reload."
        >
          <span className="version-dot pulse-amber" />
          <span>New Version ({serverVersion?.version || "Latest"}) Available • Tap to Update</span>
          <FeatherIcon icon="rotate-cw" size={11} />
        </button>
      ) : (
        <div
          className="login-version-badge"
          onClick={() => setShowDetails((prev) => !prev)}
          title="Click to view version details"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setShowDetails((prev) => !prev);
          }}
        >
          <span className="version-dot green" />
          <span className="version-code-text">v{APP_VERSION.version} ({APP_VERSION.buildCode})</span>
          <span className="version-status-text">• {checking ? "Checking..." : "Latest"}</span>
          <button
            type="button"
            className="version-refresh-btn"
            onClick={(e) => {
              e.stopPropagation();
              checkForUpdate();
            }}
            title="Check if latest version is updated"
          >
            <FeatherIcon
              icon="refresh-cw"
              size={10}
              className={checking ? "version-spin" : ""}
            />
          </button>
        </div>
      )}

      {showDetails && (
        <div className="login-version-details-popover">
          <div className="version-popover-header">
            <strong>Application Info</strong>
            <button
              type="button"
              className="version-popover-close"
              onClick={() => setShowDetails(false)}
            >
              ×
            </button>
          </div>
          <div className="version-detail-row">
            <span>Version:</span>
            <strong>v{APP_VERSION.version}</strong>
          </div>
          <div className="version-detail-row">
            <span>Build Code:</span>
            <strong>{APP_VERSION.buildCode}</strong>
          </div>
          {/* {APP_VERSION.gitCommit && (
            <div className="version-detail-row">
              <span>Commit:</span>
              <strong>{APP_VERSION.gitCommit}</strong>
            </div>
          )} */}
          <div className="version-detail-row">
            <span>Build Date:</span>
            <strong>{APP_VERSION.buildDate}</strong>
          </div>
          <div className="version-detail-row">
            <span>Status:</span>
            <strong style={{ color: hasUpdate ? "#ea580c" : "#16a34a" }}>
              {hasUpdate ? "Update Available" : "Up to date (Latest)"}
            </strong>
          </div>
          <button
            type="button"
            className="version-force-reload-btn"
            onClick={handleForceUpdate}
          >
            <FeatherIcon icon="rotate-cw" size={12} />
            <span>Force Reload &amp; Clear Cache</span>
          </button>
        </div>
      )}
    </div>
  );
}
