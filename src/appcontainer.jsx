import React from "react";
import { createBrowserRouter } from "react-router-dom";

const CreateDeal = React.lazy(() =>
  import("./components/pages/Oxyloans/Admin/Deals/CreateDeal/CreateDeal")
);
const EscrowDeals = React.lazy(() =>
  import("./components/pages/Oxyloans/Admin/Deals/EscrowDeals/EscrowDeals")
);

const MainAdminDashboard = React.lazy(() =>
  import("./components/pages/Oxyloans/Admin/MainAdminDashboard")
);
const Whatapploginwith = React.lazy(() =>
  import("./components/pages/Authentication/Whatapploginwith")
);

const Whatappuser = React.lazy(() =>
  import("./components/pages/Authentication/Whatappuser")
);

const TestDeals = React.lazy(() =>
  import("./components/pages/Oxyloans/Admin/Deals/TestDeals/TestDeals")
);

const ViewCurrentDayDeals = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/ViewCurrentDayDeals")
);

const ViewDeals = React.lazy(() =>
  import("./components/pages/Oxyloans/Admin/Deals/CreateDeal/ViewDeals")
);

const TestDeal = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/TestDeal")
);

const Login = React.lazy(() => import("./components/pages/Authentication"));

const Participatedeal = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/Participatedeal")
);
const Admlogin = React.lazy(() =>
  import("./components/pages/Authentication/Admlogin")
);

const Membership = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/Membership")
);

const Spining = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/Spining")
);

const Loginotp = React.lazy(() =>
  import("./components/pages/Authentication/Loginotp")
);

const Register = React.lazy(() =>
  import("./components/pages/Authentication/Register")
);
const ForgotPassword = React.lazy(() =>
  import("./components/pages/Authentication/ForgotPassword")
);
const Error404 = React.lazy(() =>
  import("./components/pages/Authentication/Error-404")
);
const ConfigautoInvest = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/ConfigautoInvest")
);

const AdminDashboard = React.lazy(() =>
  import("./components/pages/Dashboard/AdminDashboard")
);

const EarningCertificate = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/EarningCertificate")
);

const Emicalculator = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/Emicalculator")
);
const LoadwaletThroughQr = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/LoadwaletThroughQr")
);
const LoadwalletThroughVirtualAccount = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/LoadwalletThroughVirtualAccount")
);
const LoanListings = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/LoanListings")
);
const MyclosedDeals = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/MyclosedDeals")
);
const Mycontacts = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/Mycontacts")
);
const MyEarnings = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/MyEarnings")
);
const MyhighvalueDeals = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/MyhighvalueDeals")
);
const Myholdamount = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/Myholdamount")
);
const MyinterestEarning = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/MyinterestEarning")
);
const MyloansStatement = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/MyloansStatement")
);
const MypartiallClosedDeal = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/MypartiallClosedDeal")
);
const MyreferalStatus = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/MyreferalStatus")
);
const myRunningDeals = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/myRunningDeals")
);
const ReferaFriend = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/ReferaFriend")
);

const RegularEscrowDeals = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/RegularEscrowDeals")
);
const RegularPersonalDeal = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/RegularPersonalDeal")
);
const RegularRunningDeal = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/RegularRunningDeal")
);
const TransferWalletToWallet = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/TransferWalletToWallet")
);
const ViewAutoHistory = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/ViewAutoHistory")
);
const ViewTicketHistory = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/ViewTicketHistory")
);
const WalletToWallet = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/WalletToWallet")
);
const WithdrawdealfromDeal = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/WithdrawdealfromDeal")
);
const Withdrawdealfromwallet = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/Withdrawdealfromwallet")
);
const Writetous = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/Writetous")
);

const WithdrawalFromWallet = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/WithdrawalFromWallet")
);

const WithdrawdealFounds = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/WithdrawdealFounds")
);

const MembershipHistory = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/MembershipHistory")
);

const Mytransactions = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/Mytransactions")
);

const WalletToWalletHistory = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/WalletToWalletHistory")
);
const AutoInvestHistory = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/AutoInvestHistory")
);

const DashboardTransactions = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/DashboardTransactions")
);

const LenderRegister = React.lazy(() =>
  import("./components/pages/Authentication/LenderRegister")
);

const BorrowerRegister = React.lazy(() =>
  import("./components/pages/Authentication/BorrowerRegister")
);

const Register_active_proceed = React.lazy(() =>
  import("./components/pages/Authentication/register_active_proceed")
);

const ForgotPassword3 = React.lazy(() =>
  import("./components/pages/Authentication/ForgotPassword3")
);

