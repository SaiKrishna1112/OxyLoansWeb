import FeatherIcon from "feather-icons-react/build/FeatherIcon";
import { Upload } from "feather-icons-react/build/IconComponents";
import { useEffect, useState } from "react";
// import '../file.css'
import Modal from "react-bootstrap/Modal";
import { uploadapicall } from "../../../../HttpRequest/afterlogin";
import { toastrSuccess, toastrWarning } from "../../../Base UI Elements/Toast";
import { WarningBackendApi } from "../../../Base UI Elements/SweetAlert";

export default function Invaitemodel({ emailcontentdata, handleinvaite }) {
  const [lgShow, setLgShow] = useState(true);
  const [UploadFile, setUploadFile] = useState("");

  const handleFileChange = (event) => {
    const response = uploadapicall(event, emailcontentdata);
    response.then((data) => {
      if (data.response.status == 200) {
        handleinvaite();
        toastrSuccess("file uploaded successfully");
      } else {
        handleinvaite();
        WarningBackendApi("warning", data.response.data.errorMessage);
      }
    });
  };

  //         const form=new FormData();
  //   const content =""
  //   form.append("BULKINVITE",file)
  //   form.append("content",content);
  //         const response  = uploadapicall(form)
  //         response.then((data)=>{
  //             console.log(data)
  //         })

  //  useEffect(()=>{

  // const uploadfileapi=async()=>{
  //     alert("")
  //     const response  = uploadapicall(UploadFile)
  //     response.then((data)=>{
  //         console.log(data)
  //     })
  // }

  //  },[UploadFile])
  return (
    <div>
      {" "}
      <Modal
        size="md"
        show={lgShow}
        onHide={() => setLgShow(false)}
        aria-labelledby="example-modal-sizes-title-lg"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-modal-sizes-title-lg">
            Upload Your Contact's File to Invite a Friends
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <div className="form-group col-12 col-md-6">
              <p className="settings-label">
                {/* <span className="star-red">*</span> */}
              </p>
              <div className="settings-btn">
                <input
                  type="file"
                  id="file"
                  name="file"
                  className="hide-input"
                  onChange={handleFileChange}
                />
                <label htmlFor="file" className="upload">
                  <i className="feather-upload">
                    <FeatherIcon icon="upload" />
                  </i>
                </label>
              </div>

              {UploadFile && UploadFile.name}
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
