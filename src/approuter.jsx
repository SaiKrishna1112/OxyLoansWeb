import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import EscrowDeals from "./components/pages/Oxyloans/Admin/Deals/EscrowDeals/EscrowDeals";
import UserType from "./components/pages/Authentication/UserType.jsx";
import Login from "./components/pages/Authentication";
import AdminDashboard from "./components/pages/Dashboard/AdminDashboard";
import MainAdminDashboard from "./components/pages/Oxyloans/Admin/MainAdminDashboard";
import OxyloansAdminDashboard from "./components/pages/Dashboard/OxyloansAdminDashboard";

import TestDeals from "./components/pages/Oxyloans/Admin/Deals/TestDeals/TestDeals";
import ViewCurrentDayDeals from "./components/pages/Oxyloans/Lender/ViewCurrentDayDeals";
import ViewDeals from "./components/pages/Oxyloans/Admin/Deals/CreateDeal/ViewDeals";
import UserTestdeals from "./components/pages/Oxyloans/Lender/TestDeal";
import Participatedeal from "./components/pages/Oxyloans/Lender/Participatedeal";
import Admlogin from "./components/pages/Authentication/Admlogin";
import Membership from "./components/pages/Oxyloans/Lender/Membership";
import Spining from "./components/pages/Oxyloans/Lender/Spining";
import Loginotp from "./components/pages/Authentication/Loginotp";
import ConfigautoInvest from "./components/pages/Oxyloans/Lender/ConfigautoInvest";
import EarningCertificate from "./components/pages/Oxyloans/Lender/EarningCertificate";
import Emicalculator from "./components/pages/Oxyloans/Lender/Emicalculator";
import LoadwaletThroughQr from "./components/pages/Oxyloans/Lender/LoadwaletThroughQr";
import LoadwalletThroughVirtualAccount from "./components/pages/Oxyloans/Lender/LoadwalletThroughVirtualAccount";
import LoanListings from "./components/pages/Oxyloans/Lender/LoanListings";
import MyclosedDeals from "./components/pages/Oxyloans/Lender/MyclosedDeals";
import Mycontacts from "./components/pages/Oxyloans/Lender/Mycontacts";
import MyEarnings from "./components/pages/Oxyloans/Lender/MyEarnings";
import MyhighvalueDeals from "./components/pages/Oxyloans/Lender/MyhighvalueDeals";
import Myholdamount from "./components/pages/Oxyloans/Lender/Myholdamount";
import MyinterestEarning from "./components/pages/Oxyloans/Lender/MyinterestEarning";
import MyloansStatement from "./components/pages/Oxyloans/Lender/MyloansStatement";
import MypartiallClosedDeal from "./components/pages/Oxyloans/Lender/MypartiallClosedDeal";
import MyreferalStatus from "./components/pages/Oxyloans/Lender/MyreferalStatus";
import ReferalEaringsMonthWise from "./components/pages/Oxyloans/Lender/ReferalEaringsMonthWise.jsx";
import MyRunningDeals from "./components/pages/Oxyloans/Lender/MyRunningDelas";
import ReferaFriend from "./components/pages/Oxyloans/Lender/ReferaFriend";
import RegularRunningDeal from "./components/pages/Oxyloans/Lender/RegularRunningDeal";
import TransferWalletToWallet from "./components/pages/Oxyloans/Lender/TransferWalletToWallet";
import ViewAutoHistory from "./components/pages/Oxyloans/Lender/ViewAutoHistory";
import ViewTicketHistory from "./components/pages/Oxyloans/Lender/ViewTicketHistory";
import WalletToWallet from "./components/pages/Oxyloans/Lender/WalletToWallet";
import WithdrawdealfromDeal from "./components/pages/Oxyloans/Lender/WithdrawdealfromDeal";
import Withdrawdealfromwallet from "./components/pages/Oxyloans/Lender/Withdrawdealfromwallet";
import Writetous from "./components/pages/Oxyloans/Lender/Writetous";
import WithdrawalFromWallet from "./components/pages/Oxyloans/Lender/WithdrawalFromWallet";
import WithdrawdealFounds from "./components/pages/Oxyloans/Lender/WithdrawdealFounds";
import MembershipHistory from "./components/pages/Oxyloans/Lender/MembershipHistory";
import Mytransactions from "./components/pages/Oxyloans/Lender/Mytransactions";
import WalletToWalletHistory from "./components/pages/Oxyloans/Lender/WalletToWalletHistory";
import AutoInvestHistory from "./components/pages/Oxyloans/Lender/AutoInvestHistory";
import DashboardTransactions from "./components/pages/Oxyloans/Lender/DashboardTransactions";
import LenderRegister from "./components/pages/Authentication/LenderRegister";
import BorrowerRegister from "./components/pages/Authentication/BorrowerRegister";
import Register_active_proceed from "./components/pages/Authentication/register_active_proceed";
import ForgotPassword3 from "./components/pages/Authentication/ForgotPassword3";
import Whatapplog from "./components/pages/Authentication/Whatapplog";
import PartnerRegister from "./components/pages/Authentication/PartnerRegister";
import Profile from "./components/pages/Blog/Profile";
import TicketHistory from "./components/pages/Oxyloans/Lender/TicketHistory";
import MywithdrawalHistory from "./components/pages/Oxyloans/Lender/MywithdrawalHistory";
import WalletToWalletTransactionHistory from "./components/pages/Oxyloans/Lender/WalletToWalletTransactionHistory";
import RegularEscrowDeals from "./components/pages/Oxyloans/Lender/RegularEscrowDeals";

