import { useState, useCallback } from "react";

const useOfferApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiFn, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn(...args);
      return result;
    } catch (err) {
      setError(err.message || "Something went wrong");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { loading, error, execute, clearError, setError };
};

export default useOfferApi;
