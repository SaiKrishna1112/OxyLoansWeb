import React from "react";

class DashboardErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="alert alert-danger m-3">
          <strong>Dashboard section failed to load.</strong>
          <div className="small mt-1">{this.state.error.message}</div>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger mt-2"
            onClick={() => this.setState({ error: null })}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default DashboardErrorBoundary;