import Whatappuser from "./components/pages/Authentication/Whatappuser";
import BorrowerDashboard from "./components/pages/Dashboard/BorrowerDashboard";
import BorrowerProfile from "./components/pages/Oxyloans/Borrower/BorrowerProfile";
import BorrowerAgreedLoans from "./components/pages/Oxyloans/Borrower/AgreedLoan";
import BorrowerEnach from "./components/pages/Oxyloans/Borrower/Enach";
import BorrowerLoanEligibility from "./components/pages/Oxyloans/Borrower/LoanEligibility";
import BorrowerLoanListing from "./components/pages/Oxyloans/Borrower/LoanListings";
import BorrowerLoanstatement from "./components/pages/Oxyloans/Borrower/LoanStatement";
import Borrowermycontacts from "./components/pages/Oxyloans/Borrower/Mycontacts";
import BorrowerMyEarnings from "./components/pages/Oxyloans/Borrower/MyEarnings";
import BorrowerMyLoanApplication from "./components/pages/Oxyloans/Borrower/MyLoanApplication";
import BorrowerPayEmi from "./components/pages/Oxyloans/Borrower/PayEmi";
import BorrowerReferFriend from "./components/pages/Oxyloans/Borrower/ReferFriend";
import BorrowerReferStatus from "./components/pages/Oxyloans/Borrower/ReferralStatus";
import BorrowerRunningLoans from "./components/pages/Oxyloans/Borrower/RunningLoan";
import BorrowerWriteTous from "./components/pages/Oxyloans/Borrower/BorrowerWriteToUs";
import BorrowerEmiCalculator from "./components/pages/Oxyloans/Borrower/BorrowerEmaicalculator";
import BorrowerTicketHistory from "./components/pages/Oxyloans/Borrower/ViewTicketHistory";

import LoanRequest from "./components/pages/Oxyloans/Borrower/LoanRequest.jsx";
import ForgotPassword from "./components/pages/Authentication/ForgotPassword.jsx";
import Mycontacts1 from "./components/pages/Oxyloans/Lender/Mycontacts1.jsx";
import Todaydeal from "./components/pages/Oxyloans/Lender/Todaydeal.jsx";
import Testdeal1 from "./components/pages/Oxyloans/Lender/Testdeal1.jsx";
import PartnerLogin from "./components/pages/Authentication/PartnerLogin.jsx";
import Patnerdashboard from "./components/pages/Dashboard/Patnerdashboard.jsx";
import Partneraccept from "./components/pages/Oxyloans/Partner/Partneraccept.jsx";
import PartnerrequestInfo from "./components/pages/Oxyloans/Partner/PartnerrequestInfo.jsx";
import GetListOfBorrowerDetails from "./components/pages/Oxyloans/Partner/GetListOfBorrowerDetails.jsx";
import Fileconvension from "./components/pages/Oxyloans/Lender/Fileconvension.jsx";
import Updatekyc from "./components/pages/Oxyloans/Borrower/Updatekyc.jsx";
import InterestsDateWise from "./components/pages/Oxyloans/Lender/InterestsDateWise.jsx";

