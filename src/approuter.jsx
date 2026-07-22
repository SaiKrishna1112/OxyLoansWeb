import React from "react";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";

import EscrowDeals from "./components/pages/Oxyloans/Admin/Deals/EscrowDeals/EscrowDeals";
import LenderAIDashboard from "./components/pages/Oxyloans/Lender/AILenderPortfolio";
import LenderAIPlanPage from "./components/pages/Dashboard/LenderAIPlanPage";
import AISubscriptionSuccess from "./components/pages/Dashboard/AISubscriptionSuccess";
import AITestAdmin from "./components/pages/Dashboard/AITestAdmin";
import LenderUpgradePortal from "./components/pages/Dashboard/LenderUpgradePortal";
import AdminAIDashboard from "./components/pages/Oxyloans/Admin/AdminAIDashboard";
import AdminAILenderCampaignHistoryPage from "./components/pages/Oxyloans/Admin/AdminAILenderCampaignHistoryPage";
import AdminAIFeaturePage from "./components/pages/Oxyloans/Admin/AdminAIFeaturePage";
import AdminAICreatedDealsPage from "./components/pages/Oxyloans/Admin/AdminAICreatedDealsPage";
import AdminAILenderAnalyticsLendersPage from "./components/pages/Oxyloans/Admin/AdminAILenderAnalyticsLendersPage";
import AdminAIUserProfilePage from "./components/pages/Oxyloans/Admin/AdminAIUserProfilePage";
import AdminAIReferralUsersPage from "./components/pages/Oxyloans/Admin/AdminAIReferralUsersPage";
import AdminAIDealsDashboard from "./components/pages/Oxyloans/Admin/AdminAIDealsDashboard";

import AdminAIReconciliationDashboard from "./components/pages/Oxyloans/Admin/AdminAIReconciliationDashboard";

const AdminAIFeatureRedirect = () => {
  const { featureId } = useParams();
  return <Navigate to={`/adminAIDashboard/${featureId}`} replace />;
};
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
import ProximityLoans from "./components/pages/Oxyloans/Lender/ProximityLoans";
import BorrowerDocuments from "./components/pages/Oxyloans/Admin/borrowersapplications/BorrowerDocuments.jsx";
import DisburseLoans from "./components/pages/Oxyloans/Lender/DisburseLoans";
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
import TopLendersPage from "./components/pages/Oxyloans/Lender/TopLendersPage.jsx";
import Whatappuser from "./components/pages/Authentication/Whatappuser";
import BorrowerDashboard from "./components/pages/Dashboard/BorrowerInsightsDashboard";
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
import OxyIntro from "./components/pages/Authentication/OxyIntro.jsx";
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
import StudentDeals from "./components/pages/Oxyloans/Admin/HelpDeskDeals/StudentDeals.jsx";
import EquityDeals from "./components/pages/Oxyloans/Admin/HelpDeskDeals/EquityDeals.jsx";
import EscrowsDeals from "./components/pages/Oxyloans/Admin/HelpDeskDeals/EscrowsDeals.jsx";
import TestsDeals from "./components/pages/Oxyloans/Admin/HelpDeskDeals/TestsDeals.jsx";
import SalariedDeals from "./components/pages/Oxyloans/Admin/HelpDeskDeals/SalariedDeals.jsx";

import BorrowerLoanRequestCreate from "./components/pages/Oxyloans/Borrower/BorrowerLoanRequestCreate.jsx";
import BorrowerRequestAmount from "./components/pages/Oxyloans/Borrower/BorrowerRequestAmount.jsx";
import BorrowerLoansInitiated from "./components/pages/Oxyloans/Borrower/BorrowerLoansInitiated.jsx";
import BorrowerDisbursementAmount from "./components/pages/Oxyloans/Borrower/BorrowerDisbursementAmount.jsx";
import BorrowerDisbursementInterestAmount from "./components/pages/Oxyloans/Borrower/BorrowerDisbursementInterestAmount.jsx";
import BorrowerNearbyLendersPage from "./components/pages/Oxyloans/Borrower/BorrowerNearbyLendersPage.jsx";
// ********************BORROWER MODULE    ROUTES END ************************** //

