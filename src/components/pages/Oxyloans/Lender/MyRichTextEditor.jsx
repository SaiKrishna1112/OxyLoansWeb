import React, { useState, useMemo, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
// import ImageUploader from "react-quill-image-upload";
import "react-quill/dist/quill.snow.css"; // Import styles
import { uploadqueryImage } from "../../../HttpRequest/afterlogin";
import { toastrSuccess, toastrWarning } from "../../Base UI Elements/Toast";

const MyRichTextEditor = ({ data, setdata, documentUpload }) => {
  const [text, settext] = useState("hellllo");

  const sendImageToBackend = async (imgval) => {
    const imageresponse = await uploadqueryImage(imgval);
    if (
      imageresponse &&
      imageresponse.request &&
      imageresponse.request.status === 200
    ) {
      toastrSuccess("image uploaded successfully. ");
      documentUpload(imageresponse.data.documentId);
    } else {
      toastrWarning("Something went wrong. Please try again.");
    }

    // console.log(imageresponse);
    // const formData = new FormData();
    // formData.append("image", imgval);
    // console.log(formData);
  };
  const quillRef = useRef(); //
  const handleProcedureContentChange = (content, delta, source, editor, e) => {
    settext(editor.getText());
    setdata(editor.getText());
  };

  // useEffect(() => {}, [text]);

  // const modules = {
  //   toolbar: [
  //     [{ header: [1, 2, 3, 4, 5, 6, false] }],
  //     ["bold", "italic", "underline", "strike", "blockquote"],
  //     [{ size: [] }],
  //     [{ font: [] }],
  //     [{ align: ["right", "center", "justify"] }],
  //     [{ list: "ordered" }, { list: "bullet" }],
  //     ["link", "image"],
  //     [{ color: ["red", "#785412"] }],
  //     [{ background: ["red", "#785412"] }],
  //   ],
  // };

  const selectLocalImage = (vale) => {
    console.log(vale);
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [{ size: [] }],
          [{ font: [] }],
          [{ align: ["right", "center", "justify"] }],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link"],
          [{ color: ["red", "#785412"] }],
          [{ background: ["red", "#785412"] }],
          ["link", "image"],
        ],
        handlers: {
          image: () => {
            const input = document.createElement("input");
            input.setAttribute("type", "file");
            input.setAttribute("accept", "image/*");
            input.onchange = async () => {
              const file = input.files[0];
              sendImageToBackend(file);
            };
            input.click();
          },
        },
      },
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "link",
    "color",
    "image",
    "background",
    "align",
    "size",
    "font",
  ];

  const ediittexbox = {
    height: "30vh",
  };

  return (
    <div>
      <ReactQuill
        onChange={handleProcedureContentChange}
        modules={modules}
        formats={formats}
        style={ediittexbox}
        placeholder="Enter The query"
        ref={quillRef}
      />
    </div>
  );
};

export default MyRichTextEditor;
