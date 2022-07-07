import { useEffect, useState } from "react";
import { getJBDirectory, getJBSingleTokenPaymentTerminalStore } from "juice-sdk";

export default function useJuiceBoxBalance({ provider, projectId }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState();
  const [error, setError] = useState();

  useEffect(() => {
    async function getBalance(projectId) {
      const terminals = await getJBDirectory(provider).terminalsOf(projectId);
      const primaryTerminal = terminals[0];

      const balance = await getJBSingleTokenPaymentTerminalStore(provider).balanceOf(primaryTerminal, projectId);

      return balance;
    }

    setLoading(true);

    getBalance(projectId)
      .then(balance => {
        setLoading(false);
        setData(balance);
      })
      .catch(e => {
        setError(e);
      });
  }, [provider, projectId]);

  return { loading, data, error };
}
