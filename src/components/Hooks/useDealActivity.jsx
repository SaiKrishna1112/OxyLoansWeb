import React, { useEffect, useState } from "react";
import { getactivityApisData } from "../HttpRequest/afterlogin";

const useDealActivity = () => {
  const [activitydata, setActivityData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const response = await getactivityApisData();
      setActivityData(response.data);
    }
    fetchData();
  }, []);

  return { activitydata };
};

export default useDealActivity;