import PostLoanRequest from "./components/pages/Oxyloans/Borrower/PostLoanRequest";
import OpenMarketLoanListings from "./components/pages/Oxyloans/Lender/OpenMarketLoanListings";
import InterestRateNegotiation from "./components/pages/Oxyloans/Lender/InterestRateNegotiation";
import BorrowerMarketplaceConsent from "./components/pages/Oxyloans/Borrower/BorrowerMarketplaceConsent";
import LenderMarketplaceConsent from "./components/pages/Oxyloans/Lender/LenderMarketplaceConsent";
import EscalationDashboard from "./components/pages/Oxyloans/Lender/EscalationDashboard";
import BorrowerMarketplaceListings from "./components/pages/Oxyloans/Borrower/BorrowerMarketplaceListings";
import NearbyBorrowers from "./components/pages/Oxyloans/Lender/NearbyBorrowers";
import LenderEmiDashboard from "./components/pages/Oxyloans/Lender/LenderEmiDashboard";
import BorrowerEmiSchedule from "./components/pages/Oxyloans/Borrower/BorrowerEmiSchedule";
import MyOxyScore from "./components/pages/Oxyloans/Borrower/MyOxyScore";
import MarketplaceEsign from "./components/pages/Oxyloans/Borrower/MarketplaceEsign";
import MarketplaceEnach from "./components/pages/Oxyloans/Borrower/MarketplaceEnach";
import MarketplaceAdminDashboard from "./components/pages/Oxyloans/Admin/MarketplaceAdminDashboard";
import SmartLoanMatch from "./components/pages/Oxyloans/Lender/SmartLoanMatch";
import NotificationsPage from "./components/pages/NotificationsPage";
import AdminDisbursalControl from "./components/pages/Oxyloans/Admin/AdminDisbursalControl";
import AdminSettings from "./components/pages/Oxyloans/Admin/AdminSettings";
import FeeDisclosure from "./components/pages/Oxyloans/Borrower/FeeDisclosure";
import RepaymentView from "./components/pages/Oxyloans/Borrower/RepaymentView";
import AgreementPage from "./components/pages/Oxyloans/Borrower/AgreementPage";
import MyLoans from "./components/pages/Oxyloans/Borrower/MyLoans";
import LenderPortfolio from "./components/pages/Oxyloans/Lender/LenderPortfolio";
import RemoveCredentials from "./components/pages/Oxyloans/Admin/SUPERADMIN/RemoveCredentials.jsx";
import AssignedUsersforCallers from "./components/pages/Oxyloans/Admin/AssignedUsersforCallers.jsx";
import RadhaDashboard from "./components/pages/Oxyloans/Radha Admin/RadhaDashboard.jsx";
import UserCommentDetails from "./components/pages/Oxyloans/Radha Admin/UserCommentDetails.jsx";
import MonthlyInterest from "./components/pages/Oxyloans/Admin/Offlineinterest/MonthlyInterest.js";
import InterestDetailsTable from "./components/pages/Oxyloans/Admin/InterestDetails/InterestDetailsTable.js";
import ParticipationList from "./components/pages/Oxyloans/Admin/ParticipationList/ParticipationList.js";
import UploadFile from "./components/pages/Oxyloans/Admin/UploadFile/UploadFile.js";
import UserParticipationList from "./components/pages/Oxyloans/Admin/UserParticipationList/UserParticipationList.js";
import ParticipatedAmountInfo from "./components/pages/Oxyloans/Admin/ParticipatedAmountInfo/ParticipatedAmountInfo.js";
import CallsDataBasedOnID from "./components/pages/Oxyloans/Admin/Callers Data/CallsDataBasedOnID.jsx";
import TopLendersInfo from "./components/pages/Oxyloans/Admin/TopLendersList/TopLendersInfo.js";
import AllReferreDetails from "./components/pages/Oxyloans/Admin/ReferreDetails/AllReferreDetails.js";
import MonthlyReturnedInterest from "./components/pages/Oxyloans/Admin/MonthlyReturnedInterest/MonthlyReturnedInterest.js";
import ActiveLendersParticipationPage from "./components/pages/Oxyloans/Admin/ActiveLenders/ActiveLendersParticipationPage.jsx";
import FailedBorrowers from "./components/pages/Oxyloans/Admin/FailedBorrowers.jsx";
import DealsInfo from "./components/pages/Oxyloans/Admin/DealsInfo.jsx";
import CollectionsAdminDashboard from "./components/pages/Oxyloans/Admin/CollectionsAdminDashboard";
import AgentPortal from "./components/pages/Oxyloans/Admin/AgentPortal";
import CeoDashboard from "./components/pages/Oxyloans/Admin/CeoDashboard";
import LenderAnalytics from "./components/pages/Analytics/LenderAnalytics";
import BorrowerAnalytics from "./components/pages/Analytics/BorrowerAnalytics";
import AdminReconciliationDashboard from "./components/pages/Dashboard/AdminReconciliationDashboard";
import LenderPortfolioDashboard from "./components/pages/Oxyloans/Lender/AILenderPortfolio";
import BorrowerInsightsDashboard from "./components/pages/Dashboard/BorrowerInsightsDashboard";
import BorrowerCharges from "./components/pages/Oxyloans/Admin/BorrowerFees/BorrowerCharges.jsx";
import ProcessingFees from "./components/pages/Oxyloans/Admin/BorrowerFees/ProcessingFees.jsx";

