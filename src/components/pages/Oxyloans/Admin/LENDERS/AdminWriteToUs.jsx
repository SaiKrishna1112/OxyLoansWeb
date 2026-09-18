import React, { useEffect, useRef, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import Swal from "sweetalert2";

import Loader from "../../../../../loader";
import { Success, WarningBackendApi } from "../../../Base UI Elements/SweetAlert";
import {
	getAdminLenderQueriesCount,
	uploadAdminLenderQueryImage,
	writeAdminLenderQuery,
} from "../../../../HttpRequest/admin";
import { allqueries, cancelled, resolved, pending } from "../../../../imagepath";
import "../../Lender/InvoiceGrid.css";
import "../../Lender/media.css";
import "./AdminWriteToUs.css";

const getLenderProfile = (record) => record?.user || record || {};

const AdminWriteToUs = ({ show, onHide, lender }) => {
	const profiledata = getLenderProfile(lender);
	const lenderId = profiledata?.id || profiledata?.userId || lender?.userId || lender?.id;
	const [query, setQuery] = useState("");
	const [documentId, setDocumentId] = useState(0);
	const [attachmentName, setAttachmentName] = useState("");
	const [isUploading, setIsUploading] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const queryInputRef = useRef(null);
	const [isPageLoading, setIsPageLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [queryresponse, setQueryResponse] = useState({
		allQueriesCount: 0,
		resolvedCount: 0,
		cancelledCount: 0,
		pendingCount: 0,
	});

	useEffect(() => {
		if (!show) return;

		const fetchQueryCounts = async () => {
			setIsPageLoading(true);
			try {
				const response = await getAdminLenderQueriesCount(lenderId);
				setQueryResponse({
					allQueriesCount: response?.data?.allQueriesCount || 0,
					resolvedCount: response?.data?.resolvedCount || 0,
					cancelledCount: response?.data?.cancelledCount || 0,
					pendingCount: response?.data?.pendingCount || 0,
				});
			} catch (error) {
				console.error("Unable to load query counts", error);
			} finally {
				setIsPageLoading(false);
			}
		};

		fetchQueryCounts();
	}, [show]);

	const closeModal = () => {
		setQuery("");
		setDocumentId(0);
		setAttachmentName("");
		onHide();
	};

	const uploadAttachment = async (file) => {
		if (!file) return;
		if (!file.type.startsWith("image/")) {
			WarningBackendApi("warning", "Please upload an image file");
			return;
		}

		setIsUploading(true);
		try {
			const response = await uploadAdminLenderQueryImage(lenderId, file);
			if (response?.request?.status === 200 || response?.status === 200) {
				setDocumentId(response.data.documentId);
				setAttachmentName(file.name);
			} else {
				WarningBackendApi("warning", "Unable to upload the attachment");
			}
		} catch (error) {
			WarningBackendApi("warning", "Unable to upload the attachment");
		} finally {
			setIsUploading(false);
		}
	};

	const handleDrop = (event) => {
		event.preventDefault();
		setIsDragging(false);
		uploadAttachment(event.dataTransfer.files[0]);
	};

	const handleAttachmentPaste = (event) => {
		const pastedImage = Array.from(event.clipboardData?.items || [])
			.find((item) => item.type.startsWith("image/"))
			?.getAsFile();
		if (pastedImage) {
			event.preventDefault();
			uploadAttachment(pastedImage);
		}
	};

	const copyQuery = async () => {
		if (!query) return;
		try {
			await navigator.clipboard.writeText(query);
			Success("success", "Query copied to clipboard");
		} catch (error) {
			WarningBackendApi("warning", "Copy is not available in this browser");
		}
	};

	const pasteQuery = async () => {
		try {
			const clipboardText = await navigator.clipboard.readText();
			const input = queryInputRef.current;
			const start = input?.selectionStart ?? query.length;
			const end = input?.selectionEnd ?? query.length;
			setQuery(`${query.slice(0, start)}${clipboardText}${query.slice(end)}`);
		} catch (error) {
			queryInputRef.current?.focus();
		}
	};

	const submitQuery = async () => {
		const cleanedQuery = query.trim();
		if (!cleanedQuery) {
			WarningBackendApi("warning", "Please enter your query before submitting");
			return;
		}

		setIsSubmitting(true);
		try {
			const response = await writeAdminLenderQuery(lenderId, {
				query,
				documentId,
				profiledata,
				urlquery: "",
				id: null,
			});

			if (response?.request?.status === 200 || response?.status === 200) {
				Success("success", "You have successfully submitted the query");
				await Swal.fire({
					icon: "success",
					title: "Query Submitted",
					text: "You have successfully submitted the query.",
					confirmButtonText: "OK",
				});
				closeModal();
			} else {
				WarningBackendApi(
					"warning",
					response?.response?.data?.errorMessage || "Something went wrong while submitting your query."
				);
			}
		} catch (error) {
			WarningBackendApi(
				"warning",
				error?.response?.data?.errorMessage || "Something went wrong while submitting your query."
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const countCards = [
		[allqueries, queryresponse.allQueriesCount, "All Queries"],
		[resolved, queryresponse.resolvedCount, "Resolved Queries"],
		[cancelled, queryresponse.cancelledCount, "Cancelled Queries"],
		[pending, queryresponse.pendingCount, "Pending Queries"],
	];

	return (
		<Modal
			show={show}
			onHide={closeModal}
			size="lg"
			centered
			dialogClassName="admin-write-to-us-modal"
		>
			<Modal.Header closeButton>
				<Modal.Title>Write to us</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{isPageLoading ? (
					<div className="d-flex justify-content-center align-items-center py-5">
						<Loader />
					</div>
				) : (
					<>
						<div className="row admin-query-counts">
							{countCards.map(([icon, count, label]) => (
								<div className="col-xl-3 col-sm-6 col-12" key={label}>
									<div className="card inovices-card">
										<div className="card-body">
											<div className="inovices-widget-header">
												<span className="inovices-widget-icon">
													<img src={icon} alt="" className="queyImage" />
												</span>
												<div className="inovices-dash-count">
													<div className="inovices-amount">{count}</div>
												</div>
											</div>
											<p className="inovices-all">{label}</p>
										</div>
									</div>
								</div>
							))}
						</div>
						<h5 className="mt-3 mb-3">Write a query</h5>
						<div className="admin-query-field">
							<div className="admin-query-toolbar">
								<span>Describe your query</span>
							</div>
							<textarea
								ref={queryInputRef}
								className="form-control admin-query-input"
								value={query}
								onChange={(event) => setQuery(event.target.value)}
								placeholder="Type your query or paste text here..."
								rows={6}
							/>
						</div>
						<div className="admin-attachment-label">ATTACH DOCUMENT / SCREENSHOT <span>(OPTIONAL)</span></div>
						<div
							className={`admin-attachment-dropzone${isDragging ? " is-dragging" : ""}`}
							tabIndex="0"
							onPaste={handleAttachmentPaste}
							onDragEnter={(event) => {
								event.preventDefault();
								setIsDragging(true);
							}}
							onDragOver={(event) => event.preventDefault()}
							onDragLeave={() => setIsDragging(false)}
							onDrop={handleDrop}
						>
							<input
								type="file"
								accept="image/*"
								id="admin-query-attachment"
								onChange={(event) => uploadAttachment(event.target.files[0])}
							/>
							<div className="admin-attachment-main">
								<span className="admin-attachment-icon" aria-hidden="true"><i className="fa fa-paperclip" /></span>
								<span>{isUploading ? "Uploading attachment..." : "Drag & drop or paste a screenshot here (Ctrl+V)"}</span>
								<label htmlFor="admin-query-attachment" className="admin-browse-button">
									<span aria-hidden="true"><i className="fa fa-cloud-upload" /></span> Browse
								</label>
							</div>
							<div className="admin-attachment-hint">
								<span aria-hidden="true"><i className="fa fa-clipboard" /></span> Click this box then press <kbd>Ctrl+V</kbd> to paste a screenshot
							</div>
							{attachmentName && <strong>{attachmentName}</strong>}
						</div>
					</>
				)}
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={closeModal} disabled={isSubmitting}>
					Cancel
				</Button>
				<Button variant="primary" onClick={submitQuery} disabled={isPageLoading || isSubmitting || isUploading || !query}>
					{isSubmitting ? "Submitting..." : "Submit"}
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default AdminWriteToUs;
