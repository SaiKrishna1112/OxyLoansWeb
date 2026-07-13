import React from "react";

const SearchBar = ({ value, onChange, placeholder = "Search..." }) => (
  <input
    type="search"
    className="form-control"
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
  />
);

export default SearchBar;