const Whatapplog = React.lazy(() =>
  import("./components/pages/Authentication/Whatapplog")
);

const PartnerRegister = React.lazy(() =>
  import("./components/pages/Authentication/PartnerRegister")
);

const Profile = React.lazy(() => import("./components/pages/Blog/Profile"));

const TicketHistory = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/TicketHistory")
);

const MywithdrawalHistory = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/MywithdrawalHistory")
);

const WalletToWalletTransactionHistory = React.lazy(() =>
  import("./components/pages/Oxyloans/Lender/WalletToWalletTransactionHistory")
);

const BorrowerDashboard = React.lazy(() =>
  import("./components/pages/Dashboard/BorrowerDashboard")
);

const BorrowerProfile = React.lazy(() =>
  import("./components/pages/Oxyloans/Borrower/BorrowerProfile")
);

const BorrowerAgreedLoans = React.lazy(() =>
  import("./components/pages/Oxyloans/Borrower/AgreedLoan")
);

const BorrowerEnach = React.lazy(() =>
  import("./components/pages/Oxyloans/Borrower/Enach")
);

const BorrowerLoanEligibility = React.lazy(() =>
  import("./components/pages/Oxyloans/Borrower/LoanEligibility")
);

const BorrowerLoanListing = React.lazy(() =>
  import("./components/pages/Oxyloans/Borrower/LoanListings")
);

const BorrowerLoanstatement = React.lazy(() =>
  import("./components/pages/Oxyloans/Borrower/LoanStatement")
);

const Borrowermycontacts = React.lazy(() =>
  import("./components/pages/Oxyloans/Borrower/Mycontacts")
);
const BorrowerMyEarnings = React.lazy(() =>
  import("./components/pages/Oxyloans/Borrower/MyEarnings")
);

const BorrowerMyLoanApplication = React.lazy(() =>
  import("./components/pages/Oxyloans/Borrower/MyLoanApplication")
);

const BorrowerPayEmi = React.lazy(() =>
  import("./components/pages/Oxyloans/Borrower/PayEmi")
);

const BorrowerReferFriend = React.lazy(() =>
  import("./components/pages/Oxyloans/Borrower/ReferFriend")
);

const BorrowerReferStatus = React.lazy(() =>
  import("./components/pages/Oxyloans/Borrower/ReferralStatus")
);

const BorrowerRunningLoans = React.lazy(() =>
  import("./components/pages/Oxyloans/Borrower/RunningLoan")
);

const BorrowerWriteTous = React.lazy(() =>
  import("./components/pages/Oxyloans/Borrower/BorrowerWriteToUs")
);

const BorrowerEmiCalculator = React.lazy(() =>
  import("./components/pages/Oxyloans/Borrower/BorrowerEmaicalculator")
);
const BorrowerTicketHistory = React.lazy(() =>
  import("./components/pages/Oxyloans/Borrower/ViewTicketHistory")
);