const isAuthenticated = () =>
  !!(sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken"));

const PrivateRoute = ({ element }) =>
  isAuthenticated() ? element : <Navigate to="/loginotp" replace />;

const CatchAll = () => {
  if (!isAuthenticated()) return <Navigate to="/loginotp" replace />;
  const pt = localStorage.getItem("primaryType") || "";
  if (pt === "ADMIN" || pt === "HELPDESKADMIN") return <Navigate to="/oxyloansadmindashboard" replace />;
  if (pt === "LENDER") return <Navigate to="/dashboard" replace />;
  return <Navigate to="/borrowerDashboard" replace />;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ===== PUBLIC ROUTES ===== */}
        <Route path="/" element={<Login />} />
        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="/loginotp" element={<Loginotp />} />
        <Route path="/admlogin" element={<Admlogin />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/loadwaletThroughQr" element={<LoadwaletThroughQr />} />
        <Route path="/register" element={<LenderRegister />} />
        <Route path="/userType" element={<UserType />} />
        <Route path="/borrower_register" element={<BorrowerRegister />} />
        <Route path="/register_active_proceed" element={<Register_active_proceed />} />
        <Route path="/oxyIntro" element={<OxyIntro />} />
        <Route path="/forgotpassword" element={<ForgotPassword3 />} />
        <Route path="/forgotpassword2" element={<ForgotPassword />} />
        <Route path="/whatsappuser" element={<Whatappuser />} />
        <Route path="/escrowDeals" element={<EscrowDeals />} />
        <Route path="/regularEscrowDeals" element={<RegularEscrowDeals />} />
        <Route path="top-lenders" element={<TopLendersPage />} />
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
        <Route path="/lenderAIDashboard" element={<LenderAIDashboard />} />
        <Route path="/lenderAIDashboard/:lenderId" element={<LenderAIDashboard />} />
        <Route path="/adminAIDashboard" element={<AdminAIDashboard />} />
        <Route path="/adminAICampaignHistory" element={<AdminAILenderCampaignHistoryPage />} />
        <Route path="/adminAIDashboard/:featureId" element={<AdminAIFeaturePage />} />
        <Route path="/adminAiDashboard" element={<Navigate to="/adminAIDashboard" replace />} />
        <Route path="/adminAiDashboard/:featureId" element={<AdminAIFeatureRedirect />} />
        <Route path="/AdminAIDashboard" element={<Navigate to="/adminAIDashboard" replace />} />
        <Route path="/adminAICreatedDeals" element={<AdminAICreatedDealsPage />} />
        <Route path="/adminAILenderAnalytics" element={<AdminAILenderAnalyticsLendersPage />} />
        <Route path="/adminAIUserProfile" element={<AdminAIUserProfilePage />} />
        <Route path="/adminAIReferralUsers" element={<AdminAIReferralUsersPage />} />
        <Route path="/adminAIDeals" element={<AdminAIDealsDashboard />} />

        <Route path="/adminAIReconciliation" element={<AdminAIReconciliationDashboard />} />
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
        <Route path="/proximityLoans" element={<ProximityLoans />} />
        <Route path="/borrowerDocuments/:userId" element={<BorrowerDocuments />} />
        <Route path="/disburseLoans" element={<DisburseLoans />} />
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
        <Route path="/borrowerLoanRequestCreate" element={<BorrowerLoanRequestCreate />} />
        <Route path="/borrowerRequestAmount" element={<BorrowerRequestAmount />} />
        <Route path="/borrowerLoansInitiated" element={<BorrowerLoansInitiated />} />
        <Route path="/borrowerDisbursementAmount" element={<BorrowerDisbursementAmount />} />
        <Route path="/borrowerDisbursementInterestAmount/:borrowerId/:loanId/:id" element={<BorrowerDisbursementInterestAmount />} />
        <Route path="/nearbyleders" element={<BorrowerNearbyLendersPage />} />
        {/* ******************** BORROWER MODULE ROUTES END **************************  */}
        <Route path="/partnerRegister" element={<PartnerRegister />} />
        <Route path="/partnerLogin" element={<PartnerLogin />} />
        <Route path="/whatsapplogin" element={<Whatapplog />} />
        <Route path="/whatsappuser" element={<Whatappuser />} />
        <Route path="/whatappuser" element={<Whatappuser />} />

        {/* ===== PROTECTED ROUTES ===== */}
        <Route path="/dashboard" element={<PrivateRoute element={<AdminDashboard />} />} />
        <Route path="/adminAICampaignHistory" element={<PrivateRoute element={<AdminAILenderCampaignHistoryPage />} />} />
        <Route path="/loadwaletThroughQr" element={<PrivateRoute element={<LoadwaletThroughQr />} />} />
        <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
        <Route path="/testdeals" element={<PrivateRoute element={<UserTestdeals />} />} />
        <Route path="/escrowDeals" element={<PrivateRoute element={<EscrowDeals />} />} />
        <Route path="/regularEscrowDeals" element={<PrivateRoute element={<RegularEscrowDeals />} />} />
        <Route path="/top-lenders" element={<PrivateRoute element={<TopLendersPage />} />} />
        <Route path="/loadwalletThroughVirtualAccount" element={<PrivateRoute element={<LoadwalletThroughVirtualAccount />} />} />
        <Route path="/withdrawdealfromwallet" element={<PrivateRoute element={<Withdrawdealfromwallet />} />} />
        <Route path="/mainadmindashboard" element={<PrivateRoute element={<MainAdminDashboard />} />} />
        <Route path="/oxyloansadmindashboard" element={<PrivateRoute element={<OxyloansAdminDashboard />} />} />
        <Route path="/walletToWalletHistory" element={<PrivateRoute element={<WalletToWalletHistory />} />} />
        <Route path="/viewdeals" element={<PrivateRoute element={<ViewDeals />} />} />
        <Route path="/admintestDeals" element={<PrivateRoute element={<TestDeals />} />} />
        <Route path="/spining" element={<PrivateRoute element={<Spining />} />} />
        <Route path="/withdrawdealfromDeal" element={<PrivateRoute element={<WithdrawdealfromDeal />} />} />
        <Route path="/transferWalletToWallet" element={<PrivateRoute element={<TransferWalletToWallet />} />} />
        <Route path="/mywithdrawalHistory" element={<PrivateRoute element={<MywithdrawalHistory />} />} />
        <Route path="/participatedeal" element={<PrivateRoute element={<Participatedeal />} />} />
        <Route path="/writetous" element={<PrivateRoute element={<Writetous />} />} />
        <Route path="/viewTicketHistory" element={<PrivateRoute element={<ViewTicketHistory />} />} />
        <Route path="/todaydeal" element={<PrivateRoute element={<Todaydeal />} />} />
        <Route path="/testdeals1" element={<PrivateRoute element={<Testdeal1 />} />} />
        <Route path="/viewCurrentDayDeals" element={<PrivateRoute element={<ViewCurrentDayDeals />} />} />
        <Route path="/emicalculator" element={<PrivateRoute element={<Emicalculator />} />} />
        <Route path="/configautoInvest" element={<PrivateRoute element={<ConfigautoInvest />} />} />
        <Route path="/membership" element={<PrivateRoute element={<Membership />} />} />
        <Route path="/referalEaringsMonthWise" element={<PrivateRoute element={<ReferalEaringsMonthWise />} />} />
        <Route path="/viewAutoHistory" element={<PrivateRoute element={<ViewAutoHistory />} />} />
        <Route path="/regularRunningDeal" element={<PrivateRoute element={<RegularRunningDeal />} />} />
        <Route path="/myRunningDeals" element={<PrivateRoute element={<MyRunningDeals />} />} />
        <Route path="/myclosedDeals" element={<PrivateRoute element={<MyclosedDeals />} />} />
        <Route path="/myholdamount" element={<PrivateRoute element={<Myholdamount />} />} />
        <Route path="/mypartiallClosedDeal" element={<PrivateRoute element={<MypartiallClosedDeal />} />} />
        <Route path="/ticketHistory" element={<PrivateRoute element={<TicketHistory />} />} />
        <Route path="/Fileconvension" element={<PrivateRoute element={<Fileconvension />} />} />
        <Route path="/myinterestEarning" element={<PrivateRoute element={<MyinterestEarning />} />} />
        <Route path="/myhighvalueDeals" element={<PrivateRoute element={<MyhighvalueDeals />} />} />
        <Route path="/earningCertificate" element={<PrivateRoute element={<EarningCertificate />} />} />
        <Route path="/myloansStatement" element={<PrivateRoute element={<MyloansStatement />} />} />
        <Route path="/referaFriend" element={<PrivateRoute element={<ReferaFriend />} />} />
        <Route path="/myreferalStatus" element={<PrivateRoute element={<MyreferalStatus />} />} />
        <Route path="/lendercontacts" element={<PrivateRoute element={<Mycontacts />} />} />
        <Route path="/lendercontacts1" element={<PrivateRoute element={<Mycontacts1 />} />} />
        <Route path="/myEarnings" element={<PrivateRoute element={<MyEarnings />} />} />
        <Route path="/loanListings" element={<PrivateRoute element={<LoanListings />} />} />
        <Route path="/WalletToWallet" element={<PrivateRoute element={<WalletToWallet />} />} />
        <Route path="/withdrawalFromWallet" element={<PrivateRoute element={<WithdrawalFromWallet />} />} />
        <Route path="/withdrawdealFounds" element={<PrivateRoute element={<WithdrawdealFounds />} />} />
        <Route path="/membershipHistory" element={<PrivateRoute element={<MembershipHistory />} />} />
        <Route path="/mytransactions" element={<PrivateRoute element={<Mytransactions />} />} />
        <Route path="/autoInvestHistory" element={<PrivateRoute element={<AutoInvestHistory />} />} />
        <Route path="/dashboardTransactions" element={<PrivateRoute element={<DashboardTransactions />} />} />
        <Route path="/interestsDateWise" element={<PrivateRoute element={<InterestsDateWise />} />} />
        <Route path="/walletToWalletTransactionHistory" element={<PrivateRoute element={<WalletToWalletTransactionHistory />} />} />

        {/* BORROWER */}
        <Route path="/borrowerDashboard" element={<PrivateRoute element={<BorrowerDashboard />} />} />
        <Route path="/borrowerProfile" element={<PrivateRoute element={<BorrowerProfile />} />} />
        <Route path="/borrowerAgreedLoans" element={<PrivateRoute element={<BorrowerAgreedLoans />} />} />
        <Route path="/borrowerenach" element={<PrivateRoute element={<BorrowerEnach />} />} />
        <Route path="/borrowerLoaneligibility" element={<PrivateRoute element={<BorrowerLoanEligibility />} />} />
        <Route path="/borrowerloanListing" element={<PrivateRoute element={<BorrowerLoanListing />} />} />
        <Route path="/borrowerloanstatement" element={<PrivateRoute element={<BorrowerLoanstatement />} />} />
        <Route path="/updatekyc" element={<PrivateRoute element={<Updatekyc />} />} />
        <Route path="/borrowermycontacts" element={<PrivateRoute element={<Borrowermycontacts />} />} />
        <Route path="/borrowermyearnings" element={<PrivateRoute element={<BorrowerMyEarnings />} />} />
        <Route path="/borrowermyloanApplication" element={<PrivateRoute element={<BorrowerMyLoanApplication />} />} />
        <Route path="/borrowerpayemi" element={<PrivateRoute element={<BorrowerPayEmi />} />} />
        <Route path="/loanRequest" element={<PrivateRoute element={<LoanRequest />} />} />
        <Route path="/borrowerreferfriend" element={<PrivateRoute element={<BorrowerReferFriend />} />} />
        <Route path="/borrowerreferstatus" element={<PrivateRoute element={<BorrowerReferStatus />} />} />
        <Route path="/borrowerrunningLoans" element={<PrivateRoute element={<BorrowerRunningLoans />} />} />
        <Route path="/borrowerwriteTous" element={<PrivateRoute element={<BorrowerWriteTous />} />} />
        <Route path="/borroweremicalculator" element={<PrivateRoute element={<BorrowerEmiCalculator />} />} />
        <Route path="/borrowerTicketHistory" element={<PrivateRoute element={<BorrowerTicketHistory />} />} />
        <Route path="/getListOfBorrowerDetails" element={<PrivateRoute element={<GetListOfBorrowerDetails />} />} />
        <Route path="/patnerdashboard" element={<PrivateRoute element={<Patnerdashboard />} />} />
        <Route path="/partnerrequestInfo" element={<PrivateRoute element={<PartnerrequestInfo />} />} />
        <Route path="/Partneraccept" element={<PrivateRoute element={<Partneraccept />} />} />

        {/* ADMIN */}
        <Route path="/Emi" element={<PrivateRoute element={<EMI />} />} />
        <Route path="/addBorrower" element={<PrivateRoute element={<AddBorrower />} />} />
        <Route path="/cicReports" element={<PrivateRoute element={<CICReports />} />} />
        <Route path="/lenderqueries" element={<PrivateRoute element={<LenderQueries />} />} />
        <Route path="/borrowerqueries" element={<PrivateRoute element={<BorrowerQueries />} />} />
        <Route path="/resolvedlender" element={<PrivateRoute element={<ResolvedLenderQueries />} />} />
        <Route path="/resolvedborrower" element={<PrivateRoute element={<ResolvedBorrowerQueries />} />} />
        <Route path="/participatedsixmothsago" element={<PrivateRoute element={<Participatedsixmonthsago />} />} />
        <Route path="/walletloadednotpatcipated" element={<PrivateRoute element={<Walletloadednotpatcipated />} />} />
        <Route path="/notparticipatedlendersindeal" element={<PrivateRoute element={<Notparticipatedlendersindeal />} />} />
        <Route path="/onlyonceparticipatedlenders" element={<PrivateRoute element={<Onlyonceparticipatedlenders />} />} />
        <Route path="/onlytwiceparticipatedlenders" element={<PrivateRoute element={<Onlytwiceparticpated />} />} />
        <Route path="/morethanhundredlenders" element={<PrivateRoute element={<Morethanhundredlenders />} />} />
        <Route path="/emailwhatsappverified" element={<PrivateRoute element={<Emailwhatsappverified />} />} />
        <Route path="/morethantenlakhs" element={<PrivateRoute element={<Morethantenlakhs />} />} />
        <Route path="/viewstudentdeals" element={<PrivateRoute element={<StudentDeals />} />} />
        <Route path="/viewequitydeals" element={<PrivateRoute element={<EquityDeals />} />} />
        <Route path="/viewescrowsdeals" element={<PrivateRoute element={<EscrowsDeals />} />} />
        <Route path="/viewtestsDeals" element={<PrivateRoute element={<TestsDeals />} />} />
        <Route path="/viewsalariedDeals" element={<PrivateRoute element={<SalariedDeals />} />} />
        <Route path="/lenderLoanApplications" element={<PrivateRoute element={<LenderLoanApplications />} />} />
        <Route path="/borrowerLoanApplications" element={<PrivateRoute element={<BorrowerLoanApplications />} />} />
        <Route path="/updateUserDetails" element={<PrivateRoute element={<RemoveCredentials />} />} />
        <Route path="/assignedUsersforCallers" element={<PrivateRoute element={<AssignedUsersforCallers />} />} />
        <Route path="/radhaDashboard" element={<PrivateRoute element={<RadhaDashboard />} />} />
        <Route path="/userCommentDetails" element={<PrivateRoute element={<UserCommentDetails />} />} />
        <Route path="/myCalls" element={<PrivateRoute element={<CallsDataBasedOnID />} />} />
        <Route path="/participatedAmountInfo" element={<PrivateRoute element={<ParticipatedAmountInfo />} />} />
        <Route path="/uploadFile" element={<PrivateRoute element={<UploadFile />} />} />
        <Route path="/MonthlyInterest" element={<PrivateRoute element={<MonthlyInterest />} />} />
        <Route path="/interestDetailsTable" element={<PrivateRoute element={<InterestDetailsTable />} />} />
        <Route path="/participationList" element={<PrivateRoute element={<ParticipationList />} />} />
        <Route path="/userParticipationlist" element={<PrivateRoute element={<UserParticipationList />} />} />
        <Route path="/topLendersInfo" element={<PrivateRoute element={<TopLendersInfo />} />} />
        <Route path="/allReferreDetails" element={<PrivateRoute element={<AllReferreDetails />} />} />
        <Route path="/monthlyReturnedInterest" element={<PrivateRoute element={<MonthlyReturnedInterest />} />} />
        <Route path="/activeLendersParticipation" element={<PrivateRoute element={<ActiveLendersParticipationPage />} />} />

        <Route path ="/viewstudentdeals" element={<StudentDeals />} />
        <Route path ="/viewequitydeals" element={<EquityDeals />} />
        <Route path ="/viewescrowsdeals" element={<EscrowsDeals  />} />
        <Route path="/viewtestsDeals" element={<TestsDeals />} />
        <Route path="/viewsalariedDeals" element={<SalariedDeals />} />

        <Route path="/lenderLoanApplications" element={<LenderLoanApplications />} />
        <Route path="/borrowerLoanApplications" element={<BorrowerLoanApplications />} />

        <Route path="/updateUserDetails" element={<RemoveCredentials />} />
        <Route path="/assignedUsersforCallers" element={<AssignedUsersforCallers/>}/>

        <Route path="/radhaDashboard" element={<RadhaDashboard/>}/>
        <Route path="/userCommentDetails" element={<UserCommentDetails/>}/>

        <Route path="/myCalls" element={<CallsDataBasedOnID/>}/>
        <Route path="/participatedAmountInfo" element={<ParticipatedAmountInfo />}/>
        <Route path="/uploadFile" element={<UploadFile />}/>
        <Route path="/MonthlyInterest" element={<MonthlyInterest/>}/>
        <Route path="/interestDetailsTable" element={<InterestDetailsTable/>}/>
        <Route path="/participationList" element={<ParticipationList/>}/>
        <Route path="/userParticipationlist" element={<UserParticipationList />} />
        <Route path="/topLendersInfo" element={<TopLendersInfo />}/>
        <Route path="/allReferreDetails" element={<AllReferreDetails />} />
        <Route path="/monthlyReturnedInterest" element={<MonthlyReturnedInterest />} />

        <Route path="/activeLendersParticipation" element={<ActiveLendersParticipationPage />} />
        <Route path="/failedborrowers" element={<FailedBorrowers />} />
        <Route path="/dealsInfo" element={<DealsInfo />} />
        <Route path="/adminBorrowerCharges" element={<BorrowerCharges />} />
        <Route path="/adminProcessingFees" element={<ProcessingFees />} />
        {/* ******************** AdminMODULE ROUTES END **************************  */}
        {/* MARKETPLACE */}
        <Route path="/post-loan-request" element={<PrivateRoute element={<PostLoanRequest />} />} />
        <Route path="/marketplace-loans" element={<PrivateRoute element={<OpenMarketLoanListings />} />} />
        <Route path="/negotiation/:loanRequestId" element={<PrivateRoute element={<InterestRateNegotiation />} />} />
        <Route path="/borrower-consent/:loanRequestId" element={<PrivateRoute element={<BorrowerMarketplaceConsent />} />} />
        <Route path="/lender-consent/:loanRequestId" element={<PrivateRoute element={<LenderMarketplaceConsent />} />} />
        <Route path="/escalation-dashboard" element={<PrivateRoute element={<EscalationDashboard />} />} />
        <Route path="/my-marketplace-loans" element={<PrivateRoute element={<BorrowerMarketplaceListings />} />} />
        <Route path="/nearby-borrowers" element={<PrivateRoute element={<NearbyBorrowers />} />} />
        <Route path="/lender-emi-dashboard" element={<PrivateRoute element={<LenderEmiDashboard />} />} />
        <Route path="/borrower-emi-schedule" element={<PrivateRoute element={<BorrowerEmiSchedule />} />} />
        <Route path="/my-oxyscore" element={<PrivateRoute element={<MyOxyScore />} />} />
        <Route path="/esign/:loanRequestId" element={<PrivateRoute element={<MarketplaceEsign />} />} />
        <Route path="/enach/:loanRequestId" element={<PrivateRoute element={<MarketplaceEnach />} />} />
        <Route path="/marketplace-admin-dashboard" element={<PrivateRoute element={<MarketplaceAdminDashboard />} />} />
        <Route path="/smart-match" element={<PrivateRoute element={<SmartLoanMatch />} />} />
        <Route path="/notifications" element={<PrivateRoute element={<NotificationsPage />} />} />
        <Route path="/admin/disbursal-control" element={<PrivateRoute element={<AdminDisbursalControl />} />} />
        <Route path="/admin/settings" element={<PrivateRoute element={<AdminSettings />} />} />
        <Route path="/borrower/fee-disclosure/:loanRequestId" element={<PrivateRoute element={<FeeDisclosure />} />} />
        <Route path="/borrower/repayment/:loanRequestId" element={<PrivateRoute element={<RepaymentView />} />} />
        <Route path="/agreement/:loanRequestId" element={<PrivateRoute element={<AgreementPage />} />} />
        <Route path="/my-loans" element={<PrivateRoute element={<MyLoans />} />} />
        <Route path="/lender-portfolio" element={<PrivateRoute element={<LenderPortfolioDashboard />} />} />
        <Route path="/lender-portfolio/:lenderId" element={<PrivateRoute element={<LenderPortfolioDashboard />} />} />
        <Route path="/lenderAIDashboard" element={<PrivateRoute element={<LenderPortfolioDashboard />} />} />
        <Route path="/lenderAIDashboard/:lenderId" element={<PrivateRoute element={<LenderPortfolioDashboard />} />} />
        <Route path="/admin/collections" element={<PrivateRoute element={<CollectionsAdminDashboard />} />} />
        <Route path="/admin/agent-portal" element={<PrivateRoute element={<AgentPortal />} />} />
        <Route path="/admin/ceo-dashboard" element={<PrivateRoute element={<CeoDashboard />} />} />
        <Route path="/admin/marketplace" element={<PrivateRoute element={<MarketplaceAdminDashboard />} />} />
        <Route path="/smart-loan-match" element={<PrivateRoute element={<SmartLoanMatch />} />} />
        <Route path="/lender-analytics" element={<PrivateRoute element={<LenderAnalytics />} />} />
        <Route path="/borrower-analytics" element={<PrivateRoute element={<BorrowerAnalytics />} />} />
        <Route path="/admin/reconciliation" element={<PrivateRoute element={<AdminReconciliationDashboard />} />} />
        <Route path="/ai/portfolio" element={<PrivateRoute element={<LenderPortfolioDashboard />} />} />
        <Route path="/ai/portfolio/:lenderId" element={<PrivateRoute element={<LenderPortfolioDashboard />} />} />
        <Route path="/ai/plans" element={<PrivateRoute element={<LenderAIPlanPage />} />} />
        <Route path="/lender-upgrade" element={<PrivateRoute element={<LenderAIPlanPage />} />} />
        <Route path="/oxai-upgrade" element={<LenderUpgradePortal />} />
        <Route path="/ai/subscription-success" element={<PrivateRoute element={<AISubscriptionSuccess />} />} />
        <Route path="/ai/test-admin" element={<PrivateRoute element={<AITestAdmin />} />} />
        <Route path="/ai/borrower-insights" element={<PrivateRoute element={<BorrowerInsightsDashboard />} />} />
        <Route path="*" element={<CatchAll />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
