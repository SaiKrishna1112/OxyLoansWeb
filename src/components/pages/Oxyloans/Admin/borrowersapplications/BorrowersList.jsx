import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Card,
  Typography,
  Input,
  Button,
  Tag,
  Space,
  Modal,
  Tabs,
  Tooltip,
  Badge,
  Row,
  Col,
  Statistic,
  Empty,
  Spin,
  Select,
  Pagination,
  message,
  Progress,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileImageOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined,
  PhoneOutlined,
  MailOutlined,
  BankOutlined,
  IdcardOutlined,
  UserOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  RotateRightOutlined,
  RotateLeftOutlined,
  LeftOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  ClearOutlined,
  ArrowRightOutlined,
  WarningOutlined,
  TeamOutlined,
  CheckOutlined,
  CloseOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { Link, useNavigate } from "react-router-dom";
import OxyloansAdminSidebar from "../../../../SideBar/OxyloansAdminSidebar";
import OxyloansAdminHeader from "../../../../Header/OxyloansAdminHeader";
import { getBorrowerDocumentsList } from "../../../../HttpRequest/admin";
import { calculateBorrowerProfileCompleteness } from "../../../../../utils/borrowerValidation";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Sample data provided in the user request specification
const SAMPLE_BORROWER_DOCUMENTS = [
  {
    userId: 55711,
    name: "DARA DHARANI DEVI",
    documents: [
      {
        document:
          "https://oxyloansv1.s3.ap-south-1.amazonaws.com/55711/CHEQUELEAF_IMG_20240916_140414.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjECQaCmFwLXNvdXRoLTEiRzBFAiEAg5TZra17%2FhDkRQ0pUs%2BNp3vR%2F6QqjKaNm6Se7X3PJ3ICIF8H%2FwuVnLIodfY8Q6BNm46t%2BwiH7xPPNclMWKyI8zTtKr4FCO3%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQAxoMMDE4NTk3MDQ3NTgwIgy5jphnepIjpKJKVesqkgWTIVM7KHt3PuolymAyxlVHHjp5hUYoiGxdBkJ40CnRJ%2FKNswHxpRCQBQBsM8qqmtXJNtcFC3UiPB8Vz1BuN2IPl55wDY57%2BOrwAxl5u1%2BuXdE%2FwRKTSJNRYHc4kC4mAMafxKgVL6xya2FbrEHisH4EAD8uZnDnjR8SQzVqLenX8nyR19regi%2BOyCOpWTM1BEbsry2J1KULNOiP8G9jK1pDcsy4TFBBl6LV2z1I%2FMwpPCYCjMRHnjSIlQt9Yq6oix8fJ6pZj1%2FWZcri87JpUJEIBFj1%2By2c5mgLtjzPP34lPlI%2Fp7P275JDpwx9DYL3ng%2FFtTLPyyIpV81ujlp%2BVD2vDRiwzlx7qFEEaPWvQWMkOWpDk4sIZ7G69AQBM0%2BaHxtZa%2F%2Fl3jHPDEn5dVeK0YYkpumkooYPwRmP2kV8fQwGwc%2FHpHDRl9p1qwhARfxf%2FBhl%2F3OKX%2BrZsBe%2BKL7pxmtadPFTG%2BmB5Ey1iUDOAkr4GD3ioOCHPw0BM4MFYD9Vrr%2B1CCtWqZ2xRivYcb3Q1LI6q4oZrN8h4zk9D6u%2BMsQKq1F2dtoI4djZFrpetjXqF7L3ZQs5KGcww61Bxc4aTfAESX1sTM5W8ExIou1bZgc7NXbwP6SPuOVl%2F9Nc33MMjD5AIYKReYthkAWjOdwR%2B3uY1%2BjMFYd8JV9Iq0j1lQIQF%2F9JnvJ3NM%2FIb0xycKgexm6Hjj2anzxM5Vl%2F7IaYgdObMQ%2BREwq32MeEt6aQQmxmP33wDKSC80HaIavkDXoMZ5%2FBICB4GCK0NPM1nuqB%2FB7Fy6WtekbI6RUCDywxe2PRt7d3LmeDIreD8XsRDowT6P%2FoU1YBRAg9ZuZruB5L7J2DubT1AvooRJYz%2FTmAWs6uX6T7MPetgtcGOrEB1gd0nqGBZWhawUrp63XhYIzahHCjf%2BBI2mL2bchmPESPlXizWyg0unSAhZwuUgQW3M1ctZYSvS7vvJGtUrRkJBEjYlSVWFVgtelLseQwcH%2B9qImNGDXMAYvk2wSunxkDeHruFaF9JjzkOeT6G%2BGJ412Dawmas5Wn%2BmGcxdU7i3bajlDcvgTche7JT7EBwNvEPXBnPuncVDvbBO03%2Bju1zGoeEP6Fk8tjXWXUw8kExPSK&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20261027T123750Z&X-Amz-SignedHeaders=host&X-Amz-Expires=604800&X-Amz-Credential=ASIAQIVDYNUOJMVB7VFV%2F20261027%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Signature=cf724154cbaca001cb8adcb9bdc766051b51911c07dd43333c899c2589820145",
        documentType: "CHEQUELEAF",
      },
      {
        document:
          "https://oxyloansv1.s3.ap-south-1.amazonaws.com/55711/AADHAR_IMG_20240916_140753.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjECQaCmFwLXNvdXRoLTEiRzBFAiEAg5TZra17%2FhDkRQ0pUs%2BNp3vR%2F6QqjKaNm6Se7X3PJ3ICIF8H%2FwuVnLIodfY8Q6BNm46t%2BwiH7xPPNclMWKyI8zTtKr4FCO3%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQAxoMMDE4NTk3MDQ3NTgwIgy5jphnepIjpKJKVesqkgWTIVM7KHt3PuolymAyxlVHHjp5hUYoiGxdBkJ40CnRJ%2FKNswHxpRCQBQBsM8qqmtXJNtcFC3UiPB8Vz1BuN2IPl55wDY57%2BOrwAxl5u1%2BuXdE%2FwRKTSJNRYHc4kC4mAMafxKgVL6xya2FbrEHisH4EAD8uZnDnjR8SQzVqLenX8nyR19regi%2BOyCOpWTM1BEbsry2J1KULNOiP8G9jK1pDcsy4TFBBl6LV2z1I%2FMwpPCYCjMRHnjSIlQt9Yq6oix8fJ6pZj1%2FWZcri87JpUJEIBFj1%2By2c5mgLtjzPP34lPlI%2Fp7P275JDpwx9DYL3ng%2FFtTLPyyIpV81ujlp%2BVD2vDRiwzlx7qFEEaPWvQWMkOWpDk4sIZ7G69AQBM0%2BaHxtZa%2F%2Fl3jHPDEn5dVeK0YYkpumkooYPwRmP2kV8fQwGwc%2FHpHDRl9p1qwhARfxf%2FBhl%2F3OKX%2BrZsBe%2BKL7pxmtadPFTG%2BmB5Ey1iUDOAkr4GD3ioOCHPw0BM4MFYD9Vrr%2B1CCtWqZ2xRivYcb3Q1LI6q4oZrN8h4zk9D6u%2BMsQKq1F2dtoI4djZFrpetjXqF7L3ZQs5KGcww61Bxc4aTfAESX1sTM5W8ExIou1bZgc7NXbwP6SPuOVl%2F9Nc33MMjD5AIYKReYthkAWjOdwR%2B3uY1%2BjMFYd8JV9Iq0j1lQIQF%2F9JnvJ3NM%2FIb0xycKgexm6Hjj2anzxM5Vl%2F7IaYgdObMQ%2BREwq32MeEt6aQQmxmP33wDKSC80HaIavkDXoMZ5%2FBICB4GCK0NPM1nuqB%2FB7Fy6WtekbI6RUCDywxe2PRt7d3LmeDIreD8XsRDowT6P%2FoU1YBRAg9ZuZruB5L7J2DubT1AvooRJYz%2FTmAWs6uX6T7MPetgtcGOrEB1gd0nqGBZWhawUrp63XhYIzahHCjf%2BBI2mL2bchmPESPlXizWyg0unSAhZwuUgQW3M1ctZYSvS7vvJGtUrRkJBEjYlSVWFVgtelLseQwcH%2B9qImNGDXMAYvk2wSunxkDeHruFaF9JjzkOeT6G%2BGJ412Dawmas5Wn%2BmGcxdU7i3bajlDcvgTche7JT7EBwNvEPXBnPuncVDvbBO03%2Bju1zGoeEP6Fk8tjXWXUw8kExPSK&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20261027T123750Z&X-Amz-SignedHeaders=host&X-Amz-Expires=604800&X-Amz-Credential=ASIAQIVDYNUOJMVB7VFV%2F20261027%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Signature=4fa909ffb05cd3b359d695ab6971c3deab449dde1474d4c683eba93e469d104b",
        documentType: "AADHAR",
      },
      {
        document:
          "https://oxyloansv1.s3.ap-south-1.amazonaws.com/55711/USERQUERYSCREENSHOT_31fe34f8-66a5-40d7-9469-03891c42df95.jpeg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjECQaCmFwLXNvdXRoLTEiRzBFAiEAg5TZra17%2FhDkRQ0pUs%2BNp3vR%2F6QqjKaNm6Se7X3PJ3ICIF8H%2FwuVnLIodfY8Q6BNm46t%2BwiH7xPPNclMWKyI8zTtKr4FCO3%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQAxoMMDE4NTk3MDQ3NTgwIgy5jphnepIjpKJKVesqkgWTIVM7KHt3PuolymAyxlVHHjp5hUYoiGxdBkJ40CnRJ%2FKNswHxpRCQBQBsM8qqmtXJNtcFC3UiPB8Vz1BuN2IPl55wDY57%2BOrwAxl5u1%2BuXdE%2FwRKTSJNRYHc4kC4mAMafxKgVL6xya2FbrEHisH4EAD8uZnDnjR8SQzVqLenX8nyR19regi%2BOyCOpWTM1BEbsry2J1KULNOiP8G9jK1pDcsy4TFBBl6LV2z1I%2FMwpPCYCjMRHnjSIlQt9Yq6oix8fJ6pZj1%2FWZcri87JpUJEIBFj1%2By2c5mgLtjzPP34lPlI%2Fp7P275JDpwx9DYL3ng%2FFtTLPyyIpV81ujlp%2BVD2vDRiwzlx7qFEEaPWvQWMkOWpDk4sIZ7G69AQBM0%2BaHxtZa%2F%2Fl3jHPDEn5dVeK0YYkpumkooYPwRmP2kV8fQwGwc%2FHpHDRl9p1qwhARfxf%2FBhl%2F3OKX%2BrZsBe%2BKL7pxmtadPFTG%2BmB5Ey1iUDOAkr4GD3ioOCHPw0BM4MFYD9Vrr%2B1CCtWqZ2xRivYcb3Q1LI6q4oZrN8h4zk9D6u%2BMsQKq1F2dtoI4djZFrpetjXqF7L3ZQs5KGcww61Bxc4aTfAESX1sTM5W8ExIou1bZgc7NXbwP6SPuOVl%2F9Nc33MMjD5AIYKReYthkAWjOdwR%2B3uY1%2BjMFYd8JV9Iq0j1lQIQF%2F9JnvJ3NM%2FIb0xycKgexm6Hjj2anzxM5Vl%2F7IaYgdObMQ%2BREwq32MeEt6aQQmxmP33wDKSC80HaIavkDXoMZ5%2FBICB4GCK0NPM1nuqB%2FB7Fy6WtekbI6RUCDywxe2PRt7d3LmeDIreD8XsRDowT6P%2FoU1YBRAg9ZuZruB5L7J2DubT1AvooRJYz%2FTmAWs6uX6T7MPetgtcGOrEB1gd0nqGBZWhawUrp63XhYIzahHCjf%2BBI2mL2bchmPESPlXizWyg0unSAhZwuUgQW3M1ctZYSvS7vvJGtUrRkJBEjYlSVWFVgtelLseQwcH%2B9qImNGDXMAYvk2wSunxkDeHruFaF9JjzkOeT6G%2BGJ412Dawmas5Wn%2BmGcxdU7i3bajlDcvgTche7JT7EBwNvEPXBnPuncVDvbBO03%2Bju1zGoeEP6Fk8tjXWXUw8kExPSK&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20261027T123750Z&X-Amz-SignedHeaders=host&X-Amz-Expires=604800&X-Amz-Credential=ASIAQIVDYNUOJMVB7VFV%2F20261027%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Signature=dcfc9a6b073d79059a322768896f25d8bb99c6145464a8ed79942f73df9e7fc2",
        documentType: "USERQUERYSCREENSHOT",
      },
      {
        document:
          "https://oxyloansv1.s3.ap-south-1.amazonaws.com/55711/USERQUERYSCREENSHOT_54e27ea6-ad7d-4970-a210-d7af35af471c.jpeg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjECQaCmFwLXNvdXRoLTEiRzBFAiEAg5TZra17%2FhDkRQ0pUs%2BNp3vR%2F6QqjKaNm6Se7X3PJ3ICIF8H%2FwuVnLIodfY8Q6BNm46t%2BwiH7xPPNclMWKyI8zTtKr4FCO3%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQAxoMMDE4NTk3MDQ3NTgwIgy5jphnepIjpKJKVesqkgWTIVM7KHt3PuolymAyxlVHHjp5hUYoiGxdBkJ40CnRJ%2FKNswHxpRCQBQBsM8qqmtXJNtcFC3UiPB8Vz1BuN2IPl55wDY57%2BOrwAxl5u1%2BuXdE%2FwRKTSJNRYHc4kC4mAMafxKgVL6xya2FbrEHisH4EAD8uZnDnjR8SQzVqLenX8nyR19regi%2BOyCOpWTM1BEbsry2J1KULNOiP8G9jK1pDcsy4TFBBl6LV2z1I%2FMwpPCYCjMRHnjSIlQt9Yq6oix8fJ6pZj1%2FWZcri87JpUJEIBFj1%2By2c5mgLtjzPP34lPlI%2Fp7P275JDpwx9DYL3ng%2FFtTLPyyIpV81ujlp%2BVD2vDRiwzlx7qFEEaPWvQWMkOWpDk4sIZ7G69AQBM0%2BaHxtZa%2F%2Fl3jHPDEn5dVeK0YYkpumkooYPwRmP2kV8fQwGwc%2FHpHDRl9p1qwhARfxf%2FBhl%2F3OKX%2BrZsBe%2BKL7pxmtadPFTG%2BmB5Ey1iUDOAkr4GD3ioOCHPw0BM4MFYD9Vrr%2B1CCtWqZ2xRivYcb3Q1LI6q4oZrN8h4zk9D6u%2BMsQKq1F2dtoI4djZFrpetjXqF7L3ZQs5KGcww61Bxc4aTfAESX1sTM5W8ExIou1bZgc7NXbwP6SPuOVl%2F9Nc33MMjD5AIYKReYthkAWjOdwR%2B3uY1%2BjMFYd8JV9Iq0j1lQIQF%2F9JnvJ3NM%2FIb0xycKgexm6Hjj2anzxM5Vl%2F7IaYgdObMQ%2BREwq32MeEt6aQQmxmP33wDKSC80HaIavkDXoMZ5%2FBICB4GCK0NPM1nuqB%2FB7Fy6WtekbI6RUCDywxe2PRt7d3LmeDIreD8XsRDowT6P%2FoU1YBRAg9ZuZruB5L7J2DubT1AvooRJYz%2FTmAWs6uX6T7MPetgtcGOrEB1gd0nqGBZWhawUrp63XhYIzahHCjf%2BBI2mL2bchmPESPlXizWyg0unSAhZwuUgQW3M1ctZYSvS7vvJGtUrRkJBEjYlSVWFVgtelLseQwcH%2B9qImNGDXMAYvk2wSunxkDeHruFaF9JjzkOeT6G%2BGJ412Dawmas5Wn%2BmGcxdU7i3bajlDcvgTche7JT7EBwNvEPXBnPuncVDvbBO03%2Bju1zGoeEP6Fk8tjXWXUw8kExPSK&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20261027T123750Z&X-Amz-SignedHeaders=host&X-Amz-Expires=604800&X-Amz-Credential=ASIAQIVDYNUOJMVB7VFV%2F20261027%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Signature=744e59b77fc87299ada4fbcd73adf647e7b0e67a8597a261a832b7d5dbb0920a",
        documentType: "USERQUERYSCREENSHOT",
      },
    ],
    borrowerDetails: {
      userId: 55711,
      fullname: "DARA DHARANI DEVI",
      mobileNumber: "6302828128",
      email: "nadipallidharanidevi1@gmail.com",
      emailVerified: null,
      panNumber: "GGZPD6854G",
      aadharNumber: null,
      salaryIncomeMonthly: null,
      primaryType: null,
      state: "Telangana",
      pinCode: "507209",
      city: "Khammam",
      address: "Khammam",
      dob: "1999-04-15",
      userRegisterDate: "2024-07-09T15:28:38.624+0000",
      gender: "",
      utm: "WEB",
      bankAccNumber: "6486101004688",
      ifsc: "CNRB0006486",
      bankName: "CANARA BANK",
      branchName: "KALLUR",
      whastappNumber: "916302828128",
      companyName: null,
      designation: null,
      accountStatus: "REGISTERED",
      employmentType: null,
    },
    personalDetails: {
      fatherName: "Ramana",
      motherName: null,
      spouseName: null,
      spouseDob: null,
      maritalStatus: null,
      middleName: null,
      permanentAddress: "2-97/1,Yerraboinapally(V),Kallur(MD),Khammam(DT).",
      nationality: null,
    },
    professionalDetails: null,
    referenceDetails: {
      userId: 55711,
      status: "notFound",
      referenceDto: null,
      reference1: null,
      reference2: null,
      reference3: null,
      reference4: null,
      reference5: null,
      reference6: null,
      reference7: null,
      reference8: null,
    },
    nomineeDetails: {
      userId: 55711,
      emial: "daraanil9999@gmail.com",
      mobileNumber: "9676776770",
      name: "DARA ANILKUMAR",
      relation: "Husband",
      accountNumber: "6486101004687",
      bankName: "Canara",
      branchName: "Kallur",
      ifscCode: "CNRB0006486",
      city: "Kallur",
      errorMessage: null,
    },
    experianSummary: {
      userId: 55711,
      fullName: "DARA DHARANI DEVI",
      email: "nadipallidharanidevi1@gmail.com",
      mobileNumber: "6302828128",
      primaryType: "LENDER",
      uniqueNumber: "LR1055711",
      userStatus: "REGISTERED",
      oxyScore: 0,
      creditScore: 0,
      creditReportMonth: null,
      riskCategory: null,
      creditReportFileName: null,
      creditReportFilePath: null,
      comments: null,
      password: null,
      creditReportAvailable: false,
    },
  },
  {
    userId: 60982,
    name: "AJEET KUMAR",
    documents: [
      {
        document:
          "https://oxyloansv1.s3.ap-south-1.amazonaws.com/60982/AADHAR_TMPDOODLE1738754817291.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjECQaCmFwLXNvdXRoLTEiRzBFAiEAg5TZra17%2FhDkRQ0pUs%2BNp3vR%2F6QqjKaNm6Se7X3PJ3ICIF8H%2FwuVnLIodfY8Q6BNm46t%2BwiH7xPPNclMWKyI8zTtKr4FCO3%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQAxoMMDE4NTk3MDQ3NTgwIgy5jphnepIjpKJKVesqkgWTIVM7KHt3PuolymAyxlVHHjp5hUYoiGxdBkJ40CnRJ%2FKNswHxpRCQBQBsM8qqmtXJNtcFC3UiPB8Vz1BuN2IPl55wDY57%2BOrwAxl5u1%2BuXdE%2FwRKTSJNRYHc4kC4mAMafxKgVL6xya2FbrEHisH4EAD8uZnDnjR8SQzVqLenX8nyR19regi%2BOyCOpWTM1BEbsry2J1KULNOiP8G9jK1pDcsy4TFBBl6LV2z1I%2FMwpPCYCjMRHnjSIlQt9Yq6oix8fJ6pZj1%2FWZcri87JpUJEIBFj1%2By2c5mgLtjzPP34lPlI%2Fp7P275JDpwx9DYL3ng%2FFtTLPyyIpV81ujlp%2BVD2vDRiwzlx7qFEEaPWvQWMkOWpDk4sIZ7G69AQBM0%2BaHxtZa%2F%2Fl3jHPDEn5dVeK0YYkpumkooYPwRmP2kV8fQwGwc%2FHpHDRl9p1qwhARfxf%2FBhl%2F3OKX%2BrZsBe%2BKL7pxmtadPFTG%2BmB5Ey1iUDOAkr4GD3ioOCHPw0BM4MFYD9Vrr%2B1CCtWqZ2xRivYcb3Q1LI6q4oZrN8h4zk9D6u%2BMsQKq1F2dtoI4djZFrpetjXqF7L3ZQs5KGcww61Bxc4aTfAESX1sTM5W8ExIou1bZgc7NXbwP6SPuOVl%2F9Nc33MMjD5AIYKReYthkAWjOdwR%2B3uY1%2BjMFYd8JV9Iq0j1lQIQF%2F9JnvJ3NM%2FIb0xycKgexm6Hjj2anzxM5Vl%2F7IaYgdObMQ%2BREwq32MeEt6aQQmxmP33wDKSC80HaIavkDXoMZ5%2FBICB4GCK0NPM1nuqB%2FB7Fy6WtekbI6RUCDywxe2PRt7d3LmeDIreD8XsRDowT6P%2FoU1YBRAg9ZuZruB5L7J2DubT1AvooRJYz%2FTmAWs6uX6T7MPetgtcGOrEB1gd0nqGBZWhawUrp63XhYIzahHCjf%2BBI2mL2bchmPESPlXizWyg0unSAhZwuUgQW3M1ctZYSvS7vvJGtUrRkJBEjYlSVWFVgtelLseQwcH%2B9qImNGDXMAYvk2wSunxkDeHruFaF9JjzkOeT6G%2BGJ412Dawmas5Wn%2BmGcxdU7i3bajlDcvgTche7JT7EBwNvEPXBnPuncVDvbBO03%2Bju1zGoeEP6Fk8tjXWXUw8kExPSK&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20261027T123750Z&X-Amz-SignedHeaders=host&X-Amz-Expires=604799&X-Amz-Credential=ASIAQIVDYNUOJMVB7VFV%2F20261027%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Signature=1456a7db228e9a84151df73d2213ca179c495397c118c4608816d6eb272f388e",
        documentType: "AADHAR",
      },
      {
        document:
          "https://oxyloansv1.s3.ap-south-1.amazonaws.com/60982/PAN_TMPDOODLE1738754711618.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjECQaCmFwLXNvdXRoLTEiRzBFAiEAg5TZra17%2FhDkRQ0pUs%2BNp3vR%2F6QqjKaNm6Se7X3PJ3ICIF8H%2FwuVnLIodfY8Q6BNm46t%2BwiH7xPPNclMWKyI8zTtKr4FCO3%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQAxoMMDE4NTk3MDQ3NTgwIgy5jphnepIjpKJKVesqkgWTIVM7KHt3PuolymAyxlVHHjp5hUYoiGxdBkJ40CnRJ%2FKNswHxpRCQBQBsM8qqmtXJNtcFC3UiPB8Vz1BuN2IPl55wDY57%2BOrwAxl5u1%2BuXdE%2FwRKTSJNRYHc4kC4mAMafxKgVL6xya2FbrEHisH4EAD8uZnDnjR8SQzVqLenX8nyR19regi%2BOyCOpWTM1BEbsry2J1KULNOiP8G9jK1pDcsy4TFBBl6LV2z1I%2FMwpPCYCjMRHnjSIlQt9Yq6oix8fJ6pZj1%2FWZcri87JpUJEIBFj1%2By2c5mgLtjzPP34lPlI%2Fp7P275JDpwx9DYL3ng%2FFtTLPyyIpV81ujlp%2BVD2vDRiwzlx7qFEEaPWvQWMkOWpDk4sIZ7G69AQBM0%2BaHxtZa%2F%2Fl3jHPDEn5dVeK0YYkpumkooYPwRmP2kV8fQwGwc%2FHpHDRl9p1qwhARfxf%2FBhl%2F3OKX%2BrZsBe%2BKL7pxmtadPFTG%2BmB5Ey1iUDOAkr4GD3ioOCHPw0BM4MFYD9Vrr%2B1CCtWqZ2xRivYcb3Q1LI6q4oZrN8h4zk9D6u%2BMsQKq1F2dtoI4djZFrpetjXqF7L3ZQs5KGcww61Bxc4aTfAESX1sTM5W8ExIou1bZgc7NXbwP6SPuOVl%2F9Nc33MMjD5AIYKReYthkAWjOdwR%2B3uY1%2BjMFYd8JV9Iq0j1lQIQF%2F9JnvJ3NM%2FIb0xycKgexm6Hjj2anzxM5Vl%2F7IaYgdObMQ%2BREwq32MeEt6aQQmxmP33wDKSC80HaIavkDXoMZ5%2FBICB4GCK0NPM1nuqB%2FB7Fy6WtekbI6RUCDywxe2PRt7d3LmeDIreD8XsRDowT6P%2FoU1YBRAg9ZuZruB5L7J2DubT1AvooRJYz%2FTmAWs6uX6T7MPetgtcGOrEB1gd0nqGBZWhawUrp63XhYIzahHCjf%2BBI2mL2bchmPESPlXizWyg0unSAhZwuUgQW3M1ctZYSvS7vvJGtUrRkJBEjYlSVWFVgtelLseQwcH%2B9qImNGDXMAYvk2wSunxkDeHruFaF9JjzkOeT6G%2BGJ412Dawmas5Wn%2BmGcxdU7i3bajlDcvgTche7JT7EBwNvEPXBnPuncVDvbBO03%2Bju1zGoeEP6Fk8tjXWXUw8kExPSK&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20261027T123750Z&X-Amz-SignedHeaders=host&X-Amz-Expires=604800&X-Amz-Credential=ASIAQIVDYNUOJMVB7VFV%2F20261027%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Signature=c0e6298de45f905546710391ddc61db6e80cb78d666f132f8efd5dd33fc2e0bd",
        documentType: "PAN",
      },
      {
        document:
          "https://oxyloansv1.s3.ap-south-1.amazonaws.com/60982/CHEQUELEAF_IMG_20241206_111659.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjECQaCmFwLXNvdXRoLTEiRzBFAiEAg5TZra17%2FhDkRQ0pUs%2BNp3vR%2F6QqjKaNm6Se7X3PJ3ICIF8H%2FwuVnLIodfY8Q6BNm46t%2BwiH7xPPNclMWKyI8zTtKr4FCO3%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQAxoMMDE4NTk3MDQ3NTgwIgy5jphnepIjpKJKVesqkgWTIVM7KHt3PuolymAyxlVHHjp5hUYoiGxdBkJ40CnRJ%2FKNswHxpRCQBQBsM8qqmtXJNtcFC3UiPB8Vz1BuN2IPl55wDY57%2BOrwAxl5u1%2BuXdE%2FwRKTSJNRYHc4kC4mAMafxKgVL6xya2FbrEHisH4EAD8uZnDnjR8SQzVqLenX8nyR19regi%2BOyCOpWTM1BEbsry2J1KULNOiP8G9jK1pDcsy4TFBBl6LV2z1I%2FMwpPCYCjMRHnjSIlQt9Yq6oix8fJ6pZj1%2FWZcri87JpUJEIBFj1%2By2c5mgLtjzPP34lPlI%2Fp7P275JDpwx9DYL3ng%2FFtTLPyyIpV81ujlp%2BVD2vDRiwzlx7qFEEaPWvQWMkOWpDk4sIZ7G69AQBM0%2BaHxtZa%2F%2Fl3jHPDEn5dVeK0YYkpumkooYPwRmP2kV8fQwGwc%2FHpHDRl9p1qwhARfxf%2FBhl%2F3OKX%2BrZsBe%2BKL7pxmtadPFTG%2BmB5Ey1iUDOAkr4GD3ioOCHPw0BM4MFYD9Vrr%2B1CCtWqZ2xRivYcb3Q1LI6q4oZrN8h4zk9D6u%2BMsQKq1F2dtoI4djZFrpetjXqF7L3ZQs5KGcww61Bxc4aTfAESX1sTM5W8ExIou1bZgc7NXbwP6SPuOVl%2F9Nc33MMjD5AIYKReYthkAWjOdwR%2B3uY1%2BjMFYd8JV9Iq0j1lQIQF%2F9JnvJ3NM%2FIb0xycKgexm6Hjj2anzxM5Vl%2F7IaYgdObMQ%2BREwq32MeEt6aQQmxmP33wDKSC80HaIavkDXoMZ5%2FBICB4GCK0NPM1nuqB%2FB7Fy6WtekbI6RUCDywxe2PRt7d3LmeDIreD8XsRDowT6P%2FoU1YBRAg9ZuZruB5L7J2DubT1AvooRJYz%2FTmAWs6uX6T7MPetgtcGOrEB1gd0nqGBZWhawUrp63XhYIzahHCjf%2BBI2mL2bchmPESPlXizWyg0unSAhZwuUgQW3M1ctZYSvS7vvJGtUrRkJBEjYlSVWFVgtelLseQwcH%2B9qImNGDXMAYvk2wSunxkDeHruFaF9JjzkOeT6G%2BGJ412Dawmas5Wn%2BmGcxdU7i3bajlDcvgTche7JT7EBwNvEPXBnPuncVDvbBO03%2Bju1zGoeEP6Fk8tjXWXUw8kExPSK&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20261027T123750Z&X-Amz-SignedHeaders=host&X-Amz-Expires=604800&X-Amz-Credential=ASIAQIVDYNUOJMVB7VFV%2F20261027%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Signature=f628ceb9fcfc2e8cabc96a04c0670a99c63ad48aa480787e678e1c75deac5a96",
        documentType: "CHEQUELEAF",
      },
    ],
    borrowerDetails: {
      userId: 60982,
      fullname: "AJEET KUMAR",
      mobileNumber: "7589490552",
      email: "sajeet781@gmail.com",
      emailVerified: null,
      panNumber: "Eoepk5193A",
      aadharNumber: null,
      salaryIncomeMonthly: null,
      primaryType: null,
      state: "",
      pinCode: "",
      city: "",
      address: "Vill jalalpur post Dapper district Mohali Punjab ",
      dob: "1989-02-17",
      userRegisterDate: "2025-02-05T11:10:38.239+0000",
      gender: "",
      utm: "WEB",
      bankAccNumber: null,
      ifsc: null,
      bankName: null,
      branchName: null,
      whastappNumber: "917589490552",
      companyName: null,
      designation: null,
      accountStatus: "REGISTERED",
      employmentType: null,
    },
    personalDetails: {
      fatherName: "",
      motherName: null,
      spouseName: null,
      spouseDob: null,
      maritalStatus: null,
      middleName: null,
      permanentAddress: null,
      nationality: null,
    },
    professionalDetails: null,
    referenceDetails: {
      userId: 60982,
      status: "notFound",
      referenceDto: null,
      reference1: null,
      reference2: null,
      reference3: null,
      reference4: null,
      reference5: null,
      reference6: null,
      reference7: null,
      reference8: null,
    },
    nomineeDetails: null,
    experianSummary: {
      userId: 60982,
      fullName: "AJEET KUMAR",
      email: "sajeet781@gmail.com",
      mobileNumber: "7589490552",
      primaryType: "BORROWER",
      uniqueNumber: "BR1060982",
      userStatus: "REGISTERED",
      oxyScore: 0,
      creditScore: 0,
      creditReportMonth: null,
      riskCategory: null,
      creditReportFileName: null,
      creditReportFilePath: null,
      comments: null,
      password: null,
      creditReportAvailable: false,
    },
  },
];

