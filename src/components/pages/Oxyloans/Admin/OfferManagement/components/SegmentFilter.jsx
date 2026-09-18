import React from "react";
import { OFFER_SEGMENTS } from "../utils/offerConstants";

const SegmentFilter = ({ value, onChange, className = "" }) => (
  <select
    className={`form-select ${className}`}
    value={value}
    onChange={(e) => onChange(e.target.value)}
  >
    <option value="">All Segments</option>
    {OFFER_SEGMENTS.map((s) => (
      <option key={s.value} value={s.value}>
        {s.label}
      </option>
    ))}
  </select>
);

export default SegmentFilter;