export const newRouter = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
    errorElement: <Error404></Error404>,
  },

  {
    path: "/dashboard",
    element: <AdminDashboard />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/loadwaletThroughQr",
    element: <LoadwaletThroughQr />,
    errorElement: <Error404></Error404>,
  },

  {
    path: "/loginotp",
    element: <Loginotp />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/register",
    element: <LenderRegister />,
    errorElement: <Error404></Error404>,
  },

  {
    path: "/borrower_register",
    element: <BorrowerRegister />,
    errorElement: <Error404></Error404>,
  },

  {
    path: "/register_active_proceed",
    element: <Register_active_proceed />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/profile",
    element: <Profile />,
    errorElement: <Error404></Error404>,
  },

  {
    path: "/forgotpassword",
    element: <ForgotPassword3 />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/partnerRegister",
    element: <PartnerRegister />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/escrowDeals",
    element: <EscrowDeals />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/loadwalletThroughVirtualAccount",
    element: <LoadwalletThroughVirtualAccount />,
    errorElement: <Error404></Error404>,
  },

  {
    path: "/withdrawdealfromwallet",
    element: <Withdrawdealfromwallet />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/mainadmindashboard",
    element: <MainAdminDashboard />,
    errorElement: <Error404></Error404>,
  },

  {
    path: "/walletToWalletHistory",
    element: <WalletToWalletHistory />,
    errorElement: <Error404></Error404>,
  },

  {
    path: "/viewdeals",
    element: <ViewDeals />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/escrowDeals",
    element: <EscrowDeals />,
    errorElement: <Error404></Error404>,
  },

  {
    path: "/testDeals",
    element: <TestDeals />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/spining",
    element: <Spining />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/admlogin",
    element: <Admlogin />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/withdrawdealfromDeal",
    element: <WithdrawdealfromDeal />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/transferWalletToWallet",
    element: <TransferWalletToWallet />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/mywithdrawalHistory",
    element: <MywithdrawalHistory />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/writetous",
    element: <Writetous />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/viewTicketHistory",
    element: <ViewTicketHistory />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/viewCurrentDayDeals",
    element: <ViewCurrentDayDeals />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/todaydeal",
    element: <Todaydeal />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/emicalculator",
    element: <Emicalculator />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/configautoInvest",
    element: <ConfigautoInvest />,
    errorElement: <Error404></Error404>,
  },

  {
    path: "/membership",
    element: <Membership />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/viewAutoHistory",
    element: <ViewAutoHistory />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/participatedeal",
    element: <Participatedeal />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/regularRunningDeal",
    element: <RegularRunningDeal />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/testDeal",
    element: <TestDeal />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/regularEscrowDeals",
    element: <RegularEscrowDeals />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/regularPersonalDeal",
    element: <RegularPersonalDeal />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/myRunningDeals",
    element: <myRunningDeals />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/myclosedDeals",
    element: <MyclosedDeals />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/myholdamount",
    element: <Myholdamount />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/mypartiallClosedDeal",
    element: <MypartiallClosedDeal />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/ticketHistory",
    element: <TicketHistory />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/myinterestEarning",
    element: <MyinterestEarning />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/myhighvalueDeals",
    element: <MyhighvalueDeals />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/earningCertificate",
    element: <EarningCertificate />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/myloansStatement",
    element: <MyloansStatement />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/referaFriend",
    element: <ReferaFriend />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/myreferalStatus",
    element: <MyreferalStatus />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/mycontacts",
    element: <Mycontacts />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/walletToWalletHistory",
    element: <WalletToWalletHistory />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/myEarnings",
    element: <MyEarnings />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/loanListings",
    element: <LoanListings />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/WalletToWallet",
    element: <WalletToWallet />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/withdrawalFromWallet",
    element: <WithdrawalFromWallet />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/withdrawdealFounds",
    element: <WithdrawdealFounds />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/membershipHistory",
    element: <MembershipHistory />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/mytransactions",
    element: <Mytransactions />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/autoInvestHistory",
    element: <AutoInvestHistory />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/dashboardTransactions",
    element: <DashboardTransactions />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/whatappuser",
    element: <Whatappuser />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/loadwalletThroughVirtualAccount",
    element: <LoadwalletThroughVirtualAccount />,
    errorElement: <Error404></Error404>,
  },

  {
    path: "/whatsapplogin",
    element: <Whatapplog />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/whatapploginwith",
    element: <Whatapploginwith />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/walletToWalletTransactionHistory",
    element: <WalletToWalletTransactionHistory />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/borrowerDashboard",
    element: <BorrowerDashboard />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/borrowerProfile",
    element: <BorrowerProfile />,
    errorElement: <Error404></Error404>,
  },

  {
    path: "/borrowerAgreedLoans",
    element: <BorrowerAgreedLoans />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/borrowerenach",
    element: <BorrowerEnach />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/borrowerLoaneligibility",
    element: <BorrowerLoanEligibility />,
    errorElement: <Error404></Error404>,
  },

  {
    path: "/borrowerloanListing",
    element: <BorrowerLoanListing />,
    errorElement: <Error404></Error404>,
  },

  {
    path: "/borrowerloanstatement",
    element: <BorrowerLoanstatement />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/borrowermycontacts",
    element: <Borrowermycontacts />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/borrowermyearnings",
    element: <BorrowerMyEarnings />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/borrowermyloanApplication",
    element: <BorrowerMyLoanApplication />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/borrowerpayemi",
    element: <BorrowerPayEmi />,
    errorElement: <Error404></Error404>,
  },

  {
    path: "/borrowerreferfriend",
    element: <BorrowerReferFriend />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/borrowerreferstatus",
    element: <BorrowerReferStatus />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/borrowerrunningLoans",
    element: <BorrowerRunningLoans />,
    errorElement: <Error404></Error404>,
  },

  {
    path: "/borrowerwriteTous",
    element: <BorrowerWriteTous />,
    errorElement: <Error404></Error404>,
  },
  {
    path: "/borroweremicalculator",
    element: <BorrowerEmiCalculator />,
    errorElement: <Error404></Error404>,
  },

  {
    path: "/borrowerTicketHistory",
    element: <BorrowerTicketHistory />,
    errorElement: <Error404></Error404>,
  },
]);
