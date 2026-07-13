/** Static payment deals for demo / API fallback */

const addDays = (base, n) => {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
};

const fmtPaymentDate = (d) => {
  const day = d.getDate();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}-${d.getFullYear()}`;
};

const fmtLabel = (d) =>
  d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

export const buildStaticPaymentsData = (daysAhead = 3) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const payments = [];

  for (let i = 0; i < daysAhead; i += 1) {
    const date = addDays(today, i);
    payments.push({
      paymentDate: fmtPaymentDate(date),
      dateLabel: fmtLabel(date),
      dealCount: 3 + i,
      totalAmount: 1250000 + i * 450000,
      deals: [
        { dealId: 1001 + i, dealName: `Demo Deal ${i + 1}`, amount: 450000, borrowerName: "Demo Borrower" },
        { dealId: 2001 + i, dealName: `Demo Deal ${i + 2}`, amount: 380000, borrowerName: "Sample Borrower" },
      ],
    });
  }

  return {
    daysAhead,
    fromDate: fmtPaymentDate(today),
    toDate: fmtPaymentDate(addDays(today, daysAhead - 1)),
    totalDeals: payments.reduce((n, p) => n + p.dealCount, 0),
    payments,
    source: "static-demo",
  };
};
