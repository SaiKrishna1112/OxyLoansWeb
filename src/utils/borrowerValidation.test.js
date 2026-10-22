import { isBankNameMatching } from "./borrowerValidation";

describe("isBankNameMatching", () => {
  test.each([
    ["ORSU PRASAD", "ORSU PRASAD"],
    ["ORSU PRASAD", "orsu prasad"],
    ["ORSU PRASAD", "  ORSU   PRASAD  "],
    ["ORSU PRASAD", "PRASAD ORSU"],
    ["MARY ANN ELIZABETH", "ELIZABETH MARY ANN"],
  ])("matches legitimate name variation: %s / %s", (registeredName, bankName) => {
    expect(isBankNameMatching(bankName, registeredName)).toBe(true);
  });

  test.each([
    ["ORSU PRASAD", "QA TESTER"],
    ["MARY ANN ELIZABETH", "MARY JANE"],
  ])("rejects a genuine mismatch: %s / %s", (registeredName, bankName) => {
    expect(isBankNameMatching(bankName, registeredName)).toBe(false);
  });

  test("does not depend on a previous borrower value", () => {
    const firstBorrower = "ORSU PRASAD";
    const secondBorrower = "QA TESTER";

    expect(isBankNameMatching("ORSU PRASAD", firstBorrower)).toBe(true);
    expect(isBankNameMatching("ORSU PRASAD", secondBorrower)).toBe(false);
  });
});