import EMI from "./components/pages/Oxyloans/Admin/Admin Dashboard/EMI.js";
import AddBorrower from "./components/pages/Oxyloans/Admin/Admin Dashboard/AddBorrower.js";
import CICReports from "./components/pages/Oxyloans/Admin/CICReports.jsx";

import LenderQueries from "../src/components/pages/Oxyloans/Admin/Help Desk/Lender/LenderQueries.jsx";
import BorrowerQueries from "../src/components/pages/Oxyloans/Admin/Help Desk/Borrower/BorrowerQueries.jsx";
import ResolvedLenderQueries from "../src/components/pages/Oxyloans/Admin/Help Desk/Lender/ResolvedLenderQueries.jsx";
import ResolvedBorrowerQueries from "../src/components/pages/Oxyloans/Admin/Help Desk/Borrower/ResolvedBorrowerQueries.jsx";

import LenderLoanApplications from "../src/components/pages/Oxyloans/Admin/LENDERS/LenderLoanApplications.jsx";
import BorrowerLoanApplications from "../src/components/pages/Oxyloans/Admin/borrowersapplications/BorrowerLoanApplications.jsx";

import Participatedsixmonthsago from "../src/components/pages/Oxyloans/Admin/Register Lender/Participatedsixmonthsago.jsx";
import Walletloadednotpatcipated from "../src/components/pages/Oxyloans/Admin/Register Lender/Walletloadednotpatcipated.jsx";
import Notparticipatedlendersindeal from "../src/components/pages/Oxyloans/Admin/Register Lender/Notparticipatedlendersindeal.jsx";
import Onlyonceparticipatedlenders from "../src/components/pages/Oxyloans/Admin/Register Lender/Onlyonceparticipatedlenders.jsx";
import Onlytwiceparticpated from "./components/pages/Oxyloans/Admin/Register Lender/Onlytwiceparticipated.jsx";
import Morethanhundredlenders from "./components/pages/Oxyloans/Admin/Register Lender/Morethanhundredlenders.jsx";
import Emailwhatsappverified from "./components/pages/Oxyloans/Admin/Register Lender/Emailwhatsappverified.jsx";
import Morethantenlakhs from "./components/pages/Oxyloans/Admin/Register Lender/Morethantenlakhs.jsx";

// import TestsDeals from "./components/pages/Oxyloans/Admin/HelpDeskDeals/TestsDeals.jsx";
// import SalariedDeals from "./components/pages/Oxyloans/Admin/HelpDeskDeals/SalariedDeals.jsx";
import StudentDeals from "./components/pages/Oxyloans/Admin/HelpDeskDeals/StudentDeals.jsx";
import EquityDeals from "./components/pages/Oxyloans/Admin/HelpDeskDeals/EquityDeals.jsx";
import EscrowsDeals from "./components/pages/Oxyloans/Admin/HelpDeskDeals/EscrowsDeals.jsx";
import TestsDeals from "./components/pages/Oxyloans/Admin/HelpDeskDeals/TestsDeals.jsx";
import SalariedDeals from "./components/pages/Oxyloans/Admin/HelpDeskDeals/SalariedDeals.jsx";// ********************BORROWER MODULE    ROUTES END ************************** //