// Document meta dictionary with badges & colors
const DOC_META = {
  AADHAR: { label: "Aadhaar Card", color: "blue", icon: "fa-id-card" },
  PAN: { label: "PAN Card", color: "green", icon: "fa-address-card" },
  CHEQUELEAF: { label: "Cancelled Cheque", color: "purple", icon: "fa-money-check" },
  USERQUERYSCREENSHOT: {
    label: "Query Screenshot",
    color: "orange",
    icon: "fa-image",
  },
  PASSPORT: { label: "Passport", color: "cyan", icon: "fa-passport" },
  DRIVINGLICENCE: { label: "Driving License", color: "geekblue", icon: "fa-id-badge" },
  VOTERID: { label: "Voter ID", color: "lime", icon: "fa-person-booth" },
  BANKSTATEMENT: { label: "Bank Statement", color: "gold", icon: "fa-university" },
  PAYSLIPS: { label: "Salary Slips", color: "magenta", icon: "fa-file-invoice" },
};

const getInitials = (name = "") => {
  if (!name) return "B";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getAvatarColor = (name = "") => {
  const colors = [
    "#3b82f6",
    "#10b981",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#06b6d4",
    "#6366f1",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};


// Helper to calculate borrower completeness matching BorrowerProfile.jsx validation
export const computeBorrowerCompleteness = (record) => {
  if (!record) {
    return {
      percentage: 0,
      isEligibleToRaiseLoan: false,
      missingRequirements: [],
      completionBreakdown: [],
      completionGroups: [],
      pointsRemainingToEligibility: 90,
    };
  }

  const bDetails = record.borrowerDetails || {};
  const pDetails = record.personalDetails || {};
  const nDetails = record.nomineeDetails || {};
  const rDetails = record.referenceDetails || {};
  const docs = Array.isArray(record.documents) ? record.documents : [];

  // Parse name into firstName & lastName for borrowerValidation completeness check
  const rawName = bDetails.fullname || record.name || "";
  const nameParts = rawName.trim().split(/\s+/).filter(Boolean);
  const firstName = bDetails.firstName || (nameParts.length > 0 ? nameParts[0] : "");
  const lastName =
    bDetails.lastName ||
    (nameParts.length > 1 ? nameParts.slice(1).join(" ") : nameParts[0] || "");

  // Build kycDocs structure from documents array
  const kycDocs = {};
  let hasPanDoc = false;
  let hasAadharDoc = false;

  docs.forEach((d) => {
    const type = (d.documentType || "").toUpperCase();
    if (type === "PAN") {
      hasPanDoc = true;
      kycDocs.PanCard = { downloadUrl: d.document, documentName: "PAN" };
      kycDocs.pan = { downloadUrl: d.document, documentName: "PAN" };
    } else if (type === "AADHAR") {
      hasAadharDoc = true;
      kycDocs.aadhar = { downloadUrl: d.document, documentName: "AADHAR" };
      kycDocs.Aadhar = { downloadUrl: d.document, documentName: "AADHAR" };
    } else if (type === "PAYSLIPS" || type === "PAYSLIP") {
      kycDocs.paySlips = { downloadUrl: d.document, documentName: "PAYSLIPS" };
    } else if (type === "BANKSTATEMENT" || type === "CHEQUELEAF") {
      kycDocs.bankStatement = { downloadUrl: d.document, documentName: type };
    }
  });

  const isPanVerified = Boolean(
    bDetails.panNumber &&
      (hasPanDoc || bDetails.panStatus === "VERIFIED" || bDetails.isPanVerified)
  );

  // Nominee object
  const nominee = nDetails.name
    ? {
        nomineeName: nDetails.name,
        name: nDetails.name,
        nomineeMobile: nDetails.mobileNumber,
        mobileNumber: nDetails.mobileNumber,
        relation: nDetails.relation || "Nominee",
        emial: nDetails.emial || nDetails.email,
        email: nDetails.emial || nDetails.email,
        bankName: nDetails.bankName,
        accountNumber: nDetails.accountNumber,
        ifscCode: nDetails.ifscCode,
        city: nDetails.city,
      }
    : null;

  // Reference contacts
  const references = [];
  if (rDetails.referenceDto && Array.isArray(rDetails.referenceDto)) {
    references.push(...rDetails.referenceDto);
  }
  for (let i = 1; i <= 8; i++) {
    const refVal = rDetails[`reference${i}`];
    if (refVal) {
      references.push({
        name: `Reference ${i}`,
        referenceNumber: String(refVal),
        mobileNumber: String(refVal),
      });
    }
  }

  // Bank account object
  const bankAccount = {
    accountNumber: bDetails.bankAccNumber || "",
    ifscCode: bDetails.ifsc || "",
    bankName: bDetails.bankName || "",
    branchName: bDetails.branchName || "",
  };

  const profileData = {
    ...bDetails,
    ...pDetails,
    firstName,
    lastName,
    name: rawName,
    fullname: rawName,
    dob: bDetails.dob,
    gender: bDetails.gender,
    fatherName: pDetails.fatherName,
    motherName: pDetails.motherName,
    maritalStatus: pDetails.maritalStatus || "Single",
    spouseName: pDetails.spouseName,
    mobileNumber: bDetails.mobileNumber,
    whatsAppNumber: bDetails.whastappNumber || bDetails.mobileNumber,
    email: bDetails.email,
    panNumber: bDetails.panNumber,
    isPanVerified,
    panVerified: isPanVerified,
    residenceAddress: bDetails.address || pDetails.permanentAddress,
    address: bDetails.address,
    city: bDetails.city,
    state: bDetails.state,
    pinCode: bDetails.pinCode,
    companyName: bDetails.companyName,
    salary: bDetails.salaryIncomeMonthly,
    designation: bDetails.designation,
    officeAddress: bDetails.officeAddress,
    employment: bDetails.employmentType || "SALARIED",
    accountNumber: bDetails.bankAccNumber,
    ifscCode: bDetails.ifsc,
    bankName: bDetails.bankName,
    bankDetailsInfo: Boolean(bDetails.bankAccNumber && bDetails.ifsc),
    aadharNumber: bDetails.aadharNumber,
    kycDocs,
    kycStatus: Boolean(hasAadharDoc && (hasPanDoc || isPanVerified)),
  };

  return calculateBorrowerProfileCompleteness(
    profileData,
    references.length > 0 ? references : null,
    nominee,
    bankAccount
  );
};

const BorrowersList = () => {
  const navigate = useNavigate();

  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUsingSample, setIsUsingSample] = useState(false);

  // Search by dropdown (borrowerId, name, mobileNumber) + server-side search
  const [searchType, setSearchType] = useState("borrowerId");
  const [searchValue, setSearchValue] = useState("");
  const [appliedSearch, setAppliedSearch] = useState(null);
  const [docFilter, setDocFilter] = useState("ALL");
  const [bankFilter, setBankFilter] = useState("ALL");
  const [nomineeFilter, setNomineeFilter] = useState("ALL");
  const [stateFilter, setStateFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Server API Pagination state (No server totalCount)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [hasNextPage, setHasNextPage] = useState(true);

  // Quick Filter for CEO
  const [quickFilter, setQuickFilter] = useState("ALL");

  // Modals
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [modalActiveTab, setModalActiveTab] = useState("1");
  const [showPendingDrawer, setShowPendingDrawer] = useState(false);

  // Document Lightbox
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerBorrower, setViewerBorrower] = useState(null);
  const [activeDocIndex, setActiveDocIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [imgLoadError, setImgLoadError] = useState(false);

  // Fetch borrower documents list dynamically from API (without pagination for search, only send active variable)
  const fetchBorrowers = async (
    targetPage = currentPage,
    targetPageSize = pageSize,
    showToast = false,
    searchParams = appliedSearch
  ) => {
    setLoading(true);

    let payload = {};

    // When searching: without pagination and only send the variable being searched
    if (searchParams && searchParams.value) {
      const { type, value } = searchParams;
      const cleanVal = String(value || "").trim();

      if (type === "borrowerId") {
        const cleanedId = cleanVal.replace(/^(BR|LR)/i, "").replace(/[^0-9]/g, "");
        payload = {
          borrowerId: cleanedId ? Number(cleanedId) : Number(cleanVal) || cleanVal,
        };
      } else if (type === "name") {
        payload = {
          name: cleanVal,
        };
      } else if (type === "mobileNumber") {
        payload = {
          mobileNumber: cleanVal,
        };
      }
    } else {
      // Default list: with pagination
      payload = {
        pageNo: Number(targetPage) || 1,
        pageSize: Number(targetPageSize) || 10,
      };
    }

    try {
      const response = await getBorrowerDocumentsList(payload);

      let records = [];

      if (Array.isArray(response?.data)) {
        records = response.data;
      } else if (response?.data && typeof response.data === "object") {
        if (Array.isArray(response.data.results)) {
          records = response.data.results;
        } else if (Array.isArray(response.data.borrowerDocuments)) {
          records = response.data.borrowerDocuments;
        } else if (Array.isArray(response.data.listOfBorrowers)) {
          records = response.data.listOfBorrowers;
        } else if (Array.isArray(response.data.data)) {
          records = response.data.data;
        } else if (Array.isArray(response.data.records)) {
          records = response.data.records;
        } else if (Array.isArray(response.data.list)) {
          records = response.data.list;
        }
      }

      if (response?.status === 200) {
        setBorrowers(records);
        setIsUsingSample(false);

        // Keep Next enabled if records were returned
        setHasNextPage(records.length > 0);

        if (showToast) {
          if (records.length > 0) {
            message.success(
              searchParams
                ? `Found ${records.length} borrower(s) matching your search`
                : `Loaded page ${targetPage} (${records.length} records)`
            );
          } else {
            message.info(
              searchParams
                ? "No borrower records found matching your search."
                : `Page ${targetPage} has no records. You have reached the end of the list.`
            );
          }
        }
      } else {
        setBorrowers([]);
        setHasNextPage(false);
        if (showToast) {
          message.error(response?.data?.errorMessage || "Failed to load borrowers");
        }
      }
    } catch (error) {
      console.error("Error fetching borrowerDocuments:", error);
      setBorrowers([]);
      setHasNextPage(false);
      if (showToast) {
        message.error("Failed to connect to /borrowerDocuments API");
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchBorrowers(1, 10, false, null);
  }, []);

  // Previous Page navigation
  const handlePrev = () => {
    if (loading || currentPage <= 1) return;
    const prevPage = currentPage - 1;
    setCurrentPage(prevPage);
    fetchBorrowers(prevPage, pageSize, true, appliedSearch);
  };

  // Next Page navigation
  const handleNext = () => {
    if (loading) return;
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchBorrowers(nextPage, pageSize, true, appliedSearch);
  };

  // Page Size change
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
    fetchBorrowers(1, newSize, true, appliedSearch);
  };

  // Search handlers
  const handleSearch = () => {
    const trimmedVal = searchValue.trim();
    if (!trimmedVal) {
      message.warning("Please enter a value to search");
      return;
    }

    if (searchType === "borrowerId") {
      const cleanedId = trimmedVal.replace(/^(BR|LR)/i, "").replace(/[^0-9]/g, "");
      if (!cleanedId) {
        message.warning("Please enter a valid numeric Borrower ID (e.g. 69957)");
        return;
      }
    }

    if (searchType === "mobileNumber") {
      const cleanMobile = trimmedVal.replace(/[^0-9+]/g, "");
      if (!cleanMobile) {
        message.warning("Please enter a valid Mobile Number (e.g. 868654986)");
        return;
      }
    }

    const newSearch = { type: searchType, value: trimmedVal };
    setAppliedSearch(newSearch);
    setCurrentPage(1);
    fetchBorrowers(1, pageSize, true, newSearch);
  };

  const handleClearSearch = () => {
    setSearchValue("");
    setAppliedSearch(null);
    setCurrentPage(1);
    fetchBorrowers(1, pageSize, true, null);
  };

  const handleSearchInputChange = (e) => {
    const val = e.target.value;
    setSearchValue(val);
    if (!val && appliedSearch) {
      setAppliedSearch(null);
      setCurrentPage(1);
      fetchBorrowers(1, pageSize, true, null);
    }
  };

  const handleSearchTypeChange = (newType) => {
    setSearchType(newType);
    setSearchValue("");
  };

  // Filtered dataset
  const filteredData = useMemo(() => {
    return borrowers.filter((item) => {
      // Document filter
      const docs = Array.isArray(item.documents) ? item.documents : [];
      if (docFilter === "WITH_DOCS" && docs.length === 0) return false;
      if (docFilter === "NO_DOCS" && docs.length > 0) return false;
      if (
        docFilter === "AADHAR" &&
        !docs.some((d) => d.documentType === "AADHAR")
      )
        return false;
      if (docFilter === "PAN" && !docs.some((d) => d.documentType === "PAN"))
        return false;
      if (
        docFilter === "CHEQUELEAF" &&
        !docs.some((d) => d.documentType === "CHEQUELEAF")
      )
        return false;
      if (docFilter === "MULTIPLE" && docs.length < 2) return false;

      // Bank Details filter
      const hasBank = !!item.borrowerDetails?.bankAccNumber;
      if (bankFilter === "HAS_BANK" && !hasBank) return false;
      if (bankFilter === "NO_BANK" && hasBank) return false;

      // Nominee filter
      const hasNominee = !!item.nomineeDetails?.name;
      if (nomineeFilter === "HAS_NOMINEE" && !hasNominee) return false;
      if (nomineeFilter === "NO_NOMINEE" && hasNominee) return false;

      // State filter
      if (stateFilter !== "ALL") {
        const itemState = (item.borrowerDetails?.state || "").trim().toLowerCase();
        if (itemState !== stateFilter.toLowerCase()) return false;
      }

      // Status filter
      if (statusFilter !== "ALL") {
        const itemStatus = (
          item.borrowerDetails?.accountStatus ||
          item.experianSummary?.userStatus ||
          ""
        ).toUpperCase();
        if (itemStatus !== statusFilter) return false;
      }

      // CEO Quick Filter
      if (quickFilter === "ELIGIBLE") {
        const comp = computeBorrowerCompleteness(item);
        if (comp.percentage < 90) return false;
      } else if (quickFilter === "INCOMPLETE") {
        const comp = computeBorrowerCompleteness(item);
        if (comp.percentage >= 90) return false;
      } else if (quickFilter === "WITH_DOCS") {
        if (!docs.length) return false;
      } else if (quickFilter === "BANK_LINKED") {
        if (!item.borrowerDetails?.bankAccNumber) return false;
      } else if (quickFilter === "NOMINEE_ADDED") {
        if (!item.nomineeDetails?.name) return false;
      }

      return true;
    });
  }, [
    borrowers,
    docFilter,
    bankFilter,
    nomineeFilter,
    stateFilter,
    statusFilter,
    quickFilter,
  ]);

  // Distinct states for filter dropdown
  const availableStates = useMemo(() => {
    const set = new Set();
    borrowers.forEach((b) => {
      const s = (b.borrowerDetails?.state || "").trim();
      if (s) set.add(s);
    });
    return Array.from(set).sort();
  }, [borrowers]);

  // Overall Statistics
  const stats = useMemo(() => {
    const total = borrowers.length;
    let withDocs = 0;
    let totalDocsCount = 0;
    let aadharCount = 0;
    let panCount = 0;
    let chequeCount = 0;
    let bankCount = 0;
    let nomineeCount = 0;
    let creditReportCount = 0;
    let eligibleCount = 0;
    let totalCompleteness = 0;
    let totalPersonalPct = 0;

    borrowers.forEach((b) => {
      const docs = Array.isArray(b.documents) ? b.documents : [];
      if (docs.length > 0) withDocs++;
      totalDocsCount += docs.length;
      if (docs.some((d) => d.documentType === "AADHAR")) aadharCount++;
      if (docs.some((d) => d.documentType === "PAN")) panCount++;
      if (docs.some((d) => d.documentType === "CHEQUELEAF")) chequeCount++;
      if (b.borrowerDetails?.bankAccNumber) bankCount++;
      if (b.nomineeDetails?.name) nomineeCount++;
      if (b.experianSummary?.creditReportAvailable) creditReportCount++;

      const comp = computeBorrowerCompleteness(b);
      totalCompleteness += comp.percentage;
      if (comp.percentage >= 90) eligibleCount++;
      const pGroup = comp.completionGroups?.find(
        (g) => g.label === "Personal & Identity"
      );
      if (pGroup) totalPersonalPct += pGroup.earned;
    });

    const avgCompleteness = total > 0 ? Math.round(totalCompleteness / total) : 0;
    const avgPersonalPct = total > 0 ? Math.round(totalPersonalPct / total) : 0;

    return {
      total,
      withDocs,
      totalDocsCount,
      aadharCount,
      panCount,
      chequeCount,
      bankCount,
      nomineeCount,
      creditReportCount,
      eligibleCount,
      avgCompleteness,
      avgPersonalPct,
    };
  }, [borrowers]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchValue("");
    setAppliedSearch(null);
    setDocFilter("ALL");
    setBankFilter("ALL");
    setNomineeFilter("ALL");
    setStateFilter("ALL");
    setStatusFilter("ALL");
    setQuickFilter("ALL");
    setCurrentPage(1);
    fetchBorrowers(1, pageSize, true, null);
  };

  // Open Document Lightbox
  const openDocViewer = (borrower, initialDocIndex = 0) => {
    setViewerBorrower(borrower);
    setActiveDocIndex(initialDocIndex);
    setZoomLevel(1);
    setRotation(0);
    setImgLoadError(false);
    setViewerVisible(true);
  };

  // Open Full Profile Modal with reset to Tab 1
  const openProfileModal = (borrower) => {
    setSelectedBorrower(borrower);
    setModalActiveTab("1");
    setShowPendingDrawer(false);
    setProfileModalVisible(true);
  };

  // Copy to clipboard helper (with fallback for HTTP / non-secure contexts like IP address access)
  const copyText = async (text, label) => {
    if (!text && text !== 0) return;
    const value = String(text);

    const fallbackCopy = (val) => {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = val;
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.left = "-9999px";
        textArea.style.opacity = "0";
        textArea.setAttribute("readonly", "");
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        return successful;
      } catch (err) {
        console.error("Fallback copy failed:", err);
        return false;
      }
    };

    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        window.isSecureContext
      ) {
        await navigator.clipboard.writeText(value);
        message.success(`${label || "Text"} copied to clipboard`);
      } else {
        const success = fallbackCopy(value);
        if (success) {
          message.success(`${label || "Text"} copied to clipboard`);
        } else {
          message.error("Failed to copy to clipboard");
        }
      }
    } catch (err) {
      // If navigator.clipboard fails (e.g. permission denied), attempt fallback
      const success = fallbackCopy(value);
      if (success) {
        message.success(`${label || "Text"} copied to clipboard`);
      } else {
        message.error("Failed to copy to clipboard");
      }
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    if (!filteredData.length) {
      message.warning("No data to export");
      return;
    }

    const headers = [
      "User ID",
      "Unique ID",
      "Full Name",
      "Personal Details %",
      "Profile Completeness %",
      "Loan Eligibility Status",
      "Mobile Number",
      "WhatsApp Number",
      "Email",
      "Account Status",
      "Registration Date",
      "PAN Number",
      "Aadhaar Number",
      "City",
      "State",
      "Pincode",
      "Address",
      "Bank Name",
      "Branch Name",
      "Account Number",
      "IFSC Code",
      "Documents Count",
      "Document Types",
      "Nominee Name",
      "Nominee Relation",
      "Nominee Mobile",
      "Credit Score",
      "Oxy Score",
      "Credit Report Available",
    ];

    const rows = filteredData.map((b) => {
      const d = b.borrowerDetails || {};
      const n = b.nomineeDetails || {};
      const exp = b.experianSummary || {};
      const docs = Array.isArray(b.documents) ? b.documents : [];
      const docTypes = docs.map((doc) => doc.documentType).join("; ");
      const comp = computeBorrowerCompleteness(b);
      const personalGroup = comp.completionGroups?.find(
        (g) => g.label === "Personal & Identity"
      ) || { earned: 0, points: 30 };

      return [
        b.userId || d.userId || "",
        exp.uniqueNumber || "",
        `"${(b.name || d.fullname || "").replace(/"/g, '""')}"`,
        `"${personalGroup.earned}% / 30%"`,
        `"${comp.percentage}%"`,
        `"${comp.percentage >= 90 ? "ELIGIBLE (>=90%)" : "INCOMPLETE"}"`,
        d.mobileNumber || "",
        d.whastappNumber || "",
        d.email || "",
        d.accountStatus || exp.userStatus || "REGISTERED",
        d.userRegisterDate ? moment(d.userRegisterDate).format("YYYY-MM-DD") : "",
        d.panNumber || "",
        d.aadharNumber || "",
        `"${(d.city || "").replace(/"/g, '""')}"`,
        `"${(d.state || "").replace(/"/g, '""')}"`,
        d.pinCode || "",
        `"${(d.address || "").replace(/"/g, '""')}"`,
        `"${(d.bankName || "").replace(/"/g, '""')}"`,
        `"${(d.branchName || "").replace(/"/g, '""')}"`,
        d.bankAccNumber ? `'${d.bankAccNumber}` : "",
        d.ifsc || "",
        docs.length,
        `"${docTypes.replace(/"/g, '""')}"`,
        `"${(n.name || "").replace(/"/g, '""')}"`,
        `"${(n.relation || "").replace(/"/g, '""')}"`,
        n.mobileNumber || "",
        exp.creditScore || 0,
        exp.oxyScore || 0,
        exp.creditReportAvailable ? "Yes" : "No",
      ].join(",");
    });

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `oxyloans_borrowers_documents_${moment().format("YYYYMMDD_HHmm")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success("Borrowers list exported successfully");
  };

  // Columns definition for Ant Design Table
  const columns = [
    {
      title: "S.No",
      key: "sno",
      width: 65,
      align: "center",
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Borrower Info",
      key: "borrowerInfo",
      width: 240,
      render: (_, record) => {
        const name = record.name || record.borrowerDetails?.fullname || "Unknown";
        const userId = record.userId || record.borrowerDetails?.userId;
        const uniqueNo = record.experianSummary?.uniqueNumber;
        const regDate = record.borrowerDetails?.userRegisterDate;
        const status =
          record.borrowerDetails?.accountStatus ||
          record.experianSummary?.userStatus ||
          "REGISTERED";
        const initials = getInitials(name);
        const avatarColor = getAvatarColor(name);

        return (
          <div className="d-flex align-items-start gap-2">
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${avatarColor}, #4338ca)`,
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              }}
            >
              {initials}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: "#1f2937", fontSize: 14 }}>
                {name}
              </div>
              <div className="d-flex align-items-center gap-1 mt-1 flex-wrap">
                {uniqueNo && (
                  <Tag color="purple" style={{ margin: 0, fontSize: 11 }}>
                    {uniqueNo}
                  </Tag>
                )}
                <Tag color="geekblue" style={{ margin: 0, fontSize: 11 }}>
                  ID: #{userId}
                </Tag>
                <Tag
                  color={status === "REGISTERED" ? "blue" : "green"}
                  style={{ margin: 0, fontSize: 11 }}
                >
                  {status}
                </Tag>
              </div>
              {regDate && (
                <div
                  style={{ fontSize: 11, color: "#6b7280", marginTop: 3 }}
                  title="Registration Date"
                >
                  <i
                    className="fa-regular fa-calendar"
                    style={{ marginRight: 4 }}
                  ></i>
                  {moment(regDate).format("DD-MMM-YYYY")}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Personal Details %",
      key: "completeness",
      width: 210,
      render: (_, record) => {
        const completeness = computeBorrowerCompleteness(record);
        const personalGroup = completeness.completionGroups?.find(
          (g) => g.label === "Personal & Identity"
        ) || { earned: 0, points: 30 };
        const isEligible = completeness.percentage >= 90;

        return (
          <Tooltip
            placement="topLeft"
            title={
              <div style={{ maxWidth: 280, fontSize: 11 }}>
                <div style={{ fontWeight: 700, marginBottom: 4, borderBottom: "1px solid #475569", paddingBottom: 3 }}>
                  Profile Completeness ({completeness.percentage}%)
                </div>
                {completeness.completionGroups?.map((g) => {
                  const isPersonal = g.label === "Personal & Identity";
                  return (
                    <div
                      key={g.label}
                      className="d-flex justify-content-between mb-1"
                      style={{ color: isPersonal ? "#93c5fd" : undefined }}
                    >
                      <span>{g.label}:</span>
                      <strong>
                        {g.earned}% / {g.points}%
                      </strong>
                    </div>
                  );
                })}
                {completeness.missingRequirements?.length > 0 && (
                  <div className="mt-2 pt-1 border-top border-secondary">
                    <div style={{ color: "#fca5a5", fontWeight: 600 }}>
                      Pending ({completeness.missingRequirements.length}):
                    </div>
                    <div>{completeness.missingRequirements.slice(0, 3).join(", ")}</div>
                    {completeness.missingRequirements.length > 3 && (
                      <small style={{ color: "#cbd5e1" }}>
                        +{completeness.missingRequirements.length - 3} more
                      </small>
                    )}
                  </div>
                )}
              </div>
            }
          >
            <div style={{ cursor: "pointer" }} onClick={() => openProfileModal(record)}>
              {/* Personal Details Badge matching BorrowerProfile.jsx */}
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span
                  className="badge bg-primary-subtle text-primary rounded-pill fw-bold"
                  style={{ fontSize: 11, padding: "3px 8px" }}
                >
                  Personal: {personalGroup.earned}% / 30%
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: isEligible ? "#10b981" : "#f59e0b",
                  }}
                >
                  {completeness.percentage}%
                </span>
              </div>

              {/* Completeness Progress Bar matching BorrowerProfile.jsx */}
              <div className="progress" style={{ height: "6px", borderRadius: "10px", background: "#f1f5f9" }}>
                <div
                  className={`progress-bar rounded-pill ${isEligible ? "bg-success" : "bg-warning"}`}
                  role="progressbar"
                  style={{ width: `${completeness.percentage}%`, transition: "width 0.4s ease" }}
                />
              </div>

              <div className="d-flex align-items-center justify-content-between mt-1">
                <span style={{ fontSize: 10, color: "#6b7280" }}>
                  {isEligible ? (
                    <span className="text-success fw-semibold">
                      <CheckCircleOutlined className="me-1" />
                      Eligible (≥90%)
                    </span>
                  ) : (
                    <span className="text-muted">
                      {completeness.pointsRemainingToEligibility}% more to 90%
                    </span>
                  )}
                </span>
                <span style={{ fontSize: 10, color: "#3b82f6" }}>
                  Details <i className="fa-solid fa-chevron-right" style={{ fontSize: 8 }}></i>
                </span>
              </div>
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Contact & Location",
      key: "contact",
      width: 220,
      render: (_, record) => {
        const mobile = record.borrowerDetails?.mobileNumber;
        const whatsapp = record.borrowerDetails?.whastappNumber || mobile;
        const email = record.borrowerDetails?.email;
        const city = record.borrowerDetails?.city;
        const state = record.borrowerDetails?.state;
        const pinCode = record.borrowerDetails?.pinCode;

        return (
          <div style={{ fontSize: 12 }}>
            {mobile && (
              <div className="d-flex align-items-center gap-1 mb-1">
                <PhoneOutlined style={{ color: "#10b981" }} />
                <span style={{ fontWeight: 500 }}>{mobile}</span>
                {whatsapp && (
                  <Tooltip title="Chat on WhatsApp">
                    <a
                      href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-success ms-1"
                      style={{ fontSize: 13 }}
                    >
                      <i className="fa-brands fa-whatsapp"></i>
                    </a>
                  </Tooltip>
                )}
                <Tooltip title="Copy Mobile">
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined style={{ fontSize: 11 }} />}
                    style={{ padding: "0 4px", height: "auto" }}
                    onClick={() => copyText(mobile, "Mobile number")}
                  />
                </Tooltip>
              </div>
            )}
            {email && (
              <div
                className="d-flex align-items-center gap-1 mb-1 text-truncate"
                style={{ maxWidth: 200 }}
              >
                <MailOutlined style={{ color: "#3b82f6" }} />
                <a
                  href={`mailto:${email}`}
                  title={email}
                  style={{ color: "#4b5563" }}
                  className="text-truncate"
                >
                  {email}
                </a>
              </div>
            )}
            {(city || state || pinCode) ? (
              <div
                className="d-flex align-items-center gap-1"
                style={{ color: "#6b7280" }}
              >
                <GlobalOutlined style={{ color: "#8b5cf6" }} />
                <span>
                  {[city, state].filter(Boolean).join(", ")}
                  {pinCode ? ` - ${pinCode}` : ""}
                </span>
              </div>
            ) : (
              <span className="text-muted" style={{ fontSize: 11 }}>
                Location not provided
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: "Bank & Identity",
      key: "bankIdentity",
      width: 220,
      render: (_, record) => {
        const pan = record.borrowerDetails?.panNumber;
        const bankName = record.borrowerDetails?.bankName;
        const branch = record.borrowerDetails?.branchName;
        const accNo = record.borrowerDetails?.bankAccNumber;
        const ifsc = record.borrowerDetails?.ifsc;

        return (
          <div style={{ fontSize: 12 }}>
            <div className="d-flex align-items-center gap-1 mb-1">
              <IdcardOutlined style={{ color: "#f59e0b" }} />
              <strong style={{ fontSize: 11 }}>PAN:</strong>
              {pan ? (
                <Tag color="orange" style={{ margin: 0, fontWeight: 600 }}>
                  {pan}
                  <Tooltip title="Copy PAN">
                    <CopyOutlined
                      style={{ marginLeft: 4, cursor: "pointer" }}
                      onClick={() => copyText(pan, "PAN number")}
                    />
                  </Tooltip>
                </Tag>
              ) : (
                <span className="text-muted" style={{ fontSize: 11 }}>
                  Not provided
                </span>
              )}
            </div>

            {bankName ? (
              <div className="mt-1" style={{ color: "#374151" }}>
                <div className="d-flex align-items-center gap-1">
                  <BankOutlined style={{ color: "#2563eb" }} />
                  <span style={{ fontWeight: 600 }}>
                    {bankName}
                    {branch ? ` (${branch})` : ""}
                  </span>
                </div>
                {accNo && (
                  <div
                    style={{ fontSize: 11, color: "#6b7280", marginLeft: 16 }}
                  >
                    A/C: ••••{accNo.slice(-4)}
                    {ifsc && ` | IFSC: ${ifsc}`}
                  </div>
                )}
              </div>
            ) : (
              <div className="d-flex align-items-center gap-1 mt-1 text-muted">
                <BankOutlined />
                <span style={{ fontSize: 11 }}>No bank details linked</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Uploaded Documents",
      key: "documents",
      width: 270,
      render: (_, record) => {
        const docs = Array.isArray(record.documents) ? record.documents : [];
        if (!docs.length) {
          return (
            <Tag color="default" style={{ fontStyle: "italic" }}>
              No Documents Uploaded
            </Tag>
          );
        }

        return (
          <div>
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span style={{ fontSize: 11, fontWeight: 700, color: "#4b5563" }}>
                <i
                  className="fa-solid fa-folder-open me-1"
                  style={{ color: "#3d5ee1" }}
                ></i>
                {docs.length} File{docs.length > 1 ? "s" : ""} Available
              </span>
              <Button
                type="link"
                size="small"
                style={{ fontSize: 11, padding: 0 }}
                onClick={() => openDocViewer(record, 0)}
              >
                View Gallery
              </Button>
            </div>
            <div className="d-flex flex-wrap gap-1">
              {docs.map((doc, idx) => {
                const meta = DOC_META[doc.documentType] || {
                  label: doc.documentType,
                  color: "default",
                  icon: "fa-file",
                };
                return (
                  <Tooltip
                    key={idx}
                    title={
                      <div>
                        <div>
                          <strong>{meta.label}</strong>
                        </div>
                        <div style={{ fontSize: 10, color: "#e5e7eb" }}>
                          Click to preview document
                        </div>
                      </div>
                    }
                  >
                    <Tag
                      color={meta.color}
                      style={{
                        cursor: "pointer",
                        borderRadius: 4,
                        padding: "2px 6px",
                        fontSize: 11,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        margin: "1px 0",
                      }}
                      onClick={() => openDocViewer(record, idx)}
                    >
                      <i className={`fa-solid ${meta.icon}`}></i>
                      <span>{doc.documentType}</span>
                    </Tag>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        );
      },
    },
    {
      title: "Experian / Nominee",
      key: "experianNominee",
      width: 190,
      render: (_, record) => {
        const exp = record.experianSummary || {};
        const nom = record.nomineeDetails || {};
        const creditScore = exp.creditScore || 0;
        const oxyScore = exp.oxyScore || 0;

        return (
          <div style={{ fontSize: 12 }}>
            <div className="d-flex align-items-center gap-1 mb-1">
              <SafetyCertificateOutlined
                style={{ color: creditScore > 0 ? "#10b981" : "#9ca3af" }}
              />
              <span style={{ fontSize: 11 }}>Credit Score:</span>
              <Tag
                color={
                  creditScore >= 700
                    ? "success"
                    : creditScore > 0
                    ? "warning"
                    : "default"
                }
                style={{ margin: 0, fontWeight: 700, fontSize: 11 }}
              >
                {creditScore > 0 ? creditScore : "N/A"}
              </Tag>
            </div>

            {nom.name ? (
              <div
                style={{
                  background: "#f9fafb",
                  padding: "3px 6px",
                  borderRadius: 4,
                  border: "1px solid #f3f4f6",
                  marginTop: 4,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#374151",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <UserOutlined style={{ fontSize: 10, color: "#8b5cf6" }} />
                  <span className="text-truncate">{nom.name}</span>
                </div>
                {nom.relation && (
                  <div style={{ fontSize: 10, color: "#6b7280" }}>
                    Relation: {nom.relation}
                  </div>
                )}
              </div>
            ) : (
              <span
                className="text-muted"
                style={{ fontSize: 11, fontStyle: "italic" }}
              >
                No nominee listed
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 130,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Space direction="vertical" size={4} style={{ width: "100%" }}>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            block
            style={{
              backgroundColor: "#3d5ee1",
              borderColor: "#3d5ee1",
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 6,
            }}
            onClick={() => openProfileModal(record)}
          >
            Review Profile
          </Button>

          <Button
            type="default"
            size="small"
            icon={<FileImageOutlined />}
            block
            style={{ fontSize: 12, borderRadius: 6 }}
            onClick={() => openDocViewer(record, 0)}
          >
            Docs ({record.documents?.length || 0})
          </Button>

          <Button
            type="link"
            size="small"
            style={{ fontSize: 11, padding: 0 }}
            onClick={() => navigate(`/borrowerDocuments/${record.userId}`)}
          >
            Verify <ArrowRightOutlined style={{ fontSize: 10 }} />
          </Button>
        </Space>
      ),
    },
  ];

  // Currently active document in Lightbox
  const currentDocsList = viewerBorrower?.documents || [];
  const currentDoc = currentDocsList[activeDocIndex];

  return (
    <div className="main-wrapper">
      <OxyloansAdminSidebar />
      <OxyloansAdminHeader />

      <div className="page-wrapper">
        <div className="content container-fluid">
          {/* Top Title & Action Strip */}
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
            <div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <Title level={4} style={{ margin: 0, color: "#0f172a", fontWeight: 800 }}>
                  Borrowers Intelligence & Verification Studio
                </Title>
              </div>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Executive underwriting console for borrower profile completeness, KYC secure vault, banking verifications, and bureau risk metrics
              </Text>
            </div>

            <Space wrap>

              {!appliedSearch ? (
                <Space>
                  <Button
                    icon={<LeftOutlined />}
                    disabled={currentPage <= 1 || loading}
                    onClick={handlePrev}
                  >
                    Prev
                  </Button>
                  <Tag color="cyan" style={{ margin: 0, padding: "4px 10px", fontWeight: 700 }}>
                    Page {currentPage}
                  </Tag>
                  <Button
                    type="primary"
                    disabled={loading || (borrowers.length === 0 && currentPage > 1)}
                    onClick={handleNext}
                    style={{
                      backgroundColor:
                        loading || (borrowers.length === 0 && currentPage > 1)
                          ? undefined
                          : "#3d5ee1",
                      borderColor:
                        loading || (borrowers.length === 0 && currentPage > 1)
                          ? undefined
                          : "#3d5ee1",
                    }}
                  >
                    Next <RightOutlined />
                  </Button>
                </Space>
              ) : (
                <Tag color="blue" style={{ margin: 0, padding: "4px 10px", fontWeight: 600 }}>
                  Search Results ({filteredData.length})
                </Tag>
              )}

              <Button
                type="default"
                icon={<ReloadOutlined spin={loading} />}
                onClick={() => fetchBorrowers(currentPage, pageSize, true)}
                loading={loading}
              >
                Refresh
              </Button>
            </Space>
          </div>

          {/* Main Card with Filters & Table */}
          <Card
            bordered={false}
            style={{ borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            {/* Search and Filters Bar */}
            <div className="d-flex flex-wrap align-items-center gap-2 mb-3 pb-3 border-bottom">
              {/* Breakdown Search: Dropdown (borrowerId | name | mobileNumber) + Input + Search Button */}
              <Space.Compact style={{ flexShrink: 0 }}>
                <Select
                  value={searchType}
                  onChange={handleSearchTypeChange}
                  style={{ width: 145 }}
                >
                  <Option value="borrowerId">Borrower ID</Option>
                  <Option value="name">Name</Option>
                  <Option value="mobileNumber">Mobile Number</Option>
                </Select>
                <Input
                  placeholder={
                    searchType === "borrowerId"
                      ? "Enter Borrower ID (e.g. 69957)"
                      : searchType === "name"
                      ? "Enter Name (e.g. Ravi)"
                      : "Enter Mobile (e.g. 868654986)"
                  }
                  value={searchValue}
                  onChange={handleSearchInputChange}
                  onPressEnter={handleSearch}
                  style={{ width: 220 }}
                  allowClear
                />
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={handleSearch}
                  loading={loading}
                >
                  Search
                </Button>
              </Space.Compact>

              {(appliedSearch ||
                searchValue ||
                docFilter !== "ALL" ||
                bankFilter !== "ALL" ||
                nomineeFilter !== "ALL" ||
                stateFilter !== "ALL" ||
                statusFilter !== "ALL" ||
                quickFilter !== "ALL") && (
                <Button
                  type="dashed"
                  icon={<ClearOutlined />}
                  onClick={handleResetFilters}
                  style={{ color: "#ef4444", borderColor: "#fca5a5" }}
                >
                  Reset
                </Button>
              )}

              <div className="ms-auto" style={{ fontSize: 13, color: "#6b7280" }}>
                Showing <strong>{filteredData.length}</strong> of{" "}
                <strong>{borrowers.length}</strong> borrowers
              </div>
            </div>

            {/* Active search banner if search filter applied */}
            {appliedSearch && (
              <div className="mb-3 d-flex align-items-center gap-2 flex-wrap">
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Active Search:
                </Text>
                <Tag
                  color="blue"
                  closable
                  onClose={handleClearSearch}
                  style={{ padding: "3px 10px", fontSize: 12, borderRadius: 4 }}
                >
                  <span>
                    {appliedSearch.type === "borrowerId"
                      ? "Borrower ID"
                      : appliedSearch.type === "name"
                      ? "Name"
                      : "Mobile Number"}
                  </span>
                  : <strong>{appliedSearch.value}</strong>
                </Tag>
                <Button
                  type="link"
                  size="small"
                  onClick={handleClearSearch}
                  style={{ padding: 0, fontSize: 12, color: "#ef4444" }}
                >
                  Clear search
                </Button>
              </div>
            )}

            {/* Borrowers Table */}
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey={(record, idx) =>
                record.userId || record.borrowerDetails?.userId || `borrower-${idx}`
              }
              loading={loading}
              bordered
              scroll={{ x: 1200 }}
              pagination={false}
              locale={{
                emptyText: (
                  <div className="py-4 text-center">
                    <Empty
                      description={
                        <div>
                          <h6>
                            {appliedSearch
                              ? `No borrower records found matching ${
                                  appliedSearch.type === "borrowerId"
                                    ? "Borrower ID"
                                    : appliedSearch.type === "name"
                                    ? "Name"
                                    : "Mobile Number"
                                }: "${appliedSearch.value}"`
                              : `No borrower records found on Page ${currentPage}`}
                          </h6>
                          <div className="mt-3">
                            {appliedSearch && (
                              <Button
                                type="primary"
                                icon={<ClearOutlined />}
                                onClick={handleClearSearch}
                                className="me-2"
                              >
                                Clear Search & Show All
                              </Button>
                            )}
                            {currentPage > 1 && !appliedSearch && (
                              <Button
                                type="primary"
                                icon={<LeftOutlined />}
                                onClick={handlePrev}
                                className="me-2"
                              >
                                Go Back to Page {currentPage - 1}
                              </Button>
                            )}
                            <Button
                              type="dashed"
                              onClick={() => {
                                setBorrowers(SAMPLE_BORROWER_DOCUMENTS);
                                setIsUsingSample(true);
                                setHasNextPage(false);
                                message.info("Loaded sample preview dataset for review");
                              }}
                            >
                              Load Sample Preview Data
                            </Button>
                          </div>
                        </div>
                      }
                    />
                  </div>
                ),
              }}
            />

            {/* Pagination / Results summary bar */}
            {!appliedSearch ? (
              <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top flex-wrap gap-2">
                <div className="d-flex align-items-center gap-3">
                  <span style={{ fontSize: 13, color: "#4b5563" }}>
                    Page <strong className="text-primary">{currentPage}</strong> •{" "}
                    Showing <strong>{filteredData.length}</strong> borrower{filteredData.length === 1 ? "" : "s"} on this page
                  </span>

                  <div className="d-flex align-items-center gap-1">
                    <span style={{ fontSize: 12, color: "#6b7280" }}>Per page:</span>
                    <Select
                      size="small"
                      value={pageSize}
                      onChange={handlePageSizeChange}
                      style={{ width: 90 }}
                    >
                      <Option value={10}>10 / page</Option>
                      <Option value={25}>25 / page</Option>
                      <Option value={50}>50 / page</Option>
                      <Option value={100}>100 / page</Option>
                    </Select>
                  </div>
                </div>

                <Space>
                  <Button
                    icon={<LeftOutlined />}
                    disabled={currentPage <= 1 || loading}
                    onClick={handlePrev}
                  >
                    Previous
                  </Button>

                  <div
                    style={{
                      background: "#eff6ff",
                      color: "#1d4ed8",
                      fontWeight: 700,
                      borderRadius: 6,
                      padding: "4px 14px",
                      fontSize: 13,
                      border: "1px solid #bfdbfe",
                    }}
                  >
                    Page {currentPage}
                  </div>

                  <Button
                    type="primary"
                    disabled={loading || (borrowers.length === 0 && currentPage > 1)}
                    onClick={handleNext}
                    style={{
                      backgroundColor:
                        loading || (borrowers.length === 0 && currentPage > 1)
                          ? undefined
                          : "#3d5ee1",
                      borderColor:
                        loading || (borrowers.length === 0 && currentPage > 1)
                          ? undefined
                          : "#3d5ee1",
                    }}
                  >
                    Next <RightOutlined />
                  </Button>
                </Space>
              </div>
            ) : (
              <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top flex-wrap gap-2">
                <span style={{ fontSize: 13, color: "#4b5563" }}>
                  Search Results: <strong>{filteredData.length}</strong> borrower{filteredData.length === 1 ? "" : "s"} found
                </span>
                <Button
                  icon={<ClearOutlined />}
                  onClick={handleClearSearch}
                  size="small"
                >
                  Clear Search & View All Pages
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Comprehensive Borrower Profile Modal - CEO Executive Console */}
      <Modal
        title={
          <div className="d-flex align-items-center justify-content-between pe-4 flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2">
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: "linear-gradient(135deg, #3d5ee1 0%, #1e3a8a 100%)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                }}
              >
                <UserOutlined style={{ fontSize: 18 }} />
              </div>
              <div>
                <h5 style={{ margin: 0, fontWeight: 700, color: "#0f172a", fontSize: 16 }}>
                  Borrower Executive Dossier & Verification Studio
                </h5>
                <span style={{ fontSize: 11, color: "#64748b" }}>
                  CEO Underwriting & Profile Completeness Inspection Console
                </span>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Tag color="purple" style={{ margin: 0, fontWeight: 700, padding: "2px 8px" }}>
                <i className="fa-solid fa-crown me-1 text-warning"></i> CEO Executive View
              </Tag>
            </div>
          </div>
        }
        open={profileModalVisible}
        onCancel={() => setProfileModalVisible(false)}
        width={1060}
        centered
        zIndex={1200}
        style={{ maxWidth: "94vw" }}
        bodyStyle={{
          maxHeight: "calc(88vh - 120px)",
          overflowY: "auto",
          padding: "20px 24px",
          background: "#f8fafc",
        }}
        footer={[
          <Button key="close" onClick={() => setProfileModalVisible(false)}>
            Close Console
          </Button>,
          selectedBorrower?.borrowerDetails?.mobileNumber && (
            <a
              key="call"
              href={`tel:${selectedBorrower.borrowerDetails.mobileNumber}`}
              className="btn btn-sm btn-outline-secondary"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <PhoneOutlined /> Call Borrower
            </a>
          ),
          selectedBorrower?.borrowerDetails?.whastappNumber && (
            <a
              key="wa"
              href={`https://wa.me/${selectedBorrower.borrowerDetails.whastappNumber.replace(
                /[^0-9]/g,
                ""
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline-success"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <i className="fa-brands fa-whatsapp"></i> WhatsApp
            </a>
          ),
          selectedBorrower?.userId && (
            <Button
              key="verify"
              type="primary"
              icon={<SafetyCertificateOutlined />}
              style={{ backgroundColor: "#3d5ee1", borderColor: "#3d5ee1", fontWeight: 600 }}
              onClick={() => {
                setProfileModalVisible(false);
                navigate(`/borrowerDocuments/${selectedBorrower.userId}`);
              }}
            >
              Open Document Verification Studio
            </Button>
          ),
        ]}
      >
        {selectedBorrower && (() => {
          const completeness = computeBorrowerCompleteness(selectedBorrower);
          const personalGroup = completeness.completionGroups?.find(
            (g) => g.label === "Personal & Identity"
          ) || { earned: 0, points: 30 };
          const addressGroup = completeness.completionGroups?.find(
            (g) => g.label === "Residence & Address"
          ) || { earned: 0, points: 15 };
          const bankGroup = completeness.completionGroups?.find(
            (g) => g.label === "Bank Account"
          ) || { earned: 0, points: 15 };
          const empGroup = completeness.completionGroups?.find(
            (g) => g.label === "Employment / Education"
          ) || { earned: 0, points: 15 };
          const nomineeGroup = completeness.completionGroups?.find(
            (g) => g.label === "Nominee"
          ) || { earned: 0, points: 10 };
          const kycGroup = completeness.completionGroups?.find(
            (g) => g.label === "KYC Documents"
          ) || { earned: 0, points: 15 };
          const refGroup = completeness.completionGroups?.find(
            (g) => g.label === "Emergency References"
          ) || { earned: 0, points: 15 };
          const isEligible = completeness.percentage >= 90;

          const bDetails = selectedBorrower.borrowerDetails || {};
          const pDetails = selectedBorrower.personalDetails || {};
          const nDetails = selectedBorrower.nomineeDetails || {};
          const expSummary = selectedBorrower.experianSummary || {};
          const docs = Array.isArray(selectedBorrower.documents) ? selectedBorrower.documents : [];
          const initials = getInitials(selectedBorrower.name || bDetails.fullname || "");
          const avatarColor = getAvatarColor(selectedBorrower.name || bDetails.fullname || "");

          // 7-Point Personal Validation Checklist
          const personalChecks = [
            {
              label: "Full Name (First & Last)",
              points: 5,
              passed: Boolean(
                bDetails.fullname?.trim()?.split(/\s+/)?.length >= 2 ||
                (bDetails.firstName && bDetails.lastName)
              ),
              value: bDetails.fullname || selectedBorrower.name || "Missing",
            },
            {
              label: "Date of Birth & Age (18-70 yrs)",
              points: 3,
              passed: Boolean(bDetails.dob),
              value: bDetails.dob
                ? `${moment(bDetails.dob).format("DD-MMM-YYYY")} (Age: ${moment().diff(moment(bDetails.dob), "years")})`
                : "Missing",
            },
            {
              label: "Gender",
              points: 2,
              passed: Boolean(bDetails.gender?.trim()),
              value: bDetails.gender || "Not specified",
            },
            {
              label: "Parents' Names (Father & Mother)",
              points: 5,
              passed: Boolean(pDetails.fatherName?.trim() && pDetails.motherName?.trim()),
              value: [
                pDetails.fatherName ? `Father: ${pDetails.fatherName}` : null,
                pDetails.motherName ? `Mother: ${pDetails.motherName}` : null,
              ].filter(Boolean).join(", ") || "Missing mother/father name",
            },
            {
              label: "Marital / Spouse Details",
              points: 5,
              passed:
                (pDetails.maritalStatus || "Single").trim() !== "Married" ||
                Boolean(pDetails.spouseName?.trim()),
              value: pDetails.maritalStatus || "Single",
            },
            {
              label: "Contact Details (Mobile & Email)",
              points: 5,
              passed: Boolean((bDetails.mobileNumber || bDetails.whastappNumber) && bDetails.email),
              value: `${bDetails.mobileNumber || ""} • ${bDetails.email || ""}`,
            },
            {
              label: "PAN Card & Verification",
              points: 5,
              passed: Boolean(bDetails.panNumber),
              value: bDetails.panNumber || "Missing PAN",
            },
          ];

          return (
            <div>
              {/* Executive Hero Banner */}
              <div
                className="p-3 mb-3 rounded-3 shadow-sm text-white"
                style={{
                  background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                  border: "1px solid #334155",
                }}
              >
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${avatarColor}, #3b82f6)`,
                        color: "#fff",
                        fontSize: 20,
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
                        border: "2px solid rgba(255,255,255,0.25)",
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </div>

                    <div>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <h4 style={{ margin: 0, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
                          {selectedBorrower.name || bDetails.fullname}
                        </h4>
                        <span
                          className={`badge rounded-pill px-3 py-1 ${
                            isEligible ? "bg-success text-white" : "bg-warning text-dark"
                          }`}
                          style={{ fontWeight: 700, fontSize: 11 }}
                        >
                          {isEligible ? "ELIGIBLE FOR LOAN (≥90%)" : `${completeness.pointsRemainingToEligibility}% MORE TO REACH 90%`}
                        </span>
                      </div>

                      <div className="d-flex align-items-center gap-2 mt-2 flex-wrap text-white-50" style={{ fontSize: 12 }}>
                        <Tag color="purple" style={{ margin: 0, fontWeight: 700 }}>
                          ID: #{selectedBorrower.userId}
                        </Tag>
                        {expSummary.uniqueNumber && (
                          <Tag color="geekblue" style={{ margin: 0, fontWeight: 700 }}>
                            {expSummary.uniqueNumber}
                          </Tag>
                        )}
                        <Tag color="blue" style={{ margin: 0 }}>
                          {bDetails.accountStatus || expSummary.userStatus || "REGISTERED"}
                        </Tag>
                        {bDetails.utm && (
                          <Tag color="cyan" style={{ margin: 0 }}>
                            UTM: {bDetails.utm}
                          </Tag>
                        )}
                        {bDetails.userRegisterDate && (
                          <span style={{ color: "#cbd5e1" }}>
                            <i className="fa-regular fa-calendar me-1"></i>
                            Reg: {moment(bDetails.userRegisterDate).format("DD-MMM-YYYY")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Top Right Executive KPI Tiles */}
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <div
                      className="px-3 py-2 rounded-3 text-center"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", minWidth: 95 }}
                    >
                      <small className="d-block text-white-50" style={{ fontSize: 10, fontWeight: 600 }}>
                        CREDIT SCORE
                      </small>
                      <strong style={{ fontSize: 16, color: (expSummary.creditScore || 0) > 0 ? "#4ade80" : "#94a3b8" }}>
                        {expSummary.creditScore > 0 ? expSummary.creditScore : "N/A"}
                      </strong>
                    </div>

                    <div
                      className="px-3 py-2 rounded-3 text-center"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", minWidth: 105 }}
                    >
                      <small className="d-block text-white-50" style={{ fontSize: 10, fontWeight: 600 }}>
                        MONTHLY SALARY
                      </small>
                      <strong style={{ fontSize: 15, color: "#38bdf8" }}>
                        {bDetails.salaryIncomeMonthly ? `₹${Number(bDetails.salaryIncomeMonthly).toLocaleString("en-IN")}` : "Not Disclosed"}
                      </strong>
                    </div>

                    <div
                      className="px-3 py-2 rounded-3 text-center"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", minWidth: 95 }}
                    >
                      <small className="d-block text-white-50" style={{ fontSize: 10, fontWeight: 600 }}>
                        DOCUMENTS
                      </small>
                      <strong style={{ fontSize: 16, color: "#fbbf24" }}>
                        {docs.length} Uploaded
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compact Executive Completeness Card with Interactive Category Navigation */}
              <div
                className="card border-0 mb-3 rounded-3 shadow-sm"
                style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
              >
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-bold text-dark" style={{ fontSize: 13, letterSpacing: "0.5px" }}>
                        PROFILE COMPLETENESS
                      </span>
                      <span
                        className={`badge rounded-pill ${isEligible ? "bg-success text-white" : "bg-warning text-dark"}`}
                        style={{ fontSize: 12, fontWeight: 800 }}
                      >
                        {completeness.percentage}% OVERALL
                      </span>
                      <span className="text-muted" style={{ fontSize: 12 }}>
                        (90% required to raise loan)
                      </span>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      {completeness.missingRequirements?.length > 0 && (
                        <Button
                          type="text"
                          size="small"
                          onClick={() => setShowPendingDrawer(!showPendingDrawer)}
                          style={{
                            fontSize: 11,
                            color: "#b45309",
                            backgroundColor: "#fef3c7",
                            fontWeight: 600,
                            borderRadius: 12,
                            padding: "0 10px",
                            height: 24,
                          }}
                        >
                          <i className={`fa-solid ${showPendingDrawer ? "fa-chevron-up" : "fa-triangle-exclamation"} me-1`}></i>
                          {completeness.missingRequirements.length} Incomplete Requirement{completeness.missingRequirements.length > 1 ? "s" : ""}
                        </Button>
                      )}
                      <span style={{ fontSize: 12, fontWeight: 700, color: isEligible ? "#16a34a" : "#d97706" }}>
                        {isEligible ? "✓ Eligible to raise loan" : `${completeness.pointsRemainingToEligibility}% more needed`}
                      </span>
                    </div>
                  </div>

                  {/* Sleek Progress Bar */}
                  <div className="progress mb-3" style={{ height: "8px", borderRadius: "10px", background: "#f1f5f9" }}>
                    <div
                      className={`progress-bar rounded-pill ${isEligible ? "bg-success" : "bg-warning"}`}
                      role="progressbar"
                      style={{
                        width: `${completeness.percentage}%`,
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>

                  {/* 7 Interactive Category Mini-Cards (Clickable to switch tab!) */}
                  <div className="d-flex flex-wrap gap-2">
                    {completeness.completionGroups?.map((group) => {
                      const complete = group.earned >= group.points;
                      const isPersonal = group.label === "Personal & Identity";
                      const tabMap = {
                        "Personal & Identity": "1",
                        "Residence & Address": "1",
                        "Employment / Education": "2",
                        "Bank Account": "2",
                        "Nominee": "4",
                        "KYC Documents": "3",
                        "Emergency References": "6",
                      };
                      const targetTab = tabMap[group.label] || "1";
                      const isCurrentTab = modalActiveTab === targetTab;

                      return (
                        <div
                          key={group.label}
                          style={{ flex: "1 1 125px", minWidth: 115 }}
                        >
                          <div
                            onClick={() => setModalActiveTab(targetTab)}
                            className="p-2 rounded-3 text-center border h-100 d-flex flex-column justify-content-between"
                            style={{
                              cursor: "pointer",
                              background: isCurrentTab
                                ? "#eff6ff"
                                : complete
                                ? "#f0fdf4"
                                : "#fefce8",
                              borderColor: isCurrentTab
                                ? "#3b82f6"
                                : complete
                                ? "#bbf7d0"
                                : "#fef08a",
                              boxShadow: isCurrentTab
                                ? "0 2px 6px rgba(59, 130, 246, 0.2)"
                                : "none",
                              transition: "all 0.15s ease",
                            }}
                            title={`Click to view ${group.label} tab`}
                          >
                            <small
                              className="text-muted d-block text-truncate mb-1"
                              style={{ fontSize: 10, fontWeight: 600 }}
                            >
                              {group.label}
                            </small>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: isPersonal
                                  ? "#2563eb"
                                  : complete
                                  ? "#16a34a"
                                  : "#ca8a04",
                              }}
                            >
                              {group.earned}%{" "}
                              <span style={{ fontSize: 10, color: "#94a3b8" }}>
                                / {group.points}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Collapsible Pending Requirements List */}
                  {showPendingDrawer && completeness.missingRequirements?.length > 0 && (
                    <div
                      className="mt-3 p-3 rounded-3 border"
                      style={{ background: "#fffbeb", borderColor: "#fde68a" }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong style={{ fontSize: 12, color: "#92400e" }}>
                          <i className="fa-solid fa-triangle-exclamation me-1 text-warning"></i>
                          Pending Requirements for 90% Eligibility:
                        </strong>
                        <Button
                          type="text"
                          size="small"
                          onClick={() => setShowPendingDrawer(false)}
                          style={{ fontSize: 11, color: "#92400e", padding: 0 }}
                        >
                          Hide
                        </Button>
                      </div>
                      <div className="d-flex flex-wrap gap-1">
                        {completeness.missingRequirements.map((req, i) => (
                          <span
                            key={i}
                            className="badge bg-white text-danger border border-danger-subtle px-2 py-1"
                            style={{ fontSize: 11, fontWeight: 500 }}
                          >
                            <i className="fa-solid fa-circle-xmark me-1 text-danger"></i>
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Controlled Tabs Bar */}
              <Tabs
                activeKey={modalActiveTab}
                onChange={setModalActiveTab}
                className="executive-tabs"
              >
                {/* Tab 1: Personal & Identity */}
                <Tabs.TabPane
                  tab={
                    <span className="d-flex align-items-center gap-1">
                      <UserOutlined />
                      <span>Personal ({personalGroup.earned}%)</span>
                    </span>
                  }
                  key="1"
                >
                  <div className="row g-3">
                    {/* Left: 7-Point Audit Checklist */}
                    <div className="col-lg-5">
                      <div
                        className="card border-0 shadow-sm rounded-3 h-100"
                        style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
                      >
                        <div className="card-header bg-transparent border-0 pt-3 px-3 pb-0 d-flex justify-content-between align-items-center">
                          <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: 13 }}>
                            <i className="fa-solid fa-list-check text-primary me-2"></i>
                            PERSONAL VERIFICATION AUDIT
                          </h6>
                          <span className="badge bg-primary-subtle text-primary rounded-pill fw-bold">
                            {personalGroup.earned}% / 30%
                          </span>
                        </div>
                        <div className="card-body p-3">
                          <div className="d-flex flex-column gap-2">
                            {personalChecks.map((check, idx) => (
                              <div
                                key={idx}
                                className="p-2 rounded-2 border d-flex align-items-center justify-content-between"
                                style={{
                                  fontSize: 11,
                                  background: check.passed ? "#f8fafc" : "#fffbeb",
                                  borderColor: check.passed ? "#e2e8f0" : "#fef08a",
                                }}
                              >
                                <div className="d-flex align-items-center gap-2 text-truncate me-2">
                                  <i
                                    className={`fa-solid ${
                                      check.passed ? "fa-circle-check text-success" : "fa-circle-exclamation text-warning"
                                    }`}
                                    style={{ fontSize: 13 }}
                                  ></i>
                                  <div>
                                    <span className="fw-semibold text-dark d-block text-truncate">
                                      {check.label}
                                    </span>
                                    <small className="text-muted text-truncate d-block" style={{ maxWidth: 220 }}>
                                      {check.value}
                                    </small>
                                  </div>
                                </div>
                                <span
                                  className={`badge rounded-pill ${
                                    check.passed ? "bg-success text-white" : "bg-warning text-dark"
                                  }`}
                                  style={{ fontWeight: 700 }}
                                >
                                  {check.passed ? `+${check.points}%` : "0%"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Personal & Address Details */}
                    <div className="col-lg-7">
                      <div className="card border-0 shadow-sm rounded-3 mb-3" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                        <div className="card-header bg-transparent border-0 pt-3 px-3 pb-0">
                          <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: 13 }}>
                            <i className="fa-solid fa-id-card text-primary me-2"></i>
                            DEMOGRAPHICS & IDENTIFICATION
                          </h6>
                        </div>
                        <div className="card-body p-3">
                          <div className="row g-2">
                            <div className="col-sm-6">
                              <div className="p-2 border rounded bg-light">
                                <small className="text-muted d-block">Full Legal Name</small>
                                <strong>{bDetails.fullname || selectedBorrower.name || "N/A"}</strong>
                              </div>
                            </div>
                            <div className="col-sm-6">
                              <div className="p-2 border rounded bg-light">
                                <small className="text-muted d-block">Date of Birth & Age</small>
                                <strong>
                                  {bDetails.dob
                                    ? `${moment(bDetails.dob).format("DD-MMM-YYYY")} (${moment().diff(moment(bDetails.dob), "years")} yrs)`
                                    : "N/A"}
                                </strong>
                              </div>
                            </div>
                            <div className="col-sm-6">
                              <div className="p-2 border rounded bg-light">
                                <small className="text-muted d-block">Father's Name</small>
                                <strong>{pDetails.fatherName || "N/A"}</strong>
                              </div>
                            </div>
                            <div className="col-sm-6">
                              <div className="p-2 border rounded bg-light">
                                <small className="text-muted d-block">Mother's Name</small>
                                <strong>{pDetails.motherName || "Not Provided"}</strong>
                              </div>
                            </div>
                            <div className="col-sm-6">
                              <div className="p-2 border rounded bg-light">
                                <small className="text-muted d-block">Marital Status</small>
                                <strong>{pDetails.maritalStatus || "Single"}</strong>
                              </div>
                            </div>
                            <div className="col-sm-6">
                              <div className="p-2 border rounded bg-light">
                                <small className="text-muted d-block">Spouse Name</small>
                                <strong>{pDetails.spouseName || "N/A"}</strong>
                              </div>
                            </div>
                            <div className="col-sm-6">
                              <div className="p-2 border rounded bg-light">
                                <small className="text-muted d-block">PAN Number</small>
                                <strong className="text-primary">{bDetails.panNumber || "Not Linked"}</strong>
                              </div>
                            </div>
                            <div className="col-sm-6">
                              <div className="p-2 border rounded bg-light">
                                <small className="text-muted d-block">Aadhaar Number</small>
                                <strong>{bDetails.aadharNumber || "Verified via Document"}</strong>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Address Card */}
                      <div className="card border-0 shadow-sm rounded-3" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                        <div className="card-header bg-transparent border-0 pt-3 px-3 pb-0">
                          <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: 13 }}>
                            <i className="fa-solid fa-location-dot text-primary me-2"></i>
                            RESIDENCE & ADDRESS (15% / 15%)
                          </h6>
                        </div>
                        <div className="card-body p-3">
                          <div className="row g-2">
                            <div className="col-12">
                              <div className="p-2 border rounded bg-light">
                                <small className="text-muted d-block">Current Residential Address</small>
                                <strong>
                                  {bDetails.address || "N/A"}
                                  {bDetails.city ? `, ${bDetails.city}` : ""}
                                  {bDetails.state ? `, ${bDetails.state}` : ""}
                                  {bDetails.pinCode ? ` - ${bDetails.pinCode}` : ""}
                                </strong>
                              </div>
                            </div>
                            <div className="col-12">
                              <div className="p-2 border rounded bg-light">
                                <small className="text-muted d-block">Permanent Address</small>
                                <strong>{pDetails.permanentAddress || "Same as current address / Not provided"}</strong>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Tabs.TabPane>

                {/* Tab 2: Bank & Financials */}
                <Tabs.TabPane
                  tab={
                    <span className="d-flex align-items-center gap-1">
                      <BankOutlined />
                      <span>Bank & Income ({bankGroup.earned}%)</span>
                    </span>
                  }
                  key="2"
                >
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="card border-0 shadow-sm rounded-3 h-100" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                        <div className="card-header bg-transparent border-0 pt-3 px-3 pb-0 d-flex justify-content-between align-items-center">
                          <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: 13 }}>
                            <BankOutlined className="text-primary me-2" />
                            BANK ACCOUNT DETAILS
                          </h6>
                          <Tag color={bDetails.bankAccNumber ? "success" : "default"}>
                            {bDetails.bankAccNumber ? "Linked" : "No Bank"}
                          </Tag>
                        </div>
                        <div className="card-body p-3">
                          <div className="row g-2">
                            <div className="col-12">
                              <div className="p-2 border rounded bg-light">
                                <small className="text-muted d-block">Bank Name</small>
                                <strong style={{ fontSize: 14 }}>{bDetails.bankName || "Not Linked"}</strong>
                              </div>
                            </div>
                            <div className="col-sm-6">
                              <div className="p-2 border rounded bg-light">
                                <small className="text-muted d-block">Branch</small>
                                <strong>{bDetails.branchName || "N/A"}</strong>
                              </div>
                            </div>
                            <div className="col-sm-6">
                              <div className="p-2 border rounded bg-light">
                                <small className="text-muted d-block">IFSC Code</small>
                                <strong className="text-success">{bDetails.ifsc || "N/A"}</strong>
                                {bDetails.ifsc && (
                                  <CopyOutlined
                                    className="ms-2 cursor-pointer text-muted"
                                    onClick={() => copyText(bDetails.ifsc, "IFSC")}
                                  />
                                )}
                              </div>
                            </div>
                            <div className="col-12">
                              <div className="p-2 border rounded bg-light">
                                <small className="text-muted d-block">Account Number</small>
                                <strong className="text-primary" style={{ fontSize: 14 }}>
                                  {bDetails.bankAccNumber || "Not Provided"}
                                </strong>
                                {bDetails.bankAccNumber && (
                                  <CopyOutlined
                                    className="ms-2 cursor-pointer text-muted"
                                    onClick={() => copyText(bDetails.bankAccNumber, "Account Number")}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="card border-0 shadow-sm rounded-3 h-100" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                        <div className="card-header bg-transparent border-0 pt-3 px-3 pb-0 d-flex justify-content-between align-items-center">
                          <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: 13 }}>
                            <i className="fa-solid fa-briefcase text-primary me-2"></i>
                            INCOME & EMPLOYMENT (15% / 15%)
                          </h6>
                          <span className="badge bg-warning-subtle text-dark rounded-pill">
                            {empGroup.earned}% / 15%
                          </span>
                        </div>
                        <div className="card-body p-3">
                          <div className="row g-2">
                            <div className="col-sm-6">
                              <div className="p-2 border rounded bg-light">
                                <small className="text-muted d-block">Monthly Salary / Income</small>
                                <strong style={{ fontSize: 14, color: "#0284c7" }}>
                                  {bDetails.salaryIncomeMonthly ? `₹${Number(bDetails.salaryIncomeMonthly).toLocaleString("en-IN")}` : "Not Disclosed"}
                                </strong>
                              </div>
                            </div>
                            <div className="col-sm-6">
                              <div className="p-2 border rounded bg-light">
                                <small className="text-muted d-block">Employment Type</small>
                                <strong>{bDetails.employmentType || "Salaried"}</strong>
                              </div>
                            </div>
                            <div className="col-12">
                              <div className="p-2 border rounded bg-light">
                                <small className="text-muted d-block">Employer / Company Name</small>
                                <strong>{bDetails.companyName || "Not specified"}</strong>
                              </div>
                            </div>
                            <div className="col-sm-6">
                              <div className="p-2 border rounded bg-light">
                                <small className="text-muted d-block">Designation / Role</small>
                                <strong>{bDetails.designation || "Not specified"}</strong>
                              </div>
                            </div>
                            <div className="col-sm-6">
                              <div className="p-2 border rounded bg-light">
                                <small className="text-muted d-block">Office / Company Address</small>
                                <strong>{bDetails.officeAddress || "Not specified"}</strong>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Tabs.TabPane>

                {/* Tab 3: Documents Vault */}
                <Tabs.TabPane
                  tab={
                    <span className="d-flex align-items-center gap-1">
                      <FileImageOutlined />
                      <span>Documents ({docs.length} • {kycGroup.earned}%)</span>
                    </span>
                  }
                  key="3"
                >
                  {docs.length > 0 ? (
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="text-muted" style={{ fontSize: 12 }}>
                          Click any document card to view full-resolution preview, zoom, and rotate.
                        </span>
                        <Button
                          type="primary"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => openDocViewer(selectedBorrower, 0)}
                        >
                          Open Lightbox Gallery
                        </Button>
                      </div>

                      <Row gutter={[16, 16]}>
                        {docs.map((doc, idx) => {
                          const meta = DOC_META[doc.documentType] || {
                            label: doc.documentType,
                            color: "default",
                            icon: "fa-file",
                          };
                          return (
                            <Col xs={24} sm={12} md={8} lg={6} key={idx}>
                              <Card
                                hoverable
                                style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #e2e8f0" }}
                                bodyStyle={{ padding: 12 }}
                                cover={
                                  <div
                                    style={{
                                      height: 160,
                                      background: "#f1f5f9",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      position: "relative",
                                      overflow: "hidden",
                                      cursor: "pointer",
                                    }}
                                    onClick={() => openDocViewer(selectedBorrower, idx)}
                                  >
                                    <img
                                      src={doc.document}
                                      alt={meta.label}
                                      style={{
                                        maxHeight: "100%",
                                        maxWidth: "100%",
                                        objectFit: "contain",
                                      }}
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                        e.target.nextSibling.style.display = "flex";
                                      }}
                                    />
                                    <div
                                      style={{
                                        display: "none",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#64748b",
                                        padding: 8,
                                        textAlign: "center",
                                      }}
                                    >
                                      <i className={`fa-solid ${meta.icon} fa-2x mb-1`}></i>
                                      <span style={{ fontSize: 11 }}>Click to preview</span>
                                    </div>
                                  </div>
                                }
                              >
                                <div className="d-flex justify-content-between align-items-center">
                                  <Tag color={meta.color} style={{ margin: 0, fontWeight: 600 }}>
                                    {doc.documentType}
                                  </Tag>
                                  <Button
                                    type="link"
                                    size="small"
                                    icon={<EyeOutlined />}
                                    style={{ padding: 0 }}
                                    onClick={() => openDocViewer(selectedBorrower, idx)}
                                  >
                                    Preview
                                  </Button>
                                </div>
                              </Card>
                            </Col>
                          );
                        })}
                      </Row>
                    </div>
                  ) : (
                    <Empty description="No KYC documents uploaded by this borrower yet" />
                  )}
                </Tabs.TabPane>

                {/* Tab 4: Nominee Details */}
                <Tabs.TabPane
                  tab={
                    <span className="d-flex align-items-center gap-1">
                      <UserOutlined />
                      <span>Nominee ({nomineeGroup.earned}%)</span>
                    </span>
                  }
                  key="4"
                >
                  {nDetails.name ? (
                    <div className="card border-0 shadow-sm rounded-3" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                      <div className="card-header bg-transparent border-0 pt-3 px-3 pb-0 d-flex justify-content-between align-items-center">
                        <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: 13 }}>
                          <UserOutlined className="text-primary me-2" />
                          NOMINEE RECORD (10% / 10%)
                        </h6>
                        <Tag color="purple">Relationship: {nDetails.relation || "Nominee"}</Tag>
                      </div>
                      <div className="card-body p-3">
                        <div className="row g-3">
                          <div className="col-md-6">
                            <div className="p-2 border rounded bg-light">
                              <small className="text-muted d-block">Nominee Full Name</small>
                              <strong style={{ fontSize: 14 }}>{nDetails.name}</strong>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="p-2 border rounded bg-light">
                              <small className="text-muted d-block">Relationship</small>
                              <strong>{nDetails.relation || "Nominee"}</strong>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="p-2 border rounded bg-light">
                              <small className="text-muted d-block">Mobile Number</small>
                              <strong>{nDetails.mobileNumber || "N/A"}</strong>
                              {nDetails.mobileNumber && (
                                <a
                                  href={`https://wa.me/${nDetails.mobileNumber.replace(/[^0-9]/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-success ms-2"
                                  title="WhatsApp Nominee"
                                >
                                  <i className="fa-brands fa-whatsapp"></i>
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="p-2 border rounded bg-light">
                              <small className="text-muted d-block">Email Address</small>
                              <strong>{nDetails.emial || nDetails.email || "Not Provided"}</strong>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="p-2 border rounded bg-light">
                              <small className="text-muted d-block">Nominee Bank</small>
                              <strong>{nDetails.bankName || "N/A"}</strong>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="p-2 border rounded bg-light">
                              <small className="text-muted d-block">Account Number</small>
                              <strong>{nDetails.accountNumber || "N/A"}</strong>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="p-2 border rounded bg-light">
                              <small className="text-muted d-block">IFSC Code</small>
                              <strong>{nDetails.ifscCode || "N/A"}</strong>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="p-2 border rounded bg-light">
                              <small className="text-muted d-block">City</small>
                              <strong>{nDetails.city || "N/A"}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Empty description="No nominee details submitted by this borrower" />
                  )}
                </Tabs.TabPane>

                {/* Tab 5: Credit & Experian */}
                <Tabs.TabPane
                  tab={
                    <span className="d-flex align-items-center gap-1">
                      <SafetyCertificateOutlined />
                      <span>Credit Score</span>
                    </span>
                  }
                  key="5"
                >
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="p-4 border rounded-3 text-center bg-white shadow-sm">
                        <small className="text-muted d-block fw-bold mb-1">BUREAU CREDIT SCORE</small>
                        <h2
                          style={{
                            margin: 0,
                            color: expSummary.creditScore > 0 ? "#10b981" : "#94a3b8",
                            fontWeight: 800,
                            fontSize: 36,
                          }}
                        >
                          {expSummary.creditScore || "0"}
                        </h2>
                        <div className="mt-2">
                          <Tag color={expSummary.creditScore >= 700 ? "success" : expSummary.creditScore > 0 ? "warning" : "default"}>
                            {expSummary.creditScore >= 700 ? "Excellent / Low Risk" : expSummary.creditScore > 0 ? "Average" : "No Hit / Report Pending"}
                          </Tag>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="p-4 border rounded-3 text-center bg-white shadow-sm">
                        <small className="text-muted d-block fw-bold mb-1">OXY INTERNAL SCORE</small>
                        <h2
                          style={{
                            margin: 0,
                            color: expSummary.oxyScore > 0 ? "#3b82f6" : "#94a3b8",
                            fontWeight: 800,
                            fontSize: 36,
                          }}
                        >
                          {expSummary.oxyScore || "0"}
                        </h2>
                        <div className="mt-2">
                          <Tag color="geekblue">Proprietary AI Risk Model</Tag>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="p-2 border rounded bg-light">
                        <small className="text-muted d-block">Unique Number</small>
                        <strong className="text-primary">{expSummary.uniqueNumber || "N/A"}</strong>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-2 border rounded bg-light">
                        <small className="text-muted d-block">Primary Type</small>
                        <strong>{expSummary.primaryType || "BORROWER"}</strong>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-2 border rounded bg-light">
                        <small className="text-muted d-block">User Status</small>
                        <Tag color="blue">{expSummary.userStatus || "REGISTERED"}</Tag>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-2 border rounded bg-light">
                        <small className="text-muted d-block">Credit Report Available</small>
                        <Tag color={expSummary.creditReportAvailable ? "success" : "default"}>
                          {expSummary.creditReportAvailable ? "Yes" : "No"}
                        </Tag>
                      </div>
                    </div>
                  </div>
                </Tabs.TabPane>

                {/* Tab 6: Emergency References */}
                <Tabs.TabPane
                  tab={
                    <span className="d-flex align-items-center gap-1">
                      <TeamOutlined />
                      <span>References ({refGroup.earned}%)</span>
                    </span>
                  }
                  key="6"
                >
                  {(() => {
                    const r = selectedBorrower.referenceDetails || {};
                    const refList = [];
                    if (r.referenceDto && Array.isArray(r.referenceDto)) {
                      refList.push(...r.referenceDto);
                    }
                    for (let i = 1; i <= 8; i++) {
                      const refVal = r[`reference${i}`];
                      if (refVal) {
                        refList.push({
                          name: `Emergency Contact ${i}`,
                          mobileNumber: String(refVal),
                        });
                      }
                    }

                    if (refList.length === 0) {
                      return (
                        <Empty description="No emergency reference contacts submitted by this borrower" />
                      );
                    }

                    return (
                      <div className="row g-3">
                        {refList.map((ref, idx) => (
                          <div className="col-md-6" key={idx}>
                            <div className="p-3 border rounded bg-white shadow-sm">
                              <div className="d-flex align-items-center justify-content-between mb-1">
                                <strong style={{ fontSize: 13 }}>
                                  <i className="fa-solid fa-user-shield text-primary me-2"></i>
                                  {ref.name || ref.referenceName || `Emergency Contact ${idx + 1}`}
                                </strong>
                                <Tag color="cyan">Contact #{idx + 1}</Tag>
                              </div>
                              <div className="text-muted mt-1" style={{ fontSize: 12 }}>
                                <PhoneOutlined className="me-1 text-success" />
                                {ref.mobileNumber || ref.referenceNumber || ref.number || "N/A"}
                                {ref.mobileNumber && (
                                  <a
                                    href={`https://wa.me/${String(ref.mobileNumber).replace(/[^0-9]/g, "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-success ms-2"
                                  >
                                    <i className="fa-brands fa-whatsapp"></i>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </Tabs.TabPane>
              </Tabs>
            </div>
          );
        })()}
      </Modal>

      {/* Lightbox / Document Viewer Modal */}
      <Modal
        title={
          <div className="d-flex align-items-center justify-content-between pe-4 flex-wrap gap-2">
            <div>
              <span style={{ fontWeight: 700 }}>
                {currentDoc ? currentDoc.documentType : "Document"}
              </span>
              {viewerBorrower && (
                <span className="text-muted ms-2" style={{ fontSize: 13 }}>
                  • {viewerBorrower.name || viewerBorrower.borrowerDetails?.fullname} (#
                  {viewerBorrower.userId})
                </span>
              )}
            </div>
            {currentDocsList.length > 1 && (
              <span className="badge bg-secondary" style={{ fontSize: 12 }}>
                {activeDocIndex + 1} of {currentDocsList.length}
              </span>
            )}
          </div>
        }
        open={viewerVisible}
        onCancel={() => setViewerVisible(false)}
        width={900}
        centered
        zIndex={1300}
        style={{ maxWidth: "94vw" }}
        footer={[
          <Button
            key="prev"
            disabled={activeDocIndex <= 0}
            onClick={() => {
              setActiveDocIndex((i) => Math.max(0, i - 1));
              setZoomLevel(1);
              setRotation(0);
              setImgLoadError(false);
            }}
          >
            Previous
          </Button>,
          <Button
            key="next"
            disabled={activeDocIndex >= currentDocsList.length - 1}
            onClick={() => {
              setActiveDocIndex((i) =>
                Math.min(currentDocsList.length - 1, i + 1)
              );
              setZoomLevel(1);
              setRotation(0);
              setImgLoadError(false);
            }}
          >
            Next
          </Button>,
          <Button
            key="openNewTab"
            icon={<EyeOutlined />}
            onClick={() => {
              if (currentDoc?.document) {
                window.open(currentDoc.document, "_blank");
              }
            }}
          >
            Open in New Tab
          </Button>,
          <Button
            key="close"
            type="primary"
            onClick={() => setViewerVisible(false)}
          >
            Close
          </Button>,
        ]}
      >
        {currentDoc ? (
          <div>
            {/* Toolbar for zoom & rotate */}
            <div className="d-flex justify-content-between align-items-center mb-2 px-2 py-1 bg-light rounded flex-wrap gap-2">
              <Space>
                <Button
                  size="small"
                  icon={<ZoomInOutlined />}
                  onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                >
                  Zoom In
                </Button>
                <Button
                  size="small"
                  icon={<ZoomOutOutlined />}
                  onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                >
                  Zoom Out
                </Button>
                <Button
                  size="small"
                  icon={<RotateLeftOutlined />}
                  onClick={() => setRotation((r) => r - 90)}
                >
                  Rotate Left
                </Button>
                <Button
                  size="small"
                  icon={<RotateRightOutlined />}
                  onClick={() => setRotation((r) => r + 90)}
                >
                  Rotate Right
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    setZoomLevel(1);
                    setRotation(0);
                  }}
                >
                  Reset
                </Button>
              </Space>

              <Tag color={DOC_META[currentDoc.documentType]?.color || "blue"}>
                {DOC_META[currentDoc.documentType]?.label || currentDoc.documentType}
              </Tag>
            </div>

            {/* Document display area */}
            <div
              style={{
                height: 520,
                background: "#1f2937",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "auto",
                position: "relative",
              }}
            >
              {!imgLoadError ? (
                <img
                  src={currentDoc.document}
                  alt={currentDoc.documentType}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                    transition: "transform 0.2s ease-in-out",
                    objectFit: "contain",
                  }}
                  onError={() => setImgLoadError(true)}
                />
              ) : (
                <div className="text-center text-white p-4">
                  <WarningOutlined style={{ fontSize: 36, color: "#f59e0b" }} />
                  <h5 className="text-white mt-2">Preview Not Available Directly</h5>
                  <p className="text-muted" style={{ maxWidth: 450, fontSize: 13 }}>
                    The S3 pre-signed URL may have expired or is blocked by CORS in the
                    browser. You can still access the file via the direct link below.
                  </p>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={() => window.open(currentDoc.document, "_blank")}
                  >
                    Open Original URL
                  </Button>
                </div>
              )}
            </div>

            {/* Document Thumbnails strip if multiple */}
            {currentDocsList.length > 1 && (
              <div className="d-flex align-items-center gap-2 mt-3 overflow-auto pb-2">
                {currentDocsList.map((d, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setActiveDocIndex(i);
                      setZoomLevel(1);
                      setRotation(0);
                      setImgLoadError(false);
                    }}
                    style={{
                      width: 70,
                      height: 55,
                      borderRadius: 6,
                      border:
                        activeDocIndex === i
                          ? "2.5px solid #3d5ee1"
                          : "1px solid #d1d5db",
                      overflow: "hidden",
                      cursor: "pointer",
                      flexShrink: 0,
                      background: "#f3f4f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ fontSize: 10, fontWeight: 700, textAlign: "center" }}>
                      {d.documentType}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Empty description="No document selected" />
        )}
      </Modal>
    </div>
  );
};

export default BorrowersList;