import RemoveCredentials from "./components/pages/Oxyloans/Admin/SUPERADMIN/RemoveCredentials.jsx";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/loadwaletThroughQr" element={<LoadwaletThroughQr />} />
        <Route path="/loginotp" element={<Loginotp />} />
        <Route path="/register" element={<LenderRegister />} />
        <Route path="/userType" element={<UserType />} />
        <Route path="/borrower_register" element={<BorrowerRegister />} />
        <Route
          path="/register_active_proceed"
          element={<Register_active_proceed />}
        />
        <Route path="/profile" element={<Profile />} />
        <Route path="/testdeals" element={<UserTestdeals />} />
        <Route path="/forgotpassword" element={<ForgotPassword3 />} />
        <Route path="/partnerRegister" element={<PartnerRegister />} />
        <Route path="/forgotpassword2" element={<ForgotPassword />} />
        <Route path="/whatsappuser" element={<Whatappuser />} />
        <Route path="/escrowDeals" element={<EscrowDeals />} />
        <Route path="/regularEscrowDeals" element={<RegularEscrowDeals />} />
        <Route
          path="/loadwalletThroughVirtualAccount"
          element={<LoadwalletThroughVirtualAccount />}
        />
        <Route
          path="/withdrawdealfromwallet"
          element={<Withdrawdealfromwallet />}
        />
        <Route path="/mainadmindashboard" element={<MainAdminDashboard />} />
        <Route
          path="/oxyloansadmindashboard"
          element={<OxyloansAdminDashboard />}
        />
        <Route
          path="/walletToWalletHistory"
          element={<WalletToWalletHistory />}
        />
        <Route path="/viewdeals" element={<ViewDeals />} />
        <Route path="/admintestDeals" element={<TestDeals />} />
        <Route path="/spining" element={<Spining />} />
        <Route path="/admlogin" element={<Admlogin />} />
        <Route
          path="/withdrawdealfromDeal"
          element={<WithdrawdealfromDeal />}
        />
        <Route
          path="/transferWalletToWallet"
          element={<TransferWalletToWallet />}
        />
        <Route path="/mywithdrawalHistory" element={<MywithdrawalHistory />} />
        <Route path="/participatedeal" element={<Participatedeal />} />
        <Route path="/writetous" element={<Writetous />} />
        <Route path="/viewTicketHistory" element={<ViewTicketHistory />} />
        <Route path="/todaydeal" element={<Todaydeal />} />
        <Route path="/testdeals1" element={<Testdeal1 />} />
        <Route path="/viewCurrentDayDeals" element={<ViewCurrentDayDeals />} />
        <Route path="/emicalculator" element={<Emicalculator />} />
        <Route path="/configautoInvest" element={<ConfigautoInvest />} />
        <Route path="/membership" element={<Membership />} />
        <Route
          path="/referalEaringsMonthWise"
          element={<ReferalEaringsMonthWise />}
        />
        <Route path="/viewAutoHistory" element={<ViewAutoHistory />} />
        <Route path="/regularRunningDeal" element={<RegularRunningDeal />} />
        <Route path="/myRunningDeals" element={<MyRunningDeals />} />
        <Route path="/myclosedDeals" element={<MyclosedDeals />} />
        <Route path="/myholdamount" element={<Myholdamount />} />
        <Route
          path="/mypartiallClosedDeal"
          element={<MypartiallClosedDeal />}
        />
        <Route path="/ticketHistory" element={<TicketHistory />} />
        <Route path="/Fileconvension" element={<Fileconvension />} />
        <Route path="/myinterestEarning" element={<MyinterestEarning />} />
        <Route path="/myhighvalueDeals" element={<MyhighvalueDeals />} />
        <Route path="/earningCertificate" element={<EarningCertificate />} />
        <Route path="/myloansStatement" element={<MyloansStatement />} />
        <Route path="/referaFriend" element={<ReferaFriend />} />
        <Route path="/myreferalStatus" element={<MyreferalStatus />} />
        <Route path="/lendercontacts" element={<Mycontacts />} />
        <Route path="/lendercontacts1" element={<Mycontacts1 />} />
        <Route
          path="/walletToWalletHistory"
          element={<WalletToWalletHistory />}
        />
        <Route path="/myEarnings" element={<MyEarnings />} />
        <Route path="/loanListings" element={<LoanListings />} />
        <Route path="/WalletToWallet" element={<WalletToWallet />} />
        <Route
          path="/withdrawalFromWallet"
          element={<WithdrawalFromWallet />}
        />
        <Route path="/withdrawdealFounds" element={<WithdrawdealFounds />} />
        <Route path="/whatappuser" element={<Whatappuser />} />
        <Route path="/membershipHistory" element={<MembershipHistory />} />
        <Route path="/mytransactions" element={<Mytransactions />} />
        <Route path="/autoInvestHistory" element={<AutoInvestHistory />} />
        <Route
          path="/dashboardTransactions"
          element={<DashboardTransactions />}
        />
        <Route
          path="/loadwalletThroughVirtualAccount"
          element={<LoadwalletThroughVirtualAccount />}
        />{" "}
        <Route path="/interestsDateWise" element={<InterestsDateWise />} />
        <Route path="/whatsapplogin" element={<Whatapplog />} />
        <Route
          path="/walletToWalletTransactionHistory"
          element={<WalletToWalletTransactionHistory />}
        />
        {/* ******************** BORROWER MODULE    ROUTES START **************************  */}
        <Route path="/borrowerDashboard" element={<BorrowerDashboard />} />
        <Route path="/borrowerProfile" element={<BorrowerProfile />} />
        <Route path="/borrowerAgreedLoans" element={<BorrowerAgreedLoans />} />
        <Route path="/borrowerenach" element={<BorrowerEnach />} />
        <Route
          path="/borrowerLoaneligibility"
          element={<BorrowerLoanEligibility />}
        />
        <Route path="/borrowerloanListing" element={<BorrowerLoanListing />} />
        <Route
          path="/borrowerloanstatement"
          element={<BorrowerLoanstatement />}
        />{" "}
        <Route path="/updatekyc" element={<Updatekyc />} />
        <Route path="/borrowermycontacts" element={<Borrowermycontacts />} />
        <Route path="/borrowermyearnings" element={<BorrowerMyEarnings />} />
        <Route
          path="/borrowermyloanApplication"
          element={<BorrowerMyLoanApplication />}
        />
        <Route path="/borrowerpayemi" element={<BorrowerPayEmi />} />
        <Route path="/loanRequest" element={<LoanRequest />} />
        <Route path="/borrowerreferfriend" element={<BorrowerReferFriend />} />
        <Route path="/borrowerreferstatus" element={<BorrowerReferStatus />} />
        <Route
          path="/borrowerrunningLoans"
          element={<BorrowerRunningLoans />}
        />
        <Route path="/borrowerwriteTous" element={<BorrowerWriteTous />} />
        <Route
          path="/borroweremicalculator"
          element={<BorrowerEmiCalculator />}
        />
        <Route
          path="/borrowerTicketHistory"
          element={<BorrowerTicketHistory />}
        />
        <Route
          path="/getListOfBorrowerDetails"
          element={<GetListOfBorrowerDetails />}
        />
        <Route path="/partnerLogin" element={<PartnerLogin />} />
        <Route path="/patnerdashboard" element={<Patnerdashboard />} />
        <Route path="/partnerrequestInfo" element={<PartnerrequestInfo />} />
        <Route path="/Partneraccept" element={<Partneraccept />} />
        {/* ******************** BORROWER MODULE ROUTES END **************************  */}

        {/* ******************** Admin MODULE ROUTES Start **************************  */}
        <Route path="/Emi" element={<EMI />} />
        <Route path="/addBorrower" element={<AddBorrower />} />
        <Route path="/cicReports" element={<CICReports />} />
        <Route path="lenderqueries" element={<LenderQueries />} />
        <Route path="/borrowerqueries" element={<BorrowerQueries />} />
        <Route path="/resolvedlender" element={<ResolvedLenderQueries />} />
        <Route path="/resolvedborrower" element={<ResolvedBorrowerQueries />} />

        <Route path="/participatedsixmothsago" element={<Participatedsixmonthsago />} />
        <Route path="/walletloadednotpatcipated" element={<Walletloadednotpatcipated />} />
        <Route path="/notparticipatedlendersindeal" element={<Notparticipatedlendersindeal />} />
        <Route path="/onlyonceparticipatedlenders" element={<Onlyonceparticipatedlenders />} />
        <Route path="/onlytwiceparticipatedlenders" element={<Onlytwiceparticpated />} />
        <Route path="/morethanhundredlenders" element={<Morethanhundredlenders />} />
        <Route path="/emailwhatsappverified" element={<Emailwhatsappverified />} />
        <Route path="/morethantenlakhs" element={<Morethantenlakhs />} />

        {/* <Route path="/testsDeals" element={<TestsDeals />} />
        <Route path="/salariedDeals" element={<SalariedDeals />} /> */}

<Route path ="/viewstudentdeals" element={<StudentDeals />} />
        <Route path ="/viewequitydeals" element={<EquityDeals />} />
        <Route path ="/viewescrowsdeals" element={<EscrowsDeals  />} />
        <Route path="/viewtestsDeals" element={<TestsDeals />} />
        <Route path="/viewsalariedDeals" element={<SalariedDeals />} />

        <Route path="/lenderLoanApplications" element={<LenderLoanApplications />} />
        <Route path="/borrowerLoanApplications" element={<BorrowerLoanApplications />} />

        <Route path="/updateUserDetails" element={<RemoveCredentials />} />
        {/* ******************** AdminMODULE ROUTES END **************************  */}
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